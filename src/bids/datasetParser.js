/**
 * Provides file access for BIDS datasets.
 *
 * This module contains the {@link BidsFileAccessor} base class. Its subclasses read files from a BIDS dataset in
 * different environments: {@link BidsDirectoryAccessor} (module bids/directoryAccessor) a local directory,
 * {@link BidsWebAccessor} (module bids/webAccessor) the files uploaded to a web browser.
 *
 * @module bids/datasetParser
 */

import { IssueError } from '../issues/issues'
import { organizePaths } from '../utils/paths'

/**
 * Base class for BIDS file accessors.
 *
 * This class provides a common interface for accessing files in a BIDS dataset, regardless of the underlying storage
 * mechanism. Subclasses must implement the `create` and `getFileContent` methods.
 */
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
   * The HED schema builder function.
   * @type {function}
   */
  schemaBuilder

  /**
   * BIDS suffixes.
   * @type {string[]}
   * @private
   */
  static _SUFFIXES = ['dataset_description', 'participants', '_events', '_beh', '_scans', '_sessions', 'samples']

  /**
   * BIDS special directories.
   * @type {string[]}
   */
  static SPECIAL_DIRS = ['phenotype', 'stimuli']

  /**
   * Constructs a BidsFileAccessor.
   *
   * @param {string} datasetRootDirectory The root directory of the dataset.
   * @param {Map<string, any>} fileMap A map of relative file paths to file representations (e.g., `File` objects for web, full paths for Node.js).
   * @param {function(BidsJsonFile): Promise<HedSchemas|null>} [schemaBuilder] The HED schema builder function.
   */
  constructor(datasetRootDirectory, fileMap, schemaBuilder = null) {
    if (typeof datasetRootDirectory !== 'string') {
      IssueError.generateAndThrowInternalError(
        'BidsFileAccessor constructor requires a string for datasetRootDirectory.',
      )
    }
    if (!(fileMap instanceof Map)) {
      // Ensure fileMap is a Map
      IssueError.generateAndThrowInternalError('BidsFileAccessor constructor requires a Map argument for fileMap.')
    }
    this.datasetRootDirectory = datasetRootDirectory
    this._initialize(fileMap)
    this.schemaBuilder = schemaBuilder
  }

  /**
   * Factory method to create a BidsFileAccessor.
   *
   * This method must be implemented by subclasses to handle environment-specific setup.
   *
   * @param {string | object} datasetRootDirectory The root directory of the dataset or a file-like object.
   * @returns {Promise<BidsFileAccessor>} A Promise that resolves to a new BidsFileAccessor instance.
   * @throws {IssueError} If the method is not implemented by a subclass.
   */
  static async create(datasetRootDirectory) {
    // Use datasetRootDirectory in the error message to satisfy the linter
    IssueError.generateAndThrowInternalError(
      `BidsFileAccessor.create for '${datasetRootDirectory}' must be implemented by a subclass.`,
    )
  }

  /**
   * Initializes the file map and organized paths.
   *
   * This method filters the file map to include only BIDS-related files and organizes them by type and category.
   *
   * @param {Map<string, any>} fileMap A map of relative file paths to file representations.
   * @private
   */
  _initialize(fileMap) {
    const relativeFilePaths = Array.from(fileMap.keys())
    const { candidates, organizedPaths } = organizePaths(
      relativeFilePaths,
      BidsFileAccessor._SUFFIXES,
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
   *
   * This method must be implemented by subclasses to handle environment-specific file reading.
   *
   * @param {string} relativePath The relative path to the file.
   * @returns {Promise<string|null>} A promise that resolves with the file content as a string, or null if the file cannot be read.
   * @throws {IssueError} If the method is not implemented by a subclass.
   */
  async getFileContent(relativePath) {
    if (!this.fileMap.has(relativePath)) {
      return null
    }
    // Use relativePath in the error message to satisfy the linter
    IssueError.generateAndThrowInternalError(
      `getFileContent for '${relativePath}': File found in map, but base class cannot determine how to read content. Subclass must implement.`,
    )
  }
}
