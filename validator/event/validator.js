import differenceWith from 'lodash/differenceWith'
import isEqual from 'lodash/isEqual'

import { IssueError, generateIssue } from '../../common/issues/issues'
import ParsedHedGroup from '../../parser/parsedHedGroup'
import ParsedHedTag from '../../parser/parsedHedTag'
import ParsedHedColumnSplice from '../../parser/parsedHedColumnSplice'
import { getParsedParentTags } from '../../utils/hedData'
import { hedStringIsAGroup, replaceTagNameWithPound } from '../../utils/hedStrings'
import { getCharacterCount } from '../../utils/string'

const tagGroupType = 'tagGroup'
const topLevelTagGroupType = 'topLevelTagGroup'

const uniqueType = 'unique'
const requiredType = 'required'
const specialTags = require('../../data/json/specialTags.json')

/**
 * HED validator.
 */
export default class HedValidator {
  /**
   * The parsed HED string to be validated.
   * @type {ParsedHedString}
   */
  parsedString
  /**
   * The collection of HED schemas.
   * @type {Schemas}
   */
  hedSchemas
  /**
   * The validation options.
   * @type {Object<string, boolean>}
   */
  options
  /**
   * The running issue list.
   * @type {Issue[]}
   */
  issues
  /**
   * The parsed definitions.
   *
   * @type {Map<string, ParsedHedGroup>}
   */
  definitions

  /**
   * Constructor.
   *
   * @param {ParsedHedString} parsedString The parsed HED string to be validated.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   * @param {Map<string, ParsedHedGroup>} definitions The parsed definitions.
   * @param {Object<string, boolean>} options The validation options.
   */
  constructor(parsedString, hedSchemas, definitions, options) {
    this.parsedString = parsedString
    this.hedSchemas = hedSchemas
    this.options = options
    this.issues = []
    this.definitions = definitions
  }

  validateStringLevel() {
    this.options.isEventLevel = false
    this.validateIndividualHedTags()
    this.validateHedTagLevels()
    this.validateHedTagGroups()
    this.validateFullParsedHedString()
  }

  validateEventLevel() {
    this.options.isEventLevel = true
    this.validateTopLevelTags()
    this.validateIndividualHedTags()
    this.validateHedTagLevels()
    this.validateHedTagGroups()
    this.validateTopLevelTagGroups()
  }

  // Categories

  /**
   * Validate the individual HED tags in a parsed HED string object.
   */
  validateIndividualHedTags() {
    for (const tag of this.parsedString.tags) {
      this.validateIndividualHedTag(tag)
    }
  }

  /**
   * Validate an individual HED tag.
   */
  validateIndividualHedTag(tag) {
    //this.checkIfTagIsValid(tag, previousTag)
    //this.checkIfTagUnitClassUnitsAreValid(tag)
    if (!this.options.isEventLevel) {
      //this.checkValueTagSyntax(tag)
    }
    if (this.definitions !== null) {
      this.checkForMissingDefinitions(tag, 'Def')
      this.checkForMissingDefinitions(tag, 'Def-expand')
    }
    if (this.options.expectValuePlaceholderString) {
      this.checkPlaceholderTagSyntax(tag)
    }
  }

  /**
   * Validate the HED tag levels in a parsed HED string object.
   */
  validateHedTagLevels() {
    for (const tagGroup of this.parsedString.tagGroups) {
      for (const subGroup of tagGroup.subGroupArrayIterator()) {
        this.validateHedTagLevel(subGroup)
      }
    }
    this.validateHedTagLevel(this.parsedString.parseTree)
  }

  /**
   * Validate a HED tag level.
   */
  validateHedTagLevel(tagList) {
    this.checkForMultipleUniqueTags(tagList)
    this.checkForDuplicateTags(tagList)
  }

  /**
   * Validate the HED tag groups in a parsed HED string.
   */
  validateHedTagGroups() {
    for (const tagGroup of this.parsedString.tagGroups) {
      for (const subGroup of tagGroup.subParsedGroupIterator()) {
        this.validateHedTagGroup(subGroup)
      }
    }
  }

  /**
   * Validate a HED tag group.
   */
  // eslint-disable-next-line no-unused-vars
  validateHedTagGroup(parsedTagGroup) {
    this.checkDefinitionGroupSyntax(parsedTagGroup)
    this.checkTemporalSyntax(parsedTagGroup)
  }

