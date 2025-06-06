import path from 'path'

import { BidsJsonFile, BidsSidecar } from './types/json'
import { readFile } from '../utils/files'

/**
 * Parse a BIDS JSON file.
 *
 * @param {string} datasetRoot The root path of the dataset.
 * @param {string} relativePath The relative path of the file within the dataset.
 * @returns {Promise<BidsJsonFile>} The built JSON file object.
 */
export async function parseBidsJsonFile(datasetRoot, relativePath) {
  const [contents, fileObject] = await readBidsFile(datasetRoot, relativePath)
  const jsonData = JSON.parse(contents)
  return new BidsJsonFile(relativePath, fileObject, jsonData)
}

/**
 * Parse a BIDS sidecar.
 *
 * @param {string} datasetRoot The root path of the dataset.
 * @param {string} relativePath The relative path of the file within the dataset.
 * @returns {Promise<BidsSidecar>} The built sidecar object.
 */
export async function parseBidsSidecar(datasetRoot, relativePath) {
  const [contents, fileObject] = await readBidsFile(datasetRoot, relativePath)
  const jsonData = JSON.parse(contents)
  return new BidsSidecar(relativePath, fileObject, jsonData)
}

/**
 * Read a BIDS file.
 *
 * @param {string} datasetRoot The root path of the dataset.
 * @param {string} relativePath The relative path of the file within the dataset.
 * @returns {Promise<[string, {path: string}]>} The file contents and mocked BIDS-type file object.
 */
async function readBidsFile(datasetRoot, relativePath) {
  const filePath = path.join(datasetRoot, relativePath)
  const fileObject = { path: filePath }
  return [await readFile(filePath), fileObject]
}
