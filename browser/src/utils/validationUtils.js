import { BidsTsvFile, BidsSidecar } from '@hed-javascript-root/index.js'

/**
 * Performs HED validation on a JSON sidecar.
 *
 * @param {string} jsonName - The name of the JSON file.
 * @param {string} jsonPath - The path to the JSON file.
 * @param {object} jsonData - The parsed JSON data.
 * @param {HedSchemas} hedSchema - The loaded HED schema (e.g., HedSchema).
 * @returns {Array} An array of validation issues.
 */
export function performJsonValidation(jsonName, jsonPath, jsonData, hedSchema) {
  try {
    const jsonFileObject = { name: jsonName, path: jsonPath }

    // The BidsSidecar constructor expects (name, fileObject, jsonData)
    const bidsSidecar = new BidsSidecar(jsonName, jsonFileObject, jsonData)
    return bidsSidecar.validate(hedSchema)
  } catch (err) {
    // console.error('Error during HED validation utility:', err);
    console.warn('Error during HED validation utility:', err) // Changed to console.warn
    return [
      {
        code: 'VALIDATION_UTIL_ERROR',
        message: err.message || 'An unexpected error occurred in performHedValidation.',
        location: jsonPath,
      },
    ]
  }
}

/**
 * Performs HED validation on a TSV file and its JSON sidecar.
 *
 * @param {string} tsvName - The name of the TSV file.
 * @param {string} tsvPath - The path to the TSV file.
 * @param {string} tsvData - The text content of the TSV file.
 * @param {HedSchemas} hedSchema - The loaded HED schema (e.g., HedSchema).
 * @param {object} [mergedDict={}] - An optional merged dictionary.
 * @returns {Array} An array of validation issues.
 */
export function performTsvValidation(tsvName, tsvPath, tsvData, hedSchema, mergedDict = {}) {
  try {
    const tsvFileObject = { name: tsvName, path: tsvPath }
    const bidsTsvFile = new BidsTsvFile(tsvName, tsvFileObject, tsvData, mergedDict)
    return bidsTsvFile.validate(hedSchema)
  } catch (err) {
    // console.error('Error during HED validation utility:', err);
    console.warn('Error during HED validation utility:', err) // Changed to console.warn
    return [
      {
        code: 'VALIDATION_UTIL_ERROR',
        message: err.message || 'An unexpected error occurred in performHedValidation.',
        location: tsvPath,
      },
    ]
  }
}
