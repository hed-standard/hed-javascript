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
// package.json; esbuild honours that field automatically when platform is set
// to 'browser'. Note: node:fs/promises is still polyfilled (as an empty stub)
// because src/bids/datasetParser.js imports it directly — that code path is
// Node-only and is never reached in a browser context.
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
