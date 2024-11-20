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
  exclusiveTags
  noSpliceInGroup

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
    this.specialGroupTags = Array.from(this.specialMap.entries())
      .filter(([key, value]) => value.tagGroup === true)
      .map(([key, value]) => key)
    this.exclusiveTags = Array.from(this.specialMap.entries())
      .filter(([key, value]) => value.exclusive === true)
      .map(([key, value]) => key)
    this.noSpliceInGroup = Array.from(this.specialMap.entries())
      .filter(([key, value]) => value.noSpliceInGroup === true)
      .map(([key, value]) => key)
    // eslint-disable-next-line no-constructor-return
    return this
  }

  /**
   * Do the checks that can be done a parse time to provide an early out.
   * @param hedString
   * @param fullCheck
   * @returns {Issues[]}
   */
  checkHedString(hedString, fullCheck) {
    let issues = this.spliceCheck(hedString, fullCheck)
    if (fullCheck) {
      // Make sure all tags that should be in groups are.
      for (const tag of hedString.topLevelTags) {
        if (this.hasGroupAttribute(tag)) {
          issues.push(generateIssue('invalidGroupTag', { tag: tag.originalTag, string: hedString.hedString }))
        }
      }
    }
    issues.push(...this.checkUnique(hedString))
    if (issues.length > 0) {
      return issues
    }

    // Now get down to checking special tags
    if (!fullCheck && !hedString.tags.some((tag) => this.specialNames.includes(tag.schemaTag.name))) {
      return []
    }
    issues = this.checkTopLevelGroupTags(hedString, fullCheck)
    if (issues.length > 0) {
      return issues
    }
    issues = this.checkExclusive(hedString)
    if (issues.length > 0) {
      return issues
    }
    issues = this.checkGroups(hedString, fullCheck)
    if (issues.length > 0) {
      return issues
    }
    return []
  }

  /**
   * Does top-level check whether splices are allowed
   */
  spliceCheck(hedString, fullCheck) {
    if (hedString.columnSplices.length === 0) {
      // No column splices in string so skip test
      return []
    }
    if (fullCheck) {
      // If doing a full-check, column splices should be resolved
      return [generateIssue('curlyBracesNotAllowed', { string: hedString.hedString })]
    }
    // Exclusive tags are not allowed in same string with curly braces regardless.
    if (hedString.tags.some((obj) => this.exclusiveTags.includes(obj.schemaTag._name))) {
      return [generateIssue('curlyBracesNotAllowed', { string: hedString.hedString })]
    }
    if (hedString.tags.some((obj) => this.noSpliceInGroup.includes(obj._schemaTag.name)).length === 0) {
      return [] // No tags in string with splice restrictions
    }
    return []
  }

  /**
   * Check whether tags that are top-level tag group tags could not be at the top level
   */
  checkTopLevelGroupTags(hedString, fullCheck) {
    const issues = []
    const topGroupTags = hedString.topLevelGroupTags.flat()
    hedString.tags.forEach((tag) => {
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
      // In final form --- if not in a group, it should be
      if (fullCheck && hedString.topLevelTags.includes(tag) && this.hasGroupAttribute(tag)) {
        issues.push(generateIssue('missingTagGroup', { tag: tag.originalTag }))
      }
    })
    return issues
  }

  /**
   * Check the exclusive property (so far only for Definitions)
   * @param hedString {parsedHedString} - the object to be checked
   * @returns {Issue[]}
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

  checkGroups(hedString) {
    const issues = []
    const topGroups = hedString.tagGroups
    for (const group of topGroups) {
      if (!group.isDefExpandGroup) {
        issues.push(...this.checkSpecialGroupTagRequirements(group))
      }
    }
    return issues
  }

  checkSpecialGroupTagRequirements(group) {
    // Check the right elements are at top level in the group
    const tags = group.tags.filter((obj) => obj instanceof ParsedHedTag)
    const specialTags = tags.filter((obj) => this.specialGroupTags.includes(obj.schemaTag._name))
    if (specialTags.length === 0) {
      return []
    } else if (tags.length > 2) {
      // This assumes that special tags can have at most one other tag
      return [generateIssue('invalidGroupTopTags', { tags: tags.map((tag) => tag.toString()).join(', ') })]
    }
    let maxSubgroups = specialTags[0].maxNumberSubgroups ?? Infinity // JSON doesn't have infinity -- uses null
    let minSubgroups = specialTags[0].minNumberSubgroups // Will always have a value of at least 0.

    if (specialTags.length === 2) {
      // Check special tags are allowed together
      const otherAllowed0 = this.getSpecialAttributeForTag(specialTags[0], 'otherAllowedTags')?.includes(
        specialTags[1].schemaTag.name,
      )
      const otherAllowed1 = this.getSpecialAttributeForTag(specialTags[1], 'otherAllowedTags')?.includes(
        specialTags[0].schemaTag.name,
      )
      if (!otherAllowed0 || !otherAllowed1) {
        return [generateIssue('invalidGroupTopTags', { tags: specialTags.map((tag) => tag.toString()).join(', ') })]
      }
      maxSubgroups = Math.min(maxSubgroups, specialTags[1].maxNumberSubgroups ?? Infinity)
      minSubgroups = Math.max(minSubgroups, specialTags[1].minNumberSubgroups)
    }

    // Check that the maximum number of groups make sense
    const subgroups = group.tags.filter((obj) => obj instanceof ParsedHedGroup)
    if (maxSubgroups < minSubgroups || subgroups.length > maxSubgroups) {
      return [
        generateIssue('invalidNumberOfSubgroups', {
          tags: specialTags.map((tag) => tag.originalTag.join(', ')),
          string: group.format(),
        }),
      ]
    }

    // Check that the minimum number of groups make sense
    const columnSplices = group.tags.filter((obj) => obj instanceof ParsedHedColumnSplice)
    if (columnSplices.length === 0 && subgroups.length < minSubgroups) {
      return [
        generateIssue('invalidNumberOfSubgroups', {
          tags: specialTags.map((tag) => tag.originalTag.join(', ')),
          string: group.format(),
        }),
      ]
    }
    return []
  }

  checkDefExpandGroup(group, issues) {
    return []
  }

  /**
   * Check for tags with the unique attribute
   * @param hedString
   * @returns {Issue[]|*[]}
   */
  checkUnique(hedString) {
    const uniqueTags = hedString.tags.filter((tag) => tag.hasAttribute('unique'))
    if (uniqueTags.length < 2) {
      return []
    }
    const uniqueNames = new Set()
    for (const tag of uniqueTags) {
      if (uniqueNames.has(tag.schemaTag._name)) {
        return [generateIssue('multipleUniqueTags', { tag: tag.originalTag, string: hedString.hedString })]
      }
      uniqueNames.add(tag.schemaTag._name)
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

  // /**
  //  * Return the tagGroup for a given tag if it is in one.
  //  * @param tag {ParsedHedTag}
  //  * @returns {ParsedHedGroup | null}
  //  */
  // getTagGroup(tag) {
  //     for (let i = 0; i < this.hedString.tagGroups.length; i++) {
  //        const topList = this.hedString.topLevelGroupTags[i]
  //       if (topList.find(tTag => tTag === tag)) {
  //         return this.hedString.tagGroups[i]
  //       }
  //     }
  //     return null
  // }

  checkTag(thisTag) {
    // checkTagGroup()
    // checkTopLevelTagGroup(thisTag)
  }

  getSpecialTags() {
    return this.specialTags
  }
  /**
   * Check whether
   * @type { ParsedHedTag }
   * @returns { boolean }
   */
  isSpecialTag(tag) {
    return tag.short in this.specialTags
  }

  // // List of parsed hed tags that
  // mustBeGroup(tagList) {}
  //
  // /** Check a list of special HEDTags tags for whether they can have children **/
  // checkTags(tagList) {
  //   const issueList = []
  //   for (const tag of tagList) {
  //     if (!this.isSpecialTag(tag)) {
  //       continue
  //     }
  //     const specReq = this.specialTags[tag._schemaTag.name]
  //     if (!specReq['child'] && tag._remainder.length > 0) {
  //       issueList.push({ internalCode: 'childForbidden', parameters: { tag: tag } })
  //     } else if (specReq['child'] && tag._remainder.length === 0) {
  //       issueList.push({ internalCode: 'childRequired', parameters: { tag: tag } })
  //     }
  //   }
  //   return issueList
  // }
  //
  // checkTagGroup(tagGroup) {
  //   const issueList = []
  //   const topTags = tagGroup.tag.filter((tag) => tag instanceof ParsedHedTag)
  //   const topSubgroups = tagGroup.tag.filter((tag) => tag instanceof ParsedHedGroup)
  // }
  //
  // checkTopGroupTags(tag, topSubgroups) {
  //   const issueList = []
  //   if (this.isSpecialTag(tag)) {
  //     return issueList
  //   }
  //   const specReq = this.specialTags[tag._schemaTag.name]
  //   for (const tag of tagList) {
  //   }
  // }

  // Add more methods as needed...
}
