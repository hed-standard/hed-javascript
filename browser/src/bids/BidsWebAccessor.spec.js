/** @jest-environment jsdom */

import { jest, describe, it, expect } from '@jest/globals'
import { BidsWebAccessor } from './BidsWebAccessor.js'

// Mock File object for BidsWebAccessor tests
const MockFile = class {
  constructor(content, name, webkitRelativePath) {
    this.content = content
    this.name = name || 'mockfile.txt'
    this.size = content.length
    this.type = 'text/plain'
    this.webkitRelativePath = webkitRelativePath
  }
  async text() {
    return this.content
  }
}

describe('BidsWebAccessor', () => {
  describe('create', () => {
    it('should handle an empty file list', async () => {
      const accessor = await BidsWebAccessor.create([])
      expect(accessor.datasetRootDirectory).toBe('')
      expect(accessor.fileMap.size).toBe(0)
    })

    it('should extract the root directory and create a relative file map', async () => {
      const fileInput = [
        new MockFile('{}', 'dataset_description.json', 'my-dataset/dataset_description.json'),
        new MockFile('data', 'sub-01_events.tsv', 'my-dataset/sub-01/sub-01_events.tsv'),
      ]
      const accessor = await BidsWebAccessor.create(fileInput)
      expect(accessor.datasetRootDirectory).toBe('my-dataset')
      expect(Array.from(accessor.fileMap.keys()).sort()).toEqual(
        ['dataset_description.json', 'sub-01/sub-01_events.tsv'].sort(),
      )
      expect(accessor.fileMap.get('dataset_description.json')).toBe(fileInput[0])
    })

    it('should handle files in the root without a parent directory', async () => {
      const fileInput = [
        new MockFile('{}', 'dataset_description.json', 'dataset_description.json'),
        new MockFile('data', 'participants.tsv', 'participants.tsv'),
      ]
      const accessor = await BidsWebAccessor.create(fileInput)
      expect(accessor.datasetRootDirectory).toBe('')
      expect(Array.from(accessor.fileMap.keys()).sort()).toEqual(
        ['dataset_description.json', 'participants.tsv'].sort(),
      )
    })
  })

  describe('getFileContent', () => {
    it('should return null if the file is not in the map', async () => {
      const accessor = await BidsWebAccessor.create([])
      const content = await accessor.getFileContent('nonexistent.txt')
      expect(content).toBeNull()
    })

    it('should call file.text() and return its result', async () => {
      const mockFile = new MockFile('file content', 'dataset_description.json', 'my-dataset/dataset_description.json')
      const fileInput = [mockFile]
      const accessor = await BidsWebAccessor.create(fileInput)
      const content = await accessor.getFileContent('dataset_description.json')
      expect(content).toBe('file content')
    })

    it('should throw an error if the file object lacks a .text() method', async () => {
      const fileInput = [
        {
          name: 'dataset_description.json',
          webkitRelativePath: 'my-dataset/dataset_description.json',
        },
      ]
      const accessor = await BidsWebAccessor.create(fileInput)
      await expect(accessor.getFileContent('dataset_description.json')).rejects.toThrow(
        'Cannot read file dataset_description.json: File object in map lacks .text() method.',
      )
    })
  })

  describe('getAllFilePaths', () => {
    it('should return keys from the fileInput map', async () => {
      const fileInput = [
        new MockFile('{}', 'dataset_description.json', 'my-dataset/dataset_description.json'),
        new MockFile('tsv content', 'participants.tsv', 'my-dataset/participants.tsv'),
      ]
      const accessor = await BidsWebAccessor.create(fileInput)
      const paths = accessor.getAllFilePaths()
      expect(paths.sort()).toEqual(['dataset_description.json', 'participants.tsv'].sort())
    })
    it('should return an empty array for an empty map', async () => {
      const accessor = await BidsWebAccessor.create([])
      expect(accessor.getAllFilePaths()).toEqual([])
    })
  })
})
