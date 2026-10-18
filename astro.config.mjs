// @ts-check
import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Có bài blog đã đăng chưa (file .md không bắt đầu bằng "_" và không có draft: true) – chưa có thì /tin-tuc/ là noindex
const BLOG = 'src/content/blog';
const hasPosts = fs.existsSync(BLOG) && fs.readdirSync(BLOG).some((f) =>
  f.endsWith('.md') && !f.startsWith('_') && !/^draft:\s*true/m.test(fs.readFileSync(`${BLOG}/${f}`, 'utf8')));

// Trang noindex (giỏ hàng, đặt hàng, tài khoản, quản trị) không đưa vào sitemap
const NO_SITEMAP = ['/gio-hang/', '/dat-hang/', '/dat-hang-thanh-cong/', '/dang-nhap/', '/tai-khoan/', '/quan-tri/', '/404/',
  ...(hasPosts ? [] : ['/tin-tuc/'])];

export default defineConfig({
  site: 'https://viogreen.com', // tên miền chính (canonical, OG, JSON-LD, sitemap) – khớp site.website trong src/data/site.ts
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (page) => !NO_SITEMAP.includes(new URL(page).pathname) })],
  vite: { plugins: [tailwindcss()] },
});
