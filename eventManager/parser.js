import { mergeParsingIssues } from '../utils/hedData'
import ParsedHedString from './parsedHedString'
import HedStringSplitter from './splitter'
import { generateIssue } from '../common/issues/issues'
import { SpecialChecker } from './special'
import { getTagListString } from './parseUtils'

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

  definitionsAllowed

  placeholdersAllowed

  /**
   * Constructor.
   *
   * @param {string|ParsedHedString} hedString The HED string to be parsed.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   * @param {boolean} definitionsAllowed - True if definitions are allowed
   * @param {boolean} placeholdersAllowed - True if placeholders are allowed
   */
  constructor(hedString, hedSchemas, definitionsAllowed, placeholdersAllowed) {
    this.hedString = hedString
    this.hedSchemas = hedSchemas
    this.definitionsAllowed = definitionsAllowed
    this.placeholdersAllowed = placeholdersAllowed
  }

  /**
   * Parse a full HED string.
   * @param {boolean} fullCheck whether the string is in final form and can be fully parsed

   * @returns {[ParsedHedString|null, Issue[]]} The parsed HED string and any parsing issues.
   */
  parseHedString(fullCheck) {
    if (this.hedString === null || this.hedString === undefined) {
      return [null, [generateIssue('invalidTagString', {})]]
    }
    // if (!this.hedString) {
    //   return [null, []]
    // }
    const placeholderIssues = this._getPlaceholderCountIssues()
    if (placeholderIssues.length > 0) {
      return [null, placeholderIssues]
    }
    if (this.hedString instanceof ParsedHedString) {
      return [this.hedString, []]
    }
    if (!this.hedSchemas) {
      return [null, [generateIssue('missingSchemaSpecification', {})]]
    }

    // This assumes that splitter errors are only errors and not warnings
    const [parsedTags, parsingIssues] = new HedStringSplitter(this.hedString, this.hedSchemas).splitHedString()
    if (parsedTags === null || parsingIssues.length > 0) {
      return [null, parsingIssues]
    }

    const parsedString = new ParsedHedString(this.hedString, parsedTags)

    // This checks whether there are any definitions in the string
    const simpleDefinitionIssues = this._checkDefinitionContext(parsedString)
    if (simpleDefinitionIssues.length > 0) {
      return [null, simpleDefinitionIssues]
    }
    const checkIssues = SpecialChecker.getInstance().checkHedString(parsedString, fullCheck)
    if (checkIssues.length > 0) {
      return [null, checkIssues]
    }
    return [parsedString, []]
  }

  _checkDefinitionContext(parsedString) {
    if (this.definitionsAllowed || !parsedString) {
      return []
    }
    const definitionTags = parsedString.tags.filter((tag) => tag.schemaTag.name === 'Definition')
    if (definitionTags.length > 0) {
      return [
        generateIssue('illegalDefinitionContext', {
          definition: getTagListString(definitionTags),
          string: parsedString.hedString,
        }),
      ]
    }
    return []
  }

  _getPlaceholderCountIssues() {
    if (this.placeholdersAllowed) {
      return []
    }
    const checkString = this.hedString instanceof ParsedHedString ? this.hedString.hedString : this.hedString
    if (checkString.split('#').length > 1) {
      return [generateIssue('invalidPlaceholderContext', { string: checkString })]
    }
    return []
  }

  /**
   * Parse a list of HED strings.
   *
   * @param {string[]|ParsedHedString[]} hedStrings A list of HED strings.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   * @param {boolean} fullCheck whether the strings are in final form and can be fully parsed
   * @param {boolean} definitionsAllowed - True if definitions are allowed
   * @param {boolean} placeholdersAllowed - True if placeholders are allowed
   * @returns {[ParsedHedString[], Issue[]]} The parsed HED strings and any issues found.
   */
  static parseHedStrings(hedStrings, hedSchemas, fullCheck, definitionsAllowed, placeholdersAllowed) {
    if (!hedSchemas) {
      return [null, [generateIssue('missingSchemaSpecification', {})]]
    }
    const parsedStrings = []
    const cumulativeIssues = []
    for (const hedString of hedStrings) {
      const [parsedString, currentIssues] = new HedStringParser(
        hedString,
        hedSchemas,
        definitionsAllowed,
        placeholdersAllowed,
      ).parseHedString(fullCheck)
      parsedStrings.push(parsedString)
      cumulativeIssues.push(...currentIssues)
    }

    return [parsedStrings, cumulativeIssues]
  }
}

/**
 * Parse a HED string.
 *
 * @param {string|ParsedHedString} hedString A (possibly already parsed) HED string.
 * @param {Schemas} hedSchemas - The collection of HED schemas.
 * @param {boolean} fullCheck - If the string is in final form -- can be fully parsed
 * @param {boolean} definitionsAllowed - True if definitions are allowed
 * @param {boolean} placeholdersAllowed - True if placeholders are allowed
 * @returns {[ParsedHedString, Issue[]]} - The parsed HED string and any issues found.
 */
export function parseHedString(hedString, hedSchemas, fullCheck, definitionsAllowed, placeholdersAllowed) {
  return new HedStringParser(hedString, hedSchemas, definitionsAllowed, placeholdersAllowed).parseHedString(fullCheck)
}

/**
 * Parse a list of HED strings.
 *
 * @param {string[]|ParsedHedString[]} hedStrings A list of HED strings.
 * @param {Schemas} hedSchemas - The collection of HED schemas.
 * @param {boolean} fullCheck - If the strings is in final form -- can be fully parsed
 * @param {boolean} definitionsAllowed - True if definitions are allowed
 * @param {boolean} placeholdersAllowed - True if placeholders are allowed
 * @returns {[ParsedHedString[], Issue[]]} The parsed HED strings and any issues found.
 */
export function parseHedStrings(hedStrings, hedSchemas, fullCheck, definitionsAllowed, placeholdersAllowed) {
  return HedStringParser.parseHedStrings(hedStrings, hedSchemas, fullCheck, definitionsAllowed, placeholdersAllowed)
}
