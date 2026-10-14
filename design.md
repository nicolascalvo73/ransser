# design.md — Ransser Indumentaria (propuesta de rediseño)

Basado en `research.json` (2026-10-14; datos de capturas del 2026-10-01). Vertical: **catálogo y venta con tienda propia** (sin Tiendanube ni Shopify).

## 1. Identidad de marca

**Concepto:** "Hecho para el camino". Indumentaria y accesorios para moteros que viajan y acampan, contados como lo hace el dueño en sus Reels: real, de ruta de tierra, sin estudio. Oscuro y técnico, pero cercano.

**Paleta** (el coral está muestreado del logo de Instagram)

| Rol | Color | Uso |
|---|---|---|
| Base | Carbón `#0E0F10` | Fondo general |
| Superficie | `#17191B` / `#202326` | Cards, drawer, formularios |
| Línea | `#2E3236` | Bordes y separadores |
| Acento | Coral Ransser `#E45A52` | CTAs, precio, foco, detalles del logo (texto oscuro sobre coral) |
| Secundario | Verde oliva `#5E6E3B` / claro `#9DB06A` | Camping, badges de categoría, estados "ok" |
| Apoyo | Arena `#CDBF9B`, azul marino `#1F2F46`, gris `#A7ABAE` | Etiquetas, fondos de bloque, texto secundario |
| Texto | Hueso `#F1EFEA` | Texto principal sobre oscuro |
| Puntuales | Flúor `#D4FF2A` (badge Outlet), bordó `#7A1F2B` (ilustración de hamaca/bolsa) | Sólo detalles, nunca bloques grandes |
| Semántico | Verde WhatsApp `#25D366` | Sólo botón/FAB de WhatsApp |

Contraste verificado: texto hueso sobre carbón y texto carbón sobre coral superan AA (≥ 4,5:1). El coral nunca lleva texto blanco.

**Tipografía** (self-hosted vía `@fontsource`, `font-display: swap`)
- Títulos: **Saira Extra Condensed** 700/800, en mayúsculas: ecos del tablero y del estampado del logo, angosta para nombres largos de producto.
- Cuerpo y precios: **Inter** variable.
- Escala fluida con `clamp()` desde 360 px.

**Logo:** el real del perfil de Instagram (velocímetro con alas, "RANSSER 1993"). Sólo hay 100×100 px: se usa a ≤ 48 px de alto. No se redibuja ni se vectoriza sin autorización; en el informe se pide el archivo original.

**Fotografía:** real y casera. Hero con la foto del dueño en camino de tierra (portada del catálogo de WhatsApp). Fotos de producto reales pendientes: hasta entonces, placeholders oscuros con ícono de la categoría y la leyenda "Foto real a cargar". Nada de stock.

## 2. Tono de comunicación

Cercano, directo, de motoviajero. Voseo argentino. Frases cortas, beneficio primero, dato después. Nunca corporativo.

| Sí | No |
|---|---|
| "Viajás en moto? Acá tenés lo que va en la valija." | "Soluciones integrales para el motociclista moderno." |
| "Hablame por WhatsApp y lo vemos." | "Contacte a nuestro equipo de ventas." |
| "Se hace por pedido." (sólo la carpa, así lo dice el catálogo) | "Fabricación propia de toda la línea." (sin confirmar) |
| "Envíos a todo el país." | "Desde 1993." (el 1993 del logo no está confirmado como fundación) |
| "Lindo para el viaje." | Mayúsculas y signos en cadena |

Microcopy de la tienda: "Sumar al pedido", "Tu pedido", "Confirmar pedido", "Pagar con Mercado Pago", "Consultar por WhatsApp".

## 3. Estructura de layout

Mobile-first desde 360 px. Sitio de una página + ficha de producto + confirmación.

