/** This module holds the class for encapsulating the rules for "Reserved" tags.
 * @module parser/reservedChecker
 */
import reservedTags from '../data/json/reservedTags.json'
import { generateIssue, IssueError } from '../issues/issues'
import { getTagListString } from './parseUtils'

export class ReservedChecker {
  /**
   * Singleton instance of ReservedChecker.
   * @type {ReservedChecker}
   * @private
   */
  static _instance = undefined
  static reservedMap = new Map(Object.entries(reservedTags))

  constructor() {
    if (ReservedChecker._instance) {
      IssueError.generateAndThrowInternalError('Use ReservedChecker.getInstance() to get an instance of this class.')
    }

    this._initializeReservedTags()
  }

  // Static method to control access to the singleton instance
  static getInstance() {
    if (!ReservedChecker._instance) {
      ReservedChecker._instance = new ReservedChecker()
    }
    return ReservedChecker._instance
  }

  _initializeReservedTags() {
    this.reservedNames = new Set(ReservedChecker.reservedMap.keys())
    this.requireValueTags = ReservedChecker._getReservedTagsByProperty('requireValue')
    this.noExtensionTags = ReservedChecker._getReservedTagsByProperty('noExtension')
    this.requiresDefTags = ReservedChecker._getReservedTagsByProperty('requiresDef')
    this.timelineTags = ReservedChecker._getReservedTagsByProperty('requiresTimeline')
  }

  static _getReservedTagsByProperty(property) {
    return new Set(
      [...ReservedChecker.reservedMap.values()].filter((value) => value[property] === true).map((value) => value.name),
    )
  }