  /**
   * Validate the top-level HED tags in a parsed HED string.
   */
  validateTopLevelTags() {
    for (const topLevelTag of this.parsedString.topLevelTags) {
      if (
        !hedStringIsAGroup(topLevelTag.formattedTag) &&
        (topLevelTag.hasAttribute(tagGroupType) || topLevelTag.parentHasAttribute(tagGroupType))
      ) {
        this.pushIssue('invalidTopLevelTag', {
          tag: topLevelTag,
        })
      }
    }
  }

  /**
   * Validate the top-level HED tag groups in a parsed HED string.
   */
  validateTopLevelTagGroups() {
    for (const tag of this.parsedString.tags) {
      if (!tag.hasAttribute(topLevelTagGroupType) && !tag.parentHasAttribute(topLevelTagGroupType)) {
        continue
      }
      if (!this.parsedString.topLevelTagGroups.some((topLevelTagGroup) => topLevelTagGroup.includes(tag))) {
        this.pushIssue('invalidTopLevelTagGroupTag', {
          tag: tag,
        })
      }
    }
  }

  /**
   * Validate the full parsed HED string.
   */
  validateFullParsedHedString() {
    this.checkPlaceholderStringSyntax()
    this.checkDefinitionStringSyntax()
  } // Individual checks

  /**
   * Check for duplicate tags at the top level or within a single group.
   */
  checkForDuplicateTags(tagList) {
    const duplicateTags = new Set()

    const addIssue = (tag) => {
      if (duplicateTags.has(tag)) {
        return
      }
      this.pushIssue('duplicateTag', {
        tag: tag,
      })
      duplicateTags.add(tag)
    }

    tagList.forEach((firstTag, firstIndex) => {
      tagList.forEach((secondTag, secondIndex) => {
        if (firstIndex !== secondIndex && firstTag.equivalent(secondTag)) {
          // firstIndex and secondIndex are not the same (i.e. comparing a tag with itself),
          // but they are equivalent tags or tag groups (i.e. have the same members up to order).
          addIssue(firstTag)
          addIssue(secondTag)
        }
      })
    })
  }

  // TODO:  Doesn't seem to be working correctly
  /**
   * Check for multiple instances of a unique tag.
   */
  checkForMultipleUniqueTags(tagList) {
    const actualTagList = tagList.filter((tagOrGroup) => tagOrGroup instanceof ParsedHedTag)
    this._checkForTagAttribute(uniqueType, (uniqueTagPrefix) => {
      if (actualTagList.filter((tag) => tag.formattedTag.startsWith(uniqueTagPrefix)).length > 1) {
        this.pushIssue('multipleUniqueTags', {
          tag: uniqueTagPrefix,
        })
      }
    })
  }

  /**
   * Validation check based on a tag attribute.
   *
   * @param {string} attribute The name of the attribute.
   * @param {function (string): void} fn The actual validation code.
   */
  _checkForTagAttribute(attribute, fn) {
    const schemas = this.hedSchemas.schemas.values()
    for (const schema of schemas) {
      const tags = schema.entries.tags.getEntriesWithBooleanAttribute(attribute)
      for (const tag of tags.values()) {
        fn(tag.longName)
      }
    }
  }

  // TODO: Checking for extensions is being removed temporarily -- well have to add it back eventually.
  /*
   * Check if an individual HED tag is in the schema or is an allowed extension.
   *!/
  checkIfTagIsValid(tag) {
    if (tag.existsInSchema || tag.takesValue) {
      return
    }
    if (!this.options.isEventLevel && this.options.checkForWarnings) {
      // This is an allowed extension.
      this.pushIssue('extension', { tag: tag })
    }
  }*/

  /**
   * Check basic placeholder tag syntax.
   *
   * @param {ParsedHedTag} tag A HED tag.
   */
  checkPlaceholderTagSyntax(tag) {
    // TODO: Refactor or eliminate after column splicing completed
    const placeholderCount = getCharacterCount(tag.formattedTag, '#')
    if (placeholderCount === 1) {
      const valueTag = replaceTagNameWithPound(tag.formattedTag)
      if (getCharacterCount(valueTag, '#') !== 1) {
        this.pushIssue('invalidPlaceholder', {
          tag: tag,
        })
      }
    } else if (placeholderCount > 1) {
      // More than one placeholder.
      this.pushIssue('invalidPlaceholder', {
        tag: tag,
      })
    }
  }

