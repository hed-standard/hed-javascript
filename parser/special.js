import specialTags from '../data/json/specialTags.json'
import { generateIssue } from '../common/issues/issues'

const specialMap = new Map(Object.entries(specialTags))

export class SpecialChecker {
  /**
   * Map of properties for special tags.
   * @type {Object<string,*>}
   */
  specialMap
  specialNames
  requireValueTags
  allowTwoLevelValueTags
  specialGroupTags
  specialTopGroupTags
  exclusiveTags
  noSpliceInGroup
  hasForbiddenSubgroupTags

  constructor() {
    if (SpecialChecker.instance) {
      // eslint-disable-next-line no-constructor-return
      return SpecialChecker.instance
    }
    this.specialMap = specialMap
    this.specialNames = Array.from(specialMap.keys())
    this.requireValueTags = this._getSpecialTags('requireValue')
    this.allowTwoLevelValueTags = this._getSpecialTags('allowTwoLevelValue')
    this.specialGroupTags = this._getSpecialTags('tagGroup')
    this.specialTopGroupTags = this._getSpecialTags('topLevelTagGroup')
    this.exclusiveTags = this._getSpecialTags('exclusive')
    this.noSpliceInGroup = this._getSpecialTags('noSpliceInGroup')
    this.hasForbiddenSubgroupTags = Array.from(this.specialMap.values())
      .filter((value) => value.forbiddenSubgroupTags.length > 0)
      .map((value) => value.name)
    // eslint-disable-next-line no-constructor-return
    return this
  }

  _getSpecialTags(tagProperty) {
    return Array.from(this.specialMap.values())
      .filter((value) => value[tagProperty] === true)
      .map((value) => value.name)
  }

  /**
   * Do the checks that can be done a parse time to provide an early out.
   * @param {ParsedHedString} hedString to be checked for syntactical violations
   * @param {boolean} fullCheck if true may assume that all splices have been resolved in the string
   * @returns {Issues[]|[]}
   */
  checkHedString(hedString, fullCheck) {
    let issues = this.spliceCheck(hedString, fullCheck)
    if (issues.length > 0) {
      return issues
    }
    issues = this.checkTagGroupLevels(hedString, fullCheck)
    if (issues.length > 0) {
      return issues
    }

    issues = this.checkUnique(hedString) // Check if more than one tag with the unique attribute
    if (issues.length > 0) {
      return issues
    }

    // Now get down to checking special tags
    if (!fullCheck && !hedString.tags.some((tag) => this.specialNames.includes(tag.schemaTag.name))) {
      return []
    }

    issues = this.checkExclusive(hedString)
    if (issues.length > 0) {
      return issues
    }
    issues = this.checkSpecialTopGroups(hedString, fullCheck)
    if (issues.length > 0) {
      return issues
    }

    issues = this.checkNoSpliceInGroupTags(hedString)
    if (issues.length > 0) {
      return issues
    }

    return this.checkForbiddenGroups(hedString.tagGroups)
  }

  /**
   *  Check whether column splices are allowed
   *  @param {ParsedHedString} hedString - to be checked for splice conflicts
   *  @param {boolean} fullCheck - if true, then column splices should have been resolved
   *  @returns {Issue[]|[]} - issues with splices that can be detected
   */
  spliceCheck(hedString, fullCheck) {
    if (hedString.columnSplices.length === 0) {
      // No column splices in string so skip test
      return []
    }

    // If doing a full-check, column splices should be resolved
    if (fullCheck || hedString.tags.some((obj) => this.exclusiveTags.includes(obj.schemaTag._name))) {
      return [generateIssue('curlyBracesNotAllowed', { string: hedString.hedString })]
    }
    return []
  }

  /**
   * Check whether tags are not in groups -- or top-level groups as required
   *
   * @param {ParsedHedString} hedString -- parsed object to be checked for special tag syntax
   * @param {boolean} fullCheck -- if true, can assume that no column splices are around.
   * @returns {issues[]} -- the issues that occurred.
   */
  checkTagGroupLevels(hedString, fullCheck) {
    const issues = []
    const topGroupTags = hedString.topLevelGroupTags.flat()
    hedString.tags.forEach((tag) => {
      // Iterating over all tags in the string
      if (this.hasTopLevelTagGroupAttribute(tag)) {
        // Check for top-level violations because tag is deep
        if (topGroupTags.includes(tag)) {
          //Tag is in a top-level tag group
          return
        } else if (!hedString.topLevelTags.includes(tag) || (fullCheck && hedString.topLevelTags.includes(tag))) {
          issues.push(
            generateIssue('invalidTopLevelTagGroupTag', { tag: tag.originalTag, string: hedString.hedString }),
          )
          return
        }
      }
      // In final form --- if not in a group (not just a top group) but has the group tag attribute
      if (fullCheck && hedString.topLevelTags.includes(tag) && this.hasGroupAttribute(tag)) {
        issues.push(generateIssue('missingTagGroup', { tag: tag.originalTag, string: hedString.hedString }))
      }
    })
    return issues
  }

