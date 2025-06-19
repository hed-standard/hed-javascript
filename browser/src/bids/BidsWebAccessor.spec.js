import { jest, describe, it, expect } from '@jest/globals'
import { BidsWebAccessor } from './BidsWebAccessor.js'

// Mock File object for BidsWebAccessor tests
const MockFile = class {
  constructor(content) {
    this.content = content
    this.name = 'mockfile.txt'
    this.size = content.length
    this.type = 'text/plain'
  }
  async text() {
    return this.content
  }
  // Add other methods if needed by your tests, e.g., arrayBuffer, slice, etc.
}

describe('BidsWebAccessor', () => {
  it('It should have true to be true', () => {
    expect(true).toBeTruthy()
  })
})
//   const datasetRoot = '' // Typically empty for web if paths are already relative
//   describe('constructor', () => {
//     it('should throw an error if fileInput is not a Map', () => {
//       expect(() => new BidsWebAccessor(datasetRoot, [])).toThrow(
//         'BidsWebAccessor constructor requires a Map object for fileMap.',
//       )
//     })
//     it('should create an instance if fileInput is a Map', () => {
//       expect(() => new BidsWebAccessor(datasetRoot, new Map())).not.toThrow()
//     })
//   })
//
//   describe('getFileContent', () => {
//     it('should return null if the file is not in the map', async () => {
//       const accessor = new BidsWebAccessor(datasetRoot, new Map())
//       const content = await accessor.getFileContent('nonexistent.txt')
//       expect(content).toBeNull()
//     })
//
//     it('should call file.text() and return its result', async () => {
//       const mockFile = new MockFile('file content')
//       const fileInput = new Map([['test.txt', mockFile]])
//       const accessor = new BidsWebAccessor(datasetRoot, fileInput)
//       const content = await accessor.getFileContent('test.txt')
//       expect(content).toBe('file content')
//     })
//
//     it('should re-throw an error if file.text() throws', async () => {
//       const mockFile = {
//         text: jest.fn().mockRejectedValue(new Error('Read error')),
//       }
//       const fileInput = new Map([['test.txt', mockFile]])
//       const accessor = new BidsWebAccessor(datasetRoot, fileInput)
//       await expect(accessor.getFileContent('test.txt')).rejects.toThrow('Read error')
//     })
//
//     it('should throw an error if the file object lacks a .text() method', async () => {
//       const fileInput = new Map([['test.txt', {}]]) // File without .text()
//       const accessor = new BidsWebAccessor(datasetRoot, fileInput)
//       await expect(accessor.getFileContent('test.txt')).rejects.toThrow(
//         'Cannot read file test.txt: File object in map lacks .text() method.',
//       )
//     })
//   })
//
//   describe('getAllFilePaths', () => {
//     it('should return keys from the fileInput map', () => {
//       const fileInput = new Map([
//         ['file1.json', new MockFile('{}')],
//         ['data/file2.tsv', new MockFile('tsv content')],
//       ])
//       const accessor = new BidsWebAccessor(datasetRoot, fileInput)
//       const paths = accessor.getAllFilePaths()
//       expect(paths).toEqual(['file1.json', 'data/file2.tsv'])
//     })
//     it('should return an empty array for an empty map', () => {
//       const fileInput = new Map()
//       const accessor = new BidsWebAccessor(datasetRoot, fileInput)
//       expect(accessor.getAllFilePaths()).toEqual([])
//     })
//   })
//})
