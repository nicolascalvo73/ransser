# stack.md — Ransser

## Framework y requisitos
- **Astro** (misma versión que quimica-dalton), salida estática (`output: 'static'`), TypeScript estricto.
- **Mobile-first**: CSS desde 360 px; breakpoints 640 / 768 / 1024 / 1280.
- **Velocidad y SEO** como prioridad: HTML estático, JS sólo donde hace falta (carrito y checkout, ~pocos KB), objetivo Lighthouse ≥ 95.
- **Sin analytics.**

## Estructura de carpetas
```
ransser/
├─ astro.config.mjs        # site: 'https://labs.mondistudio.com.ar', base: '/ransser'
├─ .github/workflows/deploy.yml   # withastro/action + deploy-pages (igual que quimica-dalton)
├─ docs/mercadopago-checkout.md   # paso a Checkout Pro real (serverless)
├─ public/                 # favicon, og-image, (robots por endpoint)
├─ scripts/optimize-images.mjs    # raw/ -> src/assets/images/*.webp
├─ src/
│  ├─ config/checkout.ts   # MP_CHECKOUT_URL (única constante), WhatsApp, clave de storage
│  ├─ data/                # products.json, categories.ts, site.ts, sizes.ts
│  ├─ lib/                 # cart.ts (puro), cart-storage.ts, cart-store.ts, checkout-form.ts, format.ts, whatsapp.ts, products.ts, url.ts, seo.ts
│  ├─ scripts/             # cart-ui.ts, checkout-ui.ts, product-ui.ts (islands vanilla)
│  ├─ components/{layout,sections,ui,cart}/
│  ├─ layouts/BaseLayout.astro
│  ├─ pages/               # index, producto/[slug], checkout, 404, robots.txt
│  ├─ styles/              # tokens.css, global.css
│  └─ types/
└─ design.md, stack.md, research.json
```

## Calidad de código (SOLID)
- **Single responsibility:** `lib/cart.ts` sólo reglas del carrito (puras, sin DOM ni storage); `cart-storage.ts` sólo persistencia; `cart-store.ts` sólo estado + suscriptores; los scripts de UI sólo conectan DOM con el store; `whatsapp.ts` sólo arma mensajes/links; `checkout-form.ts` sólo valida.
- **Open/closed:** categorías, productos, talles y secciones "consultá" se agregan editando datos (`products.json`, `categories.ts`), sin tocar componentes.
- **Liskov / Interface segregation:** props mínimas y tipadas (`ProductCardProps`); `Button` con variantes por prop.
- **Dependency inversion:** los componentes reciben datos por props; `lib/` no conoce Astro ni el DOM; el medio de pago se aísla tras `config/checkout.ts` para cambiar de redirección placeholder a función serverless en un solo punto.
- Tokens únicos en `tokens.css`; sin colores sueltos en componentes.
- `astro check` sin errores antes de cada commit.

## Performance
- Imágenes reales descargadas → **WebP** con `sharp` (script `npm run images`), `astro:assets`/`<Image>` con dimensiones explícitas (sin CLS); hero con `fetchpriority="high"`, el resto `lazy`.
- Fuentes self-hosted (`@fontsource`: Big Shoulders Display, Instrument Sans, DM Mono), subset latino, `swap`, con preload de las 4 del primer pantallazo.
- Movimiento: `gsap` + ScrollTrigger sólo en home y fichas (~46 KB gzip); el drawer y el modal lo cargan bajo demanda, así `/checkout` queda sin GSAP.
- Placeholders de producto son SVG inline (0 requests).
- CSS por componente + tokens globales, sin framework CSS.

## SEO
- `title`/`description` por página, `lang="es-AR"`, un solo `h1`, canonical, Open Graph + Twitter, sitemap (`@astrojs/sitemap`), `robots.txt`.
- JSON-LD `Store` (sin dirección, porque la ciudad no está confirmada) y `Product` en cada ficha (sin `Offer`: los precios son de ejemplo).
- `/checkout` con `noindex`.

## Accesibilidad
Contraste AA, foco visible, teclado, `<dialog>` nativo en el drawer, `aria-live`, `prefers-reduced-motion`, objetivos ≥ 44 px.

## Eventos
- `src/data/events.json` validado en build con zod (`astro/zod`, sin dependencias nuevas); los vencidos se filtran en cada build. Componentes: `EventsSection`, `EventCard`, `EventFilters`; lógica pura en `lib/events.ts`; filtro con `scripts/events-filter.ts` (mejora progresiva). JSON-LD `Event` sólo para eventos reales (`ejemplo: false`). Ver `docs/eventos.md`.

## Vertical: catálogo y venta sin plataforma
- **Catálogo:** `products.json` versionado en el repo.
- **Carrito:** memoria + `localStorage` con `try/catch`.
- **Confirmación:** resumen, formulario con validación en cliente, "Pagar con Mercado Pago" (redirige a `MP_CHECKOUT_URL`) y "Consultar por WhatsApp" (`wa.me` prellenado).
- **Producción real:** documentada en `docs/mercadopago-checkout.md` (Cloudflare Workers o Vercel Functions; precios recalculados en el servidor, nunca confiar en el cliente).

## Deploy
- Repo independiente y público: **`ransser`** (`nicolascalvo73/ransser`).
- GitHub Pages con `build_type: workflow`, igual que quimica-dalton; sin CNAME en el repo.
- `labs.mondistudio.com.ar/ransser` lo sirve el proxy de **labs-hub** (`vercel.json`): requiere agregar las dos reglas de `ransser` allí (fuera de este repo).
- Revisión e2e con Playwright MCP en local (carrito, confirmación, redirección) **antes** de publicar.
