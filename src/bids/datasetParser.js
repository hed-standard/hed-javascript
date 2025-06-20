import { BidsJsonFile } from './types/json'
import fsp from 'fs/promises'
import path from 'path'
import { organizePaths } from '../utils/paths.js'

/**
 * Parse a BIDS JSON file.
 *
 * @param {string} datasetRoot The root path of the dataset.
 * @param {string} relativePath The relative path of the file within the dataset.
 * @returns {Promise<BidsJsonFile>} The built JSON file object.
 */
export async function parseBidsJsonFile(datasetRoot, relativePath) {
  return BidsJsonFile.createFromBidsDatasetPath(datasetRoot, relativePath)
}

// Base Class Definition for File Access
export class BidsFileAccessor {
  /**
   * The root directory of the dataset.
   * @type {string}
   */
  datasetRootDirectory

  /**
   * Map of relative file paths to file representations.
   * @type {Map<string, any>}
   */
  fileMap

  /**
   * Organized paths.
   * @type {Map<string, Map<string, string[]>>}
   */
  organizedPaths

  /**
   * BIDS suffixes.
   * @type {string[]}
   */
  static SUFFIXES = ['dataset_description', 'participants', '_events', '_beh', '_scans', '_sessions', 'samples']

  /**
   * BIDS special directories.
   * @type {string[]}
   */
  static SPECIAL_DIRS = ['phenotype', 'stimuli']

  /**
   * @param {string} datasetRootDirectory The root directory of the dataset.
   * @param {Map<string, any>} fileMap Map of relative file paths to file representations (e.g., File objects for web, full paths for directory).
   */
  constructor(datasetRootDirectory, fileMap) {
    if (typeof datasetRootDirectory !== 'string') {
      throw new Error('BidsFileAccessor constructor requires a string for datasetRootDirectory.')
    }
    if (!(fileMap instanceof Map)) {
      // Ensure fileMap is a Map
      throw new Error('BidsFileAccessor constructor requires a Map argument for fileMap.')
    }
    this.datasetRootDirectory = datasetRootDirectory
    this._initialize(fileMap)
  }

  /**
   * Factory method to create a BidsFileAccessor.
   * This method should be implemented by subclasses.
   * @param {string} datasetRootDirectory The root directory of the dataset.
   * @returns {Promise<BidsFileAccessor>}
   */
  static async create(datasetRootDirectory) {
    // Use datasetRootDirectory in the error message to satisfy the linter
    throw new Error(`BidsFileAccessor.create for '${datasetRootDirectory}' must be implemented by a subclass.`)
  }

  /**
   * Initialize the BidsFileAccessor.
   * @param {Map<string, any>} fileMap Map of relative file paths to file representations.
   * @private
   */
  _initialize(fileMap) {
    const relativeFilePaths = Array.from(fileMap.keys())
    const { candidates, organizedPaths } = organizePaths(
      relativeFilePaths,
      BidsFileAccessor.SUFFIXES,
      BidsFileAccessor.SPECIAL_DIRS,
    )
    this.organizedPaths = organizedPaths

    const newFileMap = new Map()
    for (const candidate of candidates) {
      newFileMap.set(candidate, fileMap.get(candidate))
    }
    this.fileMap = newFileMap
  }

  /**
   * Asynchronously reads the content of a file.
   * This method should be implemented by subclasses.
   * @param {string} relativePath The relative path to the file.
   * @returns {Promise<string|null>} A promise that resolves with the file content as a string, or null if not found.
   */
  async getFileContent(relativePath) {
    if (!this.fileMap.has(relativePath)) {
      return null
    }
    // Use relativePath in the error message to satisfy the linter
    throw new Error(
      `getFileContent for '${relativePath}': File found in map, but base class cannot determine how to read content. Subclass must implement.`,
    )
  }

  /**
   * Gets all relative file paths known to the accessor.
   * This method should be implemented by subclasses.
   * @returns {string[]} An array of relative file paths.
   */
  getAllFilePaths() {
    throw new Error('getAllFilePaths must be implemented by a subclass')
  }
}

// Subclass for web environment