  /**
   * Check full-string placeholder syntax.
   */
  checkPlaceholderStringSyntax() {
    const standalonePlaceholders = {
      // Count of placeholders not in Definition groups.
      placeholders: 0,
      // Whether an Issue has already been generated for an excess placeholder outside a Definition group.
      issueGenerated: false,
    }
    this._checkStandalonePlaceholderStringSyntaxInGroup(this.parsedString.topLevelTags, standalonePlaceholders)
    // Loop over the top-level tag groups.
    for (const tagGroup of this.parsedString.tagGroups) {
      if (tagGroup.isDefinitionGroup) {
        this._checkDefinitionPlaceholderStringSyntaxInGroup(tagGroup)
      } else if (!standalonePlaceholders.issueGenerated) {
        this._checkStandalonePlaceholderStringSyntaxInGroup(tagGroup.tagIterator(), standalonePlaceholders)
      }
    }
    if (this.options.expectValuePlaceholderString && standalonePlaceholders.placeholders === 0) {
      this.pushIssue('missingPlaceholder', {
        string: this.parsedString.hedString,
      })
    }
  }

  /**
   * Check Definition-related placeholder syntax in a tag group.
   *
   * @param {ParsedHedGroup} tagGroup A HED tag group.
   * @private
   */
  _checkDefinitionPlaceholderStringSyntaxInGroup(tagGroup) {
    // Count of placeholders within this Definition group.
    let definitionPlaceholders = 0
    const definitionValue = tagGroup.definitionValue
    const definitionHasPlaceholder = definitionValue === '#'
    const definitionName = tagGroup.definitionName
    for (const tag of tagGroup.tagIterator()) {
      if (!definitionHasPlaceholder || tag !== tagGroup.definitionTag) {
        definitionPlaceholders += getCharacterCount(tag.formattedTag, '#')
      }
    }
    const isValid =
      (definitionValue === '' && definitionPlaceholders === 0) ||
      (definitionHasPlaceholder && definitionPlaceholders === 1)
    if (!isValid) {
      this.pushIssue('invalidPlaceholderInDefinition', {
        definition: definitionName,
      })
    }
  }

  /**
   * Check non-Definition-related placeholder syntax in a tag group.
   *
   * @param {ParsedHedTag[]|Generator<ParsedHedTag>} tags A HED tag iterator.
   * @param {{placeholders: number, issueGenerated: boolean}} standalonePlaceholders The validator's standalone placeholder context.
   * @private
   */
  _checkStandalonePlaceholderStringSyntaxInGroup(tags, standalonePlaceholders) {
    let firstStandaloneTag
    for (const tag of tags) {
      const tagString = tag.formattedTag
      const tagPlaceholders = getCharacterCount(tagString, '#')
      standalonePlaceholders.placeholders += tagPlaceholders
      if (!firstStandaloneTag && tagPlaceholders > 0) {
        firstStandaloneTag = tag
      }
      if (
        tagPlaceholders === 0 ||
        (standalonePlaceholders.placeholders <= 1 &&
          (this.options.expectValuePlaceholderString || standalonePlaceholders.placeholders === 0))
      ) {
        continue
      }
      if (this.options.expectValuePlaceholderString && !standalonePlaceholders.issueGenerated) {
        this.pushIssue('invalidPlaceholder', {
          tag: firstStandaloneTag,
        })
      }
      this.pushIssue('invalidPlaceholder', {
        tag: tag,
      })
      standalonePlaceholders.issueGenerated = true
    }
  }

  /**
   * Check full-string Definition syntax.
   */
  checkDefinitionStringSyntax() {
    if (this.parsedString.definitionGroups.length === 0) {
      return
    }
    switch (this.options.definitionsAllowed) {
      case 'no':
        this.pushIssue('illegalDefinitionContext', {
          string: this.parsedString.hedString,
        })
        break
      case 'exclusive':
        if (
          !isEqual(this.parsedString.definitionGroups, this.parsedString.tagGroups) ||
          this.parsedString.topLevelTags.length > 0
        ) {
          this.pushIssue('illegalDefinitionInExclusiveContext', {
            string: this.parsedString.hedString,
          })
        }
        break
    }
  }

