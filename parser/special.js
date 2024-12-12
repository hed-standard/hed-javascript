import specialTags from '../data/json/specialTags.json'
import { generateIssue } from '../common/issues/issues'
import { categorizeTagsByName, getTagListString } from './parseUtils'

export class SpecialChecker {
  static instance = null
  static specialMap = new Map(Object.entries(specialTags))

  constructor() {
    if (SpecialChecker.instance) {
      throw new Error('Use SpecialChecker.getInstance() to get an instance of this class.')
    }

    this._initializeSpecialTags()
  }

  // Static method to control access to the singleton instance
  static getInstance() {
    if (!SpecialChecker.instance) {
      SpecialChecker.instance = new SpecialChecker()
    }
    return SpecialChecker.instance
  }

  _initializeSpecialTags() {
    this.specialNames = new Set(SpecialChecker.specialMap.keys())
    this.requireValueTags = SpecialChecker._getSpecialTagsByProperty('requireValue')
    this.noExtensionTags = SpecialChecker._getSpecialTagsByProperty('noExtension')
    this.allowTwoLevelValueTags = SpecialChecker._getSpecialTagsByProperty('allowTwoLevelValue')
    this.specialTopGroupTags = SpecialChecker._getSpecialTagsByProperty('topLevelTagGroup')
    this.specialGroupTags = SpecialChecker._getSpecialTagsByProperty('tagGroup')
    this.specialNonTopGroupTags = new Set(
      [...this.specialGroupTags].filter((item) => !this.specialTopGroupTags.has(item)),
    )
    this.exclusiveTags = SpecialChecker._getSpecialTagsByProperty('exclusive')
    this.noSpliceInGroup = SpecialChecker._getSpecialTagsByProperty('noSpliceInGroup')
    this.hasForbiddenSubgroupTags = new Set(
      [...SpecialChecker.specialMap.values()]
        .filter((value) => value.forbiddenSubgroupTags.length > 0)
        .map((value) => value.name),
    )
  }

