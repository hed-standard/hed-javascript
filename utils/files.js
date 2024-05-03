import fs from 'fs'

import fetch from 'cross-fetch'

/**
 * Read a local file.
 *
 * @param {string} fileName The file path.
 * @returns {Promise<unknown>} A promise with the file contents.
 */
export function readFile(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

/**
 * Read a remote file using HTTPS.
 *
 * @param {string} url The remote URL.
 * @returns {Promise<string>} A promise with the file contents.
 */
export async function readHTTPSFile(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Server responded to ${url} with status code ${response.status}: ${response.statusText}`)
  }
  return response.text()
}