  /**
   * Check the exclusive property (so far only for Definitions) - only groups of same kind allowed in string
   * @param hedString {ParsedHedString} - the object to be checked
   * @returns {Issue[]|[]}
   *
   * Notes:  Can only be in a top group and with other top groups of the same kind
   */
  checkExclusive(hedString) {
    const exclusiveTags = hedString.tags.filter((obj) => this.exclusiveTags.includes(obj.schemaTag._name))
    if (exclusiveTags.length === 0) {
      return []
    }

    // Exclusive tags don't allow splices and must be in groups
    if (hedString.topLevelTags.length > 0) {
      return [
        generateIssue('illegalInExclusiveContext', {
          tag: exclusiveTags[0].originalTag,
          string: hedString.hedString,
        }),
      ]
    }

    // Make sure that all the objects in exclusiveTags have same schema tag name - not an issue currently
    const badList = exclusiveTags.filter((obj) => obj.schemaTag._name != exclusiveTags[0].schemaTag._name)
    if (badList.length > 0) {
      return [generateIssue('illegalExclusiveContext', { tag: badList[0].originalTag, string: hedString.hedString })]
    }
    return []
  }

  /**
   * Check the group conditions of the special tags. The top-level has already been verified
   * @param {ParsedHedString }hedString
   * @returns {Issues[]|[]}
   *
   * Notes: These include the number of groups and top tag compatibility in the group
   */
  checkSpecialTopGroups(hedString) {
    const issues = []
    for (const group of hedString.tagGroups) {
      const nextIssues = this.checkSpecialTopGroup(group)
      issues.push(...nextIssues)
    }
    return issues
  }

  /**
   * Check special group requirements for special top-level tags
   * @param {ParsedHedGroup} group to be checked for requirements
   * @returns {Issue[]|[]}
   *
   * Note:  This is a top-group check only
   */
  checkSpecialTopGroup(group) {
    const specialTags = group.topTags.filter((obj) => this.specialTopGroupTags.includes(obj.schemaTag.name))
    if (specialTags.length === 0) {
      return []
    } else if (specialTags.length >= group.topTags.length + 1) {
      // ASSUME that groups with special tags can only have other tags which are special or a Def //TODO fix when map is removed from specialTags
      return [generateIssue('invalidTagGroup', { tagGroup: group.originalTag })]
    } else if (group.isDefExpandGroup && group.topTags.length === 1 && group.topGroups.length <= 1) {
      // This group is a valid Def-expand group, and we don't have to check it further
      return []
    } else if (group.isDefExpandGroup || (group.hasDefExpandChildren && group.defExpandChildren.length > 1)) {
      // It is an invalid Def-expand group  or too many Def-expand subgroups
      return [generateIssue('invalidTagGroup', { tagGroup: group.originalTag })]
    } else if (group.hasDefExpandChildren && group.topTags.some((obj) => obj.schemaTag.name === 'Def')) {
      // It has both a Def tag and a Def-expand group --- which currently are not allowed
      return [generateIssue('invalidTagGroup', { tagGroup: group.originalTag })]
    }
    return this._checkSpecialTopGroup(group, specialTags)
  }

  /**
   * Check the details after the guard conditions have been handled
   * @param {ParsedHedGroup} group whose special tags are to be checked
   * @param {ParsedHedTag[]} specialTags tags in this group with special properties
   * @returns {[]|[Issue]}
   * @private
   */
  _checkSpecialTopGroup(group, specialTags) {
    const hasDef = group.topTags.some((obj) => obj.schemaTag.name === 'Def') || group.hasDefExpandChildren
    for (const sTag of specialTags) {
      const sTagReqs = this.specialMap.get(sTag.schemaTag.name)
      const otherTags = group.topTags.filter((obj) => obj !== sTag)
      const notAllowed = otherTags.filter((obj) => !sTagReqs.otherAllowedTags?.includes(obj.schemaTag.name))
      if (notAllowed.length > 0 || this.hasDuplicateNames(otherTags)) {
        // Make sure that there are not any duplicates in the allowed tags
        return [generateIssue('invalidTagGroup', { tagGroup: group.originalTag })]
      }

      if (!hasDef && sTagReqs.defTagRequired && group.topColumnSplices.length === 0) {
        // Make sure that the tag has a required definition grouped with it
        return [generateIssue('temporalWithoutDefinition', { tag: sTag.schemaTag.name, tagGroup: group.originalTag })]
      }

      const defExpandCount = sTagReqs.defTagRequired && group.hasDefExpandChildren ? 1 : 0
      const maxReq = (sTagReqs.maxNonDefSubgroups ?? Infinity) + defExpandCount
      if (group.topGroups.length > maxReq) {
        return [generateIssue('invalidTagGroup', { tagGroup: group.originalTag })]
      }
      if (group.topColumnSplices.length === 0 && group.topGroups.length < sTagReqs.minNonDefSubgroups) {
        // If no column splices, the minimum number is known
        return [generateIssue('invalidTagGroup', { tagGroup: group.originalTag })]
      }
    }
    return []
  }