  static _getSpecialTagsByProperty(property) {
    return new Set(
      [...SpecialChecker.specialMap.values()].filter((value) => value[property] === true).map((value) => value.name),
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
      () => this.checkSpecialTopGroupRequirements(hedString, fullCheck),
      () => this.checkForbiddenGroups(hedString),
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
    const topGroupTags = hedString.topLevelGroupTags.flat()
    hedString.tags.forEach((tag) => {
      // Check for top-level violations because tag is deep
      if (this.hasTopLevelTagGroupAttribute(tag)) {
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
      if (fullCheck && hedString.topLevelTags.includes(tag) && this.hasGroupAttribute(tag)) {
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
      return [generateIssue('curlyBracesNotAllowed', { string: hedString })]
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
  checkSpecialTopGroupRequirements(hedString, fullCheck) {
    const issues = []
    for (const group of hedString.tagGroups) {
      const specialTags = [...group.specialTags.values()].flat()
      for (const specialTag of specialTags) {
        const nextIssues = this._checkGroupRequirements(specialTag, group, fullCheck)
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
   * @param {ParsedHedTag} specialTag - a top-level special tag in group
   * @param {ParsedHedGroup} group - the group to check for tag requirements
   * @param { boolean} fullCheck - if True, assume this is the final version and all tags must be present
   * @returns {Issue[]}
   */
  _checkGroupRequirements(specialTag, group, fullCheck) {
    const specialRequirements = SpecialChecker.specialMap.get(specialTag.schemaTag.name)
    const issues = this._checkAllowedTags(specialTag, group, specialRequirements.otherAllowedTags)
    if (issues.length > 0) {
      return issues
    }
    issues.push(...this._checkAllowedGroups(specialTag, group, specialRequirements, fullCheck))
    return issues
  }

  /**
   * Verify that the tags in the group are allowed with the special tag
   *
   * @param {ParsedHedTag} specialTag - The special tag whose tag requirements are to be checked
   * @param {ParsedHedGroup} group - The enclosing tag group
   * @param { string[] | null} allowedTags - The list of tags that are allowed with this tag
   * @returns {Issue[]|[]}
   * @private
   */
  _checkAllowedTags(specialTag, group, allowedTags) {
    if (allowedTags === null || allowedTags === undefined) {
      return []
    }
    const allowedTagSet = new Set(allowedTags)
    // Quick check to determine that there are not too many
    const otherTopTags = group.topTags.filter((tag) => tag !== specialTag)
    if (otherTopTags.length > allowedTagSet.size) {
      return [generateIssue('tooManyGroupTopTags', { string: group.originalTag })]
    }
    const byNameMap = categorizeTagsByName(otherTopTags)

    // Check that there aren't any disallowed tags at the top level
    const badTags = [...byNameMap.keys()].filter((key) => !allowedTagSet.has(key))
    if (badTags.length > 0) {
      return [generateIssue('tooManyGroupTopTags', { string: group.originalTag })]
    }

    // Check that there aren't any duplicates of allowed tags
    const dupTags = [...byNameMap.keys()].filter((key) => byNameMap.get(key).length > 1)
    if (dupTags.length > 0) {
      return [generateIssue('tooManyGroupTopTags', { string: group.originalTag })]
    }
    return []
  }

  /**
   * Verify the group conditions
   *
   * @param {ParsedHedTag} specialTag - The special tag whose tag requirements are to be checked
   * @param {ParsedHedGroup} group - The enclosing tag group
   * @param {boolean} fullCheck - If true, all splices have been resolved and everything should be there
   * @param { string[] | null} allowedTags - The list of tags that are allowed with this tag
   * @returns {Issue[]|[]}
   * @private
   */
  _checkAllowedGroups(specialTag, group, specialRequirements, fullCheck) {
    // Group checks are not applicable to this special tag
    if (!specialRequirements.tagGroup) {
      return []
    }

    let groupCount = group.topGroups.length
    const defCount = group.topTags.filter((tag) => tag.schemaTag.name === 'Def').length
    if (specialRequirements.defTagRequired && defCount === 0 && group.defExpandChildren.length > 0) {
      groupCount = groupCount - 1
    }

    // Check maximum limit
    const maxLimit = specialRequirements.maxNonDefSubgroups != null ? specialRequirements.maxNonDefSubgroups : Infinity
    if (groupCount > maxLimit) {
      return [generateIssue('invalidNumberOfSubgroups', { tag: specialTag.originalTag, string: group.originalTag })]
    }

    // Check if you can't do more because of splices
    if (!fullCheck && group.topSplices.length > 0) {
      return []
    }

    // Check that it has the minimum number of subgroups
    const minLimit = specialRequirements.minNonDefSubgroups != null ? specialRequirements.minNonDefSubgroups : -Infinity
    if (group.count < minLimit) {
      return [generateIssue('invalidNumberOfSubgroups', { tag: specialTag.originalTag, string: group.originalTag })]
    }

    // Make sure that there is a Def or Def-expand key if required
    if (specialRequirements.defTagRequired && defCount + group.defExpandChildren.length === 0) {
      return [generateIssue('temporalWithoutDefinition', { tag: specialTag.originalTag, tagGroup: group.originalTag })]
    }
    return []
  }

  /**
   * Get tags that are not allowed in the current group.
   *
   * @param {ParsedHedTag[]} tags - The HED tags to be evaluated.
   * @param {Object} specialTagRequirements - The requirements for the special tag.
   * @returns {ParsedHedTag[]} An array of tags that are not allowed.
   * @private
   */
  _getDisallowedTags(tags, specialTagRequirements) {
    return tags.filter((tag) => !specialTagRequirements.otherAllowedTags?.includes(tag.schemaTag.name))
  }

  /**
   * Check if there are conflicting subgroup tags.
   *
   * @param {ParsedHedString} hedString - the HED string to be checked.
   * @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
   */
  checkForbiddenGroups(hedString) {
    const issues = []
    for (const group of hedString.tagGroups) {
      // Only check the group if there are tags with forbidden subgroup tags
      if (group.allTags.some((tag) => this.hasForbiddenSubgroupTags.has(tag.schemaTag.name))) {
        issues.push(...this._checkForbiddenGroup(group))
      }
      // if (group.allTags.some((tag) => this.specialGroupTags.has(tag.schemaTag.name))) {
      //   issues.push(...this._checkSpecialGroup(group))
      // }
    }
    return issues
  }

  /*
 /!**
  * Check the compatibility of special tags within a group after the initial guard conditions have been handled.
  *
  *  This function verifies whether special tags in the provided group meet the required constraints.
  *  Specifically, it checks if tags are allowed based on group properties, if there are any duplicate names,
  *  and if certain required tags or group conditions are missing.
*
* @param {ParsedHedGroup}  - The HED group object containing tags to be validated.
* @param {ParsedHedTag[]} specialTags  - Tags within the group that have special properties requiring validation.
* @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
* @private
*!/
_checkSpecialTagsInGroup(group, specialTags) {
  const hasDef = group.topTags.some((tag) => tag.schemaTag.name === 'Def') || group.hasDefExpandChildren

  for (const specialTag of specialTags) {
    const specialRequirements = SpecialChecker.specialMap.get(specialTag.schemaTag.name)
    const otherTags = group.topTags.filter((tag) => tag !== specialTag)

    // Check for disallowed tags in the group
    const disallowedTags = this._getDisallowedTags(otherTags, specialRequirements)

    // Make sure that there are not any duplicates in the allowed tags
    if (disallowedTags.length > 0 || this.hasDuplicateNames(otherTags)) {
      return [generateIssue('invalidTagGroup', { tagGroup: group.originalTag })]
    }

    // Check if required definition tag is missing
    if (!hasDef && specialRequirements.defTagRequired && group.topColumnSplices.length === 0) {
      return [
        generateIssue('temporalWithoutDefinition', {
          tag: specialTag.schemaTag.name,
          tagGroup: group.originalTag,
        }),
      ]
    }

    // Check for the maximum number of subgroups allowed
    const defExpandCount = specialRequirements.defTagRequired && group.hasDefExpandChildren ? 1 : 0
    const maxRequired = (specialRequirements.maxNonDefSubgroups ?? Infinity) + defExpandCount
    if (group.topGroups.length > maxRequired) {
      return [generateIssue('invalidTagGroup', { tagGroup: group.originalTag })]
    }

    // Check if no column splices so the minimum number of groups can be verified
    if (group.topColumnSplices.length === 0 && group.topGroups.length < specialRequirements.minNonDefSubgroups) {
      return [generateIssue('invalidTagGroup', { tagGroup: group.originalTag })]
    }
  }
  return []
}
*/

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
          SpecialChecker.specialMap.get(tag.schemaTag.name)?.forbiddenSubgroupTags.includes(otherTag.schemaTag.name),
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
   * Return the value of a special attribute if special tag, otherwise undefined.
   *
   * @param {ParsedHedTag} tag - The HED tag to be checked for the attribute
   * @param {string} attributeName - The name of the special attribute to check for.
   *
   * @returns value of the property or undefined.
   */
  getSpecialAttributeForTag(tag, attributeName) {
    return this.specialMap.get(tag.schemaTag.name)?.[attributeName]
  }

  /**
   * Return true if a list of tags has any duplicate names.
   *
   * @param {list} - A list of ParsedHedTag objects to be checked.
   * @returns {boolean} If true, indicates that there tags with duplicate names in the list.
   *
   */
  hasDuplicateNames(list) {
    const seen = new Set()
    for (const obj of list) {
      if (seen.has(obj.schemaTag.name)) {
        return true
      }
      seen.add(obj.schemaTag.name)
    }
    return false
  }

  _hasExclusiveTags(hedString) {
    return hedString.tags.some((tag) => this.exclusiveTags.includes(tag.schemaTag._name))
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
  hasTopLevelTagGroupAttribute(tag) {
    return (
      tag.hasAttribute('topLevelTagGroup') ||
      (SpecialChecker.specialMap.has(tag.schemaTag.name) &&
        SpecialChecker.specialMap.get(tag.schemaTag.name).topLevelTagGroup)
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
  hasGroupAttribute(tag) {
    return (
      tag.hasAttribute('tagGroup') ||
      (SpecialChecker.specialMap.has(tag.schemaTag.name) && SpecialChecker.specialMap.get(tag.schemaTag.name).tagGroup)
    )
  }
}
