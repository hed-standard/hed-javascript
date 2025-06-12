import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import * as path from 'path'

// This configuration combines your specific project needs (React, multi-page, custom scripts)
// with a dynamic base path for seamless local development and GitHub Pages deployment.

export default defineConfig(({ command }) => {
  // 'command' will be 'serve' for local development (npm run dev)
  // and 'build' for production (npm run build)
  const isProduction = command === 'build'

  return {
    // The 'base' is now dynamic.
    // For production builds, it's set to your repository name '/hed-javascript/'.
    // For local development, it defaults to '/', allowing assets to load correctly.
    // NOTE: This setting can be overridden by the '--base' flag in your GitHub Action.
    base: isProduction ? '/hed-javascript/' : '/',

    build: {
      // This matches the output directory in your GitHub Actions workflow.
      outDir: 'buildweb',

      // Preserving your multi-page application setup.
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          validate_dataset: path.resolve(__dirname, 'validate_dataset.html'),
          validate_file: path.resolve(__dirname, 'validate_file.html'),
        },
      },
      // Best practice: Generates a manifest file.
      manifest: true,

      // Best practice: Helps with debugging in production.
      sourcemap: true,
    },

    plugins: [
      // Your React plugin.
      react(),

      // Your custom plugin to copy documentation after the build.
      isProduction && {
        name: 'copy-api-docs-after-build',
        closeBundle: () => {
          const sourceDir = path.resolve(__dirname, '../docs/html')
          const targetDir = path.resolve(__dirname, 'buildweb/docs/html')

          // Check if the source directory exists before attempting to copy.
          if (fs.existsSync(sourceDir)) {
            // Using fs.cpSync for modern Node.js versions.
            fs.cpSync(sourceDir, targetDir, { recursive: true })
            console.log('✅ Copied docs/html → buildweb/docs/html after build')
          } else {
            console.warn('⚠️  docs/html not found — skipping copy')
          }
        },
      },
    ],
  }
})
