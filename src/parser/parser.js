/** This module holds contains the classes for basic HED parsing.
 * @module parser/parser
 */
import ParsedHedString from './parsedHedString'
import HedStringSplitter from './splitter'
import { generateIssue } from '../issues/issues'
import { ReservedChecker } from './reservedChecker'
import { DefinitionChecker } from './definitionChecker'

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
   * True if definitions are allowed in this string.
   * @type {boolean}
   */
  definitionsAllowed

  /**
   * True if placeholders are allowed in this string.
   * @type {boolean}
   */
  placeholdersAllowed

  /**
   * Constructor.
   *
   * @param {string|ParsedHedString} hedString - The HED string to be parsed.
   * @param {Schemas} hedSchemas - The collection of HED schemas.
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
   *
   * @param {boolean} fullValidation - True if full validation should be performed -- with assemply
   * ###Note: now separates errors and warnings for easier handling.
   *
   * @returns {Array} - [ParsedHedString|null, Issue[], Issue[]] representing the parsed HED string and any parsing issues.
   */
  parse(fullValidation) {
    if (this.hedString === null || this.hedString === undefined) {
      return [null, [generateIssue('invalidTagString', {})], []]
    }

    const placeholderIssues = this._getPlaceholderCountIssues()
    if (placeholderIssues.length > 0) {
      return [null, placeholderIssues, []]
    }
    if (this.hedString instanceof ParsedHedString) {
      return [this.hedString, [], []]
    }
    if (!this.hedSchemas) {
      return [null, [generateIssue('missingSchemaSpecification', {})], []]
    }

    // This assumes that splitter errors are only errors and not warnings
    const [parsedTags, parsingIssues] = new HedStringSplitter(this.hedString, this.hedSchemas).splitHedString()
    if (parsedTags === null || parsingIssues.length > 0) {
      return [null, parsingIssues, []]
    }

    // Returns a parsed HED string unless empty
    const parsedString = new ParsedHedString(this.hedString, parsedTags)
    if (!parsedString) {
      return [null, null, []]
    }

    // Check the definition syntax issues
    const definitionIssues = new DefinitionChecker(parsedString).check(this.definitionsAllowed)
    if (definitionIssues.length > 0) {
      return [null, definitionIssues, []]
    }

    // Check the other reserved tags requirements
    const checkIssues = ReservedChecker.getInstance().checkHedString(parsedString, fullValidation)
    if (checkIssues.length > 0) {
      return [null, checkIssues, []]
    }

    // Warnings are only checked when there are no fatal errors
    return [parsedString, [], this._getWarnings(parsedString)]
  }

  /**
   * Parse a full HED string in a standalone context, such as in the HED column of a BIDS tabular file.
   *
   * @param {DefinitionManager | null} defManager - The definition manager to use for parsing definitions.
   * @returns {Array} - [ParsedHedString|null, Issue[], Issue[]] representing the parsed HED string and any parsing issues.
   */
  parseStandalone(defManager = null) {
    // Find basic parsing issues and return if unable to parse the string. (Warnings are okay.)
    const [parsedString, errorIssues, warningIssues] = this.parse(true)

    if (parsedString !== null && parsedString.columnSplices.length > 0) {
      errorIssues.push(generateIssue('curlyBracesInHedColumn', { string: parsedString.hedString }))
    }
    if (errorIssues.length === 0 && parsedString && defManager) {
      errorIssues.push(...defManager.validateDefs(parsedString, this.hedSchemas, false))
      errorIssues.push(...defManager.validateDefExpands(parsedString, this.hedSchemas, false))
    }
    if (errorIssues.length > 0) {
      return [null, errorIssues, warningIssues]
    }
    return [parsedString, errorIssues, warningIssues]
  }

  /**
   * Get warnings applicable for a parsed HED string.
   * @param {ParsedHedString} parsedString - HED string object to check for warnings.
   * @returns {Issue[]} - Warnings for the parsed HED string
   * @private
   */
  _getWarnings(parsedString) {
    const warnings = []
    // Check for deprecated
    const deprecatedTags = parsedString.tags.filter((tag) => tag.isDeprecated === true)
    if (deprecatedTags.length > 0) {
      const deprecated = deprecatedTags.map((tag) => tag.toString())
      warnings.push(
        generateIssue('deprecatedTag', { tags: '[' + deprecated.join(', ') + ']', string: parsedString.hedString }),
      )
    }
    // Check for tag extensions
    const extendedTags = parsedString.tags.filter((tag) => tag.isExtended === true)
    if (extendedTags.length > 0) {
      const extended = extendedTags.map((tag) => tag.toString())
      warnings.push(
        generateIssue('extendedTag', { tags: '[' + extended.join(', ') + ']', string: parsedString.hedString }),
      )
    }
    return warnings
  }

  /**
   * If placeholders are not allowed and the string has placeholders, return an issue.
   * @returns {Issue[]} = Issues due to unwanted placeholders.
   * @private
   */
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
   * @param {boolean} definitionsAllowed - True if definitions are allowed
   * @param {boolean} placeholdersAllowed - True if placeholders are allowed
   * @returns {Array} - [ParsedHedString[], Issue[], Issue[]] representing the parsed HED strings and any errors and warnings.
   */
  static parseHedStrings(hedStrings, hedSchemas, definitionsAllowed, placeholdersAllowed) {
    if (!hedSchemas) {
      return [null, [generateIssue('missingSchemaSpecification', {})], []]
    }
    const parsedStrings = []
    const errors = []
    const warnings = []
    for (const hedString of hedStrings) {
      const [parsedString, errorIssues, warningIssues] = new HedStringParser(
        hedString,
        hedSchemas,
        definitionsAllowed,
        placeholdersAllowed,
      ).parse()
      parsedStrings.push(parsedString)
      errors.push(...errorIssues)
      warnings.push(...warningIssues)
    }

    return [parsedStrings, errors, warnings]
  }
}

