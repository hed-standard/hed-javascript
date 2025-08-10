import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import * as path from 'node:path'
import { createRequire } from 'node:module' // Add this line
const require = createRequire(import.meta.url) // Add this line

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

    define: {
      // Add this section
      __VITE_ENV__: true,
    },

    optimizeDeps: {
      // Add this section
      include: ['lodash', 'path-browserify'], // Added 'path-browserify'
    },

    resolve: {
      alias: {
        path: require.resolve('path-browserify'),
        'node:path': require.resolve('path-browserify'), // Modified this line
        stream: require.resolve('readable-stream'),
        timers: require.resolve('timers-browserify'), // Modified this line
        '@hed-javascript-root': path.resolve(__dirname, '..'), // Added alias to project root
        // Browser-compatible version of files utility
        '../utils/files': path.resolve(__dirname, 'src/utils/files.js'),
      },
    },

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
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/lodash')) {
              return 'lodash'
            }
            // You could add other large dependencies here
          },
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
          const targetDir = path.resolve(__dirname, 'buildweb/docs')

          // Check if the source directory exists before attempting to copy.
          if (fs.existsSync(sourceDir)) {
            // Using fs.cpSync for modern Node.js versions.
            fs.cpSync(sourceDir, targetDir, { recursive: true })
            console.log('✅ Copied docs/html → buildweb/docs after build')
          } else {
            console.warn('⚠️  docs/html not found — skipping copy')
          }
        },
      },

      // Custom plugin to copy schemas after the build.
      isProduction && {
        name: 'copy-schemas-after-build',
        closeBundle: () => {
          const sourceDir = path.resolve(__dirname, '../src/data/schemas')
          const targetDir = path.resolve(__dirname, 'buildweb/schemas')

          if (fs.existsSync(sourceDir)) {
            fs.cpSync(sourceDir, targetDir, { recursive: true })
            console.log('✅ Copied src/data/schemas → buildweb/schemas after build')
          } else {
            console.warn('⚠️  src/data/schemas not found — skipping copy')
          }
        },
      },
    ],
  }
})
