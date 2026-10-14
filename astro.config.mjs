// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Trang noindex (giỏ hàng, đặt hàng, tài khoản, quản trị) không đưa vào sitemap
const NO_SITEMAP = ['/gio-hang/', '/dat-hang/', '/dat-hang-thanh-cong/', '/dang-nhap/', '/tai-khoan/', '/quan-tri/', '/404/'];

export default defineConfig({
  site: 'https://viogreen.com', // tên miền chính (canonical, OG, JSON-LD, sitemap) – khớp site.website trong src/data/site.ts
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (page) => !NO_SITEMAP.includes(new URL(page).pathname) })],
  vite: { plugins: [tailwindcss()] },
});
