import { mergeParsingIssues } from '../utils/hedData'
import ParsedHedString from './parsedHedString'
import HedStringSplitter from './splitter'
import { generateIssue } from '../common/issues/issues'
import { SpecialChecker } from './special'

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
   * @param {boolean} fullCheck whether the string is in final form and can be fully parsed
   * @param {boolean} definitionsAllowed - True if definitions are allowed
   * @returns {[ParsedHedString|null, Issue[]]} The parsed HED string and any parsing issues.
   */
  parseHedString(fullCheck, definitionsAllowed) {
    if (this.hedString instanceof ParsedHedString) {
      return [this.hedString, []]
    }
    if (!this.hedSchemas) {
      return [null, [generateIssue('missingSchemaSpecification', {})]]
    }

    const [parsedTags, parsingIssues] = new HedStringSplitter(this.hedString, this.hedSchemas).splitHedString()
    if (parsedTags === null) {
      return [null, parsingIssues]
    }
    const parsedString = new ParsedHedString(this.hedString, parsedTags)
    const checkIssues = SpecialChecker.getInstance().checkHedString(parsedString, fullCheck, definitionsAllowed)
    mergeParsingIssues(parsingIssues, checkIssues)
    if (checkIssues.length > 0) {
      return [null, parsingIssues]
    }
    //mergeParsingIssues(parsingIssues, {syntax: checkIssues})
    return [parsedString, parsingIssues]
  }

  /**
   * Parse a list of HED strings.
   *
   * @param {string[]|ParsedHedString[]} hedStrings A list of HED strings.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   * @param {boolean} fullCheck whether the strings are in final form and can be fully parsed
   * @param {boolean} definitionsAllowed - True if definitions are allowed
   * @returns {[ParsedHedString[], Issue[]]} The parsed HED strings and any issues found.
   */
  static parseHedStrings(hedStrings, hedSchemas, fullCheck) {
    if (!hedSchemas) {
      return [null, [generateIssue('missingSchemaSpecification', {})]]
    }
    const parsedStrings = []
    const cumulativeIssues = {}
    for (const hedString of hedStrings) {
      const [parsedString, currentIssues] = new HedStringParser(hedString, hedSchemas).parseHedString(fullCheck, false)
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
 * @param {boolean} fullCheck If the string is in final form -- can be fully parsed
 * @param {boolean} definitionsAllowed - True if definitions are allowed
 * @returns {[ParsedHedString, Issue[]]} The parsed HED string and any issues found.
 */
export function parseHedString(hedString, hedSchemas, fullCheck, definitionsAllowed) {
  return new HedStringParser(hedString, hedSchemas).parseHedString(fullCheck, definitionsAllowed)
}

/**
 * Parse a list of HED strings.
 *
 * @param {string[]|ParsedHedString[]} hedStrings A list of HED strings.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @param {boolean} fullCheck If the strings is in final form -- can be fully parsed
 * @returns {[ParsedHedString[], Issue[]]} The parsed HED strings and any issues found.
 */
export function parseHedStrings(hedStrings, hedSchemas, fullCheck) {
  return HedStringParser.parseHedStrings(hedStrings, hedSchemas, fullCheck, false)
}
