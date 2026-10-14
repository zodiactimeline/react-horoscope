import { copyFile } from 'node:fs/promises';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  minify: true,
  target: 'es2018',
  // The component uses hooks, so mark the bundle as a client module for React Server Components.
  banner: { js: '"use client";' },
  onSuccess: () => copyFile('src/styles.css', 'dist/styles.css'),
});
