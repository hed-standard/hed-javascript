/**
 * Provides local directory access for BIDS datasets.
 *
 * This module holds {@link BidsDirectoryAccessor}, the only BIDS code that reads the file system. The ESM (browser)
 * build replaces it by {@link module:bids/directoryAccessor.browser} through the "browser" field of package.json.
 *
 * @module bids/directoryAccessor
 */

import fsp from 'node:fs/promises'
import path from 'node:path'

import { BidsFileAccessor } from './datasetParser'
import { buildBidsSchemas } from './schema'
import { IssueError } from '../issues/issues'

/**
 * A BIDS file accessor for local directory environments (e.g., Node.js).
 *
 * This class reads files from the local file system.
 *
 * @example
 * // In a Node.js environment:
 * const { BidsDataset, BidsDirectoryAccessor } = require('hed-validator');
 * const path = require('path');
 *
 * async function main() {
 *   const dataRoot = path.join(__dirname, 'path/to/bids/dataset');
 *   const [dataset, issues] = await BidsDataset.create(dataRoot, BidsDirectoryAccessor);
 *   if (dataset) {
 *     const validationIssues = await dataset.validate();
 *     // process issues
 *   } else {
 *     // process creation issues
 *   }
 * }
 *
 * main();
 */
export class BidsDirectoryAccessor extends BidsFileAccessor {
  /**
   * Constructs a BidsDirectoryAccessor.
   *
   * @param {string} datasetRootDirectory The absolute path to the dataset's root directory.
   * @param {Map<string, string>} fileMap A map of relative file paths to their absolute paths.
   * @throws {IssueError} If the dataset root directory path is invalid.
   */
  constructor(datasetRootDirectory, fileMap) {
    if (typeof datasetRootDirectory !== 'string' || !datasetRootDirectory) {
      const message = `Bids validation requires a non-empty string for the dataset root directory but received: ${datasetRootDirectory}`
      IssueError.generateAndThrow('fileReadError', { fileName: datasetRootDirectory, message: `${message}` })
    }
    super(datasetRootDirectory, fileMap, buildBidsSchemas)
  }

  /**
   * Factory method to create a BidsDirectoryAccessor.
   *
   * This method recursively reads the specified directory and creates a file map.
   *
   * @param {string} datasetRootDirectory The absolute path to the dataset's root directory.
   * @returns {Promise<BidsDirectoryAccessor>} A Promise that resolves to a new BidsDirectoryAccessor instance.
   * @throws {IssueError} If the dataset root directory path is empty.
   */
  static async create(datasetRootDirectory) {
    if (typeof datasetRootDirectory !== 'string' || !datasetRootDirectory) {
      IssueError.generateAndThrowInternalError('Must have a non-empty dataset root directory path.')
    }
    const resolvedDatasetRoot = path.resolve(datasetRootDirectory)
    const fileMap = new Map()
    await BidsDirectoryAccessor._readDirRecursive(resolvedDatasetRoot, resolvedDatasetRoot, fileMap)
    return new BidsDirectoryAccessor(resolvedDatasetRoot, fileMap)
  }

  /**
   * Asynchronously reads the content of a file from the file system.
   *
   * @param {string} relativePath The relative path to the file within the dataset.
   * @returns {Promise<string|null>} A promise that resolves with the file content as a string, or null if the file is not found or an error occurs.
   */
  async getFileContent(relativePath) {
    const absolutePath = this.fileMap.get(relativePath)
    if (!absolutePath) {
      return null
    }

    try {
      return String(await fsp.readFile(absolutePath, 'utf8'))
    } catch {
      return null // Resolve with null on error like file not found
    }
  }

  /**
   * Recursively reads directory contents and populates the file map.
   *
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
