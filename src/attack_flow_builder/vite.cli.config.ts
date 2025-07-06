import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { builtinModules } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'tools/cli.ts'),
      formats: ['es'],
      fileName: () => 'cli.mjs',
    },
    outDir: 'dist-cli',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        ...builtinModules,
        'commander',
      ],
      output: {
        banner: '#!/usr/bin/env node',
      },
    },
    target: 'node20',
    sourcemap: false,
    minify: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./', import.meta.url)),
      "@OpenChart": fileURLToPath(new URL('./src/assets/scripts/OpenChart/', import.meta.url))
    },
  },
});
