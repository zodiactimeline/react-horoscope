import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const src = (path: string) => fileURLToPath(new URL(`../src/${path}`, import.meta.url));

// Resolve the package name to the local source so the demo always reflects the current code.
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^react-horoscope\/styles\.css$/, replacement: src('styles.css') },
      { find: /^react-horoscope$/, replacement: src('index.ts') },
    ],
  },
});
