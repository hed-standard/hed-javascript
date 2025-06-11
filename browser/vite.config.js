import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import * as path from 'path'

export default defineConfig({
  base: '/hed-validator/',
  build: {
    outDir: 'buildweb',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        validate: path.resolve(__dirname, 'validate.html'),
        contrast: path.resolve(__dirname, 'contrast.html')
      }
    }
  },
  plugins: [
    react(),
    {
      name: 'copy-api-docs-after-build',
      closeBundle: () => {
        const sourceDir = path.resolve(__dirname, '../docs/html')
        const targetDir = path.resolve(__dirname, 'buildweb/docs/html')

        if (fs.existsSync(sourceDir)) {
          fs.cpSync(sourceDir, targetDir, { recursive: true })
          console.log('✅ Copied docs/html → buildweb/docs/html after build')
        } else {
          console.warn('⚠️  docs/html not found — skipping copy')
        }
      }
    }
  ]
})
