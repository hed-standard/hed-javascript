import specialTags from './specialTags.json'
import { ParsedHedGroup } from '../../parser/parsedHedGroup'
import { ParsedHedTag } from '../../parser/parsedHedTag'

export class SpecialTagValidator {
  /**
   * Map of properties for special tags.
   * @type {Object<string,*>}
   */
  specialTags

  constructor() {
    this.specialTags = specialTags
  }

  // Example method to check if a tag exists in specialTags
  isSpecialTag(tag) {
    return tag._schemaTag.name in this.specialTags
  }

  /** Check a list of tags for whether they can have children **/
  checkTags(tagList) {
    const issueList = []
    for (const tag of tagList) {
      if (!this.isSpecialTag(tag)) {
        continue
      }
      const specReq = this.specialTags[tag._schemaTag.name]
      if (!specReq['child'] && tag._remainder.length > 0) {
        issueList.push({ internalCode: 'childForbidden', parameters: { tag: tag } })
      } else if (specReq['child'] && tag._remainder.length === 0) {
        issueList.push({ internalCode: 'childRequired', parameters: { tag: tag } })
      }
    }
    return issueList
  }

  checkTagGroup(tagGroup) {
    const issueList = []
    const topTags = tagGroup.tag.filter((tag) => tag instanceof ParsedHedTag)
    const topSubgroups = tagGroup.tag.filter((tag) => tag instanceof ParsedHedGroup)
  }

  checktopTags(tag, topSubgroups) {
    const issueList = []
    if (this.isSpecialTag(tag)) {
      return issueList
    }
    const specReq = this.specialTags[tag._schemaTag.name]
    for (const tag of tagList) {
    }
  }

  // Add more methods as needed...
}

export default SpecialTagValidator
