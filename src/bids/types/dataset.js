import { BidsFileAccessor } from '../datasetParser'
import { BidsSidecar } from './json'
import { BidsTsvFile } from './tsv'
import { buildBidsSchemas } from '../schema'
import { IssueError } from '../../issues/issues'

export class BidsDataset {
  /**
   * Factory method to create a BidsDataset.
   *
   * @param {string} datasetRootDirectory The root directory of the dataset.
   * @param {typeof BidsFileAccessor} BidsFileAccessorClass The BidsFileAccessor class to use for accessing files.
   * @returns [{Promise<BidsDataset>} A Promise that resolves to a BidsDataset instance.
   */
  static async create(datasetRootDirectory, BidsFileAccessorClass) {
    let dataset = null
    const issues = []
    try {
      const accessor = await BidsFileAccessorClass.create(datasetRootDirectory)
      dataset = new BidsDataset(accessor)
      await dataset.getHedSchemas()
      await dataset.setSidecars()
    } catch (error) {
      if (error instanceof IssueError) {
        issues.push(error.issue)
      } else {
        issues.push({
          code: 'INTERNAL_ERROR',
          message: `An unexpected error occurred while creating the BidsDataset: ${error.message}`,
          location: datasetRootDirectory,
        })
      }
    }
    return [dataset, issues]
  }

  /**
   * The dataset's event file data.
   * @type {BidsTsvFile[]}
   */
  eventData

  /**
   * The dataset's sidecar data.
   * @type {BidsSidecar[]}
   */
  sidecarData

  /**
   * Map of BIDS sidecar files.
   * The keys are categories (e.g. 'events', 'participants', 'phenotype') and
   * the values are arrays of BidsSidecar objects.
   * @type {Map<string, BidsSidecar[]>}
   */
  sidecarMap

  /**
   * The dataset's root directory as an absolute path (Node.js context).
   * @type {string|null}
   */
  datasetRootDirectory

  /**
   * The HED schemas used to validate this dataset.
   * @type {Schemas}
   */
  hedSchemas

  /**
   * A map of relative file paths to File objects.
   * @type {Map<string, File> | null}
   */

  /**
   * All known relative paths within the dataset. Populated by factories or _initializeFileObjects.
   * @type {string[] | null}
   * @private
   */

  /**
   * Function to access file content, e.g., async (relativePath) => content.
   * @type {Function | null}
   * @private
   */

  /**
   * The BIDS file accessor.
   * @type {BidsFileAccessor}
   * @public
   */
  accessor

  /**
   * @param {BidsFileAccessor} accessor An instance of BidsFileAccessor (or its subclasses).
   */
  constructor(accessor) {
    if (!(accessor instanceof BidsFileAccessor)) {
      throw new Error('BidsDataset constructor requires an instance of BidsFileAccessor.\n')
    }
    this.accessor = accessor
    this.datasetRootDirectory = accessor.datasetRootDirectory // Set from accessor
    this.eventData = []
    this.sidecarData = new Map()
    this.sidecarMap = new Map()
    this.hedSchemas = null
    this.issues = []
  }

  async getHedSchemas() {
    let description

    try {
      // First try-catch: Load and parse dataset_description.json
      const descriptionContentString = await this.accessor.getFileContent('dataset_description.json')
      if (descriptionContentString === null || typeof descriptionContentString === 'undefined') {
        IssueError.generateAndThrow('missingSchemaSpecification', { file: 'dataset_description.json' })
      }
      description = {}
      description.jsonData = JSON.parse(descriptionContentString)
    } catch (_error) {
      // console.warn(`getHedSchemas: Error in first try block: ${_error.message}`);
      IssueError.generateAndThrow('missingSchemaSpecification', { file: 'dataset_description.json' })
    }

    try {
      this.hedSchemas = await buildBidsSchemas(description)
      if (this.hedSchemas === null) {
        IssueError.generateAndThrow('invalidSchemaSpecification', { spec: null })
      }
    } catch (_error) {
      // Changed variable name from error to caughtError
      // console.warn(`getHedSchemas: Error in second try block: ${caughtError.message}`);
      IssueError.generateAndThrow('invalidSchemaSpecification', { spec: description.jsonData?.HEDVersion || null })
    }
    // If successful, this.hedSchemas is populated.
  }

  async setSidecars() {
    this.sidecarMap = new Map()
    const organizedPaths = this.accessor.organizedPaths
    const processingPromises = []

    for (const [category, pathGroup] of organizedPaths.entries()) {
      const jsonPaths = pathGroup.get('json')
      if (!jsonPaths || jsonPaths.length === 0) {
        continue
      }

      this.sidecarMap.set(category, [])

      for (const jsonPath of jsonPaths) {
        const promise = this.accessor
          .getFileContent(jsonPath)
          .then((jsonText) => {
            if (jsonText === null) {
              this.issues.push({
                code: 'FILE_READ_ERROR',
                message: `Could not read file: ${jsonPath}`,
                location: jsonPath,
              })
              return
            }
            if (!jsonText.includes('"HED":')) {
              return
            }
            try {
              const jsonData = JSON.parse(jsonText)
              const fileName = jsonPath.substring(jsonPath.lastIndexOf('/') + 1)
              const sidecar = new BidsSidecar(fileName, { path: jsonPath, name: fileName }, jsonData)
              this.sidecarMap.get(category).push(sidecar)
            } catch (e) {
              this.issues.push({
                code: 'JSON_PARSE_ERROR',
                message: `File: ${jsonPath} - ${e.message}`,
                location: jsonPath,
              })
            }
          })
          .catch((e) => {
            this.issues.push({
              code: 'FILE_READ_ERROR',
              message: `File: ${jsonPath} - ${e.message}`,
              location: jsonPath,
            })
          })
        processingPromises.push(promise)
      }
    }
    await Promise.allSettled(processingPromises)

    // Clean up empty categories
    for (const [category, sidecars] of this.sidecarMap.entries()) {
      if (sidecars.length === 0) {
        this.sidecarMap.delete(category)
      }
    }
  }

  /**
   * Dummy validation method.
   * @returns {Promise<[]>} An empty list of issues.
   */
  async validate() {
    return []
  }
}
