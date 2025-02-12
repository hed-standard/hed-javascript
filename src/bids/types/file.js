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
   * This is used to generate {@link BidsIssue} objects.
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
   * @returns {BidsIssue[]} - Any issues found during validation of this TSV file.
   */
  validate(schemas) {
    if (!this.hasHedData) {
      return []
    }
    if (!schemas) {
      BidsHedIssue.fromHedIssue(
        generateIssue('genericError', {
          message: 'BIDS file HED validation requires a HED schema, but the schema received was null.',
        }),
        { path: this.file.file, relativePath: this.file.file },
      )
    }

    try {
      const validator = new this.validatorClass(this, schemas)
      return validator.validate()
    } catch (internalError) {
      return BidsHedIssue.fromHedIssues(internalError, this.file)
    }
  }

  /**
   * The validator class used to validate this file.
   * @returns {BidsValidator}
   */
  get validatorClass() {
    return this._validatorClass
  }
}
