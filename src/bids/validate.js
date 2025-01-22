import { buildBidsSchemas } from './schema'
import { BidsHedIssue, BidsIssue } from './types/issues'
import { generateIssue } from '../common/issues/issues'

/**
 * Validate a BIDS dataset.
 *
 * @param {BidsDataset} dataset The BIDS dataset.
 * @param {SchemasSpec} schemaDefinition The version spec for the schema to be loaded.
 * @returns {Promise} A promise for list of Any issues found.
 */
export async function validateBidsDataset(dataset, schemaDefinition) {
  const validator = new BidsHedValidator(dataset, schemaDefinition)
  return validator.validate()
}

export default validateBidsDataset

/**
 * A validator for HED content in a BIDS dataset.
 */
class BidsHedValidator {
  /**
   * The BIDS dataset being validated.
   * @type {BidsDataset}
   */
  dataset
  /**
   * The schema specification override.
   * @type {SchemasSpec}
   */
  schemaDefinition
  /**
   * The HED schema collection being validated against.
   * @type {Schemas}
   */
  hedSchemas
  /**
   * The issues found during validation.
   * @type {BidsIssue[]}
   */
  issues

  /**
   * Constructor.
   *
   * @param {BidsDataset} dataset The BIDS dataset being validated.
   * @param {SchemasSpec} schemaDefinition The version spec for the schema to be loaded.
   */
  constructor(dataset, schemaDefinition) {
    this.dataset = dataset
    this.schemaDefinition = schemaDefinition
    this.issues = []
  }

  async validate() {
    this.issues.push(...(await this._buildSchemas()))
    if (this.issues.length > 0) {
      return this.issues
    }
    try {
      this.validateFullDataset()
    } catch (internalError) {
      return BidsIssue.generateInternalErrorPromise(internalError, this.dataset.datasetDescription.file)
    }
    return this.issues
  }

  async _buildSchemas() {
    try {
      this.hedSchemas = await buildBidsSchemas(this.dataset.datasetDescription, this.schemaDefinition)
      if (this.hedSchemas === null && this.dataset.hasHedData) {
        return [
          BidsHedIssue.fromHedIssue(
            generateIssue('missingSchemaSpecification', {}),
            this.dataset.datasetDescription.file,
          ),
        ]
      }
      return []
    } catch (schemaIssues) {
      return BidsHedIssue.fromHedIssues(schemaIssues, this.dataset.datasetDescription.file)
    }
  }

  /**
   * Validate a full BIDS dataset using a HED schema collection.
   *
   * @returns {BidsIssue[]} Any issues found.
   */
  validateFullDataset() {
    this._validateFiles(this.dataset.sidecarData)
    if (BidsIssue.anyAreErrors(this.issues)) {
      return this.issues
    }
    this._validateFiles(this.dataset.eventData)
    return this.issues
  }

  /**
   * Validate a set of BIDS files using a HED schema collection.
   *
   * @param {BidsFile[]} files The list of files.
   * @private
   */
  _validateFiles(files) {
    for (const file of files) {
      const schemaFound = this._validateFile(file)
      if (!schemaFound) {
        return
      }
    }
  }

  /**
   * Validate a BIDS file using a HED schema collection.
   *
   * @returns {boolean} If the schema was found by the validator.
   * @private
   */
  _validateFile(file) {
    const issues = file.validate(this.hedSchemas)
    if (issues === null) {
      this.issues.push(
        BidsHedIssue.fromHedIssue(
          generateIssue('missingSchemaSpecification', {}),
          this.dataset.datasetDescription.file,
        ),
      )
      return false
    }
    this.issues.push(...issues)
    return true
  }
}
