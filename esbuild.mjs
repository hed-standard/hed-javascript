import path from 'node:path'
import esbuild from 'esbuild'
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill'

// Node.js target build
await esbuild.build({
  entryPoints: [path.join(process.cwd(), 'index.js')],
  loader: { '.xml': 'text' },
  outdir: path.join(process.cwd(), 'dist', 'commonjs'),
  target: 'node18',
  bundle: true,
  sourcemap: true,
  platform: 'node',
  define: {
    'import.meta.env': 'undefined',
  },
})

// Browser target build — output is consumed by Vite/Webpack browser bundlers.
// files.js is redirected to files.browser.js via the "browser" field in
// package.json, so node:fs/promises is never imported. esbuild honours that
// field automatically when platform is set to 'browser'.
await esbuild.build({
  entryPoints: [path.join(process.cwd(), 'index.js')],
  loader: { '.xml': 'text' },
  outdir: path.join(process.cwd(), 'dist', 'esm'),
  bundle: true,
  sourcemap: true,
  format: 'esm',
  external: ['pluralize'],
  platform: 'browser',
  plugins: [nodeModulesPolyfillPlugin()],
})
