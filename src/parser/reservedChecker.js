/** This module holds the class for encapsulating the rules for "Reserved" tags.
 *
 * The rules come from src/data/json/reservedTags.json, a verbatim copy of the reserved_tags.json that the HED
 * specification publishes (section 3.2.8, fields defined in Appendix A.6). Every row applies in every standard
 * schema version >= 8.0.0, so no check here takes a version.
 *
 * @module parser/reservedChecker
 */
import { getTagListString } from './parseUtils'
import reservedTags from '../data/json/reservedTags.json'
import { generateIssue, IssueError } from '../issues/issues'

/**
 * The issues for a content error of a reserved-tag group, keyed by the governing row's ERROR_CODE (specification
 * 3.2.8 rule 6): a wrong anchor, a wrong number of inner groups, and a column splice in a group whose row has
 * allowSpliceInGroup false (every TEMPORAL_TAG_ERROR row allows splices). Each takes the governing tag, the group,
 * and the splice.
 */
const CONTENT_ISSUES = {
  DEFINITION_INVALID: {
    anchor: (tag, group) => generateIssue('invalidDefinitionGroupStructure', { tag: tag, tagGroup: group }),
    subgroups: (tag, group) => generateIssue('invalidDefinitionGroupStructure', { tag: tag, tagGroup: group }),
    splice: (tag, group, splice) =>
      generateIssue('curlyBracesInDefinition', { definition: tag.originalTag, sidecarKey: splice.originalTag }),
  },
  TAG_GROUP_ERROR: {
    anchor: (tag, group) => generateIssue('tooManyGroupTopTags', { string: group.originalTag }),
    subgroups: (tag, group) =>
      generateIssue('invalidNumberOfSubgroups', { tag: tag.originalTag, string: group.originalTag }),
    splice: (tag, group, splice) =>
      generateIssue('curlyBracesInReservedGroup', {
        tag: tag.originalTag,
        tagGroup: group.originalTag,
        splice: splice.originalTag,
      }),
  },
  TEMPORAL_TAG_ERROR: {
    anchor: (tag, group) =>
      generateIssue('temporalWithWrongNumberDefs', { tag: tag.originalTag, tagGroup: group.originalTag }),
    subgroups: (tag, group) =>
      generateIssue('temporalWithWrongNumberOfGroups', { tag: tag.originalTag, tagGroup: group.originalTag }),
  },
}

export class ReservedChecker {
  /**
   * Singleton instance of ReservedChecker.
   * @type {ReservedChecker}
   * @private
   */
  static _instance

  /**
   * The rows of the reserved-tag file, keyed by tag name.
   * @type {Map<string, Object>}
   */
  static reservedMap = new Map(Object.entries(reservedTags.tags))

  /**
   * The value forms of the tags whose value has two parts, keyed by tag name.
   * @type {Map<string, Object>}
   */
  static valueForms = new Map(Object.entries(reservedTags.valueForms))

  /**
   * @type {Set<string>}
   */
  reservedNames

  /**
   * @type {Set<string>}
   */
  requireValueTags

  /**
   * @type {Set<string>}
   */
  noExtensionTags

  /**
   * @type {Set<string>}
   */
  requiresDefTags

  /**
   * @type {Set<string>}
   */
  timelineTags

  /**
   * @type {Set<string>}
   */
  twoPartValueTags

  /**
   * Constructor. Use {@link ReservedChecker.getInstance} instead.
   *
   * @private
   */
  constructor() {
    if (ReservedChecker._instance) {
      IssueError.generateAndThrowInternalError('Use ReservedChecker.getInstance() to get an instance of this class.')
    }

    this.reservedNames = new Set(ReservedChecker.reservedMap.keys())
    this.requireValueTags = this._getReservedTagsByProperty('requireValue')
    this.noExtensionTags = this._getReservedTagsByProperty('noExtension')
    this.requiresDefTags = this._getReservedTagsByProperty('requiresDef')
    this.timelineTags = this._getReservedTagsByProperty('requiresTimeline')
    this.twoPartValueTags = new Set(ReservedChecker.valueForms.keys())
  }

  /**
   * Get the names of the reserved tags with a given property.
   *
   * @param {string} property - The property to check.
   * @returns {Set<string>} The names of the reserved tags whose row has the property set to true.
   * @private
   */
  _getReservedTagsByProperty(property) {
    return new Set(
      [...ReservedChecker.reservedMap.values()].filter((value) => value[property] === true).map((value) => value.name),
    )
  }

  /**
   * Static method to control access to the singleton instance.
   *
   * @returns {ReservedChecker} The singleton instance of this class.
   */
  static getInstance() {
    if (!ReservedChecker._instance) {
      ReservedChecker._instance = new ReservedChecker()
    }
    return ReservedChecker._instance
  }

