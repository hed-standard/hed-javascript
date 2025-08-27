/** This module holds the class for representing a HED group.
 * @module parser/parsedHedGroup
 */
import differenceWith from 'lodash/differenceWith'
import { IssueError } from '../issues/issues'
import ParsedHedSubstring from './parsedHedSubstring'
import ParsedHedTag from './parsedHedTag'
import ParsedHedColumnSplice from './parsedHedColumnSplice'
import { ReservedChecker } from './reservedChecker'
import { filterByClass, categorizeTagsByName, getDuplicates, filterByTagName } from './parseUtils'

/**
 * A parsed HED tag group.
 */
export default class ParsedHedGroup extends ParsedHedSubstring {
  /**
   * The parsed HED tags, groups, or splices in the HED tag group at the top level.
   * @type {import('./parsedHedSubstring.js').default[]}
   */
  tags

  /**
   * The top-level parsed HED tags in this string.
   * @type {ParsedHedTag[]}
   */
  topTags

  /**
   * The top-level parsed HED groups in this string.
   * @type {ParsedHedGroup[]}
   */
  topGroups

  /**
   * The top-level column splices in this string
   * @type {import('./parsedHedColumnSplice.js').ParsedHedColumnSplice[]}
   */
  topSplices

  /**
   * All the parsed HED tags in this string.
   * @type {ParsedHedTag[]}
   */
  allTags

  /**
   * Reserved HED group tags. This only covers top group tags in the group.
   * @type {Map<string, ParsedHedTag[]>}
   */
  reservedTags

  /**
   * The top-level child subgroups containing Def-expand tags.
   * @type {ParsedHedGroup[]}
   */
  defExpandChildren

  /**
   * The top-level Def tags
   * @type {ParsedHedTag[]}
   */
  defTags

  /**
   * The top-level Def-expand tags
   * @type {ParsedHedTag[]}
   */
  defExpandTags

  /**
   * True if this group has a Definition tag at the top level.
   * @type {boolean}
   */
  isDefinitionGroup

  /**
   * The total number of top-level Def tags and top-level Def-expand groups.
   * @type {Number}
   */
  defCount

  /**
   * The unique top-level tag requiring a Def or Def-expand group, if any.
   * @type {import('./parsedHedTag.js').default[] | null}
   */
  requiresDefTag

  /**
   * Constructor.
   * @param {import('./parsedHedSubstring.js').default[]} parsedHedTags The parsed HED tags, groups or column splices in the HED tag group.
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

  /**
   * Recursively create a list of all the tags in this group.
   * @returns {ParsedHedTag[]}
   * @private
   */
  _getAllTags() {
    const subgroupTags = this.topGroups.flatMap((tagGroup) => tagGroup.allTags)
    return this.topTags.concat(subgroupTags)
  }

  /**
   * Sets information about the reserved tags, particularly definition-related tags in this group.
   * @private
   */
  _initializeGroups() {
    const reserved = ReservedChecker.getInstance()
    this.reservedTags = categorizeTagsByName(this.topTags, reserved.reservedNames)
    this.defExpandTags = this._filterTopTagsByTagName('Def-expand')
    this.definitionTags = this._filterTopTagsByTagName('Definition')
    this.defExpandChildren = this._filterSubgroupsByTagName('Def-expand')
    this.defTags = this._filterTopTagsByTagName('Def')
    this.defCount = this.defTags.length + this.defExpandChildren.length
    this.isDefinitionGroup = this.definitionTags.length > 0
    this.requiresDefTag = [...this.reservedTags.entries()]
      .filter((pair) => reserved.requiresDefTags.has(pair[0]))
      .flatMap((pair) => pair[1]) // Flatten the values into a single list
  }

  /**
   * Filter top tags by tag name.
   *
   * @param {string} tagName - The schemaTag name to filter by.
   * @returns {import('./parsedHedTag.js').default[]} An array of top-level tags with the given name.
   * @private
   *
   */
  _filterTopTagsByTagName(tagName) {
    return this.topTags.filter((tag) => tag.schemaTag._name === tagName)
  }

  /**
   * Filter top subgroups that include a tag at the top-level of the group.
   *
   * @param {string} tagName - The schemaTag name to filter by.
   * @returns {ParsedHedGroup[]} Array of subgroups containing the specified tag.
   * @private
   */
  _filterSubgroupsByTagName(tagName) {
    return Array.from(this.topLevelGroupIterator()).filter((subgroup) =>
      subgroup.topTags.some((tag) => tag.schemaTag.name === tagName),
    )
  }

  /**
   * Nicely format this tag group.
   *
   * @param {boolean} long Whether the tags should be in long form.
   * @returns {string} The formatted tag group.
   */
  format(long = true) {
    return '(' + this.tags.map((substring) => substring.format(long)).join(', ') + ')'
  }

  /**
   * Determine if this group is equivalent to another.
   *
   * @param {ParsedHedGroup} other The other group.
   * @returns {boolean} Whether the two groups are equivalent.
   */
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
   * Return a normalized string representation
   * @returns {string} The normalized string representation of this group.
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
   * Override of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString | Object.prototype.toString}.
   *
   * @returns {string} The original string for this group.
   */
  toString() {
    return this.originalTag
  }

  /**
   * Iterator over the ParsedHedGroup objects in this HED tag group.
   * @param {string | null} tagName - The name of the tag whose groups are to be iterated over or null if all tags.
   * @yields {ParsedHedGroup} This object and the ParsedHedGroup objects belonging to this tag group.
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
   * @yields {import('./parsedHedTag.js').default} This tag group's HED tags.
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
   * @yields {import('./parsedHedColumnSplice.js').ParsedHedColumnSplice} This tag group's HED column splices.
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
   * @yields {ParsedHedGroup} This tag group's top-level HED groups.
   */
  *topLevelGroupIterator() {
    for (const innerTag of this.tags) {
      if (innerTag instanceof ParsedHedGroup) {
        yield innerTag
      }
    }
  }
}
