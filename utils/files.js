import fs from 'fs'

import fetch, { Request } from 'cross-fetch'

/**
 * Read a local file.
 *
 * @param {string} fileName The file path.
 * @returns {Promise<unknown>} A promise with the file contents.
 */
export const readFile = function (fileName) {
  return new Promise((resolve) => {
    fs.readFile(fileName, 'utf8', (err, data) => {
      process.nextTick(() => resolve(data))
    })
  })
}

/**
 * Read a remote file using HTTPS.
 *
 * @param {string} url The remote URL.
 * @returns {Promise<string>} A promise with the file contents.
 */
export const readHTTPSFile = function (url) {
  const myRequest = new Request(url)
  return fetch(myRequest).then((response) => {
    if (!response.ok) {
      throw new Error(`Server responded to ${url} with status code ${response.status}: ${response.statusText}`)
    }
    return response.text()
  })
}
