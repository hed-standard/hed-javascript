import path from 'node:path'
import esbuild from 'esbuild'

// Node.js target build. The bundled schemas are inlined (esbuild cannot split CommonJS output).
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
// The "browser" field in package.json redirects the two Node-only modules (src/schema/loader.js and
// src/bids/directoryAccessor.js) to their browser versions; esbuild honours that field automatically
// when platform is set to 'browser'. No Node.js module is bundled, so none is polyfilled.
// Each bundled schema is split into its own chunk (dist/esm/schemas/), loaded on first use. chunkNames applies to
// every split-out file, so esbuild's shared runtime helpers also land there as schemas/chunk.js.
await esbuild.build({
  entryPoints: [path.join(process.cwd(), 'index.js')],
  loader: { '.xml': 'text' },
  outdir: path.join(process.cwd(), 'dist', 'esm'),
  bundle: true,
  sourcemap: true,
  format: 'esm',
  splitting: true,
  chunkNames: 'schemas/[name]',
  external: ['pluralize'],
  platform: 'browser',
})