  /**
   * This checks if there are conflicting subgroup tags.
   * @param {ParsedHedGroup} topGroups - the top groups in the HedString being checkec
   * @returns {Issues[]}
   */
  checkForbiddenGroups(topGroups) {
    const issues = []
    for (const group of topGroups) {
      if (group.hasForbiddenSubgroupTags) {
        issues.push(...this.checkForbiddenGroup(group))
      }
    }
    return issues
  }

  /**
   * Check a group completely for forbidden tag conflicts such as a Def in a Definition group
   * @param {ParsedHedGroup} group check for
   * @returns {Issue[]| []}
   *
   * Note: Returns in a given group as soon as it finds a conflict
   */
  checkForbiddenGroup(group) {
    for (const subGroup of group.subParsedGroupIterator()) {
      // Iterator includes this group
      const forbiddenTags = subGroup.topTags.filter((obj) =>
        this.hasForbiddenSubgroupTags.includes(obj.schemaTag._name),
      )
      // Handle the top level tags in the subgroup -- there can only be one tag if there is a forbidden tag.
      if (forbiddenTags.length > 1 || (forbiddenTags.length === 1 && subGroup.topTags.length > 1)) {
        return [
          generateIssue('invalidGroupTags', {
            tags: this.getTagListString(subGroup.topTags),
            string: subGroup.originalTag,
          }),
        ]
      }
      if (forbiddenTags.length === 1) {
        // We found one forbidden tag at the top level in this subgroup
        const forbiddenName = forbiddenTags[0].schemaTag._name
        const forbiddenSubgroupTags = this.specialMap.get(forbiddenName).forbiddenSubgroupTags
        const forbidden = subGroup.allSubgroupTags.filter((obj) => forbiddenSubgroupTags.includes(obj.schemaTag._name))
        if (forbidden.length > 0) {
          return [
            generateIssue('invalidGroupTags', { tags: this.getTagListString(forbidden), string: subGroup.originalTag }),
          ]
        }
      }
    }
    return []
  }

  /**
   * This checks for special tags that have no splice in group that no forbidden tags are in their subgroup
   *
   * @param {ParsedHedString} hedString to be checked
   * @returns {Issues[]}
   *
   * Notes: Currently these are Definition and Def-expand
   */

  /**
   * Check that no splice in group tags are not at the top level
   * @param hedString
   * @returns {Issue[]|[]}
   */
  checkNoSpliceInGroupTags(hedString) {
    const spliceTags = hedString.topLevelTags.filter((obj) => this.noSpliceInGroup.includes(obj.schemaTag._name))
    if (spliceTags.length > 0) {
      return [generateIssue('missingTagGroup', { tag: spliceTags[0].originalTag, string: hedString.hedString })]
    }
    return []
  }

  /**
   * Check for tags with the unique attribute
   * @param {ParsedHedString} hedString
   * @returns {Issue[]|*[]}
   */
  checkUnique(hedString) {
    const uniqueTags = hedString.tags.filter((tag) => tag.hasAttribute('unique'))
    if (uniqueTags.length > 1) {
      const uniqueNames = new Set()
      for (const tag of uniqueTags) {
        if (uniqueNames.has(tag.schemaTag._name)) {
          return [generateIssue('multipleUniqueTags', { tag: tag.originalTag, string: hedString.hedString })]
        }
        uniqueNames.add(tag.schemaTag._name)
      }
    }
    return []
  }

  hasTopLevelTagGroupAttribute(tag) {
    return (
      tag.hasAttribute('topLevelTagGroup') ||
      (this.specialMap.has(tag.schemaTag.name) && this.specialMap.get(tag.schemaTag.name).topLevelTagGroup)
    )
  }

  /**
   * Returns the value of a special attribute if special tag, otherwise undefined
   * @param {ParsedHedTag} tag
   * @param {string} attributeName
   * @returns value of the property or undefined
   */
  getSpecialAttributeForTag(tag, attributeName) {
    return this.specialMap.get(tag.schemaTag.name)?.[attributeName]
  }

  hasGroupAttribute(tag) {
    return (
      tag.hasAttribute('tagGroup') ||
      (this.specialMap.has(tag.schemaTag.name) && this.specialMap.get(tag.schemaTag.name).tagGroup)
    )
  }

  hasDuplicateNames(list) {
    const seen = new Set()
    for (const obj of list) {
      if (seen.has(obj.schemaTag.name)) {
        return true // Duplicate found
      }
      seen.add(obj.schemaTag.name)
    }
    return false // No duplicates
  }

  /**
   * Return a string of original tag names for error messages
   * @param {ParsedHedTag} tagList
   * @returns {string} comma separated list of original tag names for tags in tagList
   */
  getTagListString(tagList) {
    return tagList.map((tag) => tag.toString()).join(', ')
  }
}
