import { describe, it, expect } from 'vitest'
import { loadSchema } from './loader'
import { SchemaSpec } from '../../../src/schema/specs.ts'

describe('Browser Schema Loader', () => {
  it('should return undefined when loading a bundled schema in test environment', async () => {
    // Create a spec with localName to trigger bundled schema loading
    const spec = new SchemaSpec('', '8.0.0', 'HED8.0.0', '')
    // In a test environment, this will return undefined since schemaData is empty
    const schema = await loadSchema(spec)
    expect(schema).toBeUndefined()
  })

  it('should throw an error for local file loading', async () => {
    const spec = new SchemaSpec('', '', '', 'path/to/local.xml')
    await expect(loadSchema(spec)).rejects.toThrow('Local schema loading is not supported in the browser.')
  })
})
