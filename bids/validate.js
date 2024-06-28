import { buildBidsSchemas } from './schema'
import { BidsHedIssue, BidsIssue } from './types/issues'
import BidsHedSidecarValidator from './validator/bidsHedSidecarValidator'
import BidsHedTsvValidator from './validator/bidsHedTsvValidator'

/**
 * Validate a BIDS dataset.
 *
 * @param {BidsDataset} dataset The BIDS dataset.
 * @param {SchemasSpec} schemaDefinition The version spec for the schema to be loaded.
 * @returns {Promise<BidsIssue[]>} Any issues found.
 */
export async function validateBidsDataset(dataset, schemaDefinition) {
  try {
    const hedSchemas = await buildBidsSchemas(dataset.datasetDescription, schemaDefinition)
    const validator = new BidsHedValidator(dataset, hedSchemas)
    try {
      return validator.validateFullDataset()
    } catch (internalError) {
      return BidsIssue.generateInternalErrorPromise(internalError, dataset.datasetDescription.file)
    }
  } catch (schemaIssues) {
    return BidsHedIssue.fromHedIssues(schemaIssues, dataset.datasetDescription.file)
  }
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
   * @param {Schemas} hedSchemas The HED schema collection being validated against.
   */
  constructor(dataset, hedSchemas) {
    this.dataset = dataset
    this.hedSchemas = hedSchemas
    this.issues = []
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
