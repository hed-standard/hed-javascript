import { BidsFileAccessor } from '../../../src/bids/datasetParser.js'
import { buildSchemasFromVersion } from '../schema/init.js'
import { BidsHedIssue } from '../../../src/bids/types/issues.js'

/**
 * Build HED schemas from a dataset description for the browser environment.
 * @param {object} description The dataset_description.json data.
 * @returns {Promise<Schemas|null>} The HED schemas.
 */
async function buildBidsSchemas(description) {
  const hedVersionString = description.jsonData?.HEDVersion
  if (!hedVersionString) {
    return null
  }
  try {
    return await buildSchemasFromVersion(hedVersionString)
  } catch (e) {
    throw new BidsHedIssue(e.issue)
  }
}

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
  // Find dataset_description.json to determine the root path prefix.
  const descriptionFile = fileList.find((f) => (f.webkitRelativePath || f.name).endsWith('dataset_description.json'))
  let prefix = ''
  if (descriptionFile) {
    const path = descriptionFile.webkitRelativePath || descriptionFile.name
    const lastSlashIndex = path.lastIndexOf('/')
    // Check if the file is in a subdirectory
    if (lastSlashIndex > -1) {
      prefix = path.substring(0, lastSlashIndex)
    }
    // If lastSlashIndex is -1, the file is at the root, and prefix remains ''. This is correct.
  } else {
    // Fallback: if no dataset_description.json, assume the first directory level is the root.
    const firstPath = fileList[0]?.webkitRelativePath || ''
    const rootDirEndIndex = firstPath.indexOf('/')
    if (rootDirEndIndex > -1) {
      prefix = firstPath.substring(0, rootDirEndIndex)
    }
  }

  const datasetRootDirectory = prefix
  const fileMap = new Map()
  const prefixWithSlash = prefix ? prefix + '/' : ''

  for (const file of fileList) {
    const webkitRelativePath = file.webkitRelativePath || file.name
    if (!webkitRelativePath) continue

    const relativePath = webkitRelativePath.startsWith(prefixWithSlash)
      ? webkitRelativePath.substring(prefixWithSlash.length)
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
   * Factory method to create a BidsWebAccessor from a browser FileList.
   * @param {FileList|File[]} fileInput The files from a webkitdirectory upload.
   * @returns {Promise<BidsWebAccessor>}
   * @override
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
    this.schemaBuilder = buildBidsSchemas
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
