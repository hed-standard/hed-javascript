import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.js'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    // Define the Vite environment variable that the config.js file checks for
    '__VITE_ENV__': 'true',
  },
})
