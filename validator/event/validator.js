const utils = require('../../utils')
const { ParsedHedTag } = require('../parser/types')
const ParsedHedString = require('../parser/parsedString')
const { generateIssue } = require('../../common/issues/issues')
const { Schemas } = require('../../common/schema')

const uniqueType = 'unique'
const requiredType = 'required'
const requireChildType = 'requireChild'
const clockTimeUnitClass = 'clockTime'
const dateTimeUnitClass = 'dateTime'
const timeUnitClass = 'time'

// Validation tests

class HedValidator {
  /**
   * Constructor.
   *
   * @param {ParsedHedString} parsedString
   * @param {Schemas} hedSchemas
   * @param {object<String, boolean>} options
   */
  constructor(parsedString, hedSchemas, options) {
    this.parsedString = parsedString
    this.hedSchemas = hedSchemas
    this.options = options
    this.issues = []
  }

  // Phases
  validateStringLevel() {
    this.options.isEventLevel = false
    this.validateFullParsedHedString()
    this.validateIndividualHedTags()
    this.validateHedTagGroups()
  }

  validateEventLevel() {
    this.options.isEventLevel = true
    this.validateTopLevelTags()
    this.validateIndividualHedTags()
    this.validateHedTagLevels()
    this.validateHedTagGroups()
  }

  // Categories

  /**
   * Validate the full parsed HED string.
   */
  validateFullParsedHedString() {
    this.checkPlaceholderStringSyntax()
  }

  /**
   * Validate the individual HED tags in a parsed HED string object.
   */
  validateIndividualHedTags() {
    let previousTag = new ParsedHedTag('', '', [0, 0], this.hedSchemas)
    for (const tag of this.parsedString.tags) {
      this.validateIndividualHedTag(tag, previousTag)
      previousTag = tag
    }
  }

  /**
   * Validate an individual HED tag.
   */
  validateIndividualHedTag(tag, previousTag) {
    if (this.hedSchemas.generation > 0) {
      this.checkIfTagIsValid(tag, previousTag)
      this.checkIfTagUnitClassUnitsAreValid(tag)
      this.checkIfTagRequiresChild(tag)
      if (!this.options.isEventLevel) {
        this.checkValueTagSyntax(tag)
      }
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
      for (const subGroup of tagGroup.subGroupIterator()) {
        this.validateHedTagLevel(subGroup)
      }
    }
    this.validateHedTagLevel(this.parsedString.topLevelTags)
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
    for (const parsedTagGroup of this.parsedString.tagGroups) {
      this.validateHedTagGroup(parsedTagGroup)
    }
  }

  /**
   * Validate a HED tag group.
   */
  // eslint-disable-next-line no-unused-vars
  validateHedTagGroup(parsedTagGroup) {
    // No-op in HED 2, checks definition syntax in HED 3,
  }

  /**
   * Validate the top-level HED tags in a parsed HED string.
   */
  validateTopLevelTags() {
    if (this.hedSchemas.generation > 0 && this.options.checkForWarnings) {
      this.checkForRequiredTags()
    }
  }

