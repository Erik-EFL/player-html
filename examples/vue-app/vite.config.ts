import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'player-html': path.resolve(__dirname, '../..', 'src/index.ts'),
    },
  },
});
