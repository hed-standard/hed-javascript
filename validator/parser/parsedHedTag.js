import { generateIssue } from '../../common/issues/issues'
import { Schema } from '../../common/schema/types'
import { convertPartialHedStringToLong } from '../../converter/converter'
import { getTagSlashIndices, replaceTagNameWithPound } from '../../utils/hedStrings'
import ParsedHedSubstring from './parsedHedSubstring'

/**
 * A parsed HED tag.
 */
export class ParsedHedTag extends ParsedHedSubstring {
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
   * Any issues encountered during tag conversion.
   * @type {Issue[]}
   */
  conversionIssues
  /**
   * The HED schema this tag belongs to.
   * @type {Schema}
   */
  schema

  /**
   * Constructor.
   * @param {string} originalTag The original HED tag.
   * @param {string} hedString The original HED string.
   * @param {number[]} originalBounds The bounds of the HED tag in the original HED string.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   * @param {string} schemaName The label of this tag's schema in the dataset's schema spec.
   */
  constructor(originalTag, hedString, originalBounds, hedSchemas, schemaName = '') {
    super(originalTag, originalBounds)

    this._convertTag(hedString, hedSchemas, schemaName)

    this.formattedTag = this._formatTag()
  }

  /**
   * Convert this tag to long form.
   *
   * @param {string} hedString The original HED string.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   * @param {string} schemaName The label of this tag's schema in the dataset's schema spec.
   */
  _convertTag(hedString, hedSchemas, schemaName) {
    if (hedSchemas.isSyntaxOnly) {
      this.canonicalTag = this.originalTag
      this.conversionIssues = []
      return
    }

    this.schema = hedSchemas.getSchema(schemaName)
    if (this.schema === undefined) {
      if (schemaName !== '') {
        this.conversionIssues = [
          generateIssue('unmatchedLibrarySchema', {
            tag: this.originalTag,
            library: schemaName,
          }),
        ]
      } else {
        this.conversionIssues = [
          generateIssue('unmatchedBaseSchema', {
            tag: this.originalTag,
          }),
        ]
      }
      this.canonicalTag = this.originalTag
      return
    }

    const [canonicalTag, conversionIssues] = convertPartialHedStringToLong(
      this.schema,
      this.originalTag,
      hedString,
      this.originalBounds[0],
    )
    this.canonicalTag = canonicalTag
    this.conversionIssues = conversionIssues
  }

  /**
   * Format this HED tag by removing newlines, double quotes, and slashes.
   */
  _formatTag() {
    this.originalTag = this.originalTag.replace('\n', ' ')
    let hedTagString = this.canonicalTag.trim()
    if (hedTagString.startsWith('"')) {
      hedTagString = hedTagString.slice(1)
    }
    if (hedTagString.endsWith('"')) {
      hedTagString = hedTagString.slice(0, -1)
    }
    if (hedTagString.startsWith('/')) {
      hedTagString = hedTagString.slice(1)
    }
    if (hedTagString.endsWith('/')) {
      hedTagString = hedTagString.slice(0, -1)
    }
    return hedTagString.toLowerCase()
  }

  hasAttribute(attribute) {
    return this.schema.tagHasAttribute(this.formattedTag, attribute)
  }

  parentHasAttribute(attribute) {
    return this.schema.tagHasAttribute(this.parentFormattedTag, attribute)
  }

  /**
   * Get the last part of a HED tag.
   *
   * @param {string} tagString A HED tag.
   * @return {string} The last part of the tag using the given separator.
   */
  static getTagName(tagString) {
    const lastSlashIndex = tagString.lastIndexOf('/')
    if (lastSlashIndex === -1) {
      return tagString
    } else {
      return tagString.substring(lastSlashIndex + 1)
    }
  }

  get canonicalTagName() {
    return this._memoize('canonicalTagName', () => {
      return ParsedHedTag.getTagName(this.canonicalTag)
    })
  }

  get formattedTagName() {
    return this._memoize('formattedTagName', () => {
      return ParsedHedTag.getTagName(this.formattedTag)
    })
  }

  get originalTagName() {
    return this._memoize('originalTagName', () => {
      return ParsedHedTag.getTagName(this.originalTag)
    })
  }

