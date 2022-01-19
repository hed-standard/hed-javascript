const differenceWith = require('lodash/differenceWith')

const utils = require('../utils')
const { convertPartialHedStringToLong } = require('../converter/converter')

/**
 * A parsed HED substring.
 */
class ParsedHedSubstring {
  /**
   * Constructor.
   * @param {string} originalTag The original pre-parsed version of the HED substring.
   * @param {int[]} originalBounds The bounds of the HED substring in the original HED string.
   */
  constructor(originalTag, originalBounds) {
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
    /**
     * The formatted canonical version of the HED tag.
     *
     * The empty string default value should be replaced during formatting. Failure to do so
     * signals an error, as an empty tag should never happen.
     * @type {string}
     */
    this.formattedTag = ''
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
  }

  equivalent(other) {
    return (
      other instanceof ParsedHedTag && this.formattedTag === other.formattedTag
    )
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
  const definitionTags = group.tags.filter((tag) => {
    return (
      hedSchemas.baseSchema &&
      hedSchemas.isHed3 &&
      tag instanceof ParsedHedTag &&
      utils.HED.isDescendantOf(
        tag.canonicalTag,
        convertPartialHedStringToLong(
          hedSchemas,
          'Definition',
          'Definition',
          0,
        )[0],
      )
    )
  })
  switch (definitionTags.length) {
    case 0:
      return null
    case 1:
      return definitionTags[0]
    default:
      return definitionTags
  }
}

/**
 * A parsed HED tag group.
 */
class ParsedHedGroup extends ParsedHedSubstring {
  /**
   * Constructor.
   * @param {(ParsedHedSubstring)[]} parsedHedTags The parsed HED tags in the HED tag group.
   * @param {string} originalTagGroup The original pre-parsed version of the HED tag group.
   * @param {int[]} originalBounds The bounds of the HED tag group in the original HED string.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   */
  constructor(originalTagGroup, parsedHedTags, originalBounds, hedSchemas) {
    super(originalTagGroup, originalBounds)
    /**
     * The parsed HED tags in the HED tag group.
     * @type {(ParsedHedSubstring)[]}
     */
    this.tags = parsedHedTags
    /**
     * The Definition tag associated with this HED tag group.
     * @type {ParsedHedTag|ParsedHedTag[]|null}
     */
    this.definitionTag = groupDefinitionTag(this, hedSchemas)
    /**
     * Whether this HED tag group is a definition group.
     * @type {boolean}
     */
    this.isDefinitionGroup = this.definitionTag !== null
  }

  /**
   * Determine the name of this group's definition.
   * @return {string|null}
   */
  get definitionName() {
    if (!this.isDefinitionGroup) {
      return null
    }
    return utils.HED.getDefinitionName(
      this.definitionTag.formattedTag,
      'Definition',
    )
  }

  /**
   * Determine the value of this group's definition.
   * @return {ParsedHedGroup|null}
   */
  get definitionGroup() {
    if (!this.isDefinitionGroup) {
      return null
    }
    for (const subgroup of this.tags) {
      if (subgroup instanceof ParsedHedGroup) {
        return subgroup
      }
    }
    throw new Error('Definition group is missing a first-level subgroup.')
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
  ParsedHedGroup: ParsedHedGroup,
  ParsedHedString: ParsedHedString,
}
