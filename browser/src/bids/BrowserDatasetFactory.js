// filepath: i:\HEDJavascript\hed-javascript\browser\src\bids\BrowserDatasetFactory.js
import { BidsDataset } from '@hed-javascript-root/src/bids/types/dataset.js'
import { readFileAsText } from '../utils/fileReader.js'

export class BrowserDatasetFactory {
  /**
   * Creates a BidsDataset instance from a list of File objects (typically from a browser folder upload).
   *
   * @param {File[]} uploadedFiles - An array of File objects.
   * @returns {Promise<BidsDataset>} A promise that resolves to an initialized BidsDataset instance.
   * @throws {Error} If the dataset root cannot be determined or if dataset_description.json is missing/invalid.
   */
  static async create(uploadedFiles) {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      throw new Error('No files provided to create the dataset.')
    }

    // datasetRootName is the top-level folder name from the upload.
    const datasetRootName = BrowserDatasetFactory.determineDatasetRootName(uploadedFiles)
    // If datasetRootName is null or empty, it implies files were selected directly, not a containing folder.
    // This scenario needs careful handling for path relativization.

    const fileMap = new Map() // Maps path relative to dataset root (e.g., "sub-01/events.tsv") to File object
    const allRelativePaths = [] // Stores all paths relative to dataset root

    for (const file of uploadedFiles) {
      const fullPath = file.webkitRelativePath || file.name
      let relativePath
      if (datasetRootName && fullPath.startsWith(datasetRootName + '/')) {
        relativePath = fullPath.substring(datasetRootName.length + 1)
      } else if (!datasetRootName && !fullPath.includes('/')) {
        // Files selected directly, no common root folder in webkitRelativePath
        relativePath = fullPath
      } else if (datasetRootName === '' && fullPath.includes('/')) {
        // This case should ideally not happen if rootName is '' (means flat list)
        // but if webkitRelativePath somehow still has slashes, it's ambiguous.
        // For now, assume if datasetRootName is '', fullPath is already relative.
        relativePath = fullPath
      } else {
        // Path doesn't conform to expected structure (e.g. outside determined root, or ambiguous)
        // Or, if datasetRootName is null (couldn't be determined) and paths are nested.
        console.warn(
          `File path ${fullPath} could not be made relative to dataset root ${datasetRootName || "''"}. Skipping.`,
        )
        continue
      }
      if (relativePath) {
        fileMap.set(relativePath, file)
        allRelativePaths.push(relativePath)
      }
    }

    if (fileMap.size === 0) {
      throw new Error('Could not map any uploaded files to relative dataset paths.')
    }

    let datasetDescriptionData = null
    const descriptionFile = fileMap.get('dataset_description.json')

    if (descriptionFile) {
      try {
        const descriptionText = await readFileAsText(descriptionFile)
        datasetDescriptionData = JSON.parse(descriptionText)
      } catch (e) {
        // console.warn('Failed to read or parse dataset_description.json from uploaded files:', e);
        throw new Error(`Failed to read or parse dataset_description.json: ${e.message}`)
      }
    } else {
      // Allow dataset creation even if dataset_description.json is missing,
      // BidsDataset.loadHedSchemas() will throw the appropriate error.
      console.warn('dataset_description.json not found among mapped files. HED schema loading will likely fail.')
    }

    const fileAccessor = async (relativePath) => {
      const file = fileMap.get(relativePath)
      if (file) {
        return readFileAsText(file)
      }
      throw new Error(`File not found in uploaded dataset: ${relativePath}`)
    }

    // Pass the map of File objects as fileList for BidsDataset to use if needed,
    // and allRelativePaths for it to know what files are part of the dataset.
    const dataset = new BidsDataset(null, fileMap, datasetDescriptionData, fileAccessor)
    dataset._allFilePaths = allRelativePaths // Provide all known relative paths

    try {
      await dataset.loadHedSchemas()
    } catch (e) {
      // Allow dataset object to be created, but schema loading issues will be caught by the caller.
      console.warn('Error during HED schema loading in factory:', e.message)
    }

    await dataset._initializeFileObjects()

    return dataset
  }

  /**
   * Determines the dataset root directory name from a list of File objects.
   * Assumes the root name is the first segment of the webkitRelativePath.
   * Returns an empty string if files appear to be a flat list (no common root directory in paths).
   * Returns null if no files are provided or paths are inconsistent.
   *
   * @param {File[]} uploadedFiles - An array of File objects.
   * @returns {string|null} The determined dataset root name, empty string for flat lists, or null.
   */
  static determineDatasetRootName(uploadedFiles) {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return null
    }

    let commonRoot = null
    let allFilesHavePath = true
    let hasNestedPaths = false

    for (const file of uploadedFiles) {
      if (file.webkitRelativePath) {
        if (file.webkitRelativePath.includes('/')) {
          hasNestedPaths = true
          const pathParts = file.webkitRelativePath.split('/')
          if (pathParts.length > 0) {
            if (commonRoot === null) {
              commonRoot = pathParts[0]
            } else if (commonRoot !== pathParts[0]) {
              // Inconsistent root directories found
              console.warn('Inconsistent root directories found in webkitRelativePath.', commonRoot, pathParts[0])
              return '' // Treat as flat if roots are inconsistent
            }
          } else {
            // Should not happen if includes('/') is true
            allFilesHavePath = false
            break
          }
        } else {
          // Path does not include '/', implies it's a top-level file in the selection
          if (hasNestedPaths) {
            // Mixed nested and flat paths at the root of selection
            console.warn(
              'Mixed nested and flat files at the root of selection, assuming flat structure (no common dataset root folder name).',
            )
            return ''
          }
          // If all files are like this, it's a flat list.
        }
      } else {
        allFilesHavePath = false
        break
      }
    }

    if (!allFilesHavePath) {
      // Some files missing webkitRelativePath
      console.warn('Some files are missing webkitRelativePath, assuming flat structure.')
      return ''
    }

    if (!hasNestedPaths) {
      // All files are top-level (no '/' in webkitRelativePath)
      console.warn(
        'All files are top-level in selection, assuming flat structure (no common dataset root folder name).',
      )
      return ''
    }

    return commonRoot // This will be the common first segment, or null if never set (e.g. single file with no path)
  }
}
