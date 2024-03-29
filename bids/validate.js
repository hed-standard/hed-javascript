import { buildBidsSchemas } from './schema'
import { BidsHedIssue, BidsIssue } from './types/issues'
import { BidsHedTsvValidator } from './validator/bidsHedTsvValidator'
import { BidsHedSidecarValidator } from './validator/bidsHedSidecarValidator'
import { BidsHedColumnValidator } from './validator/bidsHedColumnValidator'

/**
 * Validate a BIDS dataset.
 *
 * @param {BidsDataset} dataset The BIDS dataset.
 * @param {object} schemaDefinition The version spec for the schema to be loaded.
 * @returns {Promise<BidsIssue[]>} Any issues found.
 */
export function validateBidsDataset(dataset, schemaDefinition) {
  return buildBidsSchemas(dataset, schemaDefinition).then(
    ([hedSchemas, schemaLoadIssues]) => {
      return new BidsHedValidator(dataset, hedSchemas)
        .validateFullDataset()
        .catch(BidsIssue.generateInternalErrorPromise)
        .then((issues) => issues.concat(BidsHedIssue.fromHedIssues(schemaLoadIssues, dataset.datasetDescription.file)))
    },
    (issues) => BidsHedIssue.fromHedIssues(issues, dataset.datasetDescription.file),
  )
}

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
   * @type {BidsHedIssue[]}
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
   * @returns {Promise<BidsIssue[]>|Promise<never>} Any issues found.
   */
  validateFullDataset() {
    try {
      const sidecarValidator = new BidsHedSidecarValidator(this.dataset, this.hedSchemas)
      const hedColumnValidator = new BidsHedColumnValidator(this.dataset, this.hedSchemas)
      const sidecarErrorsFound = this._pushIssues(sidecarValidator.validateSidecars())
      const hedColumnErrorsFound = this._pushIssues(hedColumnValidator.validate())
      if (sidecarErrorsFound || hedColumnErrorsFound) {
        return Promise.resolve(this.issues)
      }
      for (const eventFileData of this.dataset.eventData) {
        const tsvValidator = new BidsHedTsvValidator(eventFileData, this.hedSchemas)
        this.issues.push(...tsvValidator.validate())
      }
      return Promise.resolve(this.issues)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  /**
   * Push a list of issues to the validator's issue list.
   *
   * @param {BidsHedIssue[]} issues A list of issues generated by a file type-specific validator.
   * @returns {boolean} Whether any of the issues generated/added were errors as opposed to warnings.
   * @private
   */
  _pushIssues(issues) {
    this.issues.push(...issues)
    return BidsIssue.anyAreErrors(issues)
  }
}