  /**
   * Perform syntactical checks on the provided HED string to detect violations.
   *
   * @param {ParsedHedString} hedString - The HED string to be checked.
   * @param {boolean} fullValidation - If true, perform full validation; otherwise, perform a quick check.
   * @returns {Issue[]} An array of issues if violations are found otherwise, an empty array.
   */
  checkHedString(hedString, fullValidation) {
    const checks = [
      () => this.checkUnique(hedString),
      () => this.checkTagGroupLevels(hedString, fullValidation),
      () => this.checkTopGroupRequirements(hedString),
    ]
    for (const check of checks) {
      const issues = check()
      if (issues.length > 0) {
        return issues
      }
    }
    return []
  }

  /**
   * Check for tags with the unique attribute.
   *
   * @param {ParsedHedString} hedString - The HED string to be checked for tags with the unique attribute.
   * @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
   */
  checkUnique(hedString) {
    const uniqueTags = hedString.tags.filter((tag) => tag.hasAttribute('unique'))
    const uniqueNames = new Set()
    for (const tag of uniqueTags) {
      if (uniqueNames.has(tag.schemaTag.name)) {
        return [generateIssue('multipleUniqueTags', { tag: tag.originalTag, string: hedString.hedString })]
      }
      uniqueNames.add(tag.schemaTag.name)
    }
    return []
  }

  /**
   * Check whether tags are not in groups -- or top-level groups as required
   *
   * @param {ParsedHedString} hedString - The HED string to be checked for reserved tag syntax.
   * @param {boolean} fullValidation - If true, perform full validation; otherwise, perform a quick check.
   * @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
   */
  checkTagGroupLevels(hedString, fullValidation) {
    const issues = []
    const topGroupTags = hedString.topLevelGroupTags

    // Check for top-level violations because tag is deep
    hedString.tags.forEach((tag) => {
      // If in a top group -- no problem regardless of tag group or top group attribute
      if (topGroupTags.includes(tag)) {
        return
      }

      // This is a top-level tag group tag that is in a lower level or ungrouped top level
      if (
        ReservedChecker.hasTopLevelTagGroupAttribute(tag) &&
        (!hedString.topLevelTags.includes(tag) || fullValidation)
      ) {
        issues.push(
          generateIssue('invalidTopLevelTagGroupTag', {
            tag: tag.originalTag,
            string: hedString.hedString,
          }),
        )
        return
      }

      // In final form --- if not in a group (not just a top group) but has the group tag attribute
      if (hedString.topLevelTags.includes(tag) && ReservedChecker.hasGroupAttribute(tag) && fullValidation) {
        issues.push(generateIssue('missingTagGroup', { tag: tag.originalTag, string: hedString.hedString }))
      }
    })
    return issues
  }

  /**
   * Check the group rules of the reserved tags. The levels have already been verified.
   *
   * @param {ParsedHedString} hedString - The HED string to check for group conflicts.
   * @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
   *
   * Notes: Each group is checked against the row of its governing tag: the number of anchors and inner groups and
   * the other tags allowed at its top level.
   */
  checkTopGroupRequirements(hedString) {
    const issues = []
    for (const group of hedString.tagGroups) {
      const reservedTags = [...group.reservedTags.values()].flat()
      if (reservedTags.length > 0) {
        issues.push(...this._checkGroupRequirements(group, reservedTags))
      }
    }
    return issues
  }

  /**
   * Return the reserved tag whose row gives the group rules (specification 3.2.8 rule 3).
   *
   * @param {ParsedHedTag[]} reservedTags - The top-level reserved tags of one group.
   * @returns {ParsedHedTag|null} The only tag or, for two tags of which one lists the other in its secondaryWith,
   *     that other tag; null for any other combination, which cannot share a group.
   */
  static getGoverningTag(reservedTags) {
    if (reservedTags.length === 1) {
      return reservedTags[0]
    }
    if (reservedTags.length !== 2) {
      return null
    }
    const [first, second] = reservedTags
    if (ReservedChecker._isSecondaryWith(first, second)) {
      return second
    }
    if (ReservedChecker._isSecondaryWith(second, first)) {
      return first
    }
    return null
  }

  /**
   * Indicate whether a reserved tag is secondary beside another reserved tag.
   *
   * @param {ParsedHedTag} secondary - The reserved tag that may be secondary.
   * @param {ParsedHedTag} primary - The other reserved tag of the group.
   * @returns {boolean} True if the row of secondary lists primary in its secondaryWith.
   * @private
   */
  static _isSecondaryWith(secondary, primary) {
    const secondaryWith = ReservedChecker.reservedMap.get(secondary.schemaTag.name).secondaryWith ?? []
    return secondaryWith.includes(primary.schemaTag.name)
  }

