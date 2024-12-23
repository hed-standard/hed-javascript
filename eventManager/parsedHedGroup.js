import differenceWith from 'lodash/differenceWith'

import { IssueError } from '../common/issues/issues'
import ParsedHedSubstring from './parsedHedSubstring'
import ParsedHedTag from './parsedHedTag'
import ParsedHedColumnSplice from './parsedHedColumnSplice'
import { SpecialChecker } from './special'
import {
  filterByClass,
  categorizeTagsByName,
  getDuplicates,
  filterByTagName,
  filterTagMapByNames,
  getTagListString,
} from './parseUtils'

/**
 * A parsed HED tag group.
 */
export default class ParsedHedGroup extends ParsedHedSubstring {
  /**
   * The parsed HED tags or parsedHedGroups or parsedColumnSplices in the HED tag group at the top level
   * @type {ParsedHedSubstring[]}
   */
  tags

  topTags

  topGroups

  topSplices

  allTags
  /**
   * Any HED tags with special handling. This only covers top-level tags in the group
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

  isDefExpandGroup

  isDefinitionGroup

  defCount

  requiresDefTag

  /**
   * Constructor.
   * @param {ParsedHedSubstring[]} parsedHedTags The parsed HED tags, groups or column splices in the HED tag group.
   * @param {string} hedString The original HED string.
   * @param {number[]} originalBounds The bounds of the HED tag in the original HED string.
   */
  constructor(parsedHedTags, hedString, originalBounds) {
    const originalTag = hedString.substring(originalBounds[0], originalBounds[1])
    super(originalTag, originalBounds)
    this.tags = parsedHedTags
    this.topGroups = filterByClass(parsedHedTags, ParsedHedGroup)
    this.topTags = filterByClass(parsedHedTags, ParsedHedTag)
    this.topSplices = filterByClass(parsedHedTags, ParsedHedColumnSplice)
    this.allTags = this._getAllTags()
    this._normalized = undefined
    this._initializeGroups()
  }

  _getAllTags() {
    const subgroupTags = this.topGroups.flatMap((tagGroup) => tagGroup.allTags)
    return this.topTags.concat(subgroupTags)
  }

  _initializeGroups() {
    const special = SpecialChecker.getInstance()
    this.specialTags = categorizeTagsByName(this.topTags, special.specialNames)
    this.isDefExpandGroup = this.specialTags.has('Def-expand')
    this.isDefinitionGroup = this.specialTags.has('Definition')
    this.defExpandChildren = this._filterSubgroupsByTagName('Def-expand')
    this.hasDefExpandChildren = this.defExpandChildren.length !== 0
    this.defCount = this.getSpecial('Def').length + this.defExpandChildren.length
    this.requiresDefTag = this._getRequiresDefTag(special.requiresDefTags)
  }

  /**
   * Filter top subgroups that include a special at the top-level of the group
   *
   * @param {string} tagName - The schemaTag name to filter by.
   * @returns {Array} - Array of subgroups containing the specified tag.
   */
  _filterSubgroupsByTagName(tagName) {
    return Array.from(this.topLevelGroupIterator()).filter((subgroup) => subgroup.specialTags.has(tagName))
  }

  /**
   * Return the unique requiresDef tag associated with this group (if any).
   * @param {string[]} tagNames - The list of requiresDef tag names to use (based on the special tag requirements).
   * @returns {ParsedHedTag | null} - The parsed requiresDef tag (if any) or null.
   * @throws {IssueError} - If there are too many or too few defs or too many requiresDef tags in this group.
   * @private
   */
  _getRequiresDefTag(tagNames) {
    const requiresDefTags = filterTagMapByNames(this.specialTags, tagNames)
    if (requiresDefTags.length > 1) {
      IssueError.generateAndThrow('multipleRequiresDefTags', {
        tags: getTagListString(requiresDefTags),
        string: this.originalTag,
      })
    }
    if (requiresDefTags.length === 0) {
      return null
    }
    if (this.defCount > 1) {
      return [
        IssueError.generateAndThrow('temporalWithWrongNumberDefs', {
          tag: requiresDefTags[0].originalTag,
          tagGroup: this.originalTag,
        }),
      ]
    }
    if (this.topSplices.length === 0 && this.defCount === 0) {
      return [
        IssueError.generateAndThrow('temporalWithWrongNumberDefs', {
          tag: requiresDefTags[0].originalTag,
          tagGroup: this.originalTag,
        }),
      ]
    }
    return requiresDefTags[0]
  }

