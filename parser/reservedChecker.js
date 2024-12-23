import specialTags from '../data/json/reservedTags.json'
import { generateIssue } from '../common/issues/issues'
import { filterTagMapByNames, getTagListString } from './parseUtils'

export class ReservedChecker {
  static instance = null
  static reservedMap = new Map(Object.entries(specialTags))

  constructor() {
    if (ReservedChecker.instance) {
      throw new Error('Use ReservedChecker.getInstance() to get an instance of this class.')
    }

    this._initializeSpecialTags()
  }

  // Static method to control access to the singleton instance
  static getInstance() {
    if (!ReservedChecker.instance) {
      ReservedChecker.instance = new ReservedChecker()
    }
    return ReservedChecker.instance
  }

  _initializeSpecialTags() {
    this.specialNames = new Set(ReservedChecker.reservedMap.keys())
    this.requireValueTags = ReservedChecker._getSpecialTagsByProperty('requireValue')
    this.noExtensionTags = ReservedChecker._getSpecialTagsByProperty('noExtension')
    this.allowTwoLevelValueTags = ReservedChecker._getSpecialTagsByProperty('allowTwoLevelValue')
    this.topGroupTags = ReservedChecker._getSpecialTagsByProperty('topLevelTagGroup')
    this.requiresDefTags = ReservedChecker._getSpecialTagsByProperty('requiresDef')
    this.groupTags = ReservedChecker._getSpecialTagsByProperty('tagGroup')
    this.exclusiveTags = ReservedChecker._getSpecialTagsByProperty('exclusive')
    this.temporalTags = ReservedChecker._getSpecialTagsByProperty('isTemporalTag')
    this.noSpliceInGroup = ReservedChecker._getSpecialTagsByProperty('noSpliceInGroup')
    this.hasForbiddenSubgroupTags = new Set(
      [...ReservedChecker.reservedMap.values()]
        .filter((value) => value.forbiddenSubgroupTags.length > 0)
        .map((value) => value.name),
    )
  }

  static _getSpecialTagsByProperty(property) {
    return new Set(
      [...ReservedChecker.reservedMap.values()].filter((value) => value[property] === true).map((value) => value.name),
    )
  }

