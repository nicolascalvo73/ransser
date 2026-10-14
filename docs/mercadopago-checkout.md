# Pasar a Checkout Pro real (Mercado Pago)

Hoy "Pagar con Mercado Pago" **no cobra**: valida el formulario y redirige a `MP_CHECKOUT_URL` (`src/config/checkout.ts`), un link de ejemplo. Este documento describe el paso a Checkout Pro con una función serverless. El sitio sigue siendo estático; sólo se agrega una función.

## Por qué hace falta un servidor
- El **Access Token** de Mercado Pago es secreto: no puede vivir en el front.
- Los **precios no se pueden confiar al navegador**: la función los recalcula desde `products.json` usando sólo `id` y `qty` del carrito.

## Flujo

1. En `/checkout`, al enviar el formulario válido, el front hace `POST /api/create-preference` con `{ items: [{ id, qty, variant }], customer }`.
2. La función valida los ítems contra `products.json`, calcula el total y crea la preferencia en `POST https://api.mercadopago.com/checkout/preferences`.
3. Devuelve `{ init_point }` y el front hace `location.assign(init_point)`.
4. El comprador paga en Mercado Pago y vuelve a `back_urls` (`/gracias`, `/pendiente`, `/error`, páginas a crear).
5. Mercado Pago avisa a `notification_url` (webhook); la función confirma el pago y registra/avisa el pedido.

## 1. Cuenta y credenciales
1. Crear la aplicación en https://www.mercadopago.com.ar/developers/panel y activar **Checkout Pro**.
2. Usar las credenciales de **prueba** primero (cuentas de prueba vendedor/comprador).
3. Guardar como secretos del proveedor (nunca en el repo):
   - `MP_ACCESS_TOKEN`
   - `MP_WEBHOOK_SECRET` (clave secreta de la sección Webhooks)
   - `SITE_URL` (ej. `https://labs.mondistudio.com.ar/ransser`)

## 2. Cuerpo de la preferencia

```json
{
  "items": [
    { "id": "chaleco-ruta-40", "title": "Chaleco Ruta 40 (talle M)", "quantity": 2, "currency_id": "ARS", "unit_price": 70000 }
  ],
  "payer": { "name": "Juan", "surname": "Pérez", "email": "juan@mail.com" },
  "back_urls": {
    "success": "https://labs.mondistudio.com.ar/ransser/gracias",
    "pending": "https://labs.mondistudio.com.ar/ransser/pendiente",
    "failure": "https://labs.mondistudio.com.ar/ransser/error"
  },
  "auto_return": "approved",
  "notification_url": "https://<tu-funcion>/api/mp-webhook",
  "external_reference": "<id-de-pedido-propio>"
}
```

`unit_price` sale siempre del servidor. La respuesta trae `init_point` (producción) y `sandbox_init_point`.

## 3a. Opción Cloudflare Workers

`worker/index.ts` (deploy con `wrangler deploy`, secretos con `wrangler secret put MP_ACCESS_TOKEN`):

```ts
import products from '../src/data/products.json';

interface Env { MP_ACCESS_TOKEN: string; SITE_URL: string; ALLOWED_ORIGIN: string }

const cors = (env: Env) => ({
  'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN, // https://labs.mondistudio.com.ar
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(env) });
    if (req.method !== 'POST') return new Response('Not found', { status: 404 });

    const { items, customer } = await req.json<{ items: { id: string; qty: number; variant?: string }[]; customer: { name: string; email: string } }>();

    const mpItems = items.map(({ id, qty, variant }) => {
      const p = products.find((x) => x.id === id && x.price !== null);
      if (!p || !Number.isInteger(qty) || qty < 1 || qty > 99) throw new Error('Ítem inválido');
      return { id, title: variant ? `${p.name} (talle ${variant})` : p.name, quantity: qty, currency_id: 'ARS', unit_price: p.price };
    });

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` },
      body: JSON.stringify({
        items: mpItems,
        payer: { name: customer.name, email: customer.email },
        back_urls: { success: `${env.SITE_URL}/gracias`, pending: `${env.SITE_URL}/pendiente`, failure: `${env.SITE_URL}/error` },
        auto_return: 'approved',
        notification_url: new URL('/mp-webhook', req.url).href,
        external_reference: crypto.randomUUID(),
      }),
    });
    if (!res.ok) return new Response('Error al crear el pago', { status: 502, headers: cors(env) });
    const { init_point } = await res.json<{ init_point: string }>();
    return Response.json({ init_point }, { headers: cors(env) });
  },
};
```

## 3b. Opción Vercel Functions

`api/create-preference.ts` en un proyecto de Vercel (puede ser el mismo de `labs-hub` o uno aparte):

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import products from '../src/data/products.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'https://labs.mondistudio.com.ar');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { items, customer } = req.body;
  const mpItems = items.map(({ id, qty, variant }: { id: string; qty: number; variant?: string }) => {
    const p = products.find((x) => x.id === id && x.price !== null);
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > 99) throw new Error('Ítem inválido');
    return { id, title: variant ? `${p.name} (talle ${variant})` : p.name, quantity: qty, currency_id: 'ARS', unit_price: p.price };
  });

  const site = process.env.SITE_URL!;
  const mp = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    body: JSON.stringify({
      items: mpItems,
      payer: { name: customer.name, email: customer.email },
      back_urls: { success: `${site}/gracias`, pending: `${site}/pendiente`, failure: `${site}/error` },
      auto_return: 'approved',
      notification_url: `https://${req.headers.host}/api/mp-webhook`,
    }),
  });
  if (!mp.ok) return res.status(502).json({ error: 'No se pudo crear el pago' });
  const { init_point } = await mp.json();
  res.json({ init_point });
}
```

## 4. Webhook

Mercado Pago llama a `notification_url` con `type: "payment"` y `data.id`. En el handler:

1. **Validar la firma.** Header `x-signature` (`ts=...,v1=...`) y `x-request-id`. Armar `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` y comparar su HMAC-SHA256 (clave `MP_WEBHOOK_SECRET`) con `v1`. Si no coincide, responder 401.
2. Consultar el pago real: `GET https://api.mercadopago.com/v1/payments/<data.id>` con el Access Token. No confiar en el cuerpo del webhook.
3. Si `status === "approved"`, marcar el pedido (`external_reference`) como pagado y avisar al negocio (email o WhatsApp).
4. Responder `200` en menos de 22 segundos; si no, Mercado Pago reintenta.

## 5. Cambios en este repo
1. `src/config/checkout.ts`: reemplazar `MP_CHECKOUT_URL` por `CREATE_PREFERENCE_URL` (la URL pública de la función).
2. `src/scripts/checkout-ui.ts`: en el `submit`, en lugar de `location.assign(mpUrl)`, hacer `fetch(CREATE_PREFERENCE_URL, { method: 'POST', body: JSON.stringify({ items, customer }) })` y redirigir a `init_point`. Manejar error de red con un mensaje en `[data-checkout-status]` y reactivar el botón.
3. Crear las páginas `/gracias`, `/pendiente` y `/error` (vaciar el carrito sólo en `/gracias`).
4. Reemplazar los **precios de ejemplo** por la lista real (`price_is_placeholder` pasa a ser innecesario) y retirar el aviso del footer.
5. Probar con credenciales y usuarios de prueba antes de pasar a producción.

## 6. Pendientes antes de cobrar
- Precios, stock y talles confirmados por el negocio.
- Costo y modalidad de envío (hoy se confirma por WhatsApp; Checkout Pro puede sumar un ítem de envío o usar Mercado Envíos).
- Términos, política de cambios y datos fiscales del vendedor.
