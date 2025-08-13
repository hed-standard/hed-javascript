/**
 * This module contains the {@link BidsFile} class, which is the base class for BIDS files.
 *
 * @module file
 */

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

  constructor(name, file, validatorClass) {
    this.name = name
    this.file = file
    this._validatorClass = validatorClass
  }

  /**
   * Validate this validator's tsv file.
   *
   * @param {HedSchemas} schemas - The HED schemas used to validate this file.
   * @returns {BidsHedIssue[]} - Any issues found during validation of this TSV file.
   */
  validate(schemas) {
    if (!this.hasHedData) {
      return []
    }
    if (!schemas) {
      return [
        BidsHedIssue.fromHedIssue(
          generateIssue('missingSchemaSpecification', {
            message: 'No valid HED schema specification was supplied.',
          }),
          this.file,
        ),
      ]
    }

    try {
      const validator = new this.validatorClass(this, schemas)
      validator.validate()
      return [...validator.errors, ...validator.warnings]
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
   * @returns {function} The validator class used to validate this file.
   */
  get validatorClass() {
    return this._validatorClass
  }
}
