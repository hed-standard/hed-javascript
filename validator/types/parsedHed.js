const differenceWith = require('lodash/differenceWith')

const { Memoizer } = require('../../utils/types')

const {
  getTagSlashIndices,
  replaceTagNameWithPound,
  getTagName,
} = require('../../utils/hed')
const { convertPartialHedStringToLong } = require('../../converter/converter')

/**
 * A parsed HED substring.
 */
class ParsedHedSubstring extends Memoizer {
  /**
   * Constructor.
   * @param {string} originalTag The original pre-parsed version of the HED substring.
   * @param {int[]} originalBounds The bounds of the HED substring in the original HED string.
   */
  constructor(originalTag, originalBounds) {
    super()
    /**
     * The original pre-parsed version of the HED tag.
     * @type {string}
     */
    this.originalTag = originalTag
    /**
     * The bounds of the HED tag in the original HED string.
     * @type {int[]}
     */
    this.originalBounds = originalBounds
  }
}

/**
 * A parsed HED tag.
 */
class ParsedHedTag extends ParsedHedSubstring {
  /**
   * Constructor.
   * @param {string} originalTag The original HED tag.
   * @param {string} hedString The original HED string.
   * @param {int[]} originalBounds The bounds of the HED tag in the original HED string.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   */
  constructor(originalTag, hedString, originalBounds, hedSchemas) {
    super(originalTag, originalBounds)
    let canonicalTag, conversionIssues
    if (hedSchemas.baseSchema) {
      ;[canonicalTag, conversionIssues] = convertPartialHedStringToLong(
        hedSchemas,
        originalTag,
        hedString,
        originalBounds[0],
      )
    } else {
      canonicalTag = originalTag
      conversionIssues = []
    }
    /**
     * The canonical form of the HED tag.
     * @type {string}
     */
    this.canonicalTag = canonicalTag
    /**
     * Any issues encountered during tag conversion.
     * @type {Array}
     */
    this.conversionIssues = conversionIssues
    // TODO: Implement
    this.schema = hedSchemas.baseSchema
    /**
     * The formatted canonical version of the HED tag.
     * @type {string}
     */
    this.formattedTag = this.format()
  }

  /**
   * Format this HED tag by removing newlines, double quotes, and slashes.
   */
  format() {
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
    return this.schema.attributes.tagHasAttribute(this.formattedTag, attribute)
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
        if (
          this.schema.attributes.tagHasAttribute(
            tagSubstring,
            extensionAllowedAttribute,
          )
        ) {
          return true
        }
      }
      return false
    })
  }

  equivalent(other) {
    return (
      other instanceof ParsedHedTag && this.formattedTag === other.formattedTag
    )
  }
}

class ParsedHed2Tag extends ParsedHedTag {
  /**
   * Determine if this HED tag is in the schema.
   */
  get existsInSchema() {
    return this._memoize('existsInSchema', () => {
      return this.schema.attributes.tags.includes(this.formattedTag)
    })
  }

  /**
   * Checks if this HED tag hasEntry the 'takesValue' attribute.
   */
  get takesValue() {
    return this._memoize('takesValue', () => {
      const takesValueType = 'takesValue'
      const takesValueTag = replaceTagNameWithPound(this.formattedTag)
      return this.schema.attributes.tagHasAttribute(
        takesValueTag,
        takesValueType,
      )
    })
  }

  /**
   * Checks if this HED tag hasEntry the 'unitClass' attribute.
   */
  get hasUnitClass() {
    return this._memoize('hasUnitClass', () => {
      if (!this.schema.attributes.hasUnitClasses) {
        return false
      }
      const takesValueTag = replaceTagNameWithPound(this.formattedTag)
      return takesValueTag in this.schema.attributes.tagUnitClasses
    })
  }

  /**
   * Get the unit classes for this HED tag.
   */
  get unitClasses() {
    return this._memoize('unitClasses', () => {
      if (this.hasUnitClass) {
        const unitClassTag = replaceTagNameWithPound(this.formattedTag)
        return this.schema.attributes.tagUnitClasses[unitClassTag]
      } else {
        return []
      }
    })
  }

