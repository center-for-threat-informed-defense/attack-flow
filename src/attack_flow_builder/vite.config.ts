import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@afb-ai-prompts': fileURLToPath(new URL('../../config/ai-prompts.json', import.meta.url)),
      '~': fileURLToPath(new URL('./', import.meta.url)),
      "@OpenChart": fileURLToPath(new URL('./src/assets/scripts/OpenChart/', import.meta.url)),
      "tie-inference-web": fileURLToPath(new URL('./packages/tie-inference-web/src/index.ts', import.meta.url))
    },
  },
  base: process.env?.AFB_BASE_URL ?? "/"
})
