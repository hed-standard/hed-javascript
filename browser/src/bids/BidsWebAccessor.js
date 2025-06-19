import { BidsFileAccessor } from '../../../src/bids/datasetParser.js'

// Subclass for web environment
export class BidsWebAccessor extends BidsFileAccessor {
  /**
   * @param {string} datasetRootDirectory Usually an empty string or dataset name for web context.
   * @param {Map<string, File>} fileInputMap Map of relative file paths to File objects.
   */
  constructor(datasetRootDirectory, fileInputMap) {
    // Renamed parameter for clarity
    if (!(fileInputMap instanceof Map)) {
      throw new Error('BidsWebAccessor constructor requires a Map object for fileMap.')
    }
    super(datasetRootDirectory, fileInputMap)
  }

  async getFileContent(relativePath) {
    const file = this.fileMap.get(relativePath) // Corrected to use this.fileMap
    if (!file) {
      return null
    }
    if (typeof file.text === 'function') {
      // Removed unnecessary try-catch
      return await file.text()
    } else {
      throw new Error(`Cannot read file ${relativePath}: File object in map lacks .text() method.`)
    }
  }

  getAllFilePaths() {
    return Array.from(this.fileMap.keys()) // Corrected to use this.fileMap
  }
}
