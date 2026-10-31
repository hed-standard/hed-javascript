import { describe, it, expect, jest } from '@jest/globals'
import { BidsWebAccessor } from '../../src/bids/accessors/web'
import { buildBidsSchemas } from '../../src/bids/schema'
import HedSchemaBrowserLoader from '../../src/schema/browserLoader'

// Minimal mock of the browser File API used by BidsWebAccessor.
class MockFile {
  constructor(content, webkitRelativePath) {
    this._content = content
    this.webkitRelativePath = webkitRelativePath
    this.name = webkitRelativePath.split('/').pop()
  }

  async text() {
    return this._content
  }
}

// Build a MockFile array from a plain object map: { relativePath: content }
function makeFiles(entries) {
  return Object.entries(entries).map(([relPath, content]) => new MockFile(content, relPath))
}

describe('BidsWebAccessor.create — _processFileList prefix stripping', () => {
  it('returns empty fileMap and empty root for no input', async () => {
    const accessor = await BidsWebAccessor.create([])
    expect(accessor.fileMap.size).toBe(0)
    expect(accessor.datasetRootDirectory).toBe('')
  })

  it('detects root from dataset_description.json webkitRelativePath', async () => {
    const files = makeFiles({
      'my-dataset/dataset_description.json': '{}',
      'my-dataset/participants.tsv': 'participant_id\nsub-01',
      'my-dataset/sub-01/sub-01_events.tsv': 'onset\n0',
    })
    const accessor = await BidsWebAccessor.create(files)
    expect(accessor.datasetRootDirectory).toBe('my-dataset')
    // Paths should be relative to the detected root
    expect(accessor.fileMap.has('dataset_description.json')).toBe(true)
    expect(accessor.fileMap.has('participants.tsv')).toBe(true)
    expect(accessor.fileMap.has('sub-01/sub-01_events.tsv')).toBe(true)
    // The prefix itself should not appear as a key
    expect(accessor.fileMap.has('my-dataset/dataset_description.json')).toBe(false)
  })

  it('strips a nested root prefix (subdirectory upload)', async () => {
    const files = makeFiles({
      'upload/root/dataset_description.json': '{}',
      'upload/root/task-A_events.json': '{}',
    })
    const accessor = await BidsWebAccessor.create(files)
    expect(accessor.datasetRootDirectory).toBe('upload/root')
    expect(accessor.fileMap.has('dataset_description.json')).toBe(true)
    expect(accessor.fileMap.has('task-A_events.json')).toBe(true)
  })

  it('falls back to first-path root segment when no dataset_description.json', async () => {
    const files = makeFiles({
      'my-dataset/participants.tsv': 'participant_id\nsub-01',
      'my-dataset/sub-01/sub-01_events.tsv': 'onset\n0',
    })
    const accessor = await BidsWebAccessor.create(files)
    expect(accessor.datasetRootDirectory).toBe('my-dataset')
    expect(accessor.fileMap.has('participants.tsv')).toBe(true)
    expect(accessor.fileMap.has('sub-01/sub-01_events.tsv')).toBe(true)
  })

  it('handles files with no webkitRelativePath slash (flat list)', async () => {
    // When there is no slash in any path, prefix is '' and keys are unchanged.
    const files = [new MockFile('{}', 'dataset_description.json')]
    // Override webkitRelativePath to have no slash
    files[0].webkitRelativePath = 'dataset_description.json'
    const accessor = await BidsWebAccessor.create(files)
    expect(accessor.datasetRootDirectory).toBe('')
    expect(accessor.fileMap.has('dataset_description.json')).toBe(true)
  })

  it('sets schemaBuilder to a builder that uses the browser schema loader', async () => {
    const accessor = await BidsWebAccessor.create([])
    expect(typeof accessor.schemaBuilder).toBe('function')
    expect(accessor.schemaBuilder).not.toBe(buildBidsSchemas)
    const loaderSpy = jest.spyOn(HedSchemaBrowserLoader.prototype, 'buildSchemas')
    try {
      const schemas = await accessor.schemaBuilder({ jsonData: { HEDVersion: '8.4.0' } })
      expect(schemas.baseSchema.version).toBe('8.4.0')
      expect(loaderSpy).toHaveBeenCalledTimes(1)
    } finally {
      loaderSpy.mockRestore()
    }
  })
})

describe('BidsWebAccessor.getFileContent', () => {
  it('returns the text content of a file in the map', async () => {
    const files = makeFiles({
      'my-dataset/dataset_description.json': '{"Name":"test"}',
      'my-dataset/participants.tsv': 'participant_id\nsub-01',
    })
    const accessor = await BidsWebAccessor.create(files)
    const content = await accessor.getFileContent('dataset_description.json')
    expect(content).toBe('{"Name":"test"}')
  })

  it('returns null for a path not in the map', async () => {
    const accessor = await BidsWebAccessor.create([])
    const content = await accessor.getFileContent('nonexistent.json')
    expect(content).toBeNull()
  })

  it('throws when the File object lacks a text() method', async () => {
    // Simulate a File-like object without .text()
    const badFile = { webkitRelativePath: 'ds/dataset_description.json', name: 'dataset_description.json' }
    const accessor = await BidsWebAccessor.create([badFile])
    await expect(accessor.getFileContent('dataset_description.json')).rejects.toThrow(
      'Cannot read file dataset_description.json: File object in map lacks .text() method.',
    )
  })
})
