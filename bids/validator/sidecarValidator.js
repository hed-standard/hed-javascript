import { BidsHedIssue } from '../types/issues'
import ParsedHedString from '../../parser/parsedHedString'
// IMPORTANT: This import cannot be shortened to '../../validator', as this creates a circular dependency until v4.0.0.
//import { validateHedString } from '../../validator/event/init'
import { generateIssue, IssueError } from '../../common/issues/issues'
import { getCharacterCount } from '../../utils/string.js'
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
   * @param {Schemas} hedSchemas
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
    // Allow schema to be set a validation time -- this is checked by the superclass of BIDS file
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

    for (const [sidecarKeyName, hedData] of this.sidecar.parsedHedData) {
      if (hedData instanceof ParsedHedString) {
        // Value options have HED as string
        issues.push(...this._checkDetails(sidecarKeyName, hedData))
      } else if (hedData instanceof Map) {
        // Categorical options have HED as a Map
        for (const valueString of hedData.values()) {
          issues.push(...this._checkDetails(sidecarKeyName, valueString))
        }
      } else {
        IssueError.generateAndThrow('internalConsistencyError', {
          message: 'Unexpected type found in sidecar parsedHedData map.',
        })
      }
    }
    return issues
  }

  _checkDetails(sidecarKeyName, hedString) {
    const issues = this._checkDefs(sidecarKeyName, hedString)
    issues.push(...this._checkPlaceholders(sidecarKeyName, hedString))
    return issues
  }

  _checkDefs(sidecarKeyName, sidecarString, placeholdersAllowed) {
    const hedIssues = this.sidecar.definitions.validateDefs(sidecarString, this.hedSchemas, placeholdersAllowed)
    if (hedIssues.length > 0) {
      return BidsHedIssue.fromHedIssues(hedIssues, this.sidecar.file, { sidecarKeyName: sidecarKeyName })
    }
    return []
  }

  _checkPlaceholders(sidecarKeyName, hedString) {
    const numberPlaceholders = getCharacterCount(hedString.hedString, '#')
    const sidecarKey = this.sidecar.sidecarKeys.get(sidecarKeyName)
    if (!sidecarKey.valueString && !sidecarKey.hasDefinitions && numberPlaceholders > 0) {
      return [
        BidsHedIssue.fromHedIssue(
          generateIssue('invalidSidecarPlaceholder', { column: sidecarKeyName, string: hedString.hedString }),
          this.sidecar.file,
        ),
      ]
    } else if (sidecarKey.valueString && numberPlaceholders === 0) {
      return [
        BidsHedIssue.fromHedIssue(
          generateIssue('missingPlaceholder', { column: sidecarKeyName, string: hedString.hedString }),
          this.sidecar.file,
        ),
      ]
    }
    if (sidecarKey.valueString && numberPlaceholders > 1) {
      return [
        BidsHedIssue.fromHedIssue(
          generateIssue('invalidSidecarPlaceholder', { column: sidecarKeyName, string: hedString.hedString }),
          this.sidecar.file,
        ),
      ]
    }
    return []
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
