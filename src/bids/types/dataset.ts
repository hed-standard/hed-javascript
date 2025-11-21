/**
 * This module contains the {@link BidsDataset} class, which represents a BIDS dataset for HED validation.
 * @module bids/types/dataset
 */

import path from 'node:path'

import { BidsFileAccessor } from '../datasetParser'
import { BidsSidecar } from './json'
import { BidsTsvFile } from './tsv'
import { generateIssue, IssueError } from '../../issues/issues'
import { getMergedSidecarData, organizedPathsGenerator } from '../../utils/paths'
import { BidsHedIssue } from './issues'
import { type HedSchemas } from '../../schema/containers'

type BidsFileAccessorConstructor = {
  create(datasetRootDirectory: string | object): Promise<BidsFileAccessor>
}

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
 * @property {HedSchemas} hedSchemas The HED schemas used to validate this dataset.
 * @property {BidsFileAccessor} fileAccessor The BIDS file accessor.
 */
export class BidsDataset {
  /**
   * Map of BIDS sidecar files that contain HED annotations.
   * The keys are relative paths and the values are BidsSidecar objects.
   */
  public sidecarMap: Map<string, BidsSidecar>

  /**
   * The dataset's root directory as an absolute path (Node.js context).
   */
  public readonly datasetRootDirectory: string | null

  /**
   * The HED schemas used to validate this dataset.
   */
  private hedSchemas: HedSchemas

  /**
   * The BIDS file accessor.
   */
  public fileAccessor: BidsFileAccessor

  /**
   * Constructor for a BIDS dataset.
   *
   * @param accessor An instance of BidsFileAccessor (or its subclasses).
   * @throws {IssueError} If accessor is not an instance of BidsFileAccessor.
   * @see BidsDataset.create
   */
  private constructor(accessor: BidsFileAccessor) {
    if (!(accessor instanceof BidsFileAccessor)) {
      IssueError.generateAndThrowInternalError('BidsDataset constructor requires an instance of BidsFileAccessor')
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
   * @param rootOrFiles The root directory of the dataset or a file-like object.
   * @param fileAccessorClass The BidsFileAccessor class to use for accessing files.
   * @returns A Promise that resolves to a two-element array containing the BidsDataset instance (or null if creation failed) and an array of issues.
   */
  static async create(
    rootOrFiles: string | object,
    fileAccessorClass: BidsFileAccessorConstructor,
  ): Promise<[BidsDataset | null, BidsHedIssue[]]> {
    let dataset = null
    const issues: BidsHedIssue[] = []
    try {
      const accessor = await fileAccessorClass.create(rootOrFiles)
      dataset = new BidsDataset(accessor)
      const schemaIssues = await dataset.setHedSchemas()
      issues.push(...schemaIssues)
      const sidecarIssues = await dataset.setSidecars()
      issues.push(...sidecarIssues)
    } catch (error) {
      issues.push(...BidsHedIssue.fromHedIssues(error, null))
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
   * @returns A promise that resolves to an array of issues encountered during schema loading.
   * @throws {IssueError} If `dataset_description.json` is missing or contains an invalid HED specification.
   */
  async setHedSchemas(): Promise<BidsHedIssue[]> {
    let description

    try {
      const descriptionContentString = await this.fileAccessor.getFileContent('dataset_description.json')
      if (descriptionContentString === null || typeof descriptionContentString === 'undefined') {
        IssueError.generateAndThrow('missingSchemaSpecification', { file: 'dataset_description.json' })
      }
      description = {
        jsonData: JSON.parse(descriptionContentString),
      }
    } catch (e) {
      if (e instanceof IssueError) {
        throw e
      }
      IssueError.generateAndThrow('missingSchemaSpecification', { file: 'dataset_description.json' })
    }

    try {
      this.hedSchemas = await this.fileAccessor.schemaBuilder(description)
      if (this.hedSchemas === null) {
        IssueError.generateAndThrow('invalidSchemaSpecification', { spec: description.jsonData?.HEDVersion || null })
      }
    } catch (e) {
      if (e instanceof IssueError) {
        throw e
      }
      IssueError.generateAndThrow('invalidSchemaSpecification', { spec: description.jsonData?.HEDVersion || null })
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
   * @returns A promise that resolves to an array of issues encountered during sidecar parsing.
   */
  async setSidecars(): Promise<BidsHedIssue[]> {
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
            const sidecarIssues: BidsHedIssue[] = []
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
   * @returns A promise that resolves to an array of issues found during validation.
   */
  async validate(): Promise<BidsHedIssue[]> {
    const issues = this.validateSidecars()
    if (issues.some((issue) => issue.severity === 'error')) {
      return issues
    }
    return issues.concat(await this.validateTsvFiles())
  }

  /**
   * Validate the JSON sidecars in the dataset.
   *
   * This method iterates through all JSON sidecars and validates the HED data within them.
   * Note: The data has already been parsed into BidsSidecar objects.
   *
   * @returns An array of issues found during sidecar validation.
   */
  private validateSidecars(): BidsHedIssue[] {
    let issues: BidsHedIssue[] = []

    for (const relativePath of organizedPathsGenerator(this.fileAccessor.organizedPaths, '.json')) {
      const sidecar = this.sidecarMap.get(relativePath)
      if (sidecar) {
        issues = issues.concat(sidecar.validate(this.hedSchemas))
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
   * @returns A promise that resolves to an array of issues found during TSV validation.
   */
  private async validateTsvFiles(): Promise<BidsHedIssue[]> {
    let issues: BidsHedIssue[] = []
    for (const [category, catMap] of this.fileAccessor.organizedPaths) {
      const tsvPaths = catMap.get('tsv') || []
      const jsonPaths = catMap.get('json') || []
      for (const tsvPath of tsvPaths) {
        issues = issues.concat(await this._validateTsvFile(tsvPath, category, jsonPaths))
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
   * @param tsvPath The relative path to the TSV file.
   * @param category The BIDS category (e.g., 'sub-001/ses-001/func').
   * @param jsonPaths Array of JSON sidecar paths for this category of tsv.
   * @returns A promise that resolves to an array of issues found during validation of this TSV file.
   */
  private async _validateTsvFile(tsvPath: string, category: string, jsonPaths: string[]): Promise<BidsHedIssue[]> {
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
   * @param tsvPath The relative path to the TSV file.
   * @param category The BIDS category (e.g., 'sub-001/ses-001/func').
   * @param jsonPaths Array of JSON sidecar paths for this category.
   * @returns The merged sidecar data object, or empty object if no applicable sidecars found.
   */
  private _getSidecarData(tsvPath: string, category: string, jsonPaths: string[]): Record<string, unknown> {
    const parsedPath = path.parse(tsvPath)

    if (BidsFileAccessor.SPECIAL_DIRS.includes(category)) {
      const expectedJsonPath = `${parsedPath.dir ? parsedPath.dir + '/' : ''}${parsedPath.name}.json`
      const sidecar = this.sidecarMap.get(expectedJsonPath)
      if (sidecar !== undefined) {
        return sidecar.jsonData
      }
      return {}
    }
    return getMergedSidecarData(tsvPath, jsonPaths, this.sidecarMap)
  }
}
