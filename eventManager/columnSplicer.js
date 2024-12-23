import ParsedHedString from './parsedHedString'
import ParsedHedColumnSplice from './parsedHedColumnSplice'
import ParsedHedGroup from './parsedHedGroup'
import { generateIssue } from '../common/issues/issues'
import { parseHedString } from './parser'

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

    // HED column handled specially
    if (columnName === 'HED') {
      return this._spliceHedColumnTemplate()
    }

    // Not the HED column so treat as usual
    const replacementString = this.columnReplacements.get(columnName)

    // Handle null or undefined replacement strings
    if (replacementString === null) {
      return null
    }
    if (replacementString === undefined) {
      this.issues.push(generateIssue('undefinedCurlyBraces', { column: columnName }))
      return []
    }

    // Handle recursive curly braces
    if (replacementString.columnSplices.length > 0) {
      this.issues.push(generateIssue('recursiveCurlyBraces', { column: columnName }))
      return []
    }

    // Handle value templates with placeholder
    const tagListHasPlaceholder = replacementString.tags.some((tag) => tag.originalTagName === '#')
    if (tagListHasPlaceholder) {
      return this._spliceValueTemplate(columnTemplate)
    }

    // Default case
    return replacementString.parseTree
  }

  /**
   * Splice a "HED" column value string in place of a column template.
   *
   * @returns {ParsedHedSubstring[]} The spliced column substitution.
   * @private
   */
  _spliceHedColumnTemplate() {
    const columnName = 'HED'
    const replacementString = this.columnValues.get(columnName)
    const blankHedColumnValues = new Set([undefined, null, 'n/a', ''])
    if (blankHedColumnValues.has(replacementString)) {
      return null
    }

    return this._reparseAndSpliceString(replacementString)
  }

  /**
   * Splice a value-taking replacement string in place of a column template.
   *
   * @param {ParsedHedColumnSplice} columnTemplate The parsed HED column splice template in which to make the column splice.
   * @returns {ParsedHedSubstring[]} The spliced column substitution.
   * @private
   */
  _spliceValueTemplate(columnTemplate) {
    const columnName = columnTemplate.originalTag
    const replacementString = this.columnReplacements.get(columnName)
    const replacedString = replacementString.hedString.replace('#', this.columnValues.get(columnName))
    return this._reparseAndSpliceString(replacedString)
  }

  /**
   * Re-parse a string to use in splicing.
   *
   * @param {string} replacementString A new string to parse.
   * @returns {ParsedHedSubstring[]} The new string's parse tree.
   * @private
   */
  _reparseAndSpliceString(replacementString) {
    const [newParsedString, parsingIssues] = parseHedString(replacementString, this.hedSchemas, true, false, false)
    if (parsingIssues.length > 0) {
      this.issues.push(...parsingIssues)
      return []
    }
    return newParsedString.parseTree
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
    return new ParsedHedGroup(newData, this.parsedString.hedString, group.originalBounds)
  }
}

export default ColumnSplicer
