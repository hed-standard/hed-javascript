import specialTags from '../data/json/specialTags.json'
import ParsedHedGroup from './parsedHedGroup'
import ParsedHedTag from './parsedHedTag'
import ParsedHedColumnSplice from './parsedHedColumnSplice'
import { generateIssue } from '../common/issues/issues'
import { TagSpec } from './tokenizer'
//import fs from 'fs'

//const readFileSync = fs.readFileSync
//const specialJson = readFileSync('../data/json/specialTags.json', 'utf8')
const specialMap = new Map(Object.entries(specialTags))

export class SpecialChecker {
  /**
   * Map of properties for special tags.
   * @type {Object<string,*>}
   */
  specialMap
  specialNames
  specialGroupTags
  exclusiveTags
  noSpliceInGroup
  hasForbiddenSubgroupTags

  /**
   * Array of the special tags in this HED string
   * @type {ParsedHedTag []}
   */
  specialTags

  constructor() {
    if (SpecialChecker.instance) {
      // eslint-disable-next-line no-constructor-return
      return SpecialChecker.instance
    }
    this.specialMap = specialMap
    this.specialNames = Array.from(specialMap.keys())
    this.specialGroupTags = Array.from(this.specialMap.values())
      .filter((value) => value.tagGroup === true)
      .map((value) => value.name)
    this.exclusiveTags = Array.from(this.specialMap.values())
      .filter((value) => value.exclusive === true)
      .map((value) => value.name)
    this.noSpliceInGroup = Array.from(this.specialMap.values())
      .filter((value) => value.noSpliceInGroup === true)
      .map((value) => value.name)
    this.hasForbiddenSubgroupTags = Array.from(this.specialMap.values())
      .filter((value) => value.forbiddenSubgroupTags.length > 0)
      .map((value) => value.name)
    // eslint-disable-next-line no-constructor-return
    return this
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
    issues = this.checkSpecialGroups(hedString, fullCheck)
    if (issues.length > 0) {
      return issues
    }
    issues = this.checkForbiddenGroups(hedString.tagGroups)
    return issues
  }

  /**
   *  Check whether column splices are allowed
   *  @param {ParsedHedString} - hed string to be checked for splice conflicts
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
   * @param hedString {parsedHedString} - the object to be checked
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
   * Check the group conditions of the special tags.
   * @param {ParsedHedString }hedString
   * @param {boolean} fullCheck -- if true no column splices-- internal or external
   * @returns {Issues[]|[]}
   *
   * Notes: These include the number of groups and top tag compatibility in the group
   */
  checkSpecialGroups(hedString, fullCheck) {
    const issues = []
    for (const group of hedString.tagGroups) {
      const nextIssues = this.checkSpecialGroup(group, fullCheck)
      issues.push(...nextIssues)
    }
    return issues
  }

  /**
   * Check special groups for requirements
   * @param {ParsedHedGroup} group to be checked for requirements
   * @param {boolean} fullCheck if true all column splices have been resolved
   * @returns {Issue[]|[]}
   */
  checkSpecialGroup(group, fullCheck) {
    // Check the right elements are at top level in the group
    if (group.specialTagList.length === 0) {
      // Nothing to check
      return []
    }
    for (const subGroup of group.subParsedGroupIterator()) {
      // Iterator includes this group
      // Nothing to check
      if (subGroup.allTags.filter((obj) => this.specialGroupTags.includes(obj.schemaTag._name)).length == 0) {
        continue
      }
      let issues = this.checkSpecialGroupNumbers(subGroup, fullCheck)
      if (issues.length > 0) {
        return issues
      }
      issues = this.checkSpecialTopTags(subGroup, fullCheck)
      if (issues.length > 0) {
        return issues
      }
    }
    return []
  }

  /**
   * Checks the top tags in a special group for right number and value
   * @param {ParsedHedGroup} group  group to check that special top tags are okay together
   * @param fullCheck
   */
  checkSpecialTopTags(group, fullCheck) {
    const specialTags = group.topTags.filter((obj) => this.specialGroupTags.includes(obj.schemaTag.name))
    if (specialTags.length === 0) {
      return []
    }
    if (group.topTags.length > 2) {
      return [
        generateIssue('invalidGroupTags', { tags: this.getTagListString(group.topTags), string: group.originalTag }),
      ]
    }
    for (const specialTag of specialTags) {
      const otherTags = group.topTags.filter((obj) => obj !== specialTag)
      if (otherTags.length > 1) {
        return [
          generateIssue('invalidGroupTags', { tags: this.getTagListString(group.topTags), string: group.originalTag }),
        ]
      }
      if (!this.specialMap.get(specialTag.schemaTag.name).otherAllowedTags.includes(otherTags[0].schemaTag.name)) {
        return [
          generateIssue('invalidGroupTags', { tags: this.getTagListString(group.topTags), string: group.originalTag }),
        ]
      }
    }
    return []
  }

  checkSpecialGroupNumbers(subGroup, fullCheck) {
    //let maxSubgroups = specialTags[0].maxNumberSubgroups ?? Infinity // JSON doesn't have infinity -- uses null
    //let minSubgroups = specialTags[0].minNumberSubgroups // Will always have a value of at least 0.
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

  checkNoSpliceInGroupTags(hedString) {
    const spliceTags = hedString.tags.filter((obj) => this.noSpliceInGroup.includes(obj.schemaTag._name))
    if (spliceTags.length === 0) {
      return []
    }
    let issues = []
    //if string doesn't have any of these splice-group-tags return
    return []
  }

  getAllTagsInSubgroups(group) {
    return []
  }

  /**
   * Check for tags with the unique attribute
   * @param {HedString} hedString
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

  /**
   * Return a string of original tag names for error messages
   * @param {ParsedHedTag} tagList
   * @returns {string} comma separated list of original tag names for tags in tagList
   */
  getTagListString(tagList) {
    return tagList.map((tag) => tag.toString()).join(', ')
  }
}