/**
 * Parse a HED string.
 *
 * ###Note: now separates errors and warnings for easier handling.
 *
 * @param {string|ParsedHedString} hedString A (possibly already parsed) HED string.
 * @param {Schemas} hedSchemas - The collection of HED schemas.
 * @param {boolean} definitionsAllowed - True if definitions are allowed.
 * @param {boolean} placeholdersAllowed - True if placeholders are allowed.
 * @param {boolean} fullValidation - True if full validation is required.
 * @returns {Array} - [ParsedHedString, Issue[], Issue[]] representing the parsed HED string and any issues found.
 */
export function parseHedString(hedString, hedSchemas, definitionsAllowed, placeholdersAllowed, fullValidation) {
  return new HedStringParser(hedString, hedSchemas, definitionsAllowed, placeholdersAllowed).parse(fullValidation)
}

/**
 * Parse a HED string in a standalone context.
 *
 * @param {string|ParsedHedString} hedString - A (possibly already parsed) HED string.
 * @param {Schemas} hedSchemas - The collection of HED schemas.
 * @param {DefinitionManager|null} defManager - The definition manager to use for parsing definitions.
 * @returns {Array} - [ParsedHedString, Issue[], Issue[]] representing the parsed HED string and any issues found.
 */
export function parseStandaloneString(hedString, hedSchemas, defManager = null) {
  return new HedStringParser(hedString, hedSchemas, false, false).parseStandalone(defManager)
}

/**
 * Parse a list of HED strings.
 *
 * ###Note: now separates errors and warnings for easier handling.
 *
 * @param {string[]|ParsedHedString[]} hedStrings - A list of HED strings.
 * @param {Schemas} hedSchemas - The collection of HED schemas.
 * @param {boolean} definitionsAllowed - True if definitions are allowed
 * @param {boolean} placeholdersAllowed - True if placeholders are allowed
 * @param {boolean} fullValidation - True if full validation is required.
 * @returns {Array} - [ParsedHedString[], Issue[], Issue[]] representing the parsed HED strings and any issues found.
 */
export function parseHedStrings(hedStrings, hedSchemas, definitionsAllowed, placeholdersAllowed, fullValidation) {
  return HedStringParser.parseHedStrings(
    hedStrings,
    hedSchemas,
    definitionsAllowed,
    placeholdersAllowed,
    fullValidation,
  )
}
