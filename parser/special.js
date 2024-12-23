import specialTags from '../data/json/specialTags.json'
import { generateIssue } from '../common/issues/issues'

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
    this.specialNames = [...SpecialChecker.specialMap.keys()]
    this.requireValueTags = SpecialChecker._getSpecialTagsByProperty('requireValue')
    this.noExtensionTags = SpecialChecker._getSpecialTagsByProperty('noExtension')
    this.allowTwoLevelValueTags = SpecialChecker._getSpecialTagsByProperty('allowTwoLevelValue')
    this.specialGroupTags = SpecialChecker._getSpecialTagsByProperty('tagGroup')
    this.specialTopGroupTags = SpecialChecker._getSpecialTagsByProperty('topLevelTagGroup')
    this.exclusiveTags = SpecialChecker._getSpecialTagsByProperty('exclusive')
    this.noSpliceInGroup = SpecialChecker._getSpecialTagsByProperty('noSpliceInGroup')
    this.hasForbiddenSubgroupTags = new Set(
      [...SpecialChecker.specialMap.values()]
        .filter((value) => value.forbiddenSubgroupTags.length > 0)
        .map((value) => value.name),
    )
  }

  static _getSpecialTagsByProperty(property) {
    return [...SpecialChecker.specialMap.values()]
      .filter((value) => value[property] === true)
      .map((value) => value.name)
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
      () => this.checkTagGroupLevels(hedString, fullCheck),
      () => this.checkUnique(hedString),
      () => this.checkExclusive(hedString),
      () => this.checkSpecialTopGroups(hedString),
      () => this.checkNoSpliceInGroupTags(hedString),
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
   *  Check whether column splices are allowed
   *
   *  @param {ParsedHedString} hedString - The HED string to check for splice conflicts.
   *  @param {boolean} fullCheck - If true, then column splices should have been resolved.
   *  @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
   */
  spliceCheck(hedString, fullCheck) {
    if (hedString.columnSplices.length === 0) {
      // No column splices in string so skip test
      return []
    }

    // If doing a full-check, column splices should be resolved
    if (fullCheck || hedString.tags.some((tag) => this.exclusiveTags.includes(tag.schemaTag._name))) {
      return [generateIssue('curlyBracesNotAllowed', { string: hedString.hedString })]
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
    const exclusiveTags = hedString.tags.filter((tag) => this.exclusiveTags.includes(tag.schemaTag._name))
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
    const badList = exclusiveTags.filter((tag) => tag.schemaTag._name !== exclusiveTags[0].schemaTag._name)
    if (badList.length > 0) {
      return [generateIssue('illegalExclusiveContext', { tag: badList[0].originalTag, string: hedString.hedString })]
    }
    return []
  }

  /**
   * Check the group conditions of the special tags. The top-level has already been verified.
   *
   * @param {ParsedHedString} hedString - The HED string to check for group conflicts.
   * @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
   *
   * Notes: These include the number of groups and top tag compatibility in the group
   */
  checkSpecialTopGroups(hedString) {
    const issues = []
    for (const group of hedString.tagGroups) {
      const nextIssues = this._checkSpecialTopGroup(group)
      issues.push(...nextIssues)
    }
    return issues
  }

  /**
   * Check special group requirements for top-level tags in a parsed HED group.
   *
   * This method verifies whether the given group complies with specific requirements
   * for top-level tags, focusing on groups with special properties such as
   * 'Def' or 'Def-expand'. It ensures that group combinations are valid and that
   * restrictions on subgroup relationships are respected.
   *
   * @param {ParsedHedGroup} group  - The parsed HED group containing tags to be validated.
   * @returns {Issue[]} An array of `Issue` objects if violations are found; otherwise, an empty array.
   *
   * Note:  This is a top-group check only
   */
  _checkSpecialTopGroup(group) {
    const specialTags = group.topTags.filter((tag) => this.specialTopGroupTags.includes(tag.schemaTag.name))

    // If there are no special tags, there are no issues to check
    if (specialTags.length === 0) {
      return []
    }

    // Ensure that groups with special tags can only contain other special tags or a Def tag.
    if (specialTags.length > group.topTags.length) {
      // ASSUME that groups with special tags can only have other tags which are special or a Def //TODO fix when map is removed from specialTags
      return [generateIssue('invalidTagGroup', { tagGroup: group.originalTag })]
    }

    // Validate Def-expand groups: must have only one tag and limited subgroups.
    if (group.isDefExpandGroup && group.topTags.length === 1 && group.topGroups.length <= 1) {
      return []
    }

    // Check if group is an invalid Def-expand group or has too many Def-expand subgroups.
    if (group.isDefExpandGroup || (group.hasDefExpandChildren && group.defExpandChildren.length > 1)) {
      return [generateIssue('invalidTagGroup', { tagGroup: group.originalTag })]
    }

    // Ensure a group does not contain both a Def tag and a Def-expand group, which is disallowed.
    if (group.hasDefExpandChildren && group.topTags.some((tag) => tag.schemaTag.name === 'Def')) {
      return [generateIssue('invalidTagGroup', { tagGroup: group.originalTag })]
    }

    // Delegate to check special tags in the group for further validation.
    return this._checkSpecialTagsInGroup(group, specialTags)
  }

  /**
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
   */
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
        issues.push(...this.checkForbiddenGroup(group))
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
  checkForbiddenGroup(group) {
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
              tags: this.getTagListString(badTags),
              string: subGroup.originalTag,
            }),
          ]
        }
      }
    }
    return []
  }

  /**
   * Check for special tags that have no splice in group that no forbidden tags are in their subgroup.
   *
   * @param {ParsedHedString} hedString - the HED string to be checked.
   * @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
   *
   * Notes: Currently these are Definition and Def-expand
   */

  /**
   * Check that no splice in group tags are not at the top level.
   *
   * @param {ParsedHedString} hedString - the HED string to be checked for splices at the top level.
   * @returns {Issue[]} An array of `Issue` objects if there are violations; otherwise, an empty array.
   */
  checkNoSpliceInGroupTags(hedString) {
    const spliceTags = hedString.topLevelTags.filter((tag) => this.noSpliceInGroup.includes(tag.schemaTag._name))
    if (spliceTags.length > 0) {
      return [generateIssue('missingTagGroup', { tag: spliceTags[0].originalTag, string: hedString.hedString })]
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

  /**
   * Return a string of original tag names for error messages.
   * @param {ParsedHedTag} tagList - The HED tags whose string representations should be put in a comma-separated list.
   * @returns {string} A comma separated list of original tag names for tags in tagList.
   */
  getTagListString(tagList) {
    return tagList.map((tag) => tag.toString()).join(', ')
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