  // Individual checks

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
        tag: tag.originalTag,
        bounds: tag.originalBounds,
      })
      duplicateTags.add(tag)
    }

    for (const firstTag of tagList) {
      for (const secondTag of tagList) {
        if (firstTag !== secondTag && firstTag.equivalent(secondTag)) {
          addIssue(firstTag)
          addIssue(secondTag)
        }
      }
    }
  }

  /**
   * Check for multiple instances of a unique tag.
   */
  checkForMultipleUniqueTags(tagList) {
    this._checkForTagAttribute(uniqueType, (uniqueTagPrefix) => {
      if (tagList.filter((tag) => tag.formattedTag.startsWith(uniqueTagPrefix)).length > 1) {
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
   * @protected
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  _checkForTagAttribute(attribute, fn) {}

  /**
   * Check if a tag is missing a required child.
   *
   * @param {ParsedHedTag} tag The HED tag to be checked.
   */
  checkIfTagRequiresChild(tag) {
    const invalid = tag.hasAttribute(requireChildType)
    if (invalid) {
      this.pushIssue('childRequired', { tag: tag.originalTag })
    }
  }

  /**
   * Check that the unit is valid for the tag's unit class.
   *
   * @param {ParsedHedTag} tag A HED tag.
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  checkIfTagUnitClassUnitsAreValid(tag) {}

  /**
   * Check the syntax of tag values.
   *
   * @param {ParsedHedTag} tag A HED tag.
   */
  checkValueTagSyntax(tag) {
    if (tag.takesValue && !tag.hasUnitClass) {
      const isValidValue = utils.HED.validateValue(
        tag.formattedTagName,
        this.hedSchemas.baseSchema.tagHasAttribute(utils.HED.replaceTagNameWithPound(tag.formattedTag), 'isNumeric'),
        this.hedSchemas.isHed3,
      )
      if (!isValidValue) {
        this.pushIssue('invalidValue', { tag: tag.originalTag })
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
    // Whether this tag has an ancestor with the 'extensionAllowed' attribute.
    const isExtensionAllowedTag = tag.allowsExtensions
    if (this.options.expectValuePlaceholderString && tag.formattedTag.split('#').length === 2) {
      const valueTag = utils.HED.replaceTagNameWithPound(tag.formattedTag)
      if (valueTag.split('#').length !== 2) {
        // To avoid a redundant issue.
      } else {
        this.pushIssue('invalidPlaceholder', {
          tag: tag.originalTag,
        })
      }
    } else if (!isExtensionAllowedTag && previousTag.takesValue) {
      // This tag isn't an allowed extension, but the previous tag takes a value.
      // This is likely caused by an extraneous comma.
      this.pushIssue('extraCommaOrInvalid', {
        tag: tag.originalTag,
        previousTag: previousTag.originalTag,
      })
    } else if (!isExtensionAllowedTag) {
      // This is not a valid tag.
      this.pushIssue('invalidTag', { tag: tag.originalTag })
    } else if (!this.options.isEventLevel && this.options.checkForWarnings) {
      // This is an allowed extension.
      this.pushIssue('extension', { tag: tag.originalTag })
    }
  }

  /**
   * Check basic placeholder tag syntax.
   *
   * @param {ParsedHedTag} tag A HED tag.
   */
  checkPlaceholderTagSyntax(tag) {
    const placeholderCount = utils.string.getCharacterCount(tag.formattedTag, '#')
    if (placeholderCount === 1) {
      const valueTag = utils.HED.replaceTagNameWithPound(tag.formattedTag)
      if (utils.string.getCharacterCount(valueTag, '#') !== 1) {
        this.pushIssue('invalidPlaceholder', {
          tag: tag.originalTag,
        })
      }
    } else if (placeholderCount > 1) {
      // More than one placeholder.
      this.pushIssue('invalidPlaceholder', {
        tag: tag.originalTag,
      })
    }
  }

  /**
   * Check full-string placeholder syntax.
   */
  checkPlaceholderStringSyntax() {
    let standalonePlaceholders = 0
    let definitionPlaceholders
    let standaloneIssueGenerated = false
    let firstStandaloneTag = ''
    for (const tag of this.parsedString.topLevelTags) {
      const tagString = tag.formattedTag
      const tagPlaceholders = utils.string.getCharacterCount(tagString, '#')
      standalonePlaceholders += tagPlaceholders
      if (!firstStandaloneTag && standalonePlaceholders >= 1) {
        firstStandaloneTag = tag.originalTag
      }
      if (
        tagPlaceholders &&
        ((!this.options.expectValuePlaceholderString && standalonePlaceholders) || standalonePlaceholders > 1)
      ) {
        if (this.options.expectValuePlaceholderString && !standaloneIssueGenerated) {
          this.pushIssue('invalidPlaceholder', {
            tag: firstStandaloneTag,
          })
        }
        this.pushIssue('invalidPlaceholder', {
          tag: tag.originalTag,
        })
        standaloneIssueGenerated = true
      }
    }
    for (const tagGroup of this.parsedString.tagGroups) {
      if (tagGroup.isDefinitionGroup) {
        definitionPlaceholders = 0
        const isDefinitionPlaceholder = tagGroup.definitionTag.formattedTagName === '#'
        const definitionName = tagGroup.definitionName
        for (const tag of tagGroup.tagIterator()) {
          if (isDefinitionPlaceholder && tag === tagGroup.definitionTag) {
            continue
          }
          const tagString = tag.formattedTag
          definitionPlaceholders += utils.string.getCharacterCount(tagString, '#')
        }
        if (
          !(
            (!isDefinitionPlaceholder && definitionPlaceholders === 0) ||
            (isDefinitionPlaceholder && definitionPlaceholders === 1)
          )
        ) {
          this.pushIssue('invalidPlaceholderInDefinition', {
            definition: definitionName,
          })
        }
      } else if (!standaloneIssueGenerated) {
        for (const tag of tagGroup.tagIterator()) {
          const tagString = tag.formattedTag
          const tagPlaceholders = utils.string.getCharacterCount(tagString, '#')
          standalonePlaceholders += tagPlaceholders
          if (!firstStandaloneTag && standalonePlaceholders >= 1) {
            firstStandaloneTag = tag.originalTag
          }
          if (
            tagPlaceholders &&
            ((!this.options.expectValuePlaceholderString && standalonePlaceholders) || standalonePlaceholders > 1)
          ) {
            if (this.options.expectValuePlaceholderString && !standaloneIssueGenerated) {
              this.pushIssue('invalidPlaceholder', {
                tag: firstStandaloneTag,
              })
            }
            this.pushIssue('invalidPlaceholder', {
              tag: tag.originalTag,
            })
            standaloneIssueGenerated = true
          }
        }
      }
    }
    if (this.options.expectValuePlaceholderString && standalonePlaceholders === 0) {
      this.pushIssue('missingPlaceholder', {
        string: this.parsedString.hedString,
      })
    }
  }

  /**
   * Generate a new issue object and push it to the end of the issues array.
   *
   * @param {string} internalCode The internal error code.
   * @param {object<string, (string|number[])>} parameters The error string parameters.
   */
  pushIssue(internalCode, parameters) {
    this.issues.push(generateIssue(internalCode, parameters))
  }
}

class Hed2Validator extends HedValidator {
  constructor(parsedString, hedSchemas, options) {
    super(parsedString, hedSchemas, options)
  }

  _checkForTagAttribute(attribute, fn) {
    const tags = this.hedSchemas.baseSchema.attributes.tagAttributes[attribute]
    for (const tag of Object.keys(tags)) {
      fn(tag)
    }
  }

  /**
   * Check that the unit is valid for the tag's unit class.
   *
   * @param {ParsedHedTag} tag A HED tag.
   */
  checkIfTagUnitClassUnitsAreValid(tag) {
    if (tag.existsInSchema || !tag.hasUnitClass) {
      return
    }
    const tagUnitClasses = tag.unitClasses
    const originalTagUnitValue = tag.originalTagName
    const formattedTagUnitValue = tag.formattedTagName
    const tagUnitClassUnits = tag.validUnits
    if (
      dateTimeUnitClass in this.hedSchemas.baseSchema.attributes.unitClasses &&
      tagUnitClasses.includes(dateTimeUnitClass)
    ) {
      if (!utils.string.isDateTime(formattedTagUnitValue)) {
        this.pushIssue('invalidValue', { tag: tag.originalTag })
      }
      return
    } else if (
      clockTimeUnitClass in this.hedSchemas.baseSchema.attributes.unitClasses &&
      tagUnitClasses.includes(clockTimeUnitClass)
    ) {
      if (!utils.string.isClockFaceTime(formattedTagUnitValue)) {
        this.pushIssue('invalidValue', { tag: tag.originalTag })
      }
      return
    } else if (
      timeUnitClass in this.hedSchemas.baseSchema.attributes.unitClasses &&
      tagUnitClasses.includes(timeUnitClass) &&
      tag.originalTag.includes(':')
    ) {
      if (!utils.string.isClockFaceTime(formattedTagUnitValue)) {
        this.pushIssue('invalidValue', { tag: tag.originalTag })
      }
      return
    }
    const [foundUnit, validUnit, value] = utils.HED.validateUnits(
      originalTagUnitValue,
      tagUnitClassUnits,
      this.hedSchemas.baseSchema.attributes,
    )
    const validValue = utils.HED.validateValue(
      value,
      this.hedSchemas.baseSchema.tagHasAttribute(utils.HED.replaceTagNameWithPound(tag.formattedTag), 'isNumeric'),
      this.hedSchemas.isHed3,
    )
    if (!foundUnit && this.options.checkForWarnings) {
      const defaultUnit = tag.defaultUnit
      this.pushIssue('unitClassDefaultUsed', {
        tag: tag.originalTag,
        defaultUnit: defaultUnit,
      })
    } else if (!validUnit) {
      this.pushIssue('unitClassInvalidUnit', {
        tag: tag.originalTag,
        unitClassUnits: tagUnitClassUnits.sort().join(','),
      })
    } else if (!validValue) {
      this.pushIssue('invalidValue', { tag: tag.originalTag })
    }
  }

  /**
   * Determine if a stripped value is valid.
   */
  validateValue(value, isNumeric) {
    if (value === '#') {
      return true
    }
    if (isNumeric) {
      return utils.string.isNumber(value)
    }
    const hed2ValidValueCharacters = /^[-a-zA-Z0-9.$%^+_; :]+$/
    return hed2ValidValueCharacters.test(value)
  }
}

module.exports = {
  HedValidator: HedValidator,
  Hed2Validator: Hed2Validator,
}
