/** This module holds the class representing a parsed HED tag.
 * @module parser/parsedHedTag
 */
import { IssueError } from '../issues/issues'
import ParsedHedSubstring from './parsedHedSubstring'
import { SchemaValueTag } from '../schema/entries'
import TagConverter from './tagConverter'
import { ReservedChecker } from './reservedChecker'

const TWO_LEVEL_TAGS = new Set(['Definition', 'Def', 'Def-expand'])
const allowedRegEx = /^[^{},]*$/

/**
 * A parsed HED tag.
 */
export default class ParsedHedTag extends ParsedHedSubstring {
  /**
   * The formatted canonical version of the HED tag.
   * @type {string}
   */
  formattedTag

  /**
   * The canonical form of the HED tag.
   * @type {string}
   */
  canonicalTag

  /**
   * The HED schema this tag belongs to.
   * @type {Schema}
   */

  schema
  /**
   * The schema's representation of this tag.
   *
   * @type {SchemaTag}
   * @private
   */

  _schemaTag

  /**
   * The remaining part of the tag after the portion actually in the schema.
   * @type {string}
   * @private
   */
  _remainder

  /**
   * The value of the tag, if any.
   * @type {string}
   * @private
   */
  _value

  /**
   * If definition, this is the second value, otherwise empty string.
   * @type {string}
   * @private
   */
  _splitValue

  /**
   * The units if any.
   * @type {string}
   * @private
   */
  _units

  /**
   * Constructor.
   *
   * @param {TagSpec} tagSpec The token for this tag.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   * @param {string} hedString The original HED string.
   * @throws {IssueError} If tag conversion or parsing fails.
   */
  constructor(tagSpec, hedSchemas, hedString) {
    super(tagSpec.tag, tagSpec.bounds) // Sets originalTag and originalBounds
    this._convertTag(hedSchemas, hedString, tagSpec)
    this._normalized = this.format(false) // Sets various forms of the tag.
  }

  /**
   * Convert this tag to its various forms
   *
   * @param {Schemas} hedSchemas The collection of HED schemas.
   * @param {string} hedString The original HED string.
   * @param {TagSpec} tagSpec The token for this tag.
   * @throws {IssueError} If tag conversion or parsing fails.
   */
  _convertTag(hedSchemas, hedString, tagSpec) {
    const schemaName = tagSpec.library
    this.schema = hedSchemas.getSchema(schemaName)
    if (this.schema === undefined) {
      if (schemaName !== '') {
        IssueError.generateAndThrow('unmatchedLibrarySchema', {
          tag: this.originalTag,
          library: schemaName,
        })
      } else {
        IssueError.generateAndThrow('unmatchedBaseSchema', {
          tag: this.originalTag,
        })
      }
    }

    const [schemaTag, remainder] = new TagConverter(tagSpec, hedSchemas).convert()
    this._schemaTag = schemaTag
    this._remainder = remainder
    this.canonicalTag = this._schemaTag.longExtend(remainder)
    this.formattedTag = this.canonicalTag.toLowerCase()
    this._handleRemainder(schemaTag, remainder)
  }

  /**
   * Handle the remainder portion for value tag (converter handles others).
   *
   * @param {SchemaTag} schemaTag - The part of the tag that is in the schema.
   * @param {string} remainder - the leftover part.
   * @throws {IssueError} If parsing the remainder section fails.
   * @private
   */
  _handleRemainder(schemaTag, remainder) {
    if (!(schemaTag instanceof SchemaValueTag)) {
      return
    }
    // Check that there is a value if required
    const reserved = ReservedChecker.getInstance()
    if ((schemaTag.hasAttribute('requireChild') || reserved.requireValueTags.has(schemaTag.name)) && remainder === '') {
      IssueError.generateAndThrow('valueRequired', { tag: this.originalTag })
    }
    // Check if this could have a two-level value
    const [value, rest] = this._getSplitValue(remainder)
    this._splitValue = rest

    // Resolve the units and check
    const [actualUnit, actualUnitString, actualValueString] = this._separateUnits(schemaTag, value)
    this._units = actualUnitString
    this._value = actualValueString

    if (actualUnit === null && actualUnitString !== null) {
      IssueError.generateAndThrow('unitClassInvalidUnit', { tag: this.originalTag })
    }
    const valueErrorMsg = this.checkValue(actualValueString)
    if (valueErrorMsg !== '') {
      IssueError.generateAndThrow('invalidValue', { tag: this.originalTag, msg: valueErrorMsg })
    }
  }

  /**
   * Separate the remainder of the tag into three parts.
   *
   * @param {SchemaTag} schemaTag - The part of the tag that is in the schema.
   * @param {string} remainder - The leftover part.
   * @returns {Array} - [SchemaUnit, string, string] representing the actual Unit, the unit string and the value string.
   * @throws {IssueError} - If parsing the remainder section fails.
   */
  _separateUnits(schemaTag, remainder) {
    const unitClasses = schemaTag.unitClasses
    let actualUnit = null
    let actualUnitString = null
    let actualValueString = remainder // If no unit class, the remainder is the value
    for (const unitClass of unitClasses) {
      ;[actualUnit, actualUnitString, actualValueString] = unitClass.extractUnit(remainder)
      if (actualUnit !== null) {
        break // found the unit
      }
    }
    return [actualUnit, actualUnitString, actualValueString]
  }

