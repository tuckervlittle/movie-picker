import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src/',

  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        settings: resolve(__dirname, 'src/settings-page/index.html'),
        // checkout: resolve(__dirname, 'src/checkout/index.html'),
        // product: resolve(__dirname, 'src/product_pages/index.html'),
        // product_listing: resolve(__dirname, 'src/product_listing/index.html'),
      },
    },
  },
});
