/**
 * Provides file access for BIDS datasets.
 *
 * This module contains the {@link BidsFileAccessor} class and its subclasses, which are responsible for reading files
 * from a BIDS dataset in different environments (e.g., a local directory or a web browser).
 *
 * Note: An implementation of the BidsFileAccessor class for web folder access is not included in the
 * hed-javascript Node distribution, but is included in the hed-javascript GitHub repository in the browser folder.
 *
 * @module bids/datasetParser
 */

import fsp from 'node:fs/promises'
import path from 'node:path'

import { organizePaths } from '../utils/paths'
import { IssueError } from '../issues/issues'
import { buildBidsSchemas } from './schema'
import { type BidsJsonFile } from './types/json'
import { type HedSchemas } from '../schema/containers'

type SchemaBuilder = (datasetDescription: BidsJsonFile) => Promise<HedSchemas>

/**
 * Base class for BIDS file accessors.
 *
 * This class provides a common interface for accessing files in a BIDS dataset, regardless of the underlying storage
 * mechanism. Subclasses must implement the `create` and `getFileContent` methods.
 */
export abstract class BidsFileAccessor<FileType> {
  /**
   * The root directory of the dataset.
   */
  readonly datasetRootDirectory: string

  /**
   * Map of relative file paths to file representations.
   */
  fileMap: Map<string, FileType>

  /**
   * Organized paths.
   */
  organizedPaths: Map<string, Map<string, string[]>>

  /**
   * The HED schema builder function.
   */
  protected readonly schemaBuilder: SchemaBuilder

  /**
   * BIDS suffixes.
   */
  private static readonly SUFFIXES: string[] = [
    'dataset_description',
    'participants',
    '_events',
    '_beh',
    '_scans',
    '_sessions',
    'samples',
  ]

  /**
   * BIDS special directories.
   */
  private static readonly SPECIAL_DIRS: string[] = ['phenotype', 'stimuli']

  /**
   * Constructs a BidsFileAccessor.
   *
   * @param datasetRootDirectory The root directory of the dataset.
   * @param fileMap A map of relative file paths to file representations (e.g., `File` objects for web, full paths for Node.js).
   * @param schemaBuilder The HED schema builder function.
   */
  protected constructor(datasetRootDirectory: string, fileMap: Map<string, FileType>, schemaBuilder: SchemaBuilder) {
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
   * Initializes the file map and organized paths.
   *
   * This method filters the file map to include only BIDS-related files and organizes them by type and category.
   *
   * @param fileMap A map of relative file paths to file representations.
   */
  private _initialize(fileMap: Map<string, FileType>) {
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
   *
   * This method must be implemented by subclasses to handle environment-specific file reading.
   *
   * @param relativePath The relative path to the file.
   * @returns A promise that resolves with the file content as a string, or null if the file cannot be read.
   * @throws {IssueError} If the method is not implemented by a subclass.
   */
  public abstract getFileContent(relativePath: string): Promise<string | null>
}

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
export class BidsDirectoryAccessor extends BidsFileAccessor<string> {
  /**
   * Constructs a BidsDirectoryAccessor.
   *
   * @param datasetRootDirectory The absolute path to the dataset's root directory.
   * @param fileMap A map of relative file paths to their absolute paths.
   * @throws {IssueError} If the dataset root directory path is invalid.
   */
  private constructor(datasetRootDirectory: string, fileMap: Map<string, string>) {
    if (typeof datasetRootDirectory !== 'string' || !datasetRootDirectory) {
      const message = `Bids validation requires a non-empty string for the dataset root directory but received: ${datasetRootDirectory}`
      IssueError.generateAndThrow('fileReadError', { filename: datasetRootDirectory, message: `${message}` })
    }
    super(datasetRootDirectory, fileMap, buildBidsSchemas)
  }

  /**
   * Factory method to create a BidsDirectoryAccessor.
   *
   * This method recursively reads the specified directory and creates a file map.
   *
   * @param datasetRootDirectory The absolute path to the dataset's root directory.
   * @returns A Promise that resolves to a new BidsDirectoryAccessor instance.
   * @throws {IssueError} If the dataset root directory path is empty.
   */
  public static async create(datasetRootDirectory: string): Promise<BidsDirectoryAccessor> {
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
   * @param relativePath The relative path to the file within the dataset.
   * @returns A promise that resolves with the file content as a string, or null if the file is not found or an error occurs.
   */
  public async getFileContent(relativePath: string): Promise<string | null> {
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
   * @param dir The directory to read.
   * @param baseDir The base directory to calculate relative paths from.
   * @param fileMapRef The Map to populate with relativePath: absolutePath.
   */
  private static async _readDirRecursive(dir: string, baseDir: string, fileMapRef: Map<string, string>): Promise<void> {
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