  /**
   * Get the default unit for this HED tag.
   * TODO: Replace return with new Unit type.
   */
  get defaultUnit() {
    return this._memoize('defaultUnit', () => {
      const defaultUnitForTagAttribute = 'default'
      const defaultUnitsForUnitClassAttribute = 'defaultUnits'
      if (!this.hasUnitClass) {
        return ''
      }
      const unitClassTag = replaceTagNameWithPound(this.formattedTag)
      let hasDefaultAttribute = this.schema.attributes.tagHasAttribute(
        unitClassTag,
        defaultUnitForTagAttribute,
      )
      // TODO: New versions of the spec have defaultUnits instead of default.
      if (hasDefaultAttribute) {
        return this.schema.attributes.tagAttributes[defaultUnitForTagAttribute][
          unitClassTag
        ]
      }
      hasDefaultAttribute = this.schema.attributes.tagHasAttribute(
        unitClassTag,
        defaultUnitsForUnitClassAttribute,
      )
      if (hasDefaultAttribute) {
        return this.schema.attributes.tagAttributes[
          defaultUnitsForUnitClassAttribute
        ][unitClassTag]
      }
      const unitClasses = this.schema.attributes.tagUnitClasses[unitClassTag]
      const firstUnitClass = unitClasses[0]
      return this.schema.attributes.unitClassAttributes[firstUnitClass][
        defaultUnitsForUnitClassAttribute
      ][0]
    })
  }

  /**
   * Get the legal units for a particular HED tag.
   * @return {string[]}
   */
  get validUnits() {
    return this._memoize('validUnits', () => {
      const tagUnitClasses = this.unitClasses
      const units = []
      for (const unitClass of tagUnitClasses) {
        const unitClassUnits = this.schema.attributes.unitClasses[unitClass]
        units.push(...unitClassUnits)
      }
      return units
    })
  }
}

class ParsedHed3Tag extends ParsedHedTag {
  /**
   * Determine if this HED tag is in the schema.
   */
  get existsInSchema() {
    return this._memoize('existsInSchema', () => {
      return this.schema.attributes.definitions.get('tags').hasEntry(this.formattedTag)
    })
  }

  /**
   * Checks if this HED tag hasEntry the 'takesValue' attribute.
   */
  get takesValue() {
    return this._memoize('takesValue', () => {
      const takesValueType = 'takesValue'
      for (const ancestor of ParsedHedTag.ancestorIterator(this.formattedTag)) {
        const takesValueTag = replaceTagNameWithPound(ancestor)
        if (
          this.schema.attributes.tagHasAttribute(takesValueTag, takesValueType)
        ) {
          return true
        }
      }
      return false
    })
  }

