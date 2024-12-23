import { BidsHedIssue } from '../types/issues'
import ParsedHedString from '../../parser/parsedHedString'
// IMPORTANT: This import cannot be shortened to '../../validator', as this creates a circular dependency until v4.0.0.
import { validateHedString } from '../../validator/event/init'
import { generateIssue, IssueError } from '../../common/issues/issues'

/**
 * Validator for HED data in BIDS JSON sidecars.
 */
export class BidsHedSidecarValidator {
  /**
   * The BIDS sidecar being validated.
   * @type {BidsSidecar}
   */
  sidecar
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
   * @param {BidsSidecar} sidecar The BIDS sidecar being validated.
   * @param {Schemas} hedSchemas The HED schema collection being validated against.
   */
  constructor(sidecar, hedSchemas) {
    this.sidecar = sidecar
    this.hedSchemas = hedSchemas
    this.issues = []
  }

  /**
   * Validate a BIDS JSON sidecar file. This method returns the complete issue list for convenience.
   *
   * @returns {BidsIssue[]} Any issues found during validation of this sidecar file.
   */
  validate() {
    const sidecarParsingIssues = BidsHedIssue.fromHedIssues(
      this.sidecar.parseHedStrings(this.hedSchemas),
      this.sidecar.file,
    )
    this.issues.push(...sidecarParsingIssues)
    if (sidecarParsingIssues.length > 0) {
      return this.issues
    }
    this.issues.push(...this._validateStrings(), ...this.validateCurlyBraces())
    return this.issues
  }

  /**
   * Validate this sidecar's HED strings.
   *
   * @returns {BidsIssue[]} All issues found.
   */
  _validateStrings() {
    const issues = []

    const categoricalOptions = {
      checkForWarnings: true,
      expectValuePlaceholderString: false,
      definitionsAllowed: 'exclusive',
    }
    const valueOptions = {
      checkForWarnings: true,
      expectValuePlaceholderString: true,
      definitionsAllowed: 'no',
    }

    for (const [sidecarKey, hedData] of this.sidecar.parsedHedData) {
      if (hedData instanceof ParsedHedString) {
        // Value options have HED as string
        issues.push(...this._validateString(sidecarKey, hedData, valueOptions))
      } else if (hedData instanceof Map) {
        // Categorical options have HED as a Map
        for (const valueString of hedData.values()) {
          issues.push(...this._validateString(sidecarKey, valueString, categoricalOptions))
        }
      } else {
        IssueError.generateAndThrow('internalConsistencyError', {
          message: 'Unexpected type found in sidecar parsedHedData map.',
        })
      }
    }

    return issues
  }

  /**
   * Validate an individual string in this sidecar.
   *
   * @param {string} sidecarKey The sidecar key this string belongs to.
   * @param {ParsedHedString} sidecarString The parsed sidecar HED string.
   * @param {Object} options Options specific to this validation run to pass to {@link validateHedString}.
   * @returns {BidsIssue[]} All issues found.
   * @private
   */
  _validateString(sidecarKey, sidecarString, options) {
    // Parsing issues already pushed in validateSidecars()
    if (sidecarString === null) {
      return []
    }

    const [, hedIssues] = validateHedString(sidecarString, this.hedSchemas, options)
    return BidsHedIssue.fromHedIssues(hedIssues, this.sidecar.file, { sidecarKey })
  }

  /**
   * Validate this sidecar's curly braces.
   *
   * @returns {BidsIssue[]} All issues found.
   */
  validateCurlyBraces() {
    const issues = []
    const references = this.sidecar.columnSpliceMapping

    for (const [key, referredKeys] of references) {
      for (const referredKey of referredKeys) {
        if (references.has(referredKey)) {
          issues.push(
            BidsHedIssue.fromHedIssue(
              generateIssue('recursiveCurlyBracesWithKey', { column: referredKey, referrer: key }),
              this.sidecar.file,
            ),
          )
        }
        if (!this.sidecar.parsedHedData.has(referredKey) && referredKey !== 'HED') {
          issues.push(
            BidsHedIssue.fromHedIssue(
              generateIssue('undefinedCurlyBraces', { column: referredKey }),
              this.sidecar.file,
            ),
          )
        }
      }
    }

    return issues
  }
}

export default BidsHedSidecarValidator
