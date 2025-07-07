import fetch from 'cross-fetch'

import { IssueError, generateIssue } from '../issues/issues'

/**
 * Read a local file.
 *
 * @param {string} fileName The file path.
 * @returns {Promise<string>} A promise with the file contents.
 * @throws {IssueError} If the file read failed or if called in a browser environment.
 */
export async function readFile(fileName) {
  // @ts-ignore __VITE_ENV__ is defined by Vite in browser builds
  if (typeof __VITE_ENV__ !== 'undefined' && __VITE_ENV__) {
    throw new IssueError(
      generateIssue('internalError', {
        message: 'Local file reading (readFile) is not supported in the browser environment.',
      }),
    )
  } else {
    // Node.js/Jest environment
    try {
      const fsp = require('fs').promises // Changed from dynamic import to require
      return await fsp.readFile(fileName, 'utf8')
    } catch (error) {
      IssueError.generateAndThrow('fileReadError', { fileName: fileName, message: error.message })
    }
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
