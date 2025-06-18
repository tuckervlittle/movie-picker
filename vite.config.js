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
        search: resolve(__dirname, 'src/search/index.html'),
        random: resolve(__dirname, 'src/random/index.html'),
      },
    },
  },
});
