import { BidsHedIssue } from '../types/issues'
import ParsedHedString from '../../parser/parsedHedString'
import { generateIssue, IssueError, updateIssueParameters } from '../../issues/issues'
import { getCharacterCount } from '../../utils/string.js'
import { BidsValidator } from './validator'

/**
 * Validator for HED data in BIDS JSON sidecars.
 */
export class BidsHedSidecarValidator extends BidsValidator {
  /**
   * The BIDS sidecar being validated.
   * @type {BidsSidecar}
   */
  sidecar

  /**
   * Constructor for the BidsHedSidecarValidator.
   *
   * @param {BidsSidecar} sidecar - The BIDS sidecar being validated.
   * @param {Schemas} hedSchemas - The schemas used for the sidecar validation.
   */
  constructor(sidecar, hedSchemas) {
    super(hedSchemas)
    this.sidecar = sidecar
  }

  /**
   * Validate a BIDS JSON sidecar file. Errors and warnings are stored.
   *
   */
  validate() {
    // Allow schema to be set a validation time -- this is checked by the superclass of BIDS file
    const [errorIssues, warningIssues] = this.sidecar.parseSidecarKeys(this.hedSchemas, false)
    this.errors.push(...BidsHedIssue.fromHedIssues(errorIssues, this.sidecar.file))
    this.warnings.push(...BidsHedIssue.fromHedIssues(warningIssues, this.sidecar.file))
    if (errorIssues.length > 0) {
      return
    }

    this.errors.push(...this._validateStrings(), ...this._validateCurlyBraces())
    if (errorIssues.length > 0) {
      return
    }

    // Columns that aren't splices should have an annotation that stands on its own.
    const [errors, warnings] = this.sidecar.parseSidecarKeys(this.hedSchemas, true)
    this.errors.push(...BidsHedIssue.fromHedIssues(errors, this.sidecar.file))
    this.warnings.push(...BidsHedIssue.fromHedIssues(warnings, this.sidecar.file))
  }

  /**
   * Validate this sidecar's HED strings.
   *
   * @returns {BidsHedIssue[]} All issues found.
   */
  _validateStrings() {
    const issues = []

    for (const [sidecarKeyName, hedData] of this.sidecar.parsedHedData) {
      if (hedData instanceof ParsedHedString) {
        // Value options have HED as string.
        issues.push(...this._checkDetails(sidecarKeyName, hedData))
      } else if (hedData instanceof Map) {
        // Categorical options have HED as a Map.
        for (const valueString of hedData.values()) {
          issues.push(...this._checkDetails(sidecarKeyName, valueString))
        }
      } else {
        IssueError.generateAndThrow('illegalSidecarData', {
          sidecarKey: sidecarKeyName,
          filePath: this.sidecar?.file?.path,
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
    updateIssueParameters(issues, { sidecarKey: sidecarKeyName, filePath: this.sidecar?.file?.path })
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
    let issues = this.sidecar.definitions.validateDefs(hedString, this.hedSchemas, placeholdersAllowed)
    if (issues.length > 0) {
      return BidsHedIssue.fromHedIssues(issues, this.sidecar.file, { sidecarKey: sidecarKeyName })
    }
    issues = this.sidecar.definitions.validateDefExpands(hedString, this.hedSchemas, placeholdersAllowed)
    return BidsHedIssue.fromHedIssues(issues, this.sidecar.file, { sidecarKey: sidecarKeyName })
  }

  _checkPlaceholders(sidecarKeyName, hedString) {
    const numberPlaceholders = getCharacterCount(hedString.hedString, '#')
    const sidecarKey = this.sidecar.sidecarKeys.get(sidecarKeyName)
    if (!sidecarKey.valueString && !sidecarKey.hasDefinitions && numberPlaceholders > 0) {
      return [
        BidsHedIssue.fromHedIssue(
          generateIssue('invalidSidecarPlaceholder', { sidecarKey: sidecarKeyName, string: hedString.hedString }),
          this.sidecar.file,
        ),
      ]
    } else if (sidecarKey.valueString && numberPlaceholders === 0) {
      return [
        BidsHedIssue.fromHedIssue(
          generateIssue('missingPlaceholder', { sidecarKey: sidecarKeyName, string: hedString.hedString }),
          this.sidecar.file,
        ),
      ]
    }
    if (sidecarKey.valueString && numberPlaceholders > 1) {
      return [
        BidsHedIssue.fromHedIssue(
          generateIssue('invalidSidecarPlaceholder', { sidecarKey: sidecarKeyName, string: hedString.hedString }),
          this.sidecar.file,
        ),
      ]
    }
    return []
  }

  /**
   * Validate this sidecar's curly braces -- checking recursion and missing columns.
   *
   * @returns {BidsHedIssue[]} All issues found.
   */
  _validateCurlyBraces() {
    const issues = []
    const references = this.sidecar.columnSpliceMapping

    for (const [key, referredKeys] of references) {
      for (const referredKey of referredKeys) {
        if (references.has(referredKey)) {
          issues.push(
            BidsHedIssue.fromHedIssue(
              generateIssue('recursiveCurlyBracesWithKey', { sidecarKey: referredKey, referrer: key }),
              this.sidecar.file,
            ),
          )
        }
        if (!this.sidecar.parsedHedData.has(referredKey) && referredKey !== 'HED') {
          issues.push(
            BidsHedIssue.fromHedIssue(
              generateIssue('undefinedCurlyBraces', { sidecarKey: referredKey }),
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
