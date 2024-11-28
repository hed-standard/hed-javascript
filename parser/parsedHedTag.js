import { IssueError } from '../common/issues/issues'
import { getTagLevels } from '../utils/hedStrings'
import ParsedHedSubstring from './parsedHedSubstring'
import { SchemaValueTag } from '../schema/entries'
import TagConverter from './tagConverter'
import { SpecialChecker } from './special'

const allowedRegEx = /^[^{}\,]*$/

//TODO This is temporary until special tag handling is available.
const threeLevelTags = ['Definition', 'Def', 'Def-expand']
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
   * The extension part if it has an extension rather than a value
   *
   * @type {string}
   * @private
   */
  _extension

  /**
   * The remaining part of the tag after the portion actually in the schema.
   *
   * @type {string}
   * @private
   */
  _remainder

  /**
   * The value if any
   *
   * @type {string}
   * @private
   */
  _value

  /**
   * If definition
   *
   * @type {Array}
   * @private
   */
  _splitValue

  /**
   * The units if any
   *
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
    this._convertTag(hedSchemas, hedString, tagSpec) // Sets various forms of the tag.
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
   * Handle the remainder portion
   *
   * @throws {IssueError} If parsing the remainder section fails.
   */
  _handleRemainder(schemaTag, remainder) {
    if (remainder === '' || !(schemaTag instanceof SchemaValueTag)) {
      this._extension = remainder
      return
    }
    if (threeLevelTags.includes(this.schemaTag.name)) {
      this._handleSpecial(remainder)
      return
    }
    this._splitValue = null

    const [actualUnit, actualUnitString, actualValueString] = this._separateUnits(schemaTag, remainder)
    this._units = actualUnit
    this._value = actualValueString

    if (actualUnit === null && actualUnitString !== null) {
      IssueError.generateAndThrow('unitClassInvalidUnit', { tag: this.originalTag })
    }
    if (!this.checkValue(actualValueString)) {
      IssueError.generateAndThrow('invalidValue', { tag: this.originalTag })
    }
  }

  _separateUnits(schemaTag, remainder) {
    const unitClasses = schemaTag.unitClasses
    let actualUnit = null
    let actualUnitString = null
    let actualValueString = remainder // If no unit class, the remainder is the value
    for (let i = 0; i < unitClasses.length; i++) {
      ;[actualUnit, actualUnitString, actualValueString] = unitClasses[i].extractUnit(remainder)
      if (actualUnit !== null) {
        break // found the unit
      }
    }
    return [actualUnit, actualUnitString, actualValueString]
  }

  // TODO:  Fix this
  /**
   * Handle special -- handles special three-level tags
   */
  _handleSpecial(remainder) {
    const splitValue = remainder.split('/', 2)
    const entryManager = this.schema.entries.valueClasses
    if (entryManager.getEntry('nameClass').validateValue(splitValue[0])) {
      this._splitValue = splitValue
    } else {
      IssueError.generateAndThrow('invalidValue', { tag: this.originalTag })
    }
  }

  /**
   * Nicely format this tag.
   *
   * @param {boolean} long Whether the tags should be in long form.
   * @returns {string} The nicely formatted version of this tag.
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
   * Override of {@link Object.prototype.toString}.
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
    return this.schema?.tagHasAttribute(this.formattedTag, attribute)
  }

  /**
   * Determine whether this tag's parent tag has a given attribute.
   *
   * @param {string} attribute An attribute name.
   * @returns {boolean} Whether this tag's parent tag has the named attribute.
   */
  parentHasAttribute(attribute) {
    return this.schema?.tagHasAttribute(this.parentFormattedTag, attribute)
  }

  /**
   * Get the last part of a HED tag.
   *
   * @param {string} tagString A HED tag.
   * @returns {string} The last part of the tag using the given separator.
   */
  static getTagName(tagString) {
    const lastSlashIndex = tagString.lastIndexOf('/')
    if (lastSlashIndex === -1) {
      return tagString
    } else {
      return tagString.substring(lastSlashIndex + 1)
    }
  }

  /**
   * The trailing portion of {@link canonicalTag}.
   *
   * @returns {string} The "name" portion of the canonical tag.
   */
  get canonicalTagName() {
    return this._memoize('canonicalTagName', () => {
      return ParsedHedTag.getTagName(this.canonicalTag)
    })
  }

  /**
   * The trailing portion of {@link formattedTag}.
   *
   * @returns {string} The "name" portion of the formatted tag.
   */
  get formattedTagName() {
    return this._memoize('formattedTagName', () => {
      return ParsedHedTag.getTagName(this.formattedTag)
    })
  }

  /**
   * The trailing portion of {@link originalTag}.
   *
   * @returns {string} The "name" portion of the original tag.
   */
  get originalTagName() {
    return this._memoize('originalTagName', () => {
      return ParsedHedTag.getTagName(this.originalTag)
    })
  }

  /**
   * Get the HED tag prefix (up to the last slash).
   *
   * @param {string} tagString A HED tag.
   * @returns {string} The portion of the tag up to the last slash.
   */
  static getParentTag(tagString) {
    const lastSlashIndex = tagString.lastIndexOf('/')
    if (lastSlashIndex === -1) {
      return tagString
    } else {
      return tagString.substring(0, lastSlashIndex)
    }
  }

  /**
   * The parent portion of {@link canonicalTag}.
   *
   * @returns {string} The "parent" portion of the canonical tag.
   */
  get parentCanonicalTag() {
    return this._memoize('parentCanonicalTag', () => {
      return ParsedHedTag.getParentTag(this.canonicalTag)
    })
  }

  /**
   * The parent portion of {@link formattedTag}.
   *
   * @returns {string} The "parent" portion of the formatted tag.
   */
  get parentFormattedTag() {
    return this._memoize('parentFormattedTag', () => {
      return ParsedHedTag.getParentTag(this.formattedTag)
    })
  }

  /**
   * The parent portion of {@link originalTag}.
   *
   * @returns {string} The "parent" portion of the original tag.
   */
  get parentOriginalTag() {
    return this._memoize('parentOriginalTag', () => {
      return ParsedHedTag.getParentTag(this.originalTag)
    })
  }

  /**
   * Iterate through a tag's ancestor tag strings.
   *
   * @param {string} tagString A tag string.
   * @yields {string} The tag's ancestor tags.
   */
  static *ancestorIterator(tagString) {
    while (tagString.lastIndexOf('/') >= 0) {
      yield tagString
      tagString = ParsedHedTag.getParentTag(tagString)
    }
    yield tagString
  }

  /**
   * Determine whether this tag is a descendant of another tag.
   *
   * @param {ParsedHedTag|string} parent The possible parent tag.
   * @returns {boolean} Whether {@link parent} is the parent tag of this tag.
   */
  isDescendantOf(parent) {
    if (parent instanceof ParsedHedTag) {
      if (this.schema !== parent.schema) {
        return false
      }
      parent = parent.formattedTag
    }
    for (const ancestor of ParsedHedTag.ancestorIterator(this.formattedTag)) {
      if (ancestor === parent) {
        return true
      }
    }
    return false
  }

  /**
   * Check if any level of this HED tag allows extensions.
   *
   * @returns {boolean} Whether any level of this HED tag allows extensions.
   */
  get allowsExtensions() {
    return this._memoize('allowsExtensions', () => {
      if (this.originalTagName === '#') {
        return false
      }
      const extensionAllowedAttribute = 'extensionAllowed'
      if (this.hasAttribute(extensionAllowedAttribute)) {
        return true
      }
      return getTagLevels(this.formattedTag).some((tagSubstring) =>
        this.schema?.tagHasAttribute(tagSubstring, extensionAllowedAttribute),
      )
    })
  }

  /**
   * Determine if this HED tag is equivalent to another HED tag.
   *
   * HED tags are deemed equivalent if they have the same schema and formatted tag string.
   *
   * @param {ParsedHedTag} other A HED tag.
   * @returns {boolean} Whether {@link other} is equivalent to this HED tag.
   */
  equivalent(other) {
    return other instanceof ParsedHedTag && this.formattedTag === other.formattedTag && this.schema === other.schema
  }

  /**
   * Determine if this HED tag is in the linked schema.
   *
   * @returns {boolean} Whether this HED tag is in the linked schema.
   */
  get existsInSchema() {
    return this._memoize('existsInSchema', () => {
      return this.schema?.entries?.tags?.hasLongNameEntry(this.formattedTag)
    })
  }

  /**
   * Get the schema tag object for this tag.
   *
   * @returns {SchemaTag} The schema tag object for this tag.
   */
  get schemaTag() {
    return this._memoize('takesValueTag', () => {
      if (this._schemaTag instanceof SchemaValueTag) {
        return this._schemaTag.parent
      } else {
        return this._schemaTag
      }
    })
  }

  /**
   * Get the schema tag object for this tag's value-taking form.
   *
   * @returns {SchemaValueTag} The schema tag object for this tag's value-taking form.
   */
  get takesValueTag() {
    return this._memoize('takesValueTag', () => {
      if (this._schemaTag instanceof SchemaValueTag) {
        return this._schemaTag
      } else {
        return undefined
      }
    })
  }

  /**
   * Checks if this HED tag has the {@code takesValue} attribute.
   *
   * @returns {boolean} Whether this HED tag has the {@code takesValue} attribute.
   */
  get takesValue() {
    return this._memoize('takesValue', () => {
      return this.takesValueTag !== undefined
    })
  }

  /**
   * Checks if this HED tag has the {@code unitClass} attribute.
   *
   * @returns {boolean} Whether this HED tag has the {@code unitClass} attribute.
   */
  get hasUnitClass() {
    return this._memoize('hasUnitClass', () => {
      if (!this.takesValueTag) {
        return false
      }
      return this.takesValueTag.hasUnitClasses
    })
  }

  /**
   * Get the unit classes for this HED tag.
   *
   * @returns {SchemaUnitClass[]} The unit classes for this HED tag.
   */
  get unitClasses() {
    return this._memoize('unitClasses', () => {
      if (this.hasUnitClass) {
        return this.takesValueTag.unitClasses
      } else {
        return []
      }
    })
  }

  /**
   * Get the default unit for this HED tag.
   *
   * @returns {string} The default unit for this HED tag.
   */
  get defaultUnit() {
    return this._memoize('defaultUnit', () => {
      const defaultUnitsForUnitClassAttribute = 'defaultUnits'
      if (!this.hasUnitClass) {
        return ''
      }
      const tagDefaultUnit = this.takesValueTag.getNamedAttributeValue(defaultUnitsForUnitClassAttribute)
      if (tagDefaultUnit) {
        return tagDefaultUnit
      }
      const firstUnitClass = this.unitClasses[0]
      return firstUnitClass.getNamedAttributeValue(defaultUnitsForUnitClassAttribute)
    })
  }

  /**
   * Get the legal units for this HED tag.
   *
   * @returns {Set<SchemaUnit>} The legal units for this HED tag.
   */
  get validUnits() {
    return this._memoize('validUnits', () => {
      const tagUnitClasses = this.unitClasses
      const units = new Set()
      for (const unitClass of tagUnitClasses) {
        const unitClassUnits = this.schema?.entries.unitClasses.getEntry(unitClass.name).units
        for (const unit of unitClassUnits.values()) {
          units.add(unit)
        }
      }
      return units
    })
  }

  /**
   * Check if value is a valid value for this tag.
   *
   * @param {string} The value to be checked
   * @returns {boolean} The result of check -- false if not a valid value
   */

  checkValue(value) {
    if (!this.takesValue) {
      return false
    }
    if (value === '#') {
      // Placeholders work
      return true
    }
    const valueAttributeNames = this._schemaTag.valueAttributeNames
    const valueClassNames = valueAttributeNames?.get('valueClass')
    if (!valueClassNames) {
      // No specified value classes
      return allowedRegEx.test(value)
    }
    const entryManager = this.schema.entries.valueClasses
    for (let i = 0; i < valueClassNames.length; i++) {
      if (entryManager.getEntry(valueClassNames[i]).validateValue(value)) return true
    }
    return false
  }
}
