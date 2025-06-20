// filepath: i:\HEDJavascript\hed-javascript\browser\src\utils\datasetProcessingUtils.js
import { readFileAsText } from './fileReader.js'
import { BidsSidecar } from '@hed-javascript-root/index.js'

/**
 * Asynchronously processes JSON files from BIDS groups, extracts HED data,
 * and creates BidsSidecar objects.
 *
 * @param {File[]} filesList - The array of File objects from the folder input.
 * @param {Object<string, {json?: string[]}>} bidsFileGroups - Categorized JSON file paths (e.g., from getBidsFiles).
 * @returns {Promise<{hedSidecarGroups: Object<string, BidsSidecar[]>, issues: any[]}>}
 *          A promise that resolves to an object containing the HED sidecar groups and any issues encountered.
 */
export async function extractHedSidecarsFromJsonFiles(filesList, bidsFileGroups) {
  const hedSidecarGroups = {}
  const issues = []
  const processingPromises = []

  const findFileByPath = (path) => filesList.find((f) => f.webkitRelativePath === path)

  Object.keys(bidsFileGroups).forEach((groupName) => {
    // Changed from for...in to Object.keys().forEach
    hedSidecarGroups[groupName] = [] // Initialize array for this group
    const group = bidsFileGroups[groupName]

    if (group.json && group.json.length > 0) {
      for (const jsonPath of group.json) {
        const jsonFile = findFileByPath(jsonPath)
        if (!jsonFile) {
          issues.push({
            code: 'FILE_NOT_FOUND_IN_LIST', // More specific code
            message: `JSON file object not found in the provided file list for path: ${jsonPath}`,
            location: jsonPath,
          })
          continue // Skip this file
        }

        const promise = readFileAsText(jsonFile)
          .then((jsonText) => {
            if (jsonText.includes('"HED":')) {
              try {
                const jsonData = JSON.parse(jsonText)
                const fileObject = { name: jsonFile.name, path: jsonPath }
                const bidsSidecar = new BidsSidecar(jsonFile.name, fileObject, jsonData)
                return { bidsSidecar, groupName, path: jsonPath, originalFile: jsonFile } // Success case
              } catch (parseError) {
                // Catch JSON.parse errors specifically
                throw {
                  originalError: parseError,
                  message: `Error parsing JSON file ${jsonFile.name}: ${parseError.message}`,
                  path: jsonPath,
                  groupName: groupName,
                }
              }
            }
            return null // No HED, not an error, resolve with null
          })
          .catch((error) => {
            // Catch errors from readFileAsText or re-thrown JSON.parse errors
            // Ensure it's an object with expected properties for consistent error handling
            if (error && error.path && error.message) {
              throw error // Already in desired format
            }
            // Wrap other unexpected errors
            throw {
              originalError: error,
              message: `An unexpected error occurred while processing JSON file ${jsonFile.name}: ${error.message || error}`,
              path: jsonPath,
              groupName: groupName,
            }
          })
        processingPromises.push(promise)
      }
    }
  })

  const results = await Promise.allSettled(processingPromises)

  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value && result.value.bidsSidecar) {
      const { bidsSidecar, groupName } = result.value
      // Ensure groupName key exists (it should have been initialized)
      if (!hedSidecarGroups[groupName]) {
        hedSidecarGroups[groupName] = [] // Should not happen if initialized correctly
      }
      hedSidecarGroups[groupName].push(bidsSidecar)
    } else if (result.status === 'rejected') {
      const reason = result.reason || {}
      const message = reason.message || 'An unknown error occurred during JSON file processing.'
      const location = reason.path || 'Unknown path'
      issues.push({
        code: 'JSON_PROCESSING_ERROR',
        message: message,
        location: location,
      })
    }
    // If result.status is 'fulfilled' and result.value is null (no HED), do nothing.
  })

  return { hedSidecarGroups, issues }
}