  /**
   * Perform syntactical checks on the provided HED string to detect violations.
   *
   * @param {ParsedHedString} hedString - The HED string to be checked.
   * @param {boolean} fullValidation - If true, perform full validation; otherwise, perform a quick check.
   * @returns {Issue[]} - An array of issues if violations are found otherwise, an empty array.
   */
  checkHedString(hedString, fullValidation) {
    const checks = [
      () => this.checkUnique(hedString),
      () => this.checkTagGroupLevels(hedString, fullValidation),
      () => this.checkTopGroupRequirements(hedString),
      () => this.checkNonTopGroups(hedString),
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
      if (uniqueNames.has(tag.schemaTag._name)) {
        return [generateIssue('multipleUniqueTags', { tag: tag.originalTag, string: hedString.hedString })]
      }
      uniqueNames.add(tag.schemaTag._name)
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
    const topGroupTags = hedString.topLevelGroupTags.flat()

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
   * Check the group conditions of the reserved tags. The top-level has already been verified.
   *
   * @param {ParsedHedString} hedString - The HED string to check for group conflicts.
   * @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
   *
   * Notes: These include the number of groups and top tag compatibility in the group
   */
  checkTopGroupRequirements(hedString) {
    const issues = []
    for (const group of hedString.tagGroups) {
      const reservedTags = [...group.reservedTags.values()].flat()
      for (const reservedTag of reservedTags) {
        const nextIssues = this._checkGroupRequirements(group, reservedTag)
        issues.push(...nextIssues)
        // If an error is found in this group -- there is no point looking for more.
        if (nextIssues.length > 0) {
          break
        }
      }
    }
    return issues
  }

  /**
   * Check the group tag requirements of a reserved Tag.
   * @param {ParsedHedGroup} group - The group to check for tag requirements.
   * @param {ParsedHedTag} reservedTag - A top-level reserved tag in group.
   * @returns {Issue[]} - Returns an issue if the group requirements for this tag are not met.
   */
  _checkGroupRequirements(group, reservedTag) {
    // Check that groups with tags that require a definition, have one.
    if (group.requiresDefTag.length > 0 && group.defCount !== 1) {
      return [
        generateIssue('temporalWithWrongNumberDefs', { tag: group.requiresDefTag[0], tagGroup: group.originalTag }),
      ]
    }

    const reservedRequirements = ReservedChecker.reservedMap.get(reservedTag.schemaTag.name)

    // Check that only allowed tags are at the top level.
    const issues = this._checkAllowedTags(group, reservedTag, reservedRequirements)
    if (issues.length > 0) {
      return issues
    }
    issues.push(...this._checkAllowedGroups(group, reservedTag, reservedRequirements))
    return issues
  }

  /**
   * Verify that the tags in the group are allowed with the reserved tag.
   *
   * @param {ParsedHedGroup} group - The enclosing tag group.
   * @param {ParsedHedTag} reservedTag - The reserved tag whose tag requirements are to be checked.
   * @param {Object} requirements - The requirements for this reserved tag.
   * @returns {Issue[]} - Issues because
   * @private
   */
  _checkAllowedTags(group, reservedTag, requirements) {
    // The allowed tag requirement isn't applicable
    if (requirements.otherAllowedNonDefTags === null || requirements.otherAllowedNonDefTags === undefined) {
      return []
    }
    // Check for def or def-expand tags for a reserved tag that does not need them.
    if (!requirements.requiresDef && group.requiresDefTag.length === 0 && group.defCount > 0) {
      return [generateIssue('tooManyGroupTopTags', { string: group.originalTag })]
    }

    // Isolate the other top tags.
    const otherTopTags = group.topTags.filter((tag) => tag !== reservedTag)
    if (otherTopTags.length === 0) {
      return []
    }

    const encountered = new Set()
    for (const tag of otherTopTags) {
      if (encountered.has(tag.schemaTag.name)) {
        return [generateIssue('tooManyGroupTopTags', { string: group.originalTag })]
      }
      encountered.add(tag.schemaTag.name)
      if (tag.schemaTag.name === 'Def' && group.requiresDefTag.length !== 0) {
        continue
      }
      // This tag is not allowed with the reserved tag
      if (!requirements.otherAllowedNonDefTags.includes(tag.schemaTag.name)) {
        return [
          generateIssue('invalidGroupTopTags', { tags: getTagListString(group.topTags), string: group.originalTag }),
        ]
      }
    }
    return []
  }

  /**
   * Verify the group conditions are satisfied for a reserved tag.
   *
   * @param {ParsedHedGroup} group - The enclosing tag group.
   * @param {ParsedHedTag} reservedTag - The reserved tag whose tag requirements are to be checked.
   * @param {Object} requirements - The requirements for this reserved tag.
   * @returns {Issue[]}
   * @private
   */
  _checkAllowedGroups(group, reservedTag, requirements) {
    // Proper Def and Def-expand count for a tag that requires a def is checked when group is created.
    let defAdjustment = 0
    if (group.defExpandChildren.length !== 0 && group.requiresDefTag.length > 0) {
      defAdjustment = 1
    }

    // Check the group does not have more than the maximum allowed subgroups.
    const maxLimit = requirements.maxNonDefSubgroups != null ? requirements.maxNonDefSubgroups : Infinity
    if (group.topGroups.length - defAdjustment > maxLimit) {
      return [generateIssue('invalidNumberOfSubgroups', { tag: reservedTag.originalTag, string: group.originalTag })]
    }

    // Check that the group has the correct minimum number of subgroups.
    return this._checkMinGroupCount(group, reservedTag, requirements.minNonDefSubgroups, defAdjustment)
  }

  /**
   * Verify that a group has the minimum required subgroups for its reserved tag.
   * @param {ParsedHedGroup} group - The group to be checked.
   * @param {ParsedHedTag} reservedTag - The reserved tags whose requirements are used.
   * @param {Number | null} minLimit - The minimum number of non-def groups required or null if no requirement.
   * @param {Number} defAdjustment - Either 0 or 1 depending on whether a def-expand is included.
   * @returns {Issue[]} - Returns an issue list if the count requirement is violated.
   * @private
   */
  _checkMinGroupCount(group, reservedTag, minLimit, defAdjustment) {
    if (minLimit === null) {
      return []
    }
    let nonEmptyGroups = 0
    for (const subGroup of group.topGroups) {
      if (subGroup.allTags.length > 0) {
        nonEmptyGroups += 1
      }
    }
    if (nonEmptyGroups < minLimit + defAdjustment) {
      return [generateIssue('invalidNumberOfSubgroups', { tag: reservedTag.originalTag, string: group.originalTag })]
    }

    return []
  }

  /** Verify that there are no group tags at the top level of the string.
   *
   * @param {ParsedHedString} hedString - The HED string to be checked.
   * @returns {Issue[]} - Returns issue list if there are top level tags that are group tags.
   */
  checkNonTopGroups(hedString) {
    const group_tags = hedString.tags.filter(
      (tag) => ReservedChecker.hasGroupAttribute(tag) && tag in hedString.topLevelTags,
    )
    if (group_tags.length > 0) {
      return [generateIssue('missingTagGroup', { tag: getTagListString(group_tags) })]
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
    return tag.schemaTag.hasAttribute('tagGroup')
  }
}
