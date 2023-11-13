import differenceWith from 'lodash/differenceWith'
import isEqual from 'lodash/isEqual'

import { IssueError } from '../../common/issues/issues'
import ParsedHedGroup from '../../parser/parsedHedGroup'
import { ParsedHedTag } from '../../parser/parsedHedTag'
import { getParsedParentTags } from '../../utils/hedData'
import { getParentTag, getTagName, hedStringIsAGroup, replaceTagNameWithPound } from '../../utils/hedStrings'
import { getCharacterCount, isNumber } from '../../utils/string'
import { HedValidator } from './validator'

const tagGroupType = 'tagGroup'
const topLevelTagGroupType = 'topLevelTagGroup'

/**
 * Hed3Validator class
 */
export class Hed3Validator extends HedValidator {
  /**
   * The parsed definitions.
   * @type {Map<string, ParsedHedGroup>}
   */
  definitions

  /**
   * Constructor.
   * @param {ParsedHedString} parsedString The parsed HED string to be validated.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   * @param {Map<string, ParsedHedGroup>} definitions The parsed definitions.
   * @param {Object<string, boolean>} options The validation options.
   */
  constructor(parsedString, hedSchemas, definitions, options) {
    super(parsedString, hedSchemas, options)
    this.definitions = definitions
  }

  validateStringLevel() {
    super.validateStringLevel()
    this.validateFullParsedHedString()
  }

  validateEventLevel() {
    super.validateEventLevel()
    this.validateTopLevelTagGroups()
  }

  /**
   * Validate the full parsed HED string.
   */
  validateFullParsedHedString() {
    this.checkPlaceholderStringSyntax()
    this.checkDefinitionStringSyntax()
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
    if (this.options.expectValuePlaceholderString) {
      this.checkPlaceholderTagSyntax(tag)
    }
  }

  /**
   * Validate a HED tag group.
   */
  validateHedTagGroup(parsedTagGroup) {
    super.validateHedTagGroup(parsedTagGroup)
    this.checkDefinitionGroupSyntax(parsedTagGroup)
    this.checkTemporalSyntax(parsedTagGroup)
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

  _checkForTagAttribute(attribute, fn) {
    const schemas = this.hedSchemas.schemas.values()
    for (const schema of schemas) {
      const tags = schema.entries.definitions.get('tags').getEntriesWithBooleanAttribute(attribute)
      for (const tag of tags) {
        fn(tag.name)
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

    if (this.options.expectValuePlaceholderString && getCharacterCount(tag.formattedTag, '#') === 1) {
      const valueTag = replaceTagNameWithPound(tag.formattedTag)
      if (getCharacterCount(valueTag, '#') === 1) {
        // Ending placeholder was replaced with itself.
        this.pushIssue('invalidPlaceholder', {
          tag: tag,
        })
      } /* else {
        Handled in checkPlaceholderTagSyntax().
      } */
    } else {
      super.checkIfTagIsValid(tag, previousTag)
    }
  }

  /**
   * Check that the unit is valid for the tag's unit class.
   * @param {ParsedHed3Tag} tag A HED tag.
   */
  checkIfTagUnitClassUnitsAreValid(tag) {
    if (tag.existsInSchema || !tag.hasUnitClass) {
      return
    }
    const [foundUnit, validUnit, value] = this.validateUnits(tag)
    if (!foundUnit && this.options.checkForWarnings) {
      const defaultUnit = tag.defaultUnit
      this.pushIssue('unitClassDefaultUsed', {
        tag: tag,
        defaultUnit: defaultUnit,
      })
    } else if (!validUnit) {
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
    const definitionHasPlaceholder = tagGroup.definitionValue === '#'
    const definitionName = tagGroup.definitionName
    for (const tag of tagGroup.tagIterator()) {
      if (!definitionHasPlaceholder || tag !== tagGroup.definitionTag) {
        definitionPlaceholders += getCharacterCount(tag.formattedTag, '#')
      }
    }
    const isValid =
      (!definitionHasPlaceholder && definitionPlaceholders === 0) ||
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
   * @param {ParsedHed3Tag} tag A HED tag.
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

  /**
   * Validate a unit and strip it from the value.
   * @param {ParsedHed3Tag} tag A HED tag.
   * @returns {[boolean, boolean, string]} Whether a unit was found, whether it was valid, and the stripped value.
   */
  validateUnits(tag) {
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
   */
  validateValue(value, isNumeric) {
    if (value === '#') {
      return true
    }
    // TODO: Replace with full value class-based implementation.
    if (isNumeric) {
      return isNumber(value)
    }
    const hed3ValidValueCharacters = /^[-a-zA-Z0-9.$%^+_; ]+$/
    return hed3ValidValueCharacters.test(value)
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
    const definitionParentTags = getParsedParentTags(this.hedSchemas, definitionShortTag)
    const defExpandParentTags = getParsedParentTags(this.hedSchemas, defExpandShortTag)
    const defParentTags = getParsedParentTags(this.hedSchemas, defShortTag)

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
            bounds: columnSplice.originalBounds,
            column: columnSplice.originalTag,
          })
        }
        for (const innerTag of tag.tagIterator()) {
          const nestedDefinitionParentTags = [
            ...definitionParentTags.values(),
            ...defExpandParentTags.values(),
            ...defParentTags.values(),
          ]
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
      } else if (!tag.isDescendantOf(definitionParentTags.get(tag.schema))) {
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
    const defParentTags = getParsedParentTags(this.hedSchemas, defShortTag)
    if (!tag.isDescendantOf(defParentTags.get(tag.schema))) {
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
}
