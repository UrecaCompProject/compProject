import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: true, // 빌드 후 자동으로 브라우저에서 결과 열기
      filename: 'stats.html', // 시각화 결과를 저장할 파일 이름
      template: 'treemap', // 시각화 템플릿 (treemap, sunburst, network 등)
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