  /**
   * Get the HED tag prefix (up to the last slash).
   */
  static getParentTag(tagString) {
    const lastSlashIndex = tagString.lastIndexOf('/')
    if (lastSlashIndex === -1) {
      return tagString
    } else {
      return tagString.substring(0, lastSlashIndex)
    }
  }

  get parentCanonicalTag() {
    return this._memoize('parentCanonicalTag', () => {
      return ParsedHedTag.getParentTag(this.canonicalTag)
    })
  }

  get parentFormattedTag() {
    return this._memoize('parentFormattedTag', () => {
      return ParsedHedTag.getParentTag(this.formattedTag)
    })
  }

  get parentOriginalTag() {
    return this._memoize('parentOriginalTag', () => {
      return ParsedHedTag.getParentTag(this.originalTag)
    })
  }

  /**
   * Iterate through a tag's ancestor tag strings.
   *
   * @param {string} tagString A tag string.
   * @yield {string} The tag's ancestor tags.
   */
  static *ancestorIterator(tagString) {
    while (tagString.lastIndexOf('/') >= 0) {
      yield tagString
      tagString = ParsedHedTag.getParentTag(tagString)
    }
    yield tagString
  }

  isDescendantOf(parent) {
    if (parent instanceof ParsedHedTag) {
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
   */
  get allowsExtensions() {
    return this._memoize('allowsExtensions', () => {
      const extensionAllowedAttribute = 'extensionAllowed'
      if (this.hasAttribute(extensionAllowedAttribute)) {
        return true
      }
      const tagSlashIndices = getTagSlashIndices(this.formattedTag)
      for (const tagSlashIndex of tagSlashIndices) {
        const tagSubstring = this.formattedTag.slice(0, tagSlashIndex)
        if (this.schema.tagHasAttribute(tagSubstring, extensionAllowedAttribute)) {
          return true
        }
      }
      return false
    })
  }

  equivalent(other) {
    return other instanceof ParsedHedTag && this.formattedTag === other.formattedTag && this.schema === other.schema
  }
}

export class ParsedHed3Tag extends ParsedHedTag {
  /**
   * Determine if this HED tag is in the schema.
   */
  get existsInSchema() {
    return this._memoize('existsInSchema', () => {
      return this.schema.entries.definitions.get('tags').hasEntry(this.formattedTag)
    })
  }

  /**
   * Determine value-taking form of this tag.
   */
  get takesValueFormattedTag() {
    return this._memoize('takesValueFormattedTag', () => {
      const takesValueType = 'takesValue'
      for (const ancestor of ParsedHedTag.ancestorIterator(this.formattedTag)) {
        const takesValueTag = replaceTagNameWithPound(ancestor)
        if (this.schema.tagHasAttribute(takesValueTag, takesValueType)) {
          return takesValueTag
        }
      }
      return null
    })
  }

  /**
   * Checks if this HED tag has the 'takesValue' attribute.
   */
  get takesValue() {
    return this._memoize('takesValue', () => {
      return this.takesValueFormattedTag !== null
    })
  }

  /**
   * Checks if this HED tag has the 'unitClass' attribute.
   */
  get hasUnitClass() {
    return this._memoize('hasUnitClass', () => {
      if (!this.schema.entries.definitions.has('unitClasses')) {
        return false
      }
      if (this.takesValueTag === null) {
        return false
      }
      return this.takesValueTag.hasUnitClasses
    })
  }

  /**
   * Get the unit classes for this HED tag.
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
   * Get the legal units for a particular HED tag.
   * @return {Set<SchemaUnit>}
   */
  get validUnits() {
    return this._memoize('validUnits', () => {
      const tagUnitClasses = this.unitClasses
      const units = new Set()
      for (const unitClass of tagUnitClasses) {
        const unitClassUnits = this.schema.entries.unitClassMap.getEntry(unitClass.name).units
        for (const unit of unitClassUnits.values()) {
          units.add(unit)
        }
      }
      return units
    })
  }

  /**
   * Get the schema tag object for this tag's value-taking form.
   *
   * @return {SchemaTag}
   */
  get takesValueTag() {
    return this._memoize('takesValueTag', () => {
      if (this.takesValueFormattedTag !== null) {
        return this.schema.entries.definitions.get('tags').getEntry(this.takesValueFormattedTag)
      } else {
        return null
      }
    })
  }
}
