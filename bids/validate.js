import { buildBidsSchemas } from './schema'
import { BidsHedIssue, BidsIssue } from './types/issues'
import BidsHedSidecarValidator from './validator/bidsHedSidecarValidator'
import BidsHedTsvValidator from './validator/bidsHedTsvValidator'
import { generateIssue } from '../common/issues/issues'

/**
 * Validate a BIDS dataset.
 *
 * @param {BidsDataset} dataset The BIDS dataset.
 * @param {SchemasSpec} schemaDefinition The version spec for the schema to be loaded.
 * @returns {Promise<BidsIssue[]>} Any issues found.
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
      await this.validateFullDataset()
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
   * @returns {Promise<BidsIssue[]>} Any issues found.
   */
  async validateFullDataset() {
    for (const sidecar of this.dataset.sidecarData) {
      const sidecarValidator = new BidsHedSidecarValidator(sidecar, this.hedSchemas)
      this.issues.push(...sidecarValidator.validate())
    }
    if (BidsIssue.anyAreErrors(this.issues)) {
      return this.issues
    }
    for (const eventFileData of this.dataset.eventData) {
      const tsvValidator = new BidsHedTsvValidator(eventFileData, this.hedSchemas)
      this.issues.push(...tsvValidator.validate())
    }
    return this.issues
  }
}
