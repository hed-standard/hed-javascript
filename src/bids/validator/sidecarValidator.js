/** This module holds the sidecar validator class.
 * @module bids/validator/sidecarValidator
 */

import { BidsHedIssue } from '../types/issues'
import ParsedHedString from '../../parser/parsedHedString'
import { parseHedString } from '../../parser/parser'
import { replaceColumnReferences } from '../../parser/parseUtils'
import { generateIssue, IssueError } from '../../issues/issues'
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
    if (this.errors.length > 0) {
      return
    }
    this.errors.push(...this._validateSubstitutions())

    // Columns that aren't splices should have an annotation that stands on its own.
    const [errors, warnings] = this.sidecar.parseSidecarKeys(this.hedSchemas, true)
    this.errors.push(...BidsHedIssue.fromHedIssues(errors, this.sidecar.file))
    // The second pass parses the same strings again, so it repeats the warnings of the first pass.
    const firstPassWarnings = new Set(warningIssues.map((issue) => BidsHedSidecarValidator._issueKey(issue)))
    const newWarnings = warnings.filter((issue) => !firstPassWarnings.has(BidsHedSidecarValidator._issueKey(issue)))
    this.warnings.push(...BidsHedIssue.fromHedIssues(newWarnings, this.sidecar.file))
  }

  /**
   * A key that is the same for two issues with the same code and parameters.
   *
   * @param {Issue} issue - The issue.
   * @returns {string} The key.
   * @private
   */
  static _issueKey(issue) {
    return JSON.stringify([issue.internalCode, issue.parameters])
  }

  /**
   * Validate this sidecar's HED strings.
   *
   * @returns {BidsHedIssue[]} All issues found.
   * @private
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
          if (valueString === null) {
            continue
          }
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
    BidsHedIssue.addIssueParameters(issues, { sidecarKey: sidecarKeyName, filePath: this.sidecar?.file?.path })
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

  /**
   * Validate the placeholders.
   *
   * @param {string} sidecarKeyName - Name of the sidecar key for this HED string
   * @param {ParsedHedString} hedString - The parsed HED string object associated with this key.
   * @returns {BidsHedIssue[]} Issues encountered relating to invalid placeholders.
   * @private
   */
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
   * @private
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

  /**
   * Check each annotation with curly braces under the substitutions of specification 3.2.9.3 rule 10.
   *
   * An annotation is checked with every reference removed, then with each annotation of each referenced column
   * substituted, one referenced column at a time, every other reference removed. A referenced value column is
   * substituted with its template, `#` unfilled; `{HED}` is only removed, since its content is known only per row.
   * So the number of strings checked is one more than the sum of the referenced columns' annotations, not their
   * product. Only repeated expressions are checked: the reserved-tag group rules and anything else that depends on
   * the other columns of a row are checked when the row is assembled (rule 9).
   *
   * @returns {BidsHedIssue[]} One issue for each annotation that has a repeated expression under some substitution.
   * @private
   */
  _validateSubstitutions() {
    const issues = []
    for (const columnName of this.sidecar.columnSpliceMapping.keys()) {
      const hedData = this.sidecar.parsedHedData.get(columnName)
      const annotations = hedData instanceof Map ? [...hedData.values()] : [hedData]
      for (const annotation of annotations) {
        if (annotation instanceof ParsedHedString && annotation.columnSplices.length > 0) {
          issues.push(...this._checkSubstitutions(columnName, annotation))
        }
      }
    }
    return issues
  }

  /**
   * Check one annotation under the substitutions of rule 10 and report the first repeated expression found.
   *
   * @param {string} columnName - The column whose annotation is checked.
   * @param {ParsedHedString} annotation - The annotation, with curly-brace references.
   * @returns {BidsHedIssue[]} An issue for the first substitution that has a repeated expression, or none.
   * @private
   */
  _checkSubstitutions(columnName, annotation) {
    for (const [substitution, substituted] of this._substitutions(annotation)) {
      if (substituted === '') {
        continue
      }
      const [, errorIssues] = parseHedString(substituted, this.hedSchemas, false, true, false)
      const repeat = errorIssues.find((issue) => issue.internalCode === 'duplicateTag')
      if (repeat !== undefined) {
        const issue = generateIssue('duplicateTagInSubstitution', {
          tags: repeat.parameters.tags,
          annotation: annotation.hedString,
          sidecarKey: columnName,
          substitution: substitution,
          string: substituted,
        })
        return [BidsHedIssue.fromHedIssue(issue, this.sidecar.file, { filePath: this.sidecar?.file?.path })]
      }
    }
    return []
  }

  /**
   * The substitutions of rule 10 for one annotation, the removal of every reference first.
   *
   * @param {ParsedHedString} annotation - The annotation, with curly-brace references.
   * @yields {Array} A description of each substitution and the substituted string.
   * @private
   */
  *_substitutions(annotation) {
    const template = annotation.hedString
    yield ['every curly-brace reference is removed', replaceColumnReferences(template, () => undefined)]
    const references = new Set(annotation.columnSplices.map((splice) => splice.originalTag))
    for (const reference of references) {
      const referencedData = this.sidecar.parsedHedData.get(reference)
      const replacements = []
      if (referencedData instanceof ParsedHedString) {
        replacements.push(['its template', referencedData.hedString])
      } else if (referencedData instanceof Map) {
        for (const [value, valueAnnotation] of referencedData) {
          if (valueAnnotation !== null) {
            replacements.push([`the annotation of "${value}"`, valueAnnotation.hedString])
          }
        }
      }
      for (const [description, replacement] of replacements) {
        const substituted = replaceColumnReferences(template, (name) => (name === reference ? replacement : undefined))
        yield [`"{${reference}}" is replaced by ${description}`, substituted]
      }
    }
  }
}

export default BidsHedSidecarValidator
