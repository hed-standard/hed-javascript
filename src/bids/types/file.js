import { BidsHedIssue } from './issues'
import { generateIssue } from '../../issues/issues'

/**
 * A BIDS file.
 */
export class BidsFile {
  /**
   * The name of this file.
   * @type {string}
   */
  name

  /**
   * The Object representing this file data.
   * This is used to generate {@link BidsHedIssue} objects.
   * @type {Object}
   */

  file
  /**
   * The validator class used to validate this file.
   * @private
   */
  _validatorClass

  /**
   *
   * @param {string} name - The name of the file -- used for messages.
   * @param {Object} file - The representation of the file for error messages.
   * @param {BidsValidator} validatorClass - The validator class corresponding to this file.
   */
  constructor(name, file, validatorClass) {
    this.name = name
    this.file = file
    this._validatorClass = validatorClass
  }

  /**
   * Validate this validator's tsv file.
   *
   * @param {Schemas} schemas - The HED schemas used to validate this file.
   * @returns {BidsHedIssue[]} - Any issues found during validation of this TSV file.
   */
  validate(schemas) {
    if (!this.hasHedData) {
      return []
    }
    if (!schemas) {
      BidsHedIssue.fromHedIssue(
        generateIssue('missingSchemaSpecification', {
          message: 'No valid HED schema specification was supplied.',
        }),
        { path: this.file.file, relativePath: this.file.file },
      )
    }

    try {
      const validator = new this.validatorClass(this, schemas)
      return validator.validate()
    } catch (error) {
      // The low-level parsing throws exceptions with the issue encapsulated.
      return BidsHedIssue.fromHedIssues(error, this.file)
    }
  }

  /**
   * Determine whether this file has any HED data.
   *
   * @returns {boolean}
   */
  get hasHedData() {
    return false
  }

  /**
   * The validator class used to validate this file.
   *
   * @returns {function} (typeof BidsValidator) A subclass constructor of {@link BidsValidator}.
   */
  get validatorClass() {
    return this._validatorClass
  }
}
