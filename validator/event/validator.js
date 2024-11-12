import differenceWith from 'lodash/differenceWith'
import isEqual from 'lodash/isEqual'

import { IssueError, generateIssue, Issue } from '../../common/issues/issues'
import ParsedHedGroup from '../../parser/parsedHedGroup'
import ParsedHedTag from '../../parser/parsedHedTag'
import ParsedHedColumnSplice from '../../parser/parsedHedColumnSplice'
import { getParsedParentTags } from '../../utils/hedData'
import { getParentTag, getTagName, hedStringIsAGroup, replaceTagNameWithPound } from '../../utils/hedStrings'
import { getCharacterCount, isNumber } from '../../utils/string'

const tagGroupType = 'tagGroup'
const topLevelTagGroupType = 'topLevelTagGroup'

const NAME_CLASS_REGEX = /^[\w\-\u0080-\uFFFF]+$/
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
    let previousTag = null
    for (const tag of this.parsedString.tags) {
      this.validateIndividualHedTag(tag, previousTag)
      previousTag = tag
    }
  }

  /**
   * Validate an individual HED tag.
   */
  validateIndividualHedTag(tag, previousTag) {
    //this.checkIfTagIsValid(tag, previousTag)
    this.checkIfTagUnitClassUnitsAreValid(tag)
    if (!this.options.isEventLevel) {
      this.checkValueTagSyntax(tag)
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
    if (this.hedSchemas.generation > 0) {
      this.checkForMultipleUniqueTags(tagList)
    }
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
    if (this.options.checkForWarnings) {
      this.checkForRequiredTags()
    }
    this.checkForInvalidTopLevelTags()
  }

  /**
   * Validate the top-level HED tag groups in a parsed HED string.
   */
  validateTopLevelTagGroups() {
    this.checkForInvalidTopLevelTagGroupTags()
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
   * Check that all required tags are present.
   */
  checkForRequiredTags() {
    this._checkForTagAttribute(requiredType, (requiredTagPrefix) => {
      if (!this.parsedString.topLevelTags.some((tag) => tag.formattedTag.startsWith(requiredTagPrefix))) {
        this.pushIssue('requiredPrefixMissing', {
          tagPrefix: requiredTagPrefix,
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

  /**
   * Check if an individual HED tag is in the schema or is an allowed extension.
   */
  checkIfTagIsValid(tag, previousTag) {
    if (tag.existsInSchema || tag.takesValue) {
      return
    }
    if (!this.options.isEventLevel && this.options.checkForWarnings) {
      // This is an allowed extension.
      this.pushIssue('extension', { tag: tag })
    }
    //
    // if (this.options.expectValuePlaceholderString && getCharacterCount(tag.formattedTag, '#') === 1) {
    //   const valueTag = replaceTagNameWithPound(tag.formattedTag)
    //   if (getCharacterCount(valueTag, '#') === 1) {
    //     // Ending placeholder was replaced with itself.
    //     this.pushIssue('invalidPlaceholder', {
    //       tag: tag,
    //     })
    //   } /* else {
    //     Handled in checkPlaceholderTagSyntax().
    //   } */
    //   return
    // }

    // const isExtensionAllowedTag = tag.allowsExtensions
    // if (!isExtensionAllowedTag && previousTag?.takesValue) {
    //   // This tag isn't an allowed extension, but the previous tag takes a value.
    //   // This is likely caused by an extraneous comma.
    //   this.pushIssue('extraCommaOrInvalid', {
    //     tag: tag,
    //     previousTag: previousTag,
    //   })
    // } else if (!isExtensionAllowedTag) {
    //   // This is not a valid tag.
    //   this.pushIssue('invalidTag', { tag: tag })
    // } else if (!NAME_CLASS_REGEX.test(tag._remainder)) {
    //   this.pushIssue('invalidTag', { tag: tag })
    // } else if (!this.options.isEventLevel && this.options.checkForWarnings) {
    //   // This is an allowed extension.
    //   this.pushIssue('extension', { tag: tag })
    // }
  }

  /**
   * Check that the unit is valid for the tag's unit class.
   *
   * @param {ParsedHedTag} tag A HED tag.
   */
  checkIfTagUnitClassUnitsAreValid(tag) {
    if (!tag.takesValue || !tag.hasUnitClass || tag._remainder) {
      return
    }
    const [foundUnit, validUnit, value] = this.validateUnits(tag)
    if (!validUnit) {
      const tagUnitClassUnits = Array.from(tag.validUnits).map((unit) => unit.name)
      this.pushIssue('unitClassInvalidUnit', {
        tag: tag,
        unitClassUnits: tagUnitClassUnits.sort().join(','),
      })
    } else {
      const validValue = this.validateValue(value, true)
      if (!validValue) {
        this.pushIssue('invalidValue', { tag: tag })
      }
    }
  }

  /**
   * Check basic placeholder tag syntax.
   *
   * @param {ParsedHedTag} tag A HED tag.
   */
  checkPlaceholderTagSyntax(tag) {
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
   * Check the syntax of tag values.
   *
   * @param {ParsedHedTag} tag A HED tag.
   */
  checkValueTagSyntax(tag) {
    if (tag.takesValue && !tag.hasUnitClass) {
      const isValidValue = this.validateValue(
        tag.formattedTagName,
        tag.takesValueTag.hasAttributeName('isNumeric'), // Always false
      )
      if (!isValidValue) {
        this.pushIssue('invalidValue', { tag: tag })
      }
    }
  }

  // TODO: This can be simplified.
  /**
   * Validate a unit and strip it from the value.
   *
   * @param {ParsedHedTag} tag A HED tag.
   * @returns {[boolean, boolean, string]} Whether a unit was found, whether it was valid, and the stripped value.
   */
  static validateUnits(tag) {
    const originalTagUnitValue = tag.originalTagName
    const tagUnitClassUnits = tag.validUnits
    const validUnits = tag.schema.entries.allUnits
    const unitStrings = Array.from(validUnits.keys())
    unitStrings.sort((first, second) => {
      return second.length - first.length
    })
    let actualUnit = getTagName(originalTagUnitValue, ' ')
    let noUnitFound = false
    if (actualUnit === originalTagUnitValue) {
      actualUnit = ''
      noUnitFound = true
    }
    let foundUnit, foundWrongCaseUnit, strippedValue
    for (const unitName of unitStrings) {
      const unit = validUnits.get(unitName)
      const isPrefixUnit = unit.isPrefixUnit
      const isUnitSymbol = unit.isUnitSymbol
      for (const derivativeUnit of unit.derivativeUnits()) {
        if (isPrefixUnit && originalTagUnitValue.startsWith(derivativeUnit)) {
          foundUnit = true
          noUnitFound = false
          strippedValue = originalTagUnitValue.substring(derivativeUnit.length).trim()
        }
        if (actualUnit === derivativeUnit) {
          foundUnit = true
          strippedValue = getParentTag(originalTagUnitValue, ' ')
        } else if (actualUnit.toLowerCase() === derivativeUnit.toLowerCase()) {
          if (isUnitSymbol) {
            foundWrongCaseUnit = true
          } else {
            foundUnit = true
          }
          strippedValue = getParentTag(originalTagUnitValue, ' ')
        }
        if (foundUnit) {
          const unitIsValid = tagUnitClassUnits.has(unit)
          return [true, unitIsValid, strippedValue]
        }
      }
      if (foundWrongCaseUnit) {
        return [true, false, strippedValue]
      }
    }
    return [!noUnitFound, false, originalTagUnitValue]
  }

  /**
   * Determine if a stripped value is valid.
   *
   * @param {string} value The stripped value.
   * @param {boolean} isNumeric Whether the tag is numeric.
   * @returns {boolean} Whether the stripped value is valid.
   * @todo This function is a placeholder until support for value classes is implemented.
   */
  validateValue(value, isNumeric) {
    if (value === '#') {
      return true
    }
    // TODO: Replace with full value class-based implementation.
    if (isNumeric) {
      return isNumber(value)
    }
    // TODO: Placeholder.
    return true
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
   * Check for invalid top-level tags.
   */
  checkForInvalidTopLevelTags() {
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
   * Check for tags marked with the topLevelTagGroup attribute that are not in top-level tag groups.
   */
  checkForInvalidTopLevelTagGroupTags() {
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
