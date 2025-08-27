/**
 * This module contains the {@link BidsDataset} class, which represents a BIDS dataset for HED validation.
 * @module dataset
 */
import { BidsFileAccessor } from '../datasetParser'
import { BidsSidecar } from './json'
import { BidsTsvFile } from './tsv'
import { generateIssue, IssueError } from '../../issues/issues'
import { getMergedSidecarData, organizedPathsGenerator } from '../../utils/paths'
import { BidsHedIssue } from './issues'
import path from 'node:path'

/**
 * A BIDS dataset.
 *
 * This class organizes and provides access to the files and metadata within a BIDS dataset.
 * It is designed to be used for HED validation of BIDS datasets.
 *
 * The BidsDataset should not be created with the constructor. Instead, it should be created using the asynchronous
 * {@link BidsDataset.create} factory method. This method handles the initial setup and file discovery.
 *
 * BidsDataset creation will return a null dataset if any of the sidecars have invalid JSON,
 * or it cannot find and load the needed HED schemas.
 *
 * @example
 * // In a Node.js environment:
 * const { BidsDataset, BidsDirectoryAccessor } = require('hed-validator');
 * const path = require('path');
 *
 * async function main() {
 *   const dataRoot = path.join(__dirname, 'path/to/bids/dataset');
 *   const [dataset, issues] = await BidsDataset.create(dataRoot, BidsDirectoryAccessor);
 *   if (dataset) {
 *     const validationIssues = await dataset.validate();
 *     // process issues
 *   } else {
 *     // process creation issues
 *   }
 * }
 *
 * main();
 *
 * @property {Map<string, BidsSidecar>} sidecarMap Map of BIDS sidecar files that contain HED annotations.
 * @property {string|null} datasetRootDirectory The dataset's root directory as an absolute path (Node.js context).
 * @property {Schemas} hedSchemas The HED schemas used to validate this dataset.
 * @property {BidsFileAccessor} fileAccessor The BIDS file accessor.
 */
export class BidsDataset {
  /**
   * Map of BIDS sidecar files that contain HED annotations.
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
   * The BIDS file accessor.
   * @type {BidsFileAccessor}
   * @public
   */
  fileAccessor

  /**
   * Constructor for a BIDS dataset.
   *
   * @param {BidsFileAccessor} accessor An instance of BidsFileAccessor (or its subclasses).
   * @throws {Error} If accessor is not an instance of BidsFileAccessor.
   * @private
   * @see BidsDataset.create
   */
  constructor(accessor) {
    if (!(accessor instanceof BidsFileAccessor)) {
      throw new Error('BidsDataset constructor requires an instance of BidsFileAccessor.\n')
    }
    this.fileAccessor = accessor
    this.datasetRootDirectory = accessor.datasetRootDirectory // Set from fileAccessor
    this.sidecarMap = new Map()
    this.hedSchemas = null
  }