  /**
   * Checks if this HED tag hasEntry the 'unitClass' attribute.
   */
  get hasUnitClass() {
    return this._memoize('hasUnitClass', () => {
      if (!this.schema.attributes.definitions.has('unitClasses')) {
        return false
      }
      if (this.takesValueTag === undefined) {
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
      const tagDefaultUnit = this.takesValueTag.getNamedAttributeValue(
        defaultUnitsForUnitClassAttribute,
      )
      if (tagDefaultUnit) {
        return tagDefaultUnit
      }
      const firstUnitClass = this.unitClasses[0]
      return firstUnitClass.getNamedAttributeValue(
        defaultUnitsForUnitClassAttribute,
      )
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
        const unitClassUnits =
          this.schema.attributes.unitClassMap.get(unitClass.name).units
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
    const unitClassTag = replaceTagNameWithPound(this.formattedTag)
    return this.schema.attributes.definitions.get('tags').getEntry(unitClassTag)
  }
}

/**
 * Determine a parsed HED tag group's Definition tags.
 *
 * @param {ParsedHedGroup} group The parsed HED tag group.
 * @param {Schemas} hedSchemas The collection of HED schemas.
 * @return {null|ParsedHedTag[]|ParsedHedTag} The Definition tag(s)
 */
const groupDefinitionTag = function (group, hedSchemas) {
  if (!hedSchemas.isHed3) {
    return ['', null]
  }
  const definitionShortTag = 'Definition'
  const definitionTag = new ParsedHedTag(
    definitionShortTag,
    definitionShortTag,
    [0, definitionShortTag.length - 1],
    hedSchemas,
  )
  const definitionTags = group.tags.filter((tag) => {
    return (
      hedSchemas.baseSchema &&
      hedSchemas.isHed3 &&
      tag instanceof ParsedHedTag &&
      tag.isDescendantOf(definitionTag)
    )
  })
  switch (definitionTags.length) {
    case 0:
      return ['', null]
    case 1:
      return [definitionShortTag, definitionTags[0]]
    default:
      return [definitionShortTag, definitionTags]
  }
}

/**
 * A parsed HED tag group.
 */
class ParsedHedGroup extends ParsedHedSubstring {
  /**
   * Constructor.
   * @param {(ParsedHedTag|ParsedHedGroup)[]} parsedHedTags The parsed HED tags in the HED tag group.
   * @param {string} originalTagGroup The original pre-parsed version of the HED tag group.
   * @param {int[]} originalBounds The bounds of the HED tag group in the original HED string.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   */
  constructor(originalTagGroup, parsedHedTags, originalBounds, hedSchemas) {
    super(originalTagGroup, originalBounds)
    /**
     * The parsed HED tags in the HED tag group.
     * @type {(ParsedHedTag|ParsedHedGroup)[]}
     */
    this.tags = parsedHedTags
    const [definitionBase, definitionTag] = groupDefinitionTag(this, hedSchemas)
    this.definitionBase = definitionBase
    /**
     * The Definition tag associated with this HED tag group.
     * @type {ParsedHedTag|ParsedHedTag[]|null}
     */
    this.definitionTag = definitionTag
    /**
     * Whether this HED tag group is a definition group.
     * @type {boolean}
     */
    this.isDefinitionGroup = definitionTag !== null
  }

  /**
   * Determine the name of this group's definition.
   * @return {string|null}
   */
  get definitionName() {
    return this._memoize('definitionName', () => {
      if (!this.isDefinitionGroup) {
        return null
      }
      return ParsedHedGroup.findDefinitionName(
        this.definitionTag.canonicalTag,
        this.definitionBase,
      )
    })
  }

  /**
   * Determine the name of this group's definition.
   */
  static findDefinitionName(canonicalTag, definitionBase) {
    let tag = canonicalTag
    let value = getTagName(tag)
    let previousValue
    for (const level of ParsedHedTag.ancestorIterator(tag)) {
      if (value.toLowerCase() === definitionBase.toLowerCase()) {
        return previousValue
      }
      previousValue = value
      value = getTagName(level)
    }
    throw Error(
      `Completed iteration through ${definitionBase.toLowerCase()} tag without finding ${definitionBase} level.`,
    )
  }

  /**
   * Determine the value of this group's definition.
   * @return {ParsedHedGroup|null}
   */
  get definitionGroup() {
    return this._memoize('definitionGroup', () => {
      if (!this.isDefinitionGroup) {
        return null
      }
      for (const subgroup of this.tags) {
        if (subgroup instanceof ParsedHedGroup) {
          return subgroup
        }
      }
      throw new Error('Definition group is missing a first-level subgroup.')
    })
  }

  equivalent(other) {
    if (!(other instanceof ParsedHedGroup)) {
      return false
    }
    return (
      differenceWith(this.tags, other.tags, (ours, theirs) => {
        return ours.equivalent(theirs)
      }).length === 0
    )
  }

  /**
   * Iterator over the full HED groups and subgroups in this HED tag group.
   * @return {Generator<*, ParsedHedTag[], *>}
   */
  *subGroupIterator() {
    const currentGroup = []
    for (const innerTag of this.tags) {
      if (innerTag instanceof ParsedHedTag) {
        currentGroup.push(innerTag)
      } else if (innerTag instanceof ParsedHedGroup) {
        yield* innerTag.subGroupIterator()
      }
    }
    yield currentGroup
  }

  /**
   * Iterator over the parsed HED tags in this HED tag group.
   * @return {Generator<*, ParsedHedTag, *>}
   */
  *tagIterator() {
    for (const innerTag of this.tags) {
      if (innerTag instanceof ParsedHedTag) {
        yield innerTag
      } else if (innerTag instanceof ParsedHedGroup) {
        yield* innerTag.tagIterator()
      }
    }
  }
}

/**
 * A parsed HED string.
 */
class ParsedHedString {
  /**
   * Constructor.
   * @param {string} hedString The original HED string.
   */
  constructor(hedString) {
    /**
     * The original HED string.
     * @type {string}
     */
    this.hedString = hedString
    /**
     * All of the tags in the string.
     * @type ParsedHedTag[]
     */
    this.tags = []
    /**
     * The tag groups in the string.
     * @type ParsedHedGroup[]
     */
    this.tagGroups = []
    /**
     * The tag groups, kept in their original parenthesized form.
     * @type ParsedHedTag[]
     */
    this.tagGroupStrings = []
    /**
     * All of the top-level tags in the string.
     * @type ParsedHedTag[]
     */
    this.topLevelTags = []
    /**
     * The top-level tag groups in the string, split into arrays.
     * @type ParsedHedTag[][]
     */
    this.topLevelTagGroups = []
    /**
     * The definition tag groups in the string.
     * @type ParsedHedGroup[]
     */
    this.definitionGroups = []
  }

  get definitions() {
    return this.definitionGroups.map((group) => {
      return [group.definitionName, group]
    })
  }
}

module.exports = {
  ParsedHedTag: ParsedHedTag,
  ParsedHed2Tag: ParsedHed2Tag,
  ParsedHed3Tag: ParsedHed3Tag,
  ParsedHedGroup: ParsedHedGroup,
  ParsedHedString: ParsedHedString,
}
