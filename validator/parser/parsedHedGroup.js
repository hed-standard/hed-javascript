import differenceWith from 'lodash/differenceWith'

import { getParsedParentTags } from '../../utils/hedData'
import { getTagName } from '../../utils/hedStrings'
import ParsedHedSubstring from './parsedHedSubstring'
import { ParsedHedTag } from './parsedHedTag'

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
  const parsedDefinitionTags = getParsedParentTags(hedSchemas, definitionShortTag)
  const definitionTags = group.tags.filter((tag) => {
    if (!(tag instanceof ParsedHedTag)) {
      return false
    }
    const parsedDefinitionTag = parsedDefinitionTags.get(tag.schema)
    return tag.isDescendantOf(parsedDefinitionTag)
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
export default class ParsedHedGroup extends ParsedHedSubstring {
  /**
   * The parsed HED tags in the HED tag group.
   * @type {(ParsedHedTag|ParsedHedGroup)[]}
   */
  tags
  /**
   * The base of {@link definitionTag}.
   * @type {string}
   */
  definitionBase
  /**
   * The Definition tag associated with this HED tag group.
   * @type {ParsedHedTag|ParsedHedTag[]|null}
   */
  definitionTag
  /**
   * Whether this HED tag group is a definition group.
   * @type {boolean}
   */
  isDefinitionGroup

  /**
   * Constructor.
   * @param {(ParsedHedTag|ParsedHedGroup)[]} parsedHedTags The parsed HED tags in the HED tag group.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   * @param {string} hedString The original HED string.
   * @param {number[]} originalBounds The bounds of the HED tag in the original HED string.
   */
  constructor(parsedHedTags, hedSchemas, hedString, originalBounds) {
    const originalTag = hedString.substring(...originalBounds)
    super(originalTag, originalBounds)

    this.tags = parsedHedTags
    const [definitionBase, definitionTag] = groupDefinitionTag(this, hedSchemas)
    this.definitionBase = definitionBase
    this.definitionTag = definitionTag
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
      return ParsedHedGroup.findDefinitionName(this.definitionTag.canonicalTag, this.definitionBase)
    })
  }

  /**
   * Determine the name of this group's definition.
   */
  static findDefinitionName(canonicalTag, definitionBase) {
    const tag = canonicalTag
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
   * The deeply nested array of parsed tags.
   * @return {ParsedHedTag[]}
   */
  nestedGroups() {
    const currentGroup = []
    for (const innerTag of this.tags) {
      if (innerTag instanceof ParsedHedTag) {
        currentGroup.push(innerTag)
      } else if (innerTag instanceof ParsedHedGroup) {
        currentGroup.push(innerTag.nestedGroups())
      }
    }
    return currentGroup
  }

  /**
   * Iterator over the full HED groups and subgroups in this HED tag group.
   *
   * @yield {ParsedHedTag[]} The subgroups of this tag group.
   */
  *subGroupArrayIterator() {
    const currentGroup = []
    for (const innerTag of this.tags) {
      if (innerTag instanceof ParsedHedTag) {
        currentGroup.push(innerTag)
      } else if (innerTag instanceof ParsedHedGroup) {
        yield* innerTag.subGroupArrayIterator()
      }
    }
    yield currentGroup
  }

  /**
   * Iterator over the ParsedHedGroup objects in this HED tag group.
   *
   * @yield {ParsedHedGroup} This object and the ParsedHedGroup objects belonging to this tag group.
   */
  *subParsedGroupIterator() {
    yield this
    for (const innerTag of this.tags) {
      if (innerTag instanceof ParsedHedGroup) {
        yield* innerTag.subParsedGroupIterator()
      }
    }
  }

  /**
   * Iterator over the parsed HED tags in this HED tag group.
   *
   * @yield {ParsedHedTag} This tag group's HED tags.
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
