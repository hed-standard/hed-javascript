import { isClockFaceTime, isDateTime, isNumber } from '../../../utils/string'
import { validateUnits } from './units'
import { HedValidator } from '../../event/validator'

const clockTimeUnitClass = 'clockTime'
const dateTimeUnitClass = 'dateTime'
const timeUnitClass = 'time'

const requireChildType = 'requireChild'

/**
 * Hed2Validator class
 */
export class Hed2Validator extends HedValidator {
  constructor(parsedString, hedSchemas, options) {
    super(parsedString, hedSchemas, options)
  }

  /**
   * Validate an individual HED tag.
   */
  validateIndividualHedTag(tag, previousTag) {
    super.validateIndividualHedTag(tag, previousTag)
    this.checkIfTagRequiresChild(tag)
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
   * @param {ParsedHed2Tag} tag A HED tag.
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
      if (!isDateTime(formattedTagUnitValue)) {
        this.pushIssue('invalidValue', { tag: tag })
      }
      return
    } else if (
      clockTimeUnitClass in this.hedSchemas.baseSchema.attributes.unitClasses &&
      tagUnitClasses.includes(clockTimeUnitClass)
    ) {
      if (!isClockFaceTime(formattedTagUnitValue)) {
        this.pushIssue('invalidValue', { tag: tag })
      }
      return
    } else if (
      timeUnitClass in this.hedSchemas.baseSchema.attributes.unitClasses &&
      tagUnitClasses.includes(timeUnitClass) &&
      tag.originalTag.includes(':')
    ) {
      if (!isClockFaceTime(formattedTagUnitValue)) {
        this.pushIssue('invalidValue', { tag: tag })
      }
      return
    }
    const [foundUnit, validUnit, value] = validateUnits(
      originalTagUnitValue,
      tagUnitClassUnits,
      this.hedSchemas.baseSchema.attributes,
    )
    const validValue = this.validateValue(
      value,
      this.hedSchemas.baseSchema.tagHasAttribute(tag.takesValueFormattedTag, 'isNumeric'),
    )
    if (!foundUnit && this.options.checkForWarnings) {
      const defaultUnit = tag.defaultUnit
      this.pushIssue('unitClassDefaultUsed', {
        tag: tag,
        defaultUnit: defaultUnit,
      })
    } else if (!validUnit) {
      this.pushIssue('unitClassInvalidUnit', {
        tag: tag,
        unitClassUnits: tagUnitClassUnits.sort().join(','),
      })
    } else if (!validValue) {
      this.pushIssue('invalidValue', { tag: tag })
    }
  }

  /**
   * Check the syntax of tag values.
   *
   * @param {ParsedHed2Tag} tag A HED tag.
   */
  checkValueTagSyntax(tag) {
    if (tag.takesValue && !tag.hasUnitClass) {
      const isValidValue = this.validateValue(
        tag.formattedTagName,
        this.hedSchemas.baseSchema.tagHasAttribute(tag.takesValueFormattedTag, 'isNumeric'),
      )
      if (!isValidValue) {
        this.pushIssue('invalidValue', { tag: tag })
      }
    }
  }

  /**
   * Determine if a stripped value is valid.
   *
   * @param {string} value The stripped value.
   * @param {boolean} isNumeric Whether the tag is numeric.
   * @returns {boolean} Whether the stripped value is valid.
   */
  validateValue(value, isNumeric) {
    if (value === '#') {
      return true
    }
    if (isNumeric) {
      return isNumber(value)
    }
    const hed2ValidValueCharacters = /^[-a-zA-Z0-9.$%^+_; :]+$/
    return hed2ValidValueCharacters.test(value)
  }

  /**
   * Check if a tag is missing a required child.
   *
   * @param {ParsedHed2Tag} tag The HED tag to be checked.
   */
  checkIfTagRequiresChild(tag) {
    const invalid = tag.hasAttribute(requireChildType)
    if (invalid) {
      // If this tag has the "requireChild" attribute, then by virtue of even being in the dataset it is missing a required child.
      this.pushIssue('childRequired', { tag: tag })
    }
  }
}
