/**
 * Validator base class for HED data in BIDS TSV files.
 * @abstract
 */
export class BidsValidator {
  /**
   * The HED schema collection being validated against.
   * @type {Schemas}
   */
  hedSchemas

  /**
   * The issues found during validation.
   * @type {BidsHedIssue[]}
   */
  errors

  /**
   * The warnings found during validation.
   * @type {BidsHedIssue[]}
   */
  warnings

  /**
   * Constructor.
   *
   * @param {Schemas} hedSchemas - The HED schemas used for validation.
   */
  constructor(hedSchemas) {
    this.hedSchemas = hedSchemas // Will be set when the file is validated
    this.errors = []
    this.warnings = []
  }

  /**
   * Validate a BIDS file. Overridden by particular types of BIDS files.
   * @abstract
   */
  validate() {}
}
