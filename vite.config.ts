import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const enableBundleReport = mode === 'analyze' || process.env.BUNDLE_ANALYZE === 'true';

  return {
    plugins: [
      react(),
      ...(enableBundleReport
        ? [
            visualizer({
              filename: 'dist/bundle-report.html',
              open: false,
              gzipSize: true,
              brotliSize: true,
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'https://viettunearchiveapi-fufkgcayeydnhdeq.japanwest-01.azurewebsites.net',
          changeOrigin: true,
        },
      },
    },
  };
});