  /**
   * Factory method to create a BidsDataset. This method, rather than the constructor should always
   * be used to create a BidsDataset instance.
   *
   * Note: This method will fail to create a BidsDataset if a valid HED schema cannot be loaded or any of the
   * JSON sidecars cannot be loaded. It does not perform HED validation.
   *
   * @param {string | object} rootOrFiles The root directory of the dataset or a file-like object.
   * @param {function} fileAccessorClass The BidsFileAccessor class to use for accessing files.
   * @returns {Promise<[BidsDataset|null, BidsHedIssue[]]>} A Promise that resolves to a two-element array containing the BidsDataset instance (or null if creation failed) and an array of issues.
   *
   */
  static async create(rootOrFiles, fileAccessorClass) {
    let dataset = null
    const issues = []
    try {
      const accessor = await fileAccessorClass.create(rootOrFiles)
      dataset = new BidsDataset(accessor)
      const schemaIssues = await dataset.setHedSchemas()
      issues.push(...schemaIssues)
      if (dataset.hedSchemas === null) {
        return [null, issues]
      }
      const sidecarIssues = await dataset.setSidecars()
      issues.push(...sidecarIssues)
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
   * Load and set the HED schemas for this dataset.
   *
   * This method reads the `dataset_description.json` file, extracts the `HEDVersion` field,
   * and builds the HED schemas. The result is stored in {@link BidsDataset.hedSchemas}.
   *
   * @returns {Promise<BidsHedIssue[]>} A promise that resolves to an array of issues encountered during schema loading.
   * @throws {IssueError} If `dataset_description.json` is missing or contains an invalid HED specification.
   */
  async setHedSchemas() {
    let description

    try {
      const descriptionContentString = await this.fileAccessor.getFileContent('dataset_description.json')
      if (descriptionContentString === null || typeof descriptionContentString === 'undefined') {
        throw new IssueError(generateIssue('missingSchemaSpecification', { file: 'dataset_description.json' }))
      }
      description = {
        jsonData: JSON.parse(descriptionContentString),
      }
    } catch (e) {
      if (e instanceof IssueError) {
        throw e
      }
      throw new IssueError(generateIssue('missingSchemaSpecification', { file: 'dataset_description.json' }))
    }

    try {
      this.hedSchemas = await this.fileAccessor.schemaBuilder(description)
      if (this.hedSchemas === null) {
        throw new IssueError(
          generateIssue('invalidSchemaSpecification', { spec: description.jsonData?.HEDVersion || null }),
        )
      }
    } catch (e) {
      if (e instanceof IssueError) {
        throw e
      }
      throw new IssueError(
        generateIssue('invalidSchemaSpecification', { spec: description.jsonData?.HEDVersion || null }),
      )
    }
    return []
  }

  /**
   * Find and parse all JSON sidecar files in the dataset.
   *
   * This method iterates through the dataset's files, identifies JSON sidecars with HED data,
   * parses them into {@link BidsSidecar} objects, and stores them in {@link BidsDataset.sidecarMap}.
   *
   * Note: This method does not validate the HED data within the sidecars; it only parses them.
   *
   * @returns {Promise<BidsHedIssue[]>} A promise that resolves to an array of issues encountered during sidecar parsing.
   */
  async setSidecars() {
    this.sidecarMap = new Map()
    const issues = []
    const organizedPaths = this.fileAccessor.organizedPaths
    const processingPromises = []

    for (const pathGroup of organizedPaths.values()) {
      const jsonPaths = pathGroup.get('json')
      if (!jsonPaths || jsonPaths.length === 0) {
        continue
      }

      for (const jsonPath of jsonPaths) {
        const fileName = jsonPath.substring(jsonPath.lastIndexOf('/') + 1)
        const promise = this.fileAccessor
          .getFileContent(jsonPath)
          .then((jsonText) => {
            const sidecarIssues = []
            if (jsonText === null) {
              const errorMessage = `Could not read JSON file: ${jsonPath}`
              sidecarIssues.push(
                BidsHedIssue.fromHedIssue(
                  generateIssue('fileReadError', { filename: `${jsonPath}`, message: `${errorMessage}` }),
                  { file: jsonPath, name: fileName },
                ),
              )
              return sidecarIssues
            }
            if (!jsonText.includes('"HED":')) {
              return sidecarIssues
            }
            try {
              const jsonData = JSON.parse(jsonText)
              const sidecar = new BidsSidecar(fileName, { path: jsonPath, name: fileName }, jsonData)
              this.sidecarMap.set(jsonPath, sidecar)
            } catch (e) {
              if (e instanceof IssueError) {
                // Use the detailed information from the IssueError
                sidecarIssues.push(BidsHedIssue.fromHedIssue(e.issue, { path: jsonPath, name: fileName }))
              } else {
                // Fall back to generic fileReadError for other exceptions
                const errorMessage = `Could not parse the JSON file: ${jsonPath}`
                sidecarIssues.push(
                  BidsHedIssue.fromHedIssue(
                    generateIssue('fileReadError', { filename: `${jsonPath}`, message: `${errorMessage}` }),
                    { path: jsonPath, name: fileName },
                  ),
                )
              }
            }
            return sidecarIssues
          })
          .catch((e) => {
            const errorMessage = `Unexpected exception '${e.message}' occurred when setting sidecar: ${jsonPath}`
            return [
              BidsHedIssue.fromHedIssue(
                generateIssue('fileReadError', { filename: `${jsonPath}`, message: `${errorMessage}` }),
                { path: jsonPath, name: fileName },
              ),
            ]
          })
        processingPromises.push(promise)
      }
    }
    const allIssues = await Promise.all(processingPromises)
    issues.push(...allIssues.flat())
    return issues
  }

  /**
   * Validate the full BIDS dataset for HED compliance.
   *
   * This method validates all HED data in the dataset, including:
   * - HED strings in JSON sidecars.
   * - HED columns in TSV files, evaluated against their corresponding merged sidecars.
   *
   * Note: If any of the sidecars have errors (not just warnings), the TSV files will not be validated.
   * This is because a single error in a sidecar can result in errors on every line of a TSV file.
   *
   * @returns {Promise<BidsHedIssue[]>} A promise that resolves to an array of issues found during validation.
   */
  async validate() {
    const issues = this.validateSidecars()
    if (issues.some((issue) => issue.severity === 'error')) {
      return issues
    }
    const tsvIssues = await this.validateTsvFiles()
    issues.push(...tsvIssues)
    return issues
  }

  /**
   * Validate the JSON sidecars in the dataset.
   *
   * This method iterates through all JSON sidecars and validates the HED data within them.
   * Note: The data has already been parsed into BidsSidecar objects.
   *
   * @returns {BidsHedIssue[]} An array of issues found during sidecar validation.
   * @private
   */
  validateSidecars() {
    const issues = []

    for (const relativePath of organizedPathsGenerator(this.fileAccessor.organizedPaths, '.json')) {
      const sidecar = this.sidecarMap.get(relativePath)
      if (sidecar) {
        const validationIssues = sidecar.validate(this.hedSchemas)
        issues.push(...validationIssues)
      }
    }
    return issues
  }

  /**
   * Validate the TSV files in the dataset.
   *
   * This method iterates through all `.tsv` files, merges them with the corresponding JSON sidecars,
   * and validates the HED data within them.
   *
   * @returns {Promise<BidsHedIssue[]>} A promise that resolves to an array of issues found during TSV validation.
   * @private
   */
  async validateTsvFiles() {
    const issues = []
    for (const [category, catMap] of this.fileAccessor.organizedPaths) {
      const tsvPaths = catMap.get('tsv') || []
      const jsonPaths = catMap.get('json') || []
      for (const tsvPath of tsvPaths) {
        const tsvIssues = await this._validateTsvFile(tsvPath, category, jsonPaths)
        if (tsvIssues.length > 0) {
          issues.push(...tsvIssues)
        }
      }
    }
    return issues
  }

  /**
   * Validate a single TSV file in the dataset.
   *
   * This method reads the TSV file content, merges it with corresponding sidecar data,
   * creates a BidsTsvFile object, and validates the HED data within it.
   *
   * @param {string} tsvPath The relative path to the TSV file.
   * @param {string} category The BIDS category (e.g., 'sub-001/ses-001/func').
   * @param {string[]} jsonPaths Array of JSON sidecar paths for this category of tsv.
   * @returns {Promise<BidsHedIssue[]>} A promise that resolves to an array of issues found during validation of this TSV file.
   * @private
   */
  async _validateTsvFile(tsvPath, category, jsonPaths) {
    // Read the TSV file content -- if none do not proceed.
    const parsedPath = path.parse(tsvPath)
    const tsvContents = await this.fileAccessor.getFileContent(tsvPath)
    if (tsvContents === null) {
      const message = `Could not read TSV file: ${tsvPath}`
      return [
        BidsHedIssue.fromHedIssue(generateIssue('fileReadError', { filename: tsvPath, message: `${message}` }), {
          path: tsvPath,
          name: parsedPath.base,
        }),
      ]
    } else if (!tsvContents) {
      return []
    }

    const mergedSidecarData = this._getSidecarData(tsvPath, category, jsonPaths)
    const tsvFile = new BidsTsvFile(tsvPath, { path: `${tsvPath}` }, tsvContents, mergedSidecarData)
    if (!tsvFile.hasHedData) {
      return []
    }
    return tsvFile.validate(this.hedSchemas)
  }

  /**
   * Get merged sidecar data for a TSV file.
   *
   * This method retrieves and merges JSON sidecar data according to BIDS inheritance rules.
   * For special directories (phenotype, stimuli), it looks for a direct JSON counterpart.
   * For other files, it uses the BIDS inheritance hierarchy to merge multiple sidecars.
   *
   * @param {string} tsvPath The relative path to the TSV file.
   * @param {string} category The BIDS category (e.g., 'sub-001/ses-001/func').
   * @param {string[]} jsonPaths Array of JSON sidecar paths for this category.
   * @returns {object} The merged sidecar data object, or empty object if no applicable sidecars found.
   * @private
   */
  _getSidecarData(tsvPath, category, jsonPaths) {
    const parsedPath = path.parse(tsvPath)

    if (BidsFileAccessor.SPECIAL_DIRS.includes(category)) {
      const expectedJsonPath = `${parsedPath.dir ? parsedPath.dir + '/' : ''}${parsedPath.name}.json`
      const sidecar = this.sidecarMap.get(expectedJsonPath)
      if (sidecar !== undefined) {
        return sidecar.jsonData
      }
      return {}
    }
    const mergedSidecarData = getMergedSidecarData(tsvPath, jsonPaths, this.sidecarMap)
    return mergedSidecarData
  }
}
