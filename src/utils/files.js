/** This module holds asynchronous functions for reading files.
 * @module
 */
import { readFile as readFilePromise } from 'node:fs/promises'

import { IssueError } from '../issues/issues'

/**
 * Read a local file.
 *
 * @param {string} fileName The file path.
 * @returns {Promise<string>} A promise with the file contents.
 * @throws {IssueError} If the file read failed.
 */
export async function readFile(fileName) {
  try {
    const stringBuffer = await readFilePromise(fileName, 'utf8')
    return stringBuffer.toString()
  } catch (error) {
    IssueError.generateAndThrow('fileReadError', { fileName: fileName, message: error.message })
  }
}
