import differenceWith from 'lodash/differenceWith'

import { generateIssue, IssueError } from '../../common/issues/issues'
import { getParsedParentTags } from '../../utils/hedData'
import { getTagName } from '../../utils/hedStrings'
import ParsedHedSubstring from './parsedHedSubstring'
import { ParsedHedTag } from './parsedHedTag'

/**
 * A parsed HED tag group.
 */
export default class ParsedHedGroup extends ParsedHedSubstring {
  static SPECIAL_SHORT_TAGS = new Set(['Definition', 'Def', 'Def-expand', 'Onset', 'Offset', 'Inset'])

  /**
   * The parsed HED tags in the HED tag group.
   * @type {(ParsedHedTag|ParsedHedGroup)[]}
   */
  tags
  /**
   * Any HED tags with special handling.
   * @type {Map<string, ParsedHedTag[]>}
   */
  specialTags
  /**
   * Whether this HED tag group has child groups with a Def-expand tag.
   * @type {boolean}
   */
  hasDefExpandChildren
  /**
   * The top-level child subgroups containing Def-expand tags.
   * @type {ParsedHedGroup[]}
   */
  defExpandChildren

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
    this._findSpecialGroups(hedSchemas)
  }

  _findSpecialGroups(hedSchemas) {
    this.specialTags = new Map()
    for (const shortTag of ParsedHedGroup.SPECIAL_SHORT_TAGS) {
      const tags = ParsedHedGroup.findGroupTags(this, hedSchemas, shortTag)
      if (tags !== undefined) {
        this.specialTags.set(shortTag, tags)
      }
    }
    this.defExpandChildren = Array.from(this.topLevelGroupIterator()).filter((subgroup) => subgroup.isDefExpandGroup)
    this.hasDefExpandChildren = this.defExpandChildren.length !== 0
  }

  /**
   * Determine a parsed HED tag group's special tags.
   *
   * @param {ParsedHedGroup} group The parsed HED tag group.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   * @param {string} shortTag The short tag to search for.
   * @return {null|ParsedHedTag[]} The tag(s) matching the short tag.
   */
  static findGroupTags(group, hedSchemas, shortTag) {
    if (!hedSchemas.isHed3) {
      return undefined
    }
    const parsedTags = getParsedParentTags(hedSchemas, shortTag)
    const tags = group.tags.filter((tag) => {
      if (!(tag instanceof ParsedHedTag)) {
        return false
      }
      const parsedTag = parsedTags.get(tag.schema)
      return tag.isDescendantOf(parsedTag)
    })
    switch (tags.length) {
      case 0:
        return undefined
      default:
        return tags
    }
  }

  /**
   * The {@code Definition} tags associated with this HED tag group.
   * @return {ParsedHedTag[]}
   */
  get definitionTags() {
    return this.specialTags.get('Definition')
  }

  /**
   * The {@code Def} tags associated with this HED tag group.
   * @return {ParsedHedTag[]}
   */
  get defTags() {
    return this.specialTags.get('Def')
  }

  /**
   * The {@code Def-expand} tags associated with this HED tag group.
   * @return {ParsedHedTag[]}
   */
  get defExpandTags() {
    return this.specialTags.get('Def-expand')
  }

  /**
   * Whether this HED tag group is a definition group.
   * @return {boolean}
   */
  get isDefinitionGroup() {
    return this.specialTags.has('Definition')
  }

  /**
   * Whether this HED tag group has a {@code Def} tag.
   * @return {boolean}
   */
  get isDefGroup() {
    return this.specialTags.has('Def')
  }

  /**
   * Whether this HED tag group has a {@code Def-expand} tag.
   * @return {boolean}
   */
  get isDefExpandGroup() {
    return this.specialTags.has('Def-expand')
  }

  /**
   * Whether this HED tag group is an onset group.
   * @return {boolean}
   */
  get isOnsetGroup() {
    return this.specialTags.has('Onset')
  }

  /**
   * Whether this HED tag group is an offset group.
   * @return {boolean}
   */
  get isOffsetGroup() {
    return this.specialTags.has('Offset')
  }

  /**
   * Whether this HED tag group is an inset group.
   * @return {boolean}
   */
  get isInsetGroup() {
    return this.specialTags.has('Inset')
  }

  /**
   * Whether this HED tag group is an onset, offset, or inset group.
   * @return {boolean}
   */
  get isTemporalGroup() {
    return this.isOnsetGroup || this.isOffsetGroup || this.isInsetGroup
  }

  /**
   * Whether this HED tag group is an onset, offset, or inset group.
   * @return {string}
   */
  get temporalGroupName() {
    if (this.isOnsetGroup) {
      return 'Onset'
    } else if (this.isOffsetGroup) {
      return 'Offset'
    } else if (this.isInsetGroup) {
      return 'Inset'
    } else {
      return undefined
    }
  }

  /**
   * Find what should be the sole definition tag, or throw an error if more than one is found.
   *
   * @return {ParsedHedTag} This group's definition tag.
   */
  get definitionTag() {
    return this.getSingleDefinitionTag('definitionTag', 'Definition')
  }

  /**
   * Find what should be the sole {@code Def-expand} tag, or throw an error if more than one is found.
   *
   * @return {ParsedHedTag} This group's {@code Def-expand} tag.
   */
  get defExpandTag() {
    return this.getSingleDefinitionTag('defExpandTag', 'Def-expand')
  }

  getSingleDefinitionTag(fieldName, parentTag) {
    return this._memoize(fieldName, () => {
      switch (this.specialTags.get(parentTag).length) {
        case 0:
          return undefined
        case 1:
          return this.specialTags.get(parentTag)[0]
        default:
          throw new Error(`Single ${parentTag} tag asserted, but multiple ${parentTag} tags found.`)
      }
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
   * Determine the name of this group's definition.
   * @return {string|null}
   */
  get definitionName() {
    return this.getSingleDefinitionName('definitionName', 'Definition')
  }

  /**
   * Determine the name of this group's definition.
   * @return {string|null}
   */
  get defExpandName() {
    return this.getSingleDefinitionName('defExpandName', 'Def-expand')
  }

  getSingleDefinitionName(fieldName, parentTag) {
    return this._memoize(fieldName, () => {
      if (!this.specialTags.has(parentTag)) {
        return null
      }
      return ParsedHedGroup.findDefinitionName(
        this.getSingleDefinitionTag(fieldName, parentTag).canonicalTag,
        parentTag,
      )
    })
  }

  /**
   * Determine the value of this group's definition.
   * @return {string|null}
   */
  get definitionValue() {
    return this.getSingleDefinitionValue('definitionValue', 'Definition')
  }

  /**
   * Determine the value of this group's definition.
   * @return {string|null}
   */
  get defExpandValue() {
    return this.getSingleDefinitionValue('defExpandValue', 'Def-expand')
  }

  getSingleDefinitionValue(fieldName, parentTag) {
    return this._memoize(fieldName, () => {
      if (!this.specialTags.has(parentTag)) {
        return null
      }
      return ParsedHedGroup.getDefinitionTagValue(this.getSingleDefinitionTag(fieldName, parentTag), parentTag)
    })
  }

  /**
   * Determine the name and value of this group's definition.
   * @return {string|null}
   */
  get definitionNameAndValue() {
    return this.getSingleDefinitionNameAndValue('definition', 'Definition')
  }

  /**
   * Determine the name and value of this group's definition.
   * @return {string|null}
   */
  get defExpandNameAndValue() {
    return this.getSingleDefinitionNameAndValue('defExpand', 'Def-expand')
  }

  getSingleDefinitionNameAndValue(fieldName, parentTag) {
    return this._memoize(fieldName + 'NameAndValue', () => {
      if (!this.specialTags.has(parentTag)) {
        return null
      } else if (this.getSingleDefinitionValue(fieldName + 'Value', parentTag)) {
        return (
          this.getSingleDefinitionName(fieldName + 'Name', parentTag) +
          '/' +
          this.getSingleDefinitionValue(fieldName + 'Value', parentTag)
        )
      } else {
        return this.getSingleDefinitionName(fieldName + 'Name', parentTag)
      }
    })
  }

  /**
   * Determine the name(s) of this group's definition.
   * @return {string|string[]|null}
   */
  get defName() {
    return this._memoize('defName', () => {
      if (!this.isDefGroup && !this.hasDefExpandChildren) {
        return null
      } else if (!this.isTemporalGroup) {
        return [].concat(
          this.defExpandChildren.map((defExpandChild) => defExpandChild.defExpandName),
          this.defTags.map((defTag) => ParsedHedGroup.findDefinitionName(defTag.canonicalTag, 'Def')),
        )
      } else if (this.defCount > 1) {
        throw new IssueError(
          generateIssue('temporalWithMultipleDefinitions', {
            tagGroup: this.originalTag,
            tag: this.temporalGroupName,
          }),
        )
      } else if (this.hasDefExpandChildren) {
        return this.defExpandChildren[0].defExpandName
      }
      return ParsedHedGroup.findDefinitionName(this.defTags[0].canonicalTag, 'Def')
    })
  }

  /**
   * Determine the name of this group's definition.
   * @return {string|null}
   */
  get defValue() {
    return this._memoize('defValue', () => {
      if (!this.isDefGroup && !this.hasDefExpandChildren) {
        return null
      } else if (!this.isTemporalGroup) {
        return [].concat(
          this.defExpandChildren.map((defExpandChild) => defExpandChild.defExpandValue),
          this.defTags.map((defTag) => ParsedHedGroup.getDefinitionTagValue(defTag, 'Def')),
        )
      } else if (this.defCount > 1) {
        throw new IssueError(
          generateIssue('temporalWithMultipleDefinitions', {
            tagGroup: this.originalTag,
            tag: this.temporalGroupName,
          }),
        )
      } else if (this.hasDefExpandChildren) {
        return this.defExpandChildren[0].defExpandValue
      }
      return ParsedHedGroup.getDefinitionTagValue(this.defTags[0], 'Def')
    })
  }

  /**
   * Determine the name and value of this group's {@code Def} or {@code Def-expand}.
   * @return {string|null}
   */
  get defNameAndValue() {
    return this._memoize('defNameAndValue', () => {
      if (!this.isDefGroup && !this.hasDefExpandChildren) {
        return null
      } else if (this.defValue) {
        return this.defName + '/' + this.defValue
      } else {
        return this.defName
      }
    })
  }

  /**
   * Extract the value from a definition tag.
   *
   * @param {ParsedHedTag} tag A definition-type tag.
   * @param {string} parentTag The expected parent of the tag.
   * @return {string} The parameterized value of the definition, or an empty string if no value was found.
   */
  static getDefinitionTagValue(tag, parentTag) {
    if (getTagName(tag.parentCanonicalTag) === parentTag) {
      return ''
    } else {
      return tag.originalTagName
    }
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
      return null
    })
  }

  /**
   * Determine the number of {@code Def} and {@code Def-expand} tag/tag groups included in this group.
   * @return {number} The number of first-level definition reference tags and tag groups in this group.
   */
  get defCount() {
    return this._memoize('defCount', () => {
      if (this.isDefGroup) {
        return this.defTags.length + this.defExpandChildren.length
      } else {
        return this.defExpandChildren.length
      }
    })
  }

  equivalent(other) {
    if (!(other instanceof ParsedHedGroup)) {
      return false
    }
    return differenceWith(this.tags, other.tags, (ours, theirs) => ours.equivalent(theirs)).length === 0
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

  /**
   * Iterator over the top-level parsed HED groups in this HED tag group.
   *
   * @yield {ParsedHedTag} This tag group's top-level HED groups.
   */
  *topLevelGroupIterator() {
    for (const innerTag of this.tags) {
      if (innerTag instanceof ParsedHedGroup) {
        yield innerTag
      }
    }
  }
}
