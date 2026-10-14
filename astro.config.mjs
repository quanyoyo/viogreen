// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://viogreen.com', // tên miền chính (canonical, OG, JSON-LD, sitemap) – khớp site.website trong src/data/site.ts
  trailingSlash: 'always',
  build: { format: 'directory' },
  vite: { plugins: [tailwindcss()] },
});
