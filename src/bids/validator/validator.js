/**
 * Validator base class for HED data in BIDS TSV files.
 */
export class BidsValidator {
  /**
   * The BIDS file being validated.
   * @type {BidsFile}
   */
  bidsFile
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
   * Bids validator base class.
   *
   * @param {BidsFile} bidsFile - The BIDS TSV file being validated.
   * @param {Schemas} hedSchemas - The HED schemas used for validation.
   */
  constructor(bidsFile, hedSchemas) {
    this.bidsFile = bidsFile
    this.hedSchemas = hedSchemas // Will be set when the file is validated
    this.errors = []
    this.warnings = []
  }

  /**
   * Validate a BIDS file. Overridden by particular types of BIDS files.
   *
   */
  validate() {
    return
  }
}
