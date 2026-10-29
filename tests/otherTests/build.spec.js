import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from '@jest/globals'

import { localSchemaNames } from '../../src/schema/config'

// Checks of the published ESM (browser) build. They need dist/, which "npm run build" writes (npm ci and npm install
// run it through the "prepare" script); without it they are skipped.
const esmDir = path.join(__dirname, '..', '..', 'dist', 'esm')
const esmIndex = path.join(esmDir, 'index.js')
const describeBuild = fs.existsSync(esmIndex) ? describe : describe.skip

describeBuild('ESM build', () => {
  const esmCode = fs.existsSync(esmIndex) ? fs.readFileSync(esmIndex, 'utf8') : ''

  it('imports no Node.js module', () => {
    const chunkFiles = fs.readdirSync(path.join(esmDir, 'schemas')).filter((name) => name.endsWith('.js'))
    for (const code of [
      esmCode,
      ...chunkFiles.map((name) => fs.readFileSync(path.join(esmDir, 'schemas', name), 'utf8')),
    ]) {
      expect(code).not.toMatch(/(?:from|import|require)\s*\(?\s*["'](?:node:)?(?:fs|fs\/promises|path)["']/)
      expect(code).not.toContain('node:')
    }
  })

  it('uses the browser schema loader and the browser directory accessor', () => {
    expect(esmCode).toContain('Local file reading is not supported in browser environment')
    expect(esmCode).toContain('it needs Node.js file system access')
  })

  it('ships one chunk per bundled schema, loaded on demand', () => {
    for (const name of localSchemaNames) {
      expect(fs.existsSync(path.join(esmDir, 'schemas', `${name}.js`))).toBe(true)
      expect(esmCode).toContain(`import("./schemas/${name}.js")`)
    }
    // No schema text is inlined (every schema XML file declares its version on the HED root element).
    expect(esmCode).not.toMatch(/<HED [^>]*version=/)
  })
})