// Subclass for directory (e.g., Node.js) environment
export class BidsDirectoryAccessor extends BidsFileAccessor {
  /**
   * @param {string} datasetRootDirectory The absolute path to the dataset's root directory.
   * @param {Map<string, any>} fileMap A map of file paths.
   */
  constructor(datasetRootDirectory, fileMap) {
    if (typeof datasetRootDirectory !== 'string' || !datasetRootDirectory) {
      throw new Error('BidsDirectoryAccessor constructor requires a non-empty string for datasetRootDirectory.')
    }
    super(datasetRootDirectory, fileMap)
  }

  /**
   * Factory method to create a BidsDirectoryAccessor.
   * @param {string} datasetRootDirectory The absolute path to the dataset's root directory.
   * @returns {Promise<BidsDirectoryAccessor>}
   */
  static async create(datasetRootDirectory) {
    if (typeof datasetRootDirectory !== 'string' || !datasetRootDirectory) {
      throw new Error('BidsDirectoryAccessor.create requires a non-empty string for datasetRootDirectory.')
    }
    const resolvedDatasetRoot = path.resolve(datasetRootDirectory)
    const fileMap = new Map()
    await BidsDirectoryAccessor._readDirRecursive(resolvedDatasetRoot, resolvedDatasetRoot, fileMap)
    return new BidsDirectoryAccessor(resolvedDatasetRoot, fileMap)
  }

  /**
   * Asynchronously reads the content of a file from the file system.
   * @param {string} relativePath The relative path to the file within the dataset.
   * @returns {Promise<string|null>} A promise that resolves with the file content as a string, or null if not found/error.
   */
  async getFileContent(relativePath) {
    const absolutePath = this.fileMap.get(relativePath)
    if (!absolutePath) {
      return null
    }

    try {
      return await fsp.readFile(absolutePath, 'utf8')
    } catch (err) {
      // console.warn(`BidsDirectoryAccessor: Error reading file ${absolutePath}:`, err);
      return null // Resolve with null on error like file not found
    }
  }

  /**
   * Gets all relative file paths from the keys of the pre-populated fileMap.
   * @returns {string[]} An array of relative file paths.
   */
  getAllFilePaths() {
    return Array.from(this.fileMap.keys())
  }

  /**
   * Helper to recursively read directory contents and populate the fileMap.
   * @param {string} dir The directory to read.
   * @param {string} baseDir The base directory to calculate relative paths from.
   * @param {Map<string, string>} fileMapRef The Map to populate with relativePath: absolutePath.
   * @private
   */
  static async _readDirRecursive(dir, baseDir, fileMapRef) {
    try {
      // Check if the current path is a directory before attempting to read it.
      // This handles cases where datasetRootDirectory itself might be a file or non-existent.
      const stats = await fsp.stat(dir) // This will throw if 'dir' does not exist.
      if (!stats.isDirectory()) {
        // If 'dir' is a file (not a directory), we cannot read entries from it.
        // This is expected if the initial datasetRootDirectory was a file path.
        return
      }

      const entries = await fsp.readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          await BidsDirectoryAccessor._readDirRecursive(fullPath, baseDir, fileMapRef)
        } else {
          const systemRelativePath = path.relative(baseDir, fullPath)
          const normalizedRelativePath = systemRelativePath.split(path.sep).join('/')
          fileMapRef.set(normalizedRelativePath, fullPath)
        }
      }
    } catch (err) {
      // This catch block will now primarily handle errors like:
      // 1. fs.stat(dir) failing (e.g., dir does not exist - ENOENT).
      // 2. fs.readdir(dir) failing for other reasons (e.g., permissions - EACCES).
      // The ENOTDIR error for 'dir' itself should be prevented by the isDirectory() check.
      // We only log a warning if the error is not ENOENT for the base directory,
      // or if it's any other error for subdirectories.
      if (err.code === 'ENOENT' && dir === baseDir) {
        // This means the initial datasetRootDirectory does not exist.
        // This is an expected case for one of the tests, so no warning needed here.
      } else if (err.code === 'ENOTDIR' && dir === baseDir) {
        // This means the initial datasetRootDirectory was a file.
        // This is also an expected case for one of the tests, so no warning needed here.
      } else {
        console.warn(`BidsDirectoryAccessor: Error processing directory ${dir}:`, err)
      }
    }
    // No explicit return needed as it modifies fileMapRef directly
  }
}
