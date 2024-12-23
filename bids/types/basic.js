import { BidsHedIssue } from './issues'
import { generateIssue } from '../../common/issues/issues'

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
   * The file object representing this file data.
   * This is used to generate {@link BidsIssue} objects.
   * @type {object}
   */
  file
  /**
   * The validator class used to validate this file.
   * @private
   */
  _validatorClass

  constructor(name, file, validatorClass) {
    this.name = name
    this.file = file
    this._validatorClass = validatorClass
  }

  /**
   * Determine whether this file has any HED data.
   *
   * @returns {boolean}
   */
  hasHedData() {
    return false
  }

  /**
   * Validate this validator's tsv file
   *
   * @param {Schemas} schemas
   * @returns {BidsIssue[]} Any issues found during validation of this TSV file.
   */
  validate(schemas) {
    if (!this.hasHedData()) {
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
   * @returns {*}
   */
  get validatorClass() {
    return this._validatorClass
  }
}
