import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Destino final: labs.mondistudio.com.ar/ransser.
// El workflow puede sobreescribir SITE_URL y BASE_PATH (ej. github.io mientras no exista el subdominio).
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://labs.mondistudio.com.ar',
  base: process.env.BASE_PATH ?? '/ransser',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});
