import ParsedHedString from './parsedHedString'
import ParsedHedColumnSplice from './parsedHedColumnSplice'
import ParsedHedGroup from './parsedHedGroup'
import { generateIssue } from '../common/issues/issues'

export class ColumnSplicer {
  /**
   * The parsed HED string in which to make column splices.
   * @type {ParsedHedString}
   */
  parsedString
  /**
   * A mapping from column names to their replacement strings.
   * @type {Map<string, ParsedHedString>}
   */
  columnReplacements
  /**
   * A mapping from column names to their values.
   * @type {Map<string, string>}
   */
  columnValues
  /**
   * The active HED schema collection (passed to the {@link ParsedHedGroup} constructor).
   * @type {Schemas}
   */
  hedSchemas
  /**
   * Any issues found while splicing the columns.
   * @type {Issue[]}
   */
  issues

  /**
   * Substitute replacement strings for column splice templates.
   *
   * @param {ParsedHedString} parsedString The parsed HED string in which to make column splices.
   * @param {Map<string, ParsedHedString>} columnReplacements A mapping from column names to their replacement strings.
   * @param {Map<string, string>} columnValues A mapping from column names to their values.
   * @param {Schemas} hedSchemas The active HED schema collection (passed to the {@link ParsedHedGroup} constructor).
   */
  constructor(parsedString, columnReplacements, columnValues, hedSchemas) {
    this.parsedString = parsedString
    this.columnReplacements = columnReplacements
    this.columnValues = columnValues
    this.hedSchemas = hedSchemas
    this.issues = []
  }

  /**
   * Substitute replacement strings for column splice templates.
   *
   * @returns {ParsedHedString} A new parsed HED string with the replacements made.
   */
  splice() {
    const originalData = this.parsedString.parseTree
    const newData = this._spliceSubstrings(originalData)
    return new ParsedHedString(this.parsedString.hedString, newData)
  }

  /**
   * Splice replacement strings into a list of substrings.
   *
   * @param {ParsedHedSubstring[]} substrings The parsed HED substrings in which to make column splices.
   * @returns {ParsedHedSubstring[]} A new list of parsed HED substrings with the replacements made.
   * @private
   */
  _spliceSubstrings(substrings) {
    const newData = []
    for (const substring of substrings) {
      newData.push(...this._spliceSubstring(substring))
    }
    return newData
  }

  /**
   * Splice replacement strings in place of a single substring.
   *
   * @param {ParsedHedSubstring} substring The parsed HED substring in which to make column splices.
   * @returns {ParsedHedSubstring[]} A new list of parsed HED substrings with the replacements made.
   * @private
   */
  _spliceSubstring(substring) {
    const newData = []
    if (substring instanceof ParsedHedColumnSplice) {
      const substitution = this._spliceTemplate(substring)
      if (substitution === null) {
        return []
      }
      newData.push(...substitution)
      if (substitution.length === 0) {
        newData.push(substring)
      }
    } else if (substring instanceof ParsedHedGroup) {
      const substitution = this._spliceGroup(substring)
      if (substitution !== null) {
        newData.push(substitution)
      }
    } else {
      newData.push(substring)
    }
    return newData
  }

  /**
   * Splice a replacement string in place of a column template.
   *
   * @param {ParsedHedColumnSplice} columnTemplate The parsed HED column splice template in which to make the column splice.
   * @returns {ParsedHedSubstring[]|null} The spliced column substitution.
   * @private
   */
  _spliceTemplate(columnTemplate) {
    const columnName = columnTemplate.originalTag
    const replacementString = this.columnReplacements.get(columnName)
    if (replacementString === null) {
      return null
    }
    if (replacementString === undefined) {
      this.issues.push(generateIssue('undefinedCurlyBraces', { column: columnName }))
      return []
    }
    if (replacementString.columnSplices.length > 0) {
      this.issues.push(generateIssue('recursiveCurlyBraces', { column: columnName }))
      return []
    }
    return replacementString.parseTree
  }

  /**
   * Splice replacement strings into a parsed HED tag group.
   *
   * @param {ParsedHedGroup} group The parsed HED group in which to make column splices.
   * @returns {ParsedHedGroup|null} A new parsed HED group with the replacements made.
   * @private
   */
  _spliceGroup(group) {
    const newData = this._spliceSubstrings(group.tags)
    if (newData.length === 0) {
      return null
    }
    return new ParsedHedGroup(newData, this.hedSchemas, this.parsedString.hedString, group.originalBounds)
  }
}

export default ColumnSplicer