1. **Header sticky:** logo, nav (Indumentaria, Camping, Outlet, Envíos, Contacto), botón carrito con contador. En mobile: menú compacto y carrito siempre visible.
2. **Hero:** "Viajás en moto? Vestite y acampá para el camino." + subtítulo. CTAs: **Ver productos** y **Hablame por WhatsApp**. Foto real a la derecha (arriba en mobile). Franja de confianza: `8.180 seguidores en Instagram · Envíos a todo el país · Consultas por WhatsApp`.
3. **Categorías:** 3 tiles — Indumentaria / Camping / Outlet — con cantidad de productos y su color de apoyo (coral, oliva, flúor).
4. **Grilla de productos** por categoría (secciones con ancla): card con imagen, nombre, precio, precio anterior tachado, badge y "Sumar al pedido" (o "Elegir talle" si lleva talle; "Consultar" si no tiene precio).
5. **Combo destacado:** Tarp + Bolsa de dormir a $150.000.
6. **Ficha de producto** (`/producto/[slug]`): galería (placeholder), precio, descripción completa del catálogo, medidas/características, selector de talle, **tabla de talles** (XS a 4XL en el chaleco; resto placeholder), cantidad, botón de sumar y consulta por WhatsApp.
7. **Carrito (drawer):** lista editable, total, "Confirmar pedido".
8. **Confirmación** (`/checkout`): resumen de ítems y total, formulario de contacto y envío (nombre, email, teléfono, provincia, ciudad, dirección, CP, notas), **Pagar con Mercado Pago** (principal) y **Consultar por WhatsApp** (secundario).
9. **Envíos a todo el país:** 3 pasos ("Elegís, te confirmamos stock y envío, te llega"). Sin plazos ni costos inventados.
10. **También lo hacemos / Consultá:** accesos por WhatsApp para traje de lluvia compacto, mochilas y alforjas, musleras y camisaco (sin precio).
11. **Contacto:** WhatsApp e Instagram.
12. **Footer:** logo, redes, "Propuesta de rediseño de Mondi Studio" con link a https://mondistudio.com.ar y aviso "Los precios mostrados son de ejemplo", igual que en labs.mondistudio.com.ar/quimica-dalton.

**Botón flotante de WhatsApp** en mobile y desktop (se oculta en el checkout, donde ya está el botón secundario).

## 4. Referencias visuales

Criterio de rubro, no capturas de competidores (no se pudo revisar en vivo en esta pasada; queda marcado en `research.json`):

| Referencia de rubro | Qué tomamos | Qué mejoramos en Ransser |
|---|---|---|
| Marcas de indumentaria adventure/touring | Protecciones y propiedades (impermeable, desmontable, 4 estaciones) como íconos legibles | Hoy están enterradas en descripciones truncadas del catálogo de WhatsApp |
| Camping ligero para moto | Medidas y peso empaquetado visibles en la ficha | Datos incompletos o con errores en el catálogo actual (peso "900 kg", precio tachado de $12.000.000) |
| Estética outdoor oscura | Fondos carbón, acentos de un solo color, mucho aire | Hoy no hay web propia: sólo Instagram y WhatsApp |

**Dónde diferenciarnos:** conserva la voz y las fotos reales del dueño (no se vuelve "tienda genérica"), agrega orden (categorías, talles, precios claros, carrito) y mantiene WhatsApp como canal natural.

## 5. Integración visual de la vertical (tienda propia)

- **Modelo:** todo en un solo sitio estático Astro. No hay backend: el catálogo es `src/data/products.json` versionado en el repo y el carrito vive en el navegador.
- **Carrito:** en memoria + `localStorage` (clave `ransser-cart-v1`) con `try/catch`; si el navegador bloquea el storage, sigue andando en memoria. Cantidad máxima por ítem 99. El ítem se identifica por `id + talle`.
- **Confirmación → pago:** el botón "Pagar con Mercado Pago" valida el formulario y redirige a `MP_CHECKOUT_URL`, **una única constante** en `src/config/checkout.ts` (link placeholder). El paso a Checkout Pro real con función serverless (Cloudflare Workers o Vercel Functions) está documentado en `docs/mercadopago-checkout.md`.
- **WhatsApp:** "Consultar por WhatsApp" abre `wa.me/5493462543591` con el pedido prellenado (ítems, total, datos de envío si están cargados).
- **Precios de ejemplo:** los precios son los relevados el 2026-10-01 pero se muestran como de ejemplo; en el JSON llevan `price_is_placeholder: true` y `price_surveyed_at`. Se aclara en el footer y en la confirmación. Hay que validarlos con el cliente antes de cobrar nada real.
- **Placeholders honestos:** sin foto → tarjeta de categoría con "Foto real a cargar"; sin talles confirmados → `sizes_is_placeholder: true` y la tabla dice "a confirmar"; sin precio → "Consultar precio" por WhatsApp.
- **Estados:** carrito vacío, formulario con errores por campo (mensajes en voseo), pedido sin ítems en `/checkout` muestra un estado vacío con link a la grilla.
- **Accesibilidad:** foco visible coral, objetivos ≥ 44 px, `prefers-reduced-motion`, drawer con `<dialog>`, anuncios `aria-live` al sumar productos.
