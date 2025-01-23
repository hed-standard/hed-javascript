import { BidsHedIssue } from '../types/issues'
import ParsedHedString from '../../parser/parsedHedString'
import { generateIssue, IssueError } from '../../issues/issues'
import { getCharacterCount } from '../../utils/string.js'
import { BidsValidator } from './validator'

/**
 * Validator for HED data in BIDS JSON sidecars.
 */
export class BidsHedSidecarValidator extends BidsValidator {
  /**
   * Constructor for the BidsHedSidecarValidator.
   *
   * @param {BidsSidecar} sidecar - The BIDS bidsFile being validated.
   * @param {Schemas} hedSchemas - The schemas used for the sidecar validation.
   */
  constructor(sidecar, hedSchemas) {
    super(sidecar, hedSchemas)
  }

  /**
   * Validate a BIDS JSON bidsFile file. This method returns the complete issue list for convenience.
   *
   * @returns {BidsIssue[]} - Any issues found during validation of this bidsFile file.
   */
  validate() {
    // Allow schema to be set a validation time -- this is checked by the superclass of BIDS file
    const sidecarParsingIssues = BidsHedIssue.fromHedIssues(
      this.bidsFile.parseHedStrings(this.hedSchemas),
      this.bidsFile.file,
    )
    this.issues.push(...sidecarParsingIssues)
    if (sidecarParsingIssues.length > 0) {
      return this.issues
    }
    this.issues.push(...this._validateStrings(), ...this._validateCurlyBraces())
    return this.issues
  }

  /**
   * Validate this bidsFile's HED strings.
   *
   * @returns {BidsIssue[]} All issues found.
   */
  _validateStrings() {
    const issues = []

    for (const [sidecarKeyName, hedData] of this.bidsFile.parsedHedData) {
      if (hedData instanceof ParsedHedString) {
        // Value options have HED as string.
        issues.push(...this._checkDetails(sidecarKeyName, hedData))
      } else if (hedData instanceof Map) {
        // Categorical options have HED as a Map.
        for (const valueString of hedData.values()) {
          issues.push(...this._checkDetails(sidecarKeyName, valueString))
        }
      } else {
        IssueError.generateAndThrow('internalConsistencyError', {
          message: 'Unexpected type found in bidsFile parsedHedData map.',
        })
      }
    }
    return issues
  }

  /**
   * Check definitions and placeholders for a string associated with a sidecar key.
   *
   * @param {string} sidecarKeyName - The name of the sidecar key associated with string to be checked.
   * @param {ParsedHedString} hedString - The parsed string to be checked.
   * @returns {BidsHedIssue[]} - Issues associated with the check.
   * @private
   */
  _checkDetails(sidecarKeyName, hedString) {
    const issues = this._checkDefs(sidecarKeyName, hedString, true)
    issues.push(...this._checkPlaceholders(sidecarKeyName, hedString))
    return issues
  }

  /**
   * Validate the Def and Def-expand usage against the sidecar definitions.
   *
   * @param {string} sidecarKeyName - Name of the sidecar key for this HED string
   * @param {ParsedHedString} hedString - The parsed HED string object associated with this key.
   * @param {boolean} placeholdersAllowed - If true, placeholders are allowed here.
   * @returns {BidsHedIssue[]} - Issues encountered such as missing definitions or improper Def-expand values.
   * @private
   */
  _checkDefs(sidecarKeyName, hedString, placeholdersAllowed) {
    let issues = this.bidsFile.definitions.validateDefs(hedString, this.hedSchemas, placeholdersAllowed)
    if (issues.length > 0) {
      return BidsHedIssue.fromHedIssues(issues, this.bidsFile.file, { sidecarKeyName: sidecarKeyName })
    }
    issues = this.bidsFile.definitions.validateDefExpands(hedString, this.hedSchemas, placeholdersAllowed)
    return BidsHedIssue.fromHedIssues(issues, this.bidsFile.file, { sidecarKeyName: sidecarKeyName })
  }

  _checkPlaceholders(sidecarKeyName, hedString) {
    const numberPlaceholders = getCharacterCount(hedString.hedString, '#')
    const sidecarKey = this.bidsFile.sidecarKeys.get(sidecarKeyName)
    if (!sidecarKey.valueString && !sidecarKey.hasDefinitions && numberPlaceholders > 0) {
      return [
        BidsHedIssue.fromHedIssue(
          generateIssue('invalidSidecarPlaceholder', { column: sidecarKeyName, string: hedString.hedString }),
          this.bidsFile.file,
        ),
      ]
    } else if (sidecarKey.valueString && numberPlaceholders === 0) {
      return [
        BidsHedIssue.fromHedIssue(
          generateIssue('missingPlaceholder', { column: sidecarKeyName, string: hedString.hedString }),
          this.bidsFile.file,
        ),
      ]
    }
    if (sidecarKey.valueString && numberPlaceholders > 1) {
      return [
        BidsHedIssue.fromHedIssue(
          generateIssue('invalidSidecarPlaceholder', { column: sidecarKeyName, string: hedString.hedString }),
          this.bidsFile.file,
        ),
      ]
    }
    return []
  }

  /**
   * Validate this bidsFile's curly braces -- checking recursion and missing columns.
   *
   * @returns {BidsIssue[]} All issues found.
   */
  _validateCurlyBraces() {
    const issues = []
    const references = this.bidsFile.columnSpliceMapping

    for (const [key, referredKeys] of references) {
      for (const referredKey of referredKeys) {
        if (references.has(referredKey)) {
          issues.push(
            BidsHedIssue.fromHedIssue(
              generateIssue('recursiveCurlyBracesWithKey', { column: referredKey, referrer: key }),
              this.bidsFile.file,
            ),
          )
        }
        if (!this.bidsFile.parsedHedData.has(referredKey) && referredKey !== 'HED') {
          issues.push(
            BidsHedIssue.fromHedIssue(
              generateIssue('undefinedCurlyBraces', { column: referredKey }),
              this.bidsFile.file,
            ),
          )
        }
      }
    }

    return issues
  }
}

export default BidsHedSidecarValidator