  /**
   * Check the syntax of HED 3 definitions.
   *
   * @param {ParsedHedGroup} tagGroup The tag group.
   */
  checkDefinitionGroupSyntax(tagGroup) {
    if (!tagGroup.isDefinitionGroup) {
      return
    }

    const definitionShortTag = 'Definition'
    const defExpandShortTag = 'Def-expand'
    const defShortTag = 'Def'

    const definitionName = tagGroup.definitionNameAndValue

    let tagGroupValidated = false
    let tagGroupIssueGenerated = false
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
        for (const columnSplice of tag.columnSpliceIterator()) {
          this.pushIssue('curlyBracesInDefinition', {
            definition: definitionName,
            column: columnSplice.originalTag,
          })
        }
        for (const innerTag of tag.tagIterator()) {
          const nestedDefinitionParentTags = [definitionShortTag, defExpandShortTag, defShortTag]
          if (
            nestedDefinitionParentTags.some((parentTag) => {
              return innerTag.schemaTag?.name === parentTag
            })
          ) {
            this.pushIssue('nestedDefinition', {
              definition: definitionName,
            })
          }
        }
      } else if (tag instanceof ParsedHedColumnSplice) {
        this.pushIssue('curlyBracesInDefinition', {
          definition: definitionName,
          column: tag.originalTag,
        })
      } else if (tag.schemaTag?.name !== 'Definition') {
        this.pushIssue('illegalDefinitionGroupTag', {
          tag: tag,
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
    if (tag.schemaTag?.name !== defShortTag) {
      return
    }
    const defName = ParsedHedGroup.findDefinitionName(tag.canonicalTag, defShortTag)
    if (!this.definitions.has(defName)) {
      this.pushIssue('missingDefinition', { definition: defName })
    }
  }

  /**
   * Check the syntax of HED 3 onsets and offsets.
   *
   * @param {ParsedHedGroup} tagGroup The tag group.
   */
  checkTemporalSyntax(tagGroup) {
    if (!tagGroup.isTemporalGroup) {
      return
    }
    const definitionName = this._getTemporalDefinitionName(tagGroup)

    const defExpandChildren = tagGroup.defExpandChildren
    const defTags = tagGroup.defTags ?? []
    if (tagGroup.defCount === 0) {
      this.pushIssue('temporalWithoutDefinition', {
        tagGroup: tagGroup,
        tag: tagGroup.temporalGroupName,
      })
    }
    /**
     * The Onset/Offset tag plus the definition tag/tag group.
     * @type {(ParsedHedTag|ParsedHedGroup)[]}
     */
    const allowedTags = [
      ...getParsedParentTags(this.hedSchemas, tagGroup.temporalGroupName).values(),
      ...defExpandChildren,
      ...defTags,
    ]
    const remainingTags = differenceWith(tagGroup.tags, allowedTags, (ours, theirs) => ours.equivalent(theirs))
    const allowedTagGroups = tagGroup.isOnsetGroup || tagGroup.isInsetGroup ? 1 : 0
    if (
      remainingTags.length > allowedTagGroups ||
      remainingTags.filter((tag) => tag instanceof ParsedHedTag).length > 0
    ) {
      this.pushIssue('extraTagsInTemporal', {
        definition: definitionName,
        tag: tagGroup.temporalGroupName,
      })
    }
  }

  /**
   * Determine the definition name for an Onset- or Offset-type tag group.
   *
   * Normally, this simply returns the tag group's {@link ParsedHedGroup.defNameAndValue} return value. However,
   * if this throws an {@link IssueError}, we add the embedded {@link Issue} to our issue list and return a string
   * stating that multiple definitions were found.
   *
   * @param {ParsedHedGroup} tagGroup The onset or offset group.
   * @returns {string} The group's definition name and (optional) value, if any, or a string noting that multiple definitions were found.
   * @throws {Error} If passed a {@link ParsedHedGroup} that is not an Onset- or Offset-type group.
   * @private
   */
  _getTemporalDefinitionName(tagGroup) {
    if (!tagGroup.isTemporalGroup) {
      throw new Error(
        'Internal validator function "Hed3Validator._getTemporalDefinitionName()" called outside of its intended context',
      )
    }
    try {
      return tagGroup.defNameAndValue
    } catch (e) {
      if (e instanceof IssueError) {
        this.issues.push(e.issue)
        return 'Multiple definition tags found'
      }
    }
  }

  /**
   * Generate a new issue object and push it to the end of the issues array.
   *
   * @param {string} internalCode The internal error code.
   * @param {Object<string, (string|number[])>} parameters The error string parameters.
   */
  pushIssue(internalCode, parameters) {
    const tsvLine = this.parsedString.tsvLine ?? this.parsedString.tsvLines
    if (tsvLine) {
      parameters.tsvLine = tsvLine
    }
    this.issues.push(generateIssue(internalCode, parameters))
  }
}
