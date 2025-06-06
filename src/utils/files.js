import fs from 'fs/promises'

import fetch from 'cross-fetch'

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
    return await fs.readFile(fileName, 'utf8')
  } catch (error) {
    IssueError.generateAndThrow('fileReadError', { fileName: fileName, message: error.message })
  }
}

/**
 * Read a remote file using HTTPS.
 *
 * @param {string} url The remote URL.
 * @returns {Promise<string>} A promise with the file contents.
 * @throws {IssueError} If the network read failed.
 */
export async function readHTTPSFile(url) {
  const response = await fetch(url)
  if (!response.ok) {
    IssueError.generateAndThrow('networkReadError', {
      url: url,
      statusCode: response.status,
      statusText: response.statusText,
    })
  }
  return response.text()
}
