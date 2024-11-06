import { mergeParsingIssues } from '../utils/hedData'
import ParsedHedString from './parsedHedString'
import HedStringSplitter from './splitter'

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
   * Parse a full HED string.
   *
   * @returns {[ParsedHedString|null, Object<string, Issue[]>]} The parsed HED string and any parsing issues.
   */
  parseHedString() {
    if (this.hedString instanceof ParsedHedString) {
      return [this.hedString, {}]
    }

    const [parsedTags, parsingIssues] = new HedStringSplitter(this.hedString, this.hedSchemas).splitHedString()
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
