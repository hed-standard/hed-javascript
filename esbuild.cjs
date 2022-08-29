const path = require('path')
const esbuild = require('esbuild')
const GlobalsPlugin = require('esbuild-plugin-globals')

// Node.js target build
esbuild.build({
  entryPoints: [path.join(process.cwd(), 'index.js')],
  loader: { '.xml': 'text' },
  outdir: path.join(process.cwd(), 'dist', 'commonjs'),
  target: 'node12',
  bundle: true,
  sourcemap: true,
  platform: 'node',
})

// Browser target build
esbuild.build({
  entryPoints: [path.join(process.cwd(), 'index.js')],
  loader: { '.xml': 'text' },
  outdir: path.join(process.cwd(), 'dist', 'esm'),
  bundle: true,
  sourcemap: true,
  format: 'esm',
  define: {
    global: 'globalThis',
    window: 'globalThis',
    crypto: 'globalThis',
    os: 'globalThis',
    timers: 'globalThis',
    process: JSON.stringify({
      env: {},
      argv: [],
      stdout: '',
      stderr: '',
      stdin: '',
      version: 'v12.14.1',
    }),
    external: ['pluralize'],
  },
  plugins: [
    GlobalsPlugin({
      crypto: 'globalThis',
      os: 'globalThis',
      timers: 'globalThis',
      process: 'globalThis',
    }),
  ],
})
