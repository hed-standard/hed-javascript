/** @jest-environment jsdom */

import { describe, it, expect } from '@jest/globals'
import { loadSchema } from './loader.js'
import { SchemaSpec } from '../../../src/schema/specs.js'

describe('Browser Schema Loader', () => {
  it('should not error when loading a bundled schema', async () => {
    const spec = new SchemaSpec('', '8.0.0', '', '')
    // In a test environment, this will do nothing, but it shouldn't error.
    const schema = await loadSchema(spec)
    expect(schema).toBeUndefined()
  })

  it('should throw an error for local file loading', async () => {
    const spec = new SchemaSpec('', '', '', 'path/to/local.xml')
    await expect(loadSchema(spec)).rejects.toThrow('Local schema loading is not supported in the browser.')
  })
})