  /**
   * Nicely format this tag group.
   *
   * @param {boolean} long Whether the tags should be in long form.
   * @returns {string}
   */
  format(long = true) {
    return '(' + this.tags.map((substring) => substring.format(long)).join(', ') + ')'
  }

  getSpecial(tagName) {
    return this.specialTags.get(tagName) ?? []
  }

  isSpecialGroup(tagName) {
    return this.specialTags.has(tagName)
  }

  /**
   * Whether this HED tag group is an onset, offset, or inset group.
   * @returns {boolean}
   */
  get isTemporalGroup() {
    return this.isSpecialGroup('Onset') || this.isSpecialGroup('Offset') || this.isSpecialGroup('Inset')
  }

  /**
   * Whether this HED tag group is an onset, offset, or inset group.
   * @returns {string}
   */
  get temporalGroupName() {
    if (this.isSpecialGroup('Onset')) {
      return 'Onset'
    } else if (this.isSpecialGroup('Offset')) {
      return 'Offset'
    } else if (this.isSpecialGroup('Inset')) {
      return 'Inset'
    } else {
      return undefined
    }
  }

  equivalent(other) {
    if (!(other instanceof ParsedHedGroup)) {
      return false
    }
    const equivalence = (ours, theirs) => ours.equivalent(theirs)
    return (
      differenceWith(this.tags, other.tags, equivalence).length === 0 &&
      differenceWith(other.tags, this.tags, equivalence).length === 0
    )
  }

  /**
   * The deeply nested array of parsed tags.
   * @returns {ParsedHedTag[]}
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
   * Return a normalized string representation
   * @returns {string}
   */
  get normalized() {
    if (this._normalized) {
      return this._normalized
    }
    // Recursively normalize each item in the group
    const normalizedItems = this.tags.map((item) => item.normalized)

    // Sort normalized items to ensure order independence
    const sortedNormalizedItems = normalizedItems.sort()

    const duplicates = getDuplicates(sortedNormalizedItems)
    if (duplicates.length > 0) {
      IssueError.generateAndThrow('duplicateTag', {
        tags: '[' + duplicates.join('],[') + ']',
        string: this.originalTag,
      })
    }
    this._normalized = '(' + sortedNormalizedItems.join(',') + ')'
    // Return the normalized group as a string
    return `(${sortedNormalizedItems.join(',')})` // Using curly braces to indicate unordered group
  }

  /**
   * Iterator over the full HED groups and subgroups in this HED tag group.
   *
   * @yields {ParsedHedTag[]} The subgroups of this tag group.
   */
  *subGroupArrayIterator() {
    for (const innerTag of this.tags) {
      if (innerTag instanceof ParsedHedGroup) {
        yield* innerTag.subGroupArrayIterator()
      }
    }
    yield this.tags
  }

  /**
   * Iterator over the ParsedHedGroup objects in this HED tag group.
   * @param {string | null} tagName - The name of the tag whose groups are to be iterated over or null if all tags.
   * @yields {ParsedHedGroup} - This object and the ParsedHedGroup objects belonging to this tag group.
   */
  *subParsedGroupIterator(tagName = null) {
    if (!tagName || filterByTagName(this.topTags, tagName)) {
      yield this
    }
    for (const innerTag of this.tags) {
      if (innerTag instanceof ParsedHedGroup) {
        yield* innerTag.subParsedGroupIterator(tagName)
      }
    }
  }

  /**
   * Iterator over the parsed HED tags in this HED tag group.
   *
   * @yields {ParsedHedTag} This tag group's HED tags.
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
   * Iterator over the parsed HED column splices in this HED tag group.
   *
   * @yields {ParsedHedColumnSplice} This tag group's HED column splices.
   */
  *columnSpliceIterator() {
    for (const innerTag of this.tags) {
      if (innerTag instanceof ParsedHedColumnSplice) {
        yield innerTag
      } else if (innerTag instanceof ParsedHedGroup) {
        yield* innerTag.columnSpliceIterator()
      }
    }
  }

  /**
   * Iterator over the top-level parsed HED groups in this HED tag group.
   *
   * @yields {ParsedHedTag} This tag group's top-level HED groups.
   */
  *topLevelGroupIterator() {
    for (const innerTag of this.tags) {
      if (innerTag instanceof ParsedHedGroup) {
        yield innerTag
      }
    }
  }
}
