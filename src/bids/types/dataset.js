import { BidsFileAccessor } from '../datasetParser'
import { BidsSidecar } from './json'
import { BidsTsvFile } from './tsv'
import { buildBidsSchemas } from '../schema'
import { generateIssue, IssueError } from '../../issues/issues'
import { getMergedSidecarData, organizedPathsGenerator } from '../../utils/paths'
import { BidsHedIssue } from './issues'

export class BidsDataset {
  /**
   * Factory method to create a BidsDataset.
   *
   * @param {string | object} rootOrFiles The root directory of the dataset or a file-like object.
   * @param {typeof BidsFileAccessor} fileAccessorClass The BidsFileAccessor class to use for accessing files.
   * @returns {Promise<[BidsDataset, issue[]]>} A Promise that resolves to a BidsDataset instance and an array of issues.
   */
  static async create(rootOrFiles, fileAccessorClass) {
    let dataset = null
    const issues = []
    try {
      const accessor = await fileAccessorClass.create(rootOrFiles)
      dataset = new BidsDataset(accessor)
      await dataset.setHedSchemas()
      await dataset.setSidecars()
      if (dataset.issues.length > 0) {
        issues.push(...dataset.issues)
      }
    } catch (error) {
      if (error instanceof IssueError) {
        issues.push(error.issue)
      } else {
        issues.push({
          code: 'INTERNAL_ERROR',
          message: `An unexpected error occurred while creating the BidsDataset: ${error.message}`,
          location: typeof rootOrFiles === 'string' ? rootOrFiles : 'Uploaded files',
        })
      }
    }
    if (issues.length > 0) {
      dataset = null
    }
    return [dataset, issues]
  }

  /**
   * The dataset's event file data.
   * @type {BidsTsvFile[]}
   */
  eventData

  /**
   * Map of BIDS sidecar files.
   * The keys are relative paths and the values are BidsSidecar objects.
   * @type {Map<string, BidsSidecar>}
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
    this.sidecarMap = new Map()
    this.hedSchemas = null
    this.issues = []
  }

  async setHedSchemas() {
    let description

    try {
      // First try-catch: Load and parse dataset_description.json
      const descriptionContentString = await this.accessor.getFileContent('dataset_description.json')
      if (descriptionContentString === null || typeof descriptionContentString === 'undefined') {
        IssueError.generateAndThrow('missingSchemaSpecification', { file: 'dataset_description.json' })
      }
      description = {}
      description.jsonData = JSON.parse(descriptionContentString)
    } catch {
      IssueError.generateAndThrow('missingSchemaSpecification', { file: 'dataset_description.json' })
    }

    try {
      this.hedSchemas = await buildBidsSchemas(description)
      if (this.hedSchemas === null) {
        IssueError.generateAndThrow('invalidSchemaSpecification', { spec: null })
      }
    } catch {
      IssueError.generateAndThrow('invalidSchemaSpecification', { spec: description.jsonData?.HEDVersion || null })
    }
    // If successful, this.hedSchemas is populated.
  }

  async setSidecars() {
    this.sidecarMap = new Map()
    const organizedPaths = this.accessor.organizedPaths
    const processingPromises = []

    for (const pathGroup of organizedPaths.values()) {
      const jsonPaths = pathGroup.get('json')
      if (!jsonPaths || jsonPaths.length === 0) {
        continue
      }

      for (const jsonPath of jsonPaths) {
        const fileName = jsonPath.substring(jsonPath.lastIndexOf('/') + 1)
        const promise = this.accessor
          .getFileContent(jsonPath)
          .then((jsonText) => {
            if (jsonText === null) {
              const errorMessage = `Could not read JSON file: ${jsonPath}`
              this.issues.push(
                BidsHedIssue.fromHedIssue(
                  generateIssue('fileReadError', { filename: `${jsonPath}`, message: `${errorMessage}` }),
                  { file: jsonPath, name: fileName },
                ),
              )
              return
            }
            if (!jsonText.includes('"HED":')) {
              return
            }
            try {
              const jsonData = JSON.parse(jsonText)
              const sidecar = new BidsSidecar(fileName, { path: jsonPath, name: fileName }, jsonData)
              this.sidecarMap.set(jsonPath, sidecar)
            } catch (e) {
              const errorMessage = `Could not parse the JSON file: ${jsonPath}`
              this.issues.push(
                BidsHedIssue.fromHedIssue(
                  generateIssue('fileReadError', { filename: `${jsonPath}`, message: `${errorMessage}` }),
                  { path: jsonPath, name: fileName },
                ),
              )
            }
          })
          .catch((e) => {
            const errorMessage = `Unexpected exception '${e.message}' occurred when setting sidecar: ${jsonPath}`
            this.issues.push(
              BidsHedIssue.fromHedIssue(
                generateIssue('fileReadError', { filename: `${jsonPath}`, message: `${errorMessage}` }),
                { path: jsonPath, name: fileName },
              ),
            )
          })
        processingPromises.push(promise)
      }
    }
    await Promise.allSettled(processingPromises)
  }

  /**
   * Validate the dataset by checking each sidecar file for issues.
   * @returns {Promise<Issue[]>} A promise that resolves to an array of issues found during validation.
   */
  async validate() {
    this.issues = []

    for (const relativePath of organizedPathsGenerator(this.accessor.organizedPaths, '.json')) {
      const sidecar = this.sidecarMap.get(relativePath)
      if (sidecar) {
        const validationIssues = sidecar.validate(this.hedSchemas)
        this.issues.push(...validationIssues)
      }
    }
    await this._validateTsvFiles()
    return this.issues.length > 0 ? this.issues : []
  }

  /**
   * Validate the TSV files in the dataset.
   * @returns {Promise<void>}
   * @private
   */
  async _validateTsvFiles() {
    for (const [category, catMap] of this.accessor.organizedPaths) {
      const tsvPaths = catMap.get('tsv') || []
      const jsonPaths = catMap.get('json') || []
      for (const tsvPath of tsvPaths) {
        const tsvName = tsvPath.substring(tsvPath.lastIndexOf('/') + 1)
        const tsvContents = await this.accessor.getFileContent(tsvPath)
        if (tsvContents === null) {
          const message = `Could not read TSV file: ${tsvPath} in category ${category}`
          this.issues.push(
            BidsHedIssue.fromHedIssue(generateIssue('fileReadError', { filename: tsvPath, message: `${message}` })),
            { path: tsvPath, name: tsvName },
          )
          continue
        }
        if (!tsvContents) {
          continue
        }

        const mergedSidecarData = getMergedSidecarData(tsvPath, jsonPaths, this.sidecarMap)
        const tsvFile = new BidsTsvFile(tsvPath, { path: `${tsvPath}` }, tsvContents, mergedSidecarData)
        if (!tsvFile.hasHedData) {
          continue
        }

        const validationIssues = tsvFile.validate(this.hedSchemas)
        this.issues.push(...validationIssues)
      }
    }
  }
}
