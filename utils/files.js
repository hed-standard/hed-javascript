import fs from 'fs'
import request from 'then-request'

/**
 * Read a local file.
 *
 * @param {string} fileName The file path.
 * @return {Promise<unknown>} A promise with the file contents.
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
 * @return {Promise<string>} A promise with the file contents.
 */
export const readHTTPSFile = function (url) {
  return request('GET', url).then((res) => res.getBody())
}