  /**
   * Check a group against the row of its governing tag.
   *
   * @param {ParsedHedGroup} group - The group to check for tag requirements.
   * @param {ParsedHedTag[]} reservedTags - The top-level reserved tags in group.
   * @returns {Issue[]} - Returns an issue if the group requirements are not met.
   *
   * Notes:
   *  - A content error (a column splice where none is allowed, the anchor, the number of inner groups) carries the
   *    row's ERROR_CODE; a top-level tag the row does not allow is a placement error, reported as TAG_GROUP_ERROR
   *    (specification 3.2.8 rule 6).
   *  - A group holding a column splice anywhere is checked again on the assembled annotation, after substitution
   *    (rule 5), so what the substitution may repair is not an error here: a missing anchor, too few inner
   *    groups, an inner group that holds only a splice (it fills or vanishes), and an anchor beside a tag whose
   *    row is secondary to one that requires an anchor (the splice may supply that tag). The checks that no
   *    substitution can repair are made: a splice where none is allowed, more than one anchor, a disallowed
   *    tag, too many inner groups that cannot vanish.
   * @private
   */
  _checkGroupRequirements(group, reservedTags) {
    const governingTag = ReservedChecker.getGoverningTag(reservedTags)
    if (governingTag === null) {
      return [
        generateIssue('invalidGroupTopTags', { tags: getTagListString(group.topTags), string: group.originalTag }),
      ]
    }
    const row = ReservedChecker.reservedMap.get(governingTag.schemaTag.name)
    const contentIssues = CONTENT_ISSUES[row.ERROR_CODE]
    const deferred = !group.columnSpliceIterator().next().done

    // A column splice anywhere in a group whose row does not allow one (rule 5).
    if (!row.allowSpliceInGroup) {
      const splices = [...group.columnSpliceIterator()]
      if (splices.length > 0) {
        return [contentIssues.splice(governingTag, group, splices[0])]
      }
    }

    // The anchor: exactly one Def tag or Def-expand group, or none at the top level of the group (rule 2). A
    // splice may supply a tag that takes over the group (Onset beside Delay), so until then a row that can be
    // secondary tolerates one anchor.
    const anchorCount = group.defCount
    const mayGainGovernor = deferred && (row.secondaryWith ?? []).length > 0
    const anchorsAllowed = row.requiresDef || mayGainGovernor ? 1 : 0
    if (anchorCount > anchorsAllowed || (row.requiresDef && anchorCount === 0 && !deferred)) {
      return [contentIssues.anchor(governingTag, group)]
    }

    // Only the tags of the row's otherAllowedNonDefTags may stand beside the governing tag and its anchor.
    const otherTags = group.topTags.filter((tag) => tag !== governingTag && !group.defTags.includes(tag))
    if (otherTags.some((tag) => !row.otherAllowedNonDefTags.includes(tag.schemaTag.name))) {
      return [
        generateIssue('invalidGroupTopTags', { tags: getTagListString(group.topTags), string: group.originalTag }),
      ]
    }

    // The inner groups, not counting a Def-expand anchor group. An inner group that holds only splices may fill
    // or vanish (an n/a column removes it), so only groups with a tag count toward the maximum before assembly.
    const innerGroups = group.topGroups.filter((subgroup) => !group.defExpandChildren.includes(subgroup))
    const stableGroups = innerGroups.filter((subgroup) => subgroup.allTags.length > 0)
    const maxLimit = row.maxNonDefSubgroups ?? Infinity
    if (stableGroups.length > maxLimit) {
      return [contentIssues.subgroups(governingTag, group)]
    }
    if (!deferred && innerGroups.length < row.minNonDefSubgroups) {
      return [contentIssues.subgroups(governingTag, group)]
    }
    return []
  }

  /**
   * Indicate whether a tag should be a top-level tag.
   *
   * @param {ParsedHedTag} tag - HED tag to check for top-level requirements.
   * @returns {boolean} If true, the tag is required to be at the top level.
   *
   * Note: This check both the reserved requirements and the 'topLevelTagGroup' attribute in the schema.
   *
   */
  static hasTopLevelTagGroupAttribute(tag) {
    return (
      tag.schemaTag.hasAttribute('topLevelTagGroup') ||
      (ReservedChecker.reservedMap.has(tag.schemaTag.name) &&
        ReservedChecker.reservedMap.get(tag.schemaTag.name).topLevelTagGroup)
    )
  }

  /**
   * Return a boolean indicating whether a tag is required to be in a tag group.
   *
   * @param {ParsedHedTag} tag - The HED tag to be checked.
   * @returns {boolean} If true, this indicates that tag must be in a tag group.
   *
   * Note:  This checks both reserved and schema tag requirements.
   */
  static hasGroupAttribute(tag) {
    return (
      tag.schemaTag.hasAttribute('tagGroup') || ReservedChecker.reservedMap.get(tag.schemaTag.name)?.tagGroup === true
    )
  }
}
