/**
 * This module holds asynchronous functions for reading files.
 * @module
 */
import { readFile as readFilePromise } from 'node:fs/promises'

import { IssueError } from '../issues/issues'

/**
 * Read a local file.
 *
 * @param fileName The file path.
 * @returns A promise with the file contents.
 * @throws {IssueError} If the file read failed or if called in a browser environment.
 */
export async function readFile(fileName: string): Promise<string> {
  try {
    const stringBuffer = await readFilePromise(fileName, 'utf8')
    return stringBuffer.toString()
  } catch (error) {
    IssueError.generateAndThrow('fileReadError', { fileName: fileName, message: error.message })
  }
}

/**
 * Read a remote file using HTTPS.
 *
 * @param url The remote URL.
 * @returns A promise with the file contents.
 * @throws {IssueError} If the network read failed.
 */
export async function readHTTPSFile(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    IssueError.generateAndThrow('networkReadError', {
      url: url,
      statusCode: response.status.toString(),
      statusText: response.statusText,
    })
  }
  return response.text()
}