  /**
   * Handle reserved three-level tags.
   * @param {string} remainder - The remainder of the tag string after schema tag.
   */
  _getSplitValue(remainder) {
    if (!TWO_LEVEL_TAGS.has(this.schemaTag.name)) {
      return [remainder, null]
    }
    const [first, ...rest] = remainder.split('/')
    return [first, rest.join('/')]
  }

  /**
   * Nicely format this tag.
   *
   * @param {boolean} long - Whether the tags should be in long form.
   * @returns {string} - The nicely formatted version of this tag.
   */
  format(long = true) {
    let tagName
    if (long) {
      tagName = this._schemaTag?.longExtend(this._remainder)
    } else {
      tagName = this._schemaTag?.extend(this._remainder)
    }
    if (tagName === undefined) {
      tagName = this.originalTag
    }
    if (this.schema?.prefix) {
      return this.schema.prefix + ':' + tagName
    } else {
      return tagName
    }
  }

  /**
   * Return the normalized version of this tag.
   * @returns {string} - The normalized version of this tag.
   */
  get normalized() {
    return this._normalized
  }

  /**
   * Override of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString | Object.prototype.toString}.
   *
   * @returns {string} The original form of this HED tag.
   */
  toString() {
    if (this.schema?.prefix) {
      return this.schema.prefix + ':' + this.originalTag
    } else {
      return this.originalTag
    }
  }

  /**
   * Determine whether this tag has a given attribute.
   *
   * @param {string} attribute An attribute name.
   * @returns {boolean} Whether this tag has the named attribute.
   */
  hasAttribute(attribute) {
    return this.schemaTag.hasAttribute(attribute)
  }

  /**
   * Determine if this HED tag is equivalent to another HED tag.
   *
   * Note: HED tags are deemed equivalent if they have the same schema and normalized tag string.
   *
   * @param {ParsedHedTag} other A HED tag to compare with this one.
   * @returns {boolean} Whether the other tag is equivalent to this HED tag.
   */
  equivalent(other) {
    return other instanceof ParsedHedTag && this.formattedTag === other.formattedTag && this.schema === other.schema
  }

  /**
   * Get the schema tag object for this tag.
   *
   * @returns {SchemaTag} The schema tag object for this tag.
   */
  get schemaTag() {
    if (this._schemaTag instanceof SchemaValueTag) {
      return this._schemaTag.parent
    } else {
      return this._schemaTag
    }
  }

  /**
   * Indicates whether the tag is deprecated
   * @returns {boolean}
   */
  get isDeprecated() {
    return this.schemaTag.hasAttribute('deprecatedFrom')
  }

  /**
   * Indicates whether the tag is deprecated
   * @returns {boolean}
   */
  get isExtended() {
    return !this.takesValueTag && this._remainder !== ''
  }

  /**
   * Get the schema tag object for this tag's value-taking form.
   *
   * @returns {SchemaValueTag} The schema tag object for this tag's value-taking form.
   */
  get takesValueTag() {
    if (this._schemaTag instanceof SchemaValueTag) {
      return this._schemaTag
    }
    return undefined
  }

  /**
   * Checks if this HED tag has the `takesValue` attribute.
   *
   * @returns {boolean} Whether this HED tag has the `takesValue` attribute.
   */
  takesValue() {
    return this.takesValueTag !== undefined
  }

  /**
   * Checks if this HED tag has the `unitClass` attribute.
   *
   * @returns {boolean} Whether this HED tag has the `unitClass` attribute.
   */
  isUnitClass() {
    return this.hasAttribute('unitClass')
  }

  /**
   * Get the unit classes for this HED tag.
   *
   * @returns {SchemaUnitClass[]} The unit classes for this HED tag.
   */
  get unitClasses() {
    if (this.hasUnitClass) {
      return this.takesValueTag.unitClasses
    }
    return []
  }

  /**
   * Check if value is a valid value for this tag.
   *
   * @param {string} value - The value to be checked.
   * @returns {string} An empty string if value is value, otherwise an indication of failure.
   */
  checkValue(value) {
    if (!this.takesValue) {
      return `Tag "${this.schemaTag.name}" does not take a value but has value "${value}"`
    }
    if (value === '#') {
      // Placeholders work
      return ''
    }
    const valueAttributeNames = this._schemaTag.valueAttributeNames
    const valueClassNames = valueAttributeNames?.get('valueClass')
    if (!valueClassNames) {
      // No specified value classes
      const allowed = allowedRegEx.test(value)
      if (allowed) {
        return ''
      }
      return `Tag "${this.schemaTag.name}" has a value containing either curly braces or a comma, which is not allowed for tags without specific value class properties.`
    }
    const entryManager = this.schema.entries.valueClasses
    if (valueClassNames.some((valueClassName) => entryManager.getEntry(valueClassName).validateValue(value))) {
      return ''
    }
    return `Tag "${this.schemaTag.name}" has value classes [${valueClassNames.join(', ')}] but its value "${value}" is not in any of them.`
  }
}
