const utils = require('../../utils')
const { ParsedHedGroup, ParsedHedTag } = require('../types/parsedHed')

const { HedValidator } = require('./validator')

const tagGroupType = 'tagGroup'
const topLevelTagGroupType = 'topLevelTagGroup'

class Hed3Validator extends HedValidator {
  /**
   * Constructor.
   * @param {ParsedHedString} parsedString
   * @param {Schemas} hedSchemas
   * @param {Map<string, ParsedHedGroup>} definitions
   * @param {object<string, boolean>} options
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
    const tags = this.hedSchemas.baseSchema.entries.definitions.get('tags').getEntriesWithBooleanAttribute(attribute)
    for (const tag of tags) {
      fn(tag.name)
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
   * Validate a unit and strip it from the value.
   * @param {ParsedHed3Tag} tag A HED tag.
   * @return {[boolean, boolean, string]} Whether a unit was found, whether it was valid, and the stripped value.
   */
  validateUnits(tag) {
    const originalTagUnitValue = tag.originalTagName
    const tagUnitClassUnits = tag.validUnits
    const validUnits = this.hedSchemas.baseSchema.entries.allUnits
    const unitStrings = Array.from(validUnits.keys())
    unitStrings.sort((first, second) => {
      return second.length - first.length
    })
    let actualUnit = utils.HED.getTagName(originalTagUnitValue, ' ')
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
          strippedValue = utils.HED.getParentTag(originalTagUnitValue, ' ')
        } else if (actualUnit.toLowerCase() === derivativeUnit.toLowerCase()) {
          if (isUnitSymbol) {
            foundWrongCaseUnit = true
          } else {
            foundUnit = true
          }
          strippedValue = utils.HED.getParentTag(originalTagUnitValue, ' ')
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
   */
  validateValue(value, isNumeric) {
    if (value === '#') {
      return true
    }
    // TODO: Replace with full value class-based implementation.
    if (isNumeric) {
      return utils.string.isNumber(value)
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
    const nestedDefinitionParentTags = [definitionParentTag, defExpandParentTag, defParentTag]
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
    const defName = ParsedHedGroup.findDefinitionName(tag.canonicalTag, defShortTag)
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
    const parentTag = new ParsedHedTag(shortTag, shortTag, [0, shortTag.length - 1], this.hedSchemas)
    this.issues = this.issues.concat(parentTag.conversionIssues)
    return parentTag
  }

  /**
   * Check for invalid top-level tags.
   */
  checkForInvalidTopLevelTags() {
    for (const topLevelTag of this.parsedString.topLevelTags) {
      if (
        !utils.HED.hedStringIsAGroup(topLevelTag.formattedTag) &&
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

module.exports = {
  Hed3Validator: Hed3Validator,
}