  /**
   * Perform syntactical checks on the provided HED string to detect violations.
   *
   * @param {ParsedHedString} hedString - The HED string to be checked.
   * @param {boolean} fullCheck - If true, assumes that all splices have been resolved.
   * @returns {Issue[]} An array of issues if violations are found otherwise, an empty array.
   */
  checkHedString(hedString, fullCheck) {
    const checks = [
      () => this.spliceCheck(hedString, fullCheck),
      () => this.checkUnique(hedString),
      () => this.checkTagGroupLevels(hedString, fullCheck),
      () => this.checkExclusive(hedString),
      () => this.checkNoSpliceInGroupTags(hedString),
      () => this.checkTopGroupRequirements(hedString, fullCheck),
      () => this.checkForbiddenGroups(hedString),
      () => this.checkNonTopGroups(hedString, fullCheck),
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
   * Check whether column splices are allowed
   *
   * @param {ParsedHedString} hedString - The HED string to check for splice conflicts.
   * @param {boolean} fullCheck - If true, then column splices should have been resolved.
   * @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
   */
  spliceCheck(hedString, fullCheck) {
    if (hedString.columnSplices.length === 0) {
      // No column splices in string so skip test
      return []
    }

    // If doing a full-check, column splices should be resolved
    if (fullCheck || hedString.tags.some((tag) => this.exclusiveTags.has(tag.schemaTag._name))) {
      return [generateIssue('curlyBracesNotAllowed', { string: hedString.hedString })]
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
   * @param {ParsedHedString} hedString - The HED string to be checked for special tag syntax.
   * @param {boolean} fullCheck - If true, can assume that no column splices are around.
   * @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
   */
  checkTagGroupLevels(hedString, fullCheck) {
    const issues = []
    const topGroupTags = hedString.topLevelGroupTags
    hedString.tags.forEach((tag) => {
      // Check for top-level violations because tag is deep
      if (ReservedChecker.hasTopLevelTagGroupAttribute(tag)) {
        //Tag is in a top-level tag group
        if (topGroupTags.includes(tag)) {
          return
        }

        // Check the top-level tag requirements
        if (!hedString.topLevelTags.includes(tag) || (fullCheck && hedString.topLevelTags.includes(tag))) {
          issues.push(
            generateIssue('invalidTopLevelTagGroupTag', { tag: tag.originalTag, string: hedString.hedString }),
          )
          return
        }
      }

      // In final form --- if not in a group (not just a top group) but has the group tag attribute
      if (fullCheck && hedString.topLevelTags.includes(tag) && ReservedChecker.hasGroupAttribute(tag)) {
        issues.push(generateIssue('missingTagGroup', { tag: tag.originalTag, string: hedString.hedString }))
      }
    })
    return issues
  }

  /**
   * Check the exclusive property (so far only for Definitions) - only groups of same kind allowed in string
   *
   * @param hedString {ParsedHedString} - the HED string to be checked.
   * @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
   *
   * Notes:  Can only be in a top group and with other top groups of the same kind
   */
  checkExclusive(hedString) {
    const exclusiveTags = hedString.tags.filter((tag) => this.exclusiveTags.has(tag.schemaTag._name))
    if (exclusiveTags.length === 0) {
      return []
    }

    // Exclusive tags don't allow splices and must be in groups
    if (hedString.topLevelTags.length > 0 || hedString.columnSplices.length > 0) {
      return [
        generateIssue('illegalInExclusiveContext', {
          tag: exclusiveTags[0].originalTag,
          string: hedString.hedString,
        }),
      ]
    }

    // Make sure that all the objects in exclusiveTags have same schema tag name - not an issue currently
    const badList = exclusiveTags.filter((tag) => tag.schemaTag._name !== exclusiveTags[0].schemaTag._name)
    if (badList.length > 0) {
      return [generateIssue('illegalExclusiveContext', { tag: badList[0].originalTag, string: hedString.hedString })]
    }
    return []
  }

  /**
   * Check that no splices appear with tags that don't allow spaced
   *
   * @param {ParsedHedString} hedString - the HED string to be checked for disallowed spices
   * @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
   */
  checkNoSpliceInGroupTags(hedString) {
    const topNoSpliceTags = hedString.topLevelTags.filter((tag) => this.noSpliceInGroup.has(tag.schemaTag._name))
    if (topNoSpliceTags.length > 0) {
      return [generateIssue('missingTagGroup', { tag: topNoSpliceTags[0].originalTag, string: hedString.hedString })]
    }
    const allSpliceTags = hedString.tags.filter((tag) => this.noSpliceInGroup.has(tag.schemaTag._name))
    if (allSpliceTags.length > 0 && hedString.columnSplices.length > 0) {
      return [generateIssue('curlyBracesNotAllowed', { string: hedString.hedString })]
    }
    return []
  }

  /**
   * Check the group conditions of the special tags. The top-level has already been verified.
   *
   * @param {ParsedHedString} hedString - The HED string to check for group conflicts.
   * @param {boolean} fullCheck - If true, no splices so the HED string is complete
   * @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
   *
   * Notes: These include the number of groups and top tag compatibility in the group
   */
  checkTopGroupRequirements(hedString, fullCheck) {
    const issues = []
    for (const group of hedString.tagGroups) {
      const specialTags = [...group.specialTags.values()].flat()
      for (const specialTag of specialTags) {
        const nextIssues = this._checkGroupRequirements(group, specialTag, fullCheck)
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
   * Check the group tag requirements of a special Tag
   * @param {ParsedHedGroup} group - the group to check for tag requirements
   * @param {ParsedHedTag} specialTag - a top-level special tag in group
   * @param { boolean} fullCheck - if True, assume this is the final version and all tags must be present
   * @returns {Issue[]}
   */
  _checkGroupRequirements(group, specialTag, fullCheck) {
    const specialRequirements = ReservedChecker.reservedMap.get(specialTag.schemaTag.name)
    const issues = this._checkAllowedTags(group, specialTag, specialRequirements.otherAllowedNonDefTags)
    if (issues.length > 0) {
      return issues
    }
    issues.push(...this._checkAllowedGroups(group, specialTag, specialRequirements, fullCheck))
    return issues
  }

  /**
   * Verify that the tags in the group are allowed with the special tag
   *
   * @param {ParsedHedGroup} group - The enclosing tag group
   * @param {ParsedHedTag} specialTag - The special tag whose tag requirements are to be checked
   * @param { string[]} otherAllowed - The list of tags that are allowed with this tag
   * @returns {Issue[]|[]}
   * @private
   */
  _checkAllowedTags(group, specialTag, otherAllowed) {
    if (otherAllowed === null || otherAllowed === undefined) {
      return []
    }
    const otherTopTags = group.topTags.filter((tag) => tag !== specialTag)
    if (otherTopTags.length === 0) {
      return []
    }
    const encountered = new Set()
    for (const tag of otherTopTags) {
      if (encountered.has(tag.schemaTag.name)) {
        return [generateIssue('tooManyGroupTopTags', { string: group.originalTag })]
      }
      encountered.add(tag.schemaTag.name)
      if (tag.schemaTag.name === 'Def' && group.requiresDefTag !== null) {
        continue
      }
      // This tag is not allowed with the special tag
      if (!otherAllowed.includes(tag.schemaTag.name)) {
        return [
          generateIssue('invalidGroupTopTags', { tags: getTagListString(group.topTags), string: group.originalTag }),
        ]
      }
    }
    return []
  }

  /**
   * Verify the group conditions
   *
   * @param {ParsedHedGroup} group - The enclosing tag group
   * @param {ParsedHedTag} specialTag - The special tag whose tag requirements are to be checked
   * @param { Object } requirements - The requirements for this special tag.
   * @param {boolean} fullCheck - If true, all splices have been resolved and everything should be there
   * @returns {Issue[]}
   * @private
   */
  _checkAllowedGroups(group, specialTag, requirements, fullCheck) {
    // Group checks are not applicable to this special tag
    if (!requirements.tagGroup) {
      return []
    }
    let subgroupCount = group.topGroups.length
    if (group.hasDefExpandChildren && group.requiresDefTag !== null) {
      subgroupCount = subgroupCount - 1
    }

    // Check maximum limit
    const maxLimit = requirements.maxNonDefSubgroups != null ? requirements.maxNonDefSubgroups : Infinity
    if (subgroupCount > maxLimit) {
      return [generateIssue('invalidNumberOfSubgroups', { tag: specialTag.originalTag, string: group.originalTag })]
    }

    // Check if you can't do more because of splices
    if (!fullCheck && group.topSplices.length > 0) {
      return []
    }

    // Check that it has the minimum number of subgroups
    const minLimit = requirements.minNonDefSubgroups != null ? requirements.minNonDefSubgroups : -Infinity
    if (fullCheck && subgroupCount < minLimit) {
      return [generateIssue('invalidNumberOfSubgroups', { tag: specialTag.originalTag, string: group.originalTag })]
    }
    return []
  }

  checkNonTopGroups(hedString, fullCheck) {
    if (!hedString.tags.some((tag) => this.groupTags.has(tag.schemaTag._name) && !this.topGroupTags.has(tag))) {
      return []
    }
    const issues = []
    for (const topGroup of hedString.tagGroups) {
      for (const group of topGroup.subParsedGroupIterator()) {
        const theseIssues = this._checkGroup(group, fullCheck)
        issues.push(...theseIssues)
        if (theseIssues.length > 0) {
          break
        }
      }
    }
    return issues
  }

  _checkGroup(group, fullCheck) {
    const specialTags = filterTagMapByNames(group.specialTags, this.groupTags)
    const notTopGroupTags = specialTags.filter((tag) => !this.topGroupTags.has(tag.schemaTag.name))
    for (const tag of notTopGroupTags) {
      const issues = this._checkGroupRequirements(group, tag, fullCheck)
      if (issues.length > 0) {
        return issues
      }
    }
    return []
  }

  /**
   * Check if there are conflicting subgroup tags.
   *
   * @param {ParsedHedString} hedString - the HED string to be checked.
   * @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
   */
  checkForbiddenGroups(hedString) {
    // Only do this if there are any tags in the string with forbidden tags.
    const hasForbidden = hedString.tags.filter((tag) => this.hasForbiddenSubgroupTags.has(tag.schemaTag.name))
    if (hasForbidden.length === 0) {
      return []
    }
    let forbiddenCount = hasForbidden.length
    for (const tag of hedString.topLevelTags) {
      if (!this.hasForbiddenSubgroupTags.has(tag.schemaTag.name)) {
        continue
      }
      // This tag has
      const forbidden = ReservedChecker.reservedMap.get(tag.schemaTag.name).forbiddenSubgroupTags
      for (const group of hedString.tagGroups) {
        if (group.allTags.some((tag) => forbidden.has(tag.schemaTag.name))) {
          return [
            generateIssue('forbiddenSubgroupTags', {
              tag: tag.originalTag,
              string: hedString.hedString,
              tagList: getTagListString(forbidden),
            }),
          ]
        }
      }
      forbiddenCount--
      if (forbiddenCount === 0) {
        return []
      }
    }
    const issues = []
    for (const group of hedString.tagGroups) {
      // Only check the group if there are tags with forbidden subgroup tags
      if (group.allTags.some((tag) => this.hasForbiddenSubgroupTags.has(tag.schemaTag.name))) {
        issues.push(...this._checkForbiddenGroup(group))
      }
    }
    return issues
  }

  /**
   * Check a group completely for forbidden tag conflicts such as a Def in a Definition group.
   *
   * @param {ParsedHedGroup} group - HED group to check for forbidden group conflicts.
   * @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
   *
   * Note: Returns in a given group as soon as it finds a conflict
   */
  _checkForbiddenGroup(group) {
    for (const subGroup of group.subParsedGroupIterator()) {
      // if this group does not have top tags with forbidden subgroups -- must go deeper
      const forbiddenTags = subGroup.topTags.filter((tag) => this.hasForbiddenSubgroupTags.has(tag.schemaTag._name))
      if (forbiddenTags.length === 0) {
        continue
      }

      // Check the tags in
      for (const tag of forbiddenTags) {
        const otherTags = subGroup.allTags.filter((otherTag) => otherTag !== tag)
        const badTags = otherTags.filter((otherTag) =>
          ReservedChecker.reservedMap.get(tag.schemaTag.name)?.forbiddenSubgroupTags.includes(otherTag.schemaTag.name),
        )

        if (badTags?.length > 0) {
          return [
            generateIssue('invalidGroupTags', {
              tags: getTagListString(badTags),
              string: subGroup.originalTag,
            }),
          ]
        }
      }
    }
    return []
  }

  /**
   * Indicate whether a tag should be a top-level tag.
   *
   * @param {ParsedHedTag} tag - HED tag to check for top-level requirements.
   * @returns {boolean} If true, the tag is required to be at the top level.
   *
   * Note: This check both the special requirements and the 'topLevelTagGroup' attribute in the schema.
   *
   */
  static hasTopLevelTagGroupAttribute(tag) {
    return (
      tag.hasAttribute('topLevelTagGroup') ||
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
   * Note:  This checks both special and schema tag requirements.
   */
  static hasGroupAttribute(tag) {
    return (
      tag.hasAttribute('tagGroup') ||
      (ReservedChecker.reservedMap.has(tag.schemaTag.name) &&
        ReservedChecker.reservedMap.get(tag.schemaTag.name).tagGroup)
    )
  }
}
