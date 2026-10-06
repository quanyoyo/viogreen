// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Đổi thành tên miền thật khi có (dùng cho canonical/sitemap)
  site: 'https://viogreen.pages.dev',
  trailingSlash: 'always',
  build: { format: 'directory' },
  vite: { plugins: [tailwindcss()] },
});
