import { BidsHedIssue } from './issues'

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

  validate(hedSchemas) {
    if (!this.hasHedData()) {
      return []
    } else if (hedSchemas === null) {
      return null
    }

    try {
      const validator = new this.validatorClass(this, hedSchemas)
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
