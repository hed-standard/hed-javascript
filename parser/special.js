import specialTags from '../data/json/specialTags.json'
import ParsedHedGroup from './parsedHedGroup'
import ParsedHedTag from './parsedHedTag'
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
    if (issues.length > 0) {
      // Splices make this invalid
      return issues
    }

    issues = this.checkTopLevelGroupTags(hedString, fullCheck)
    if (issues.length > 0) {
      return issues
    }
    issues = this.checkExclusive(hedString)
    if (issues.length > 0) {
      return issues
    }

    issues = this.checkUnique(hedString)
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
          issues.push(generateIssue('invalidTopLevelTagGroupTag', { tag: tag.originalTag }))
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
          tag: exclusiveTags[0].originalTagName,
          string: hedString.hedString,
        }),
      ]
    }

    // Make sure that all the objects in exclusiveTags have same schema tag name - not an issue currently
    const badList = exclusiveTags.filter((obj) => obj.schemaTag._name != exclusiveTags[0].schemaTag._name)
    if (badList.length > 0) {
      return [
        generateIssue('illegalExclusiveContext', { tag: badList[0].schemaTag._name, string: hedString.hedString }),
      ]
    }
    return []
  }

  checkGroupsTopRequirements(hedString, fullCheck) {
    const issues = []
    const topGroupsTags = hedString.topLevelGroupTags
    for (const tags of topGroupsTags) {
      this.checkGroupTopTagRequirements(tags)
    }
    return issues
  }

  checkGroupTopTagRequirements(tags) {
    // Check the right elements are at top level in the group
    for (let i = 0; i <= tags.length; ++i) {
      if (
        !this.isSpecialTag(tags[i]) ||
        this.specialMap.get(tags[i].otherAllowedTags === null) ||
        tags[i].length === 1
      ) {
        // Nothing to check -- it is not special or only one or has no restrictions
        continue
      } else if (
        tags[i].length > 2 ||
        (this.specialMap.get(tags[i].otherAllowedTags).length === 0 && tags[i].length > 1)
      ) {
        // If no other allowed tags can only have 1 tag in the list
        return generateIssue('invalidGroupTopTags', { tags: tags.map((tag) => tag.toString()).join(', ') })
      }
    }
    return []
  }

  /**
   * Check for tags with the unique attribute
   * @param hedString
   * @returns {Issue[]|*[]}
   */
  checkUnique(hedString) {
    const uniqueTags = hedString.tags.filter((tag) => tag.hasAttribute('isUnique'))
    if (uniqueTags.length <= 2) {
      return []
    }
    const uniqueNames = Set()
    for (const tag of uniqueTags) {
      if (uniqueNames.has(tag.schemaTag._name)) {
        return [generateIssue('multipleUniqueTags', { tag: tag.schemaTag._name })]
      }
      uniqueNames.add(tag.name)
    }
    return []
  }

  hasTopLevelTagGroupAttribute(tag) {
    return (
      tag.hasAttribute('topLevelTagGroup') ||
      (this.specialMap.has(tag.schemaTag.name) && this.specialMap.get(tag.schemaTag.name).topLevelTagGroup)
    )
  }

  hasGroupAttribute(tag) {
    return (
      tag.hasAttribute('topGroup') ||
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
