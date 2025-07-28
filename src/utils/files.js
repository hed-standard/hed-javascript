import fetch from 'cross-fetch'

import { IssueError, generateIssue } from '../issues/issues'

/**
 * Cross-platform file system operations that work in both Node.js and Deno environments.
 */
export const fsp = {
  /**
   * Read a file asynchronously.
   * @param {string} filePath The path to the file.
   * @param {string} encoding The encoding to use (defaults to 'utf8').
   * @returns {Promise<string>} The file contents.
   */
  async readFile(filePath, encoding = 'utf8') {
    if (typeof globalThis.Deno !== 'undefined') {
      return await globalThis.Deno.readTextFile(filePath)
    } else if (typeof window === 'undefined') {
      // Fallback for Node.js environments - use require instead of dynamic import
      const fs = require('fs').promises
      return await fs.readFile(filePath, encoding)
    }
  },

  /**
   * Get file/directory statistics.
   * @param {string} path The path to stat.
   * @returns {Promise<object>} File stats object.
   */
  async stat(path) {
    if (typeof globalThis.Deno !== 'undefined') {
      return await globalThis.Deno.stat(path)
    } else if (typeof window === 'undefined') {
      // Fallback for Node.js environments - use require instead of dynamic import
      const fs = require('fs').promises
      return await fs.stat(path)
    }
  },

  /**
   * Read directory contents.
   * @param {string} path The directory path.
   * @param {object} options Options for reading directory.
   * @returns {Promise<Array>} Array of directory entries.
   */
  async readdir(path, options = {}) {
    if (typeof globalThis.Deno !== 'undefined') {
      const entries = []
      for await (const entry of globalThis.Deno.readDir(path)) {
        entries.push({
          name: entry.name,
          isDirectory: () => entry.isDirectory,
          isFile: () => entry.isFile,
        })
      }
      return entries
    } else {
      // Fallback for Node.js environments - use require instead of dynamic import
      const fs = require('fs').promises
      return await fs.readdir(path, options)
    }
  },
}

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
    try {
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
