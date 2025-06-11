import { BidsJsonFile, BidsSidecar } from './types/json'

/**
 * Parse a BIDS JSON file.
 *
 * @param {string} datasetRoot The root path of the dataset.
 * @param {string} relativePath The relative path of the file within the dataset.
 * @returns {Promise<BidsJsonFile>} The built JSON file object.
 */
export async function parseBidsJsonFile(datasetRoot, relativePath) {
  return BidsJsonFile.createFromBidsDatasetPath(datasetRoot, relativePath)
}

/**
 * Parse a BIDS sidecar.
 *
 * @param {string} datasetRoot The root path of the dataset.
 * @param {string} relativePath The relative path of the file within the dataset.
 * @returns {Promise<BidsSidecar>} The built sidecar object.
 */
export async function parseBidsSidecar(datasetRoot, relativePath) {
  return BidsSidecar.createFromBidsDatasetPath(datasetRoot, relativePath)
}
