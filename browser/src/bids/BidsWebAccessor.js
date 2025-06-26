import { BidsFileAccessor } from '../../../src/bids/datasetParser.js'

/**
 * Processes a list of files to determine the dataset root and create a relative file map.
 * @param {FileList|File[]} fileInput The files from a webkitdirectory upload.
 * @returns {{datasetRootDirectory: string, fileMap: Map<string, any>}}
 * @private
 */
function _processFileList(fileInput) {
  const fileList = Array.from(fileInput)
  if (fileList.length === 0) {
    return { datasetRootDirectory: '', fileMap: new Map() }
  }

  // Determine the dataset root directory from the common path prefix.
  // Assumes the first file's path is representative.
  const firstPath = fileList[0].webkitRelativePath || ''
  const rootDirEndIndex = firstPath.indexOf('/')
  const datasetRootDirectory = rootDirEndIndex > -1 ? firstPath.substring(0, rootDirEndIndex) : ''

  const fileMap = new Map()
  const prefix = datasetRootDirectory ? datasetRootDirectory + '/' : ''
  for (const file of fileList) {
    const webkitRelativePath = file.webkitRelativePath || file.name
    if (!webkitRelativePath) {
      continue
    }
    const relativePath = webkitRelativePath.startsWith(prefix)
      ? webkitRelativePath.substring(prefix.length)
      : webkitRelativePath
    if (relativePath) {
      fileMap.set(relativePath, file)
    }
  }
  return { datasetRootDirectory, fileMap }
}

// Subclass for web environment
export class BidsWebAccessor extends BidsFileAccessor {
  /**
   * Factory method to create a BidsWebAccessor.
   * @param {FileList|File[]} fileInput The files from a webkitdirectory upload.
   * @returns {Promise<BidsWebAccessor>}
   */
  static async create(fileInput) {
    const { datasetRootDirectory, fileMap } = _processFileList(fileInput)
    return new BidsWebAccessor(datasetRootDirectory, fileMap)
  }

  /**
   * Constructor for BidsWebAccessor.
   *
   * @param {string} datasetRootDirectory The root directory of the dataset.
   * @param {Map<string, any>} fileMap Map of relative file paths to file representations.
   * @private
   */
  constructor(datasetRootDirectory, fileMap) {
    super(datasetRootDirectory, fileMap)
  }

  async getFileContent(relativePath) {
    const file = this.fileMap.get(relativePath)
    if (!file) {
      return null
    }
    if (typeof file.text === 'function') {
      return await file.text()
    } else {
      throw new Error(`Cannot read file ${relativePath}: File object in map lacks .text() method.`)
    }
  }
}
