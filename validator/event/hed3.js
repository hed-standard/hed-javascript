import differenceWith from 'lodash/differenceWith'

import { IssueError } from '../../common/issues/issues'
import ParsedHedGroup from '../parser/parsedHedGroup'
import { ParsedHedTag } from '../parser/parsedHedTag'
import { asArray } from '../../utils/array'
import { getParsedParentTags } from '../../utils/hedData'
import { getParentTag, getTagName, hedStringIsAGroup } from '../../utils/hedStrings'
import { isNumber } from '../../utils/string'
import { HedValidator } from './validator'

const tagGroupType = 'tagGroup'
const topLevelTagGroupType = 'topLevelTagGroup'

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
    this.checkOnsetOffsetSyntax(parsedTagGroup)
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
        tag: tag.originalTag,
        defaultUnit: defaultUnit,
      })
    } else if (!validUnit) {
      const tagUnitClassUnits = Array.from(tag.validUnits).map((unit) => unit.name)
      this.pushIssue('unitClassInvalidUnit', {
        tag: tag.originalTag,
        unitClassUnits: tagUnitClassUnits.sort().join(','),
      })
    } else {
      const validValue = this.validateValue(value, true)
      if (!validValue) {
        this.pushIssue('invalidValue', { tag: tag.originalTag })
      }
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
        this.pushIssue('invalidValue', { tag: tag.originalTag })
      }
    }
  }

  /**
   * Validate a unit and strip it from the value.
   * @param {ParsedHed3Tag} tag A HED tag.
   * @return {[boolean, boolean, string]} Whether a unit was found, whether it was valid, and the stripped value.
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
   * Check the syntax of HED 3 definitions.
   *
   * @param {ParsedHedGroup} tagGroup The tag group.
   */
  checkDefinitionSyntax(tagGroup) {
    const definitionShortTag = 'definition'
    const defExpandShortTag = 'def-expand'
    const defShortTag = 'def'
    const definitionParentTag = getParsedParentTags(this.hedSchemas, definitionShortTag).get(
      this.hedSchemas.standardSchema,
    )
    const defExpandParentTag = getParsedParentTags(this.hedSchemas, defExpandShortTag).get(
      this.hedSchemas.standardSchema,
    )
    const defParentTag = getParsedParentTags(this.hedSchemas, defShortTag).get(this.hedSchemas.standardSchema)
    let definitionTagFound = false
    let definitionName
    for (const tag of tagGroup.tags) {
      if (tag instanceof ParsedHedGroup) {
        continue
      }
      if (tag.isDescendantOf(definitionParentTag)) {
        definitionTagFound = true
        definitionName = tag.originalTagName
        break
      }
    }
    if (!definitionTagFound) {
      return
    }
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
        for (const innerTag of tag.tagIterator()) {
          const nestedDefinitionParentTags = [definitionParentTag, defExpandParentTag, defParentTag]
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
      } else if (definitionTagFound && !tag.isDescendantOf(definitionParentTag)) {
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
    const defParentTags = getParsedParentTags(this.hedSchemas, defShortTag)
    if (!tag.isDescendantOf(defParentTags.get(tag.schema))) {
      return
    }
    const defName = ParsedHedGroup.findDefinitionName(tag.canonicalTag, defShortTag)
    if (!this.definitions.has(defName)) {
      this.pushIssue('missingDefinition', { def: defName })
    }
  }

  /**
   * Check the syntax of HED 3 onsets and offsets.
   *
   * @param {ParsedHedGroup} tagGroup The tag group.
   */
  checkOnsetOffsetSyntax(tagGroup) {
    if (!(tagGroup.isOnsetGroup || tagGroup.isOffsetGroup)) {
      return
    }
    let definitionName
    try {
      definitionName = tagGroup.definitionNameAndValue
    } catch (e) {
      if (e instanceof IssueError) {
        this.issues.push(e.issue)
        definitionName = 'Multiple definition tags found'
      }
    }
    const defExpandChildren = tagGroup.hasDefExpandChildren ? tagGroup.defExpandChildren : []
    const defTags = tagGroup.isDefGroup ? asArray(tagGroup.definitionTag) : []
    if (!(tagGroup.hasDefExpandChildren || tagGroup.isDefGroup)) {
      this.pushIssue('onsetOffsetWithoutDefinition', {
        tagGroup: tagGroup.originalTag,
      })
    }
    const allowedTags = [getParsedParentTags(this.hedSchemas, 'Onset').get(this.hedSchemas.standardSchema)]
    allowedTags.push(...defExpandChildren)
    allowedTags.push(...defTags)
    const remainingTags = differenceWith(tagGroup.tags, allowedTags, (ours, theirs) => ours.equivalent(theirs))
    const allowedRemainingTags = tagGroup.isOnsetGroup ? 1 : 0
    if (
      remainingTags.length > allowedRemainingTags ||
      remainingTags.filter((tag) => tag instanceof ParsedHedTag).length > 0
    ) {
      this.pushIssue('extraTagsInOnsetOffset', {
        definition: definitionName,
      })
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
      if (tag.hasAttribute(topLevelTagGroupType) || tag.parentHasAttribute(topLevelTagGroupType)) {
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
