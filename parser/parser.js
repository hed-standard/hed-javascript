import { mergeParsingIssues } from '../utils/hedData'
import { generateIssue } from '../common/issues/issues'
import ParsedHedString from './parsedHedString'
import HedStringSplitter from './splitHedString'
import { getCharacterCount, stringIsEmpty } from '../utils/string'

const openingGroupCharacter = '('
const closingGroupCharacter = ')'
const delimiters = new Set([','])

/**
 * A parser for HED strings.
 */
class HedStringParser {
  /**
   * The HED string being parsed.
   * @type {string|ParsedHedString}
   */
  hedString
  /**
   * The collection of HED schemas.
   * @type {Schemas}
   */
  hedSchemas

  /**
   * Constructor.
   *
   * @param {string|ParsedHedString} hedString The HED string to be parsed.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   */
  constructor(hedString, hedSchemas) {
    this.hedString = hedString
    this.hedSchemas = hedSchemas
  }

  /**
   * Check if the parentheses in a tag group match.
   *
   * @returns {Issue[]} Any issues found related to unmatched parentheses.
   */
  _countTagGroupParentheses() {
    const issues = []
    const numberOfOpeningParentheses = getCharacterCount(this.hedString, openingGroupCharacter)
    const numberOfClosingParentheses = getCharacterCount(this.hedString, closingGroupCharacter)

    if (numberOfOpeningParentheses !== numberOfClosingParentheses) {
      issues.push(
        generateIssue('parentheses', {
          opening: numberOfOpeningParentheses,
          closing: numberOfClosingParentheses,
        }),
      )
    }

    return issues
  }

  /**
   * Check if a comma is missing after an opening parenthesis.
   *
   * @param {string} lastNonEmptyCharacter The last non-empty character.
   * @param {string} currentCharacter The current character in the HED string.
   * @returns {boolean} Whether a comma is missing after a closing parenthesis.
   */
  _isCommaMissingAfterClosingParenthesis(lastNonEmptyCharacter, currentCharacter) {
    return (
      lastNonEmptyCharacter === closingGroupCharacter &&
      !(delimiters.has(currentCharacter) || currentCharacter === closingGroupCharacter)
    )
  }

  /**
   * Find delimiter-related issues in a HED string.
   *
   * @returns {Issue[]} Any issues related to delimiters.
   */
  _findDelimiterIssues() {
    const issues = []
    let lastNonEmptyValidCharacter = ''
    let lastNonEmptyValidIndex = 0
    let currentTag = ''

    for (let i = 0; i < this.hedString.length; i++) {
      const currentCharacter = this.hedString.charAt(i)
      currentTag += currentCharacter

      if (stringIsEmpty(currentCharacter)) {
        continue
      }

      if (delimiters.has(currentCharacter)) {
        if (currentTag.trim() === currentCharacter) {
          issues.push(
            generateIssue('extraDelimiter', {
              character: currentCharacter,
              index: i,
              string: this.hedString,
            }),
          )
          currentTag = ''
          continue
        }
        currentTag = ''
      } else if (currentCharacter === openingGroupCharacter) {
        if (currentTag.trim() !== openingGroupCharacter) {
          issues.push(generateIssue('commaMissing', { tag: currentTag }))
        }
        currentTag = ''
      } else if (this._isCommaMissingAfterClosingParenthesis(lastNonEmptyValidCharacter, currentCharacter)) {
        issues.push(
          generateIssue('commaMissing', {
            tag: currentTag.slice(0, -1),
          }),
        )
        break
      }

      lastNonEmptyValidCharacter = currentCharacter
      lastNonEmptyValidIndex = i
    }

    if (delimiters.has(lastNonEmptyValidCharacter)) {
      issues.push(
        generateIssue('extraDelimiter', {
          character: lastNonEmptyValidCharacter,
          index: lastNonEmptyValidIndex,
          string: this.hedString,
        }),
      )
    }

    return issues
  }

  /**
   * Validate the full unparsed HED string.
   *
   * @returns {Object<string, Issue[]>} Any issues found during validation.
   */
  _validateFullUnparsedHedString() {
    const delimiterIssues = [].concat(this._countTagGroupParentheses(), this._findDelimiterIssues())

    return { delimiter: delimiterIssues }
  }

  /**
   * Parse a full HED string.
   *
   * @returns {[ParsedHedString|null, Object<string, Issue[]>]} The parsed HED string and any parsing issues.
   */
  parseHedString() {
    if (this.hedString instanceof ParsedHedString) {
      return [this.hedString, {}]
    }

    const fullStringIssues = this._validateFullUnparsedHedString()
    if (fullStringIssues.delimiter.length > 0) {
      fullStringIssues.syntax = []
      return [null, fullStringIssues]
    }

    const [parsedTags, splitIssues] = new HedStringSplitter(this.hedString, this.hedSchemas).splitHedString()
    const parsingIssues = Object.assign(fullStringIssues, splitIssues)
    if (parsedTags === null) {
      return [null, parsingIssues]
    }

    const parsedString = new ParsedHedString(this.hedString, parsedTags)
    return [parsedString, parsingIssues]
  }

  /**
   * Parse a list of HED strings.
   *
   * @param {string[]|ParsedHedString[]} hedStrings A list of HED strings.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   * @returns {[ParsedHedString[], Object<string, Issue[]>]} The parsed HED strings and any issues found.
   */
  static parseHedStrings(hedStrings, hedSchemas) {
    const parsedStrings = []
    const cumulativeIssues = {}

    for (const hedString of hedStrings) {
      const [parsedString, currentIssues] = new HedStringParser(hedString, hedSchemas).parseHedString()
      parsedStrings.push(parsedString)
      mergeParsingIssues(cumulativeIssues, currentIssues)
    }

    return [parsedStrings, cumulativeIssues]
  }
}

/**
 * Parse a HED string.
 *
 * @param {string|ParsedHedString} hedString A (possibly already parsed) HED string.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @returns {[ParsedHedString, Object<string, Issue[]>]} The parsed HED string and any issues found.
 */
export function parseHedString(hedString, hedSchemas) {
  return new HedStringParser(hedString, hedSchemas).parseHedString()
}

/**
 * Parse a list of HED strings.
 *
 * @param {string[]|ParsedHedString[]} hedStrings A list of HED strings.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @returns {[ParsedHedString[], Object<string, Issue[]>]} The parsed HED strings and any issues found.
 */
export function parseHedStrings(hedStrings, hedSchemas) {
  return HedStringParser.parseHedStrings(hedStrings, hedSchemas)
}
