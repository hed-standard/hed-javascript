const utils = require('../../utils')
const { hedStringIsAGroup } = require('../stringParser')
const { ParsedHedGroup, ParsedHedTag } = require('../types')

const { HedValidator } = require('./validator')

const tagGroupType = 'tagGroup'
const topLevelTagGroupType = 'topLevelTagGroup'

class Hed3Validator extends HedValidator {
  constructor(parsedString, hedSchemas, definitions, options) {
    super(parsedString, hedSchemas, options)
    this.definitions = definitions
  }

  validateEventLevel() {
    super.validateEventLevel()
    this.validateTopLevelTagGroups()
  }

  /**
   * Validate an individual HED tag.
   */
  validateIndividualHedTag(tag, previousTag) {
    super.validateIndividualHedTag(tag, previousTag)
    if (this.definitions !== null) {
      this.checkForMissingDefinitions(tag, 'Def')
      this.checkForMissingDefinitions(tag, 'Def-expand')
    }
  }

  /**
   * Validate a HED tag group.
   */
  validateHedTagGroup(parsedTagGroup) {
    super.validateHedTagGroup(parsedTagGroup)
    this.checkDefinitionSyntax(parsedTagGroup)
  }

  /**
   * Validate the top-level HED tags in a parsed HED string.
   */
  validateTopLevelTags() {
    super.validateTopLevelTags()
    this.checkForInvalidTopLevelTags()
  }

  /**
   * Validate the top-level HED tag groups in a parsed HED string.
   */
  validateTopLevelTagGroups() {
    this.checkForInvalidTopLevelTagGroupTags()
  }

  /**
   * Check the syntax of HED 3 definitions.
   *
   * @param {ParsedHedGroup} tagGroup The tag group.
   */
  checkDefinitionSyntax(tagGroup) {
    const definitionShortTag = 'definition'
    const defExpandShortTag = 'def-expand'
    const defShortTag = 'def'
    const definitionParentTag = this.getParsedParentTag(definitionShortTag)
    const defExpandParentTag = this.getParsedParentTag(defExpandShortTag)
    const defParentTag = this.getParsedParentTag(defShortTag)
    let definitionTagFound = false
    let defExpandTagFound = false
    let definitionName
    for (const tag of tagGroup.tags) {
      if (tag instanceof ParsedHedGroup) {
        continue
      }
      if (tag.isDescendantOf(definitionParentTag)) {
        definitionTagFound = true
        definitionName = tag.originalTagName
        break
      } else if (tag.isDescendantOf(defExpandParentTag)) {
        defExpandTagFound = true
        definitionName = tag.originalTagName
        break
      }
    }
    if (!(definitionTagFound || defExpandTagFound)) {
      return
    }
    let tagGroupValidated = false
    let tagGroupIssueGenerated = false
    const nestedDefinitionParentTags = [
      definitionParentTag,
      defExpandParentTag,
      defParentTag,
    ]
    for (const tag of tagGroup.tags) {
      if (tag instanceof ParsedHedGroup) {
        if (tagGroupValidated && !tagGroupIssueGenerated) {
          this.pushIssue('multipleTagGroupsInDefinition', {
            definition: definitionName,
          })
          tagGroupIssueGenerated = true
          continue
        }
        tagGroupValidated = true
        for (const innerTag of tag.tagIterator()) {
          if (
            nestedDefinitionParentTags.some((parentTag) => {
              return innerTag.isDescendantOf(parentTag)
            })
          ) {
            this.pushIssue('nestedDefinition', {
              definition: definitionName,
            })
          }
        }
      } else if (
        (definitionTagFound && !tag.isDescendantOf(definitionParentTag)) ||
        (defExpandTagFound && !tag.isDescendantOf(defExpandParentTag))
      ) {
        this.pushIssue('illegalDefinitionGroupTag', {
          tag: tag.originalTag,
          definition: definitionName,
        })
      }
    }
  }

  /**
   * Check for missing HED 3 definitions.
   *
   * @param {ParsedHedTag} tag The HED tag.
   * @param {string} defShortTag The short tag to check for.
   */
  checkForMissingDefinitions(tag, defShortTag = 'Def') {
    const defParentTag = this.getParsedParentTag(defShortTag)
    if (!tag.isDescendantOf(defParentTag)) {
      return
    }
    const defName = ParsedHedGroup.findDefinitionName(
      tag.canonicalTag,
      defShortTag,
    )
    if (!this.definitions.has(defName)) {
      this.pushIssue('missingDefinition', { def: defName })
    }
  }

  /**
   * Get the parent tag object for a given short tag.
   *
   * @param {string} shortTag A short-form HED 3 tag.
   * @return {ParsedHedTag} A parsed HED tag object representing the full tag.
   */
  getParsedParentTag(shortTag) {
    const parentTag = new ParsedHedTag(
      shortTag,
      shortTag,
      [0, shortTag.length - 1],
      this.hedSchemas,
    )
    this.issues = this.issues.concat(parentTag.conversionIssues)
    return parentTag
  }

  /**
   * Check for invalid top-level tags.
   */
  checkForInvalidTopLevelTags() {
    for (const topLevelTag of this.parsedString.topLevelTags) {
      if (
        !hedStringIsAGroup(topLevelTag.formattedTag) &&
        (topLevelTag.hasAttribute(tagGroupType) ||
          this.hedSchemas.baseSchema.attributes.tagHasAttribute(
            utils.HED.getParentTag(topLevelTag.formattedTag),
            tagGroupType,
          ))
      ) {
        this.pushIssue('invalidTopLevelTag', {
          tag: topLevelTag.originalTag,
        })
      }
    }
  }

  /**
   * Check for invalid top-level tag group tags.
   */
  checkForInvalidTopLevelTagGroupTags() {
    const topLevelTagGroupTagsFound = {}
    for (const tag of this.parsedString.tags) {
      if (
        tag.hasAttribute(topLevelTagGroupType) ||
        this.hedSchemas.baseSchema.attributes.tagHasAttribute(
          utils.HED.getParentTag(tag.formattedTag),
          topLevelTagGroupType,
        )
      ) {
        let tagFound = false
        this.parsedString.topLevelTagGroups.forEach((tagGroup, index) => {
          if (tagGroup.includes(tag)) {
            tagFound = true
            if (topLevelTagGroupTagsFound[index]) {
              this.pushIssue('multipleTopLevelTagGroupTags', {
                tag: tag.originalTag,
                otherTag: topLevelTagGroupTagsFound[index],
              })
            } else {
              topLevelTagGroupTagsFound[index] = tag.originalTag
            }
          }
        })
        if (!tagFound) {
          this.pushIssue('invalidTopLevelTagGroupTag', {
            tag: tag.originalTag,
          })
        }
      }
    }
  }
}

module.exports = {
  Hed3Validator: Hed3Validator,
}
