import { ParsedHedTag } from '../../parser/parsedHedTag'
import { generateIssue, Issue } from '../../common/issues/issues'
import { Schemas } from '../../common/schema/types'

const NAME_CLASS_REGEX = /^[\w\-\u0080-\uFFFF]+$/

const uniqueType = 'unique'
const requiredType = 'required'
const requireChildType = 'requireChild'
const specialTags = require('../specialTags.json')

// Validation tests
/**
 * HedValidator class
 */
export class HedValidator {
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
   * Constructor.
   *
   * @param {ParsedHedString} parsedString The parsed HED string to be validated.
   * @param {Schemas} hedSchemas The collection of HED schemas.
   * @param {Object<String, boolean>} options The validation options.
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
    if (this.hedSchemas.generation > 0) {
      this.checkIfTagIsValid(tag, previousTag)
      this.checkIfTagUnitClassUnitsAreValid(tag)
      this.checkIfTagRequiresChild(tag)
      if (!this.options.isEventLevel) {
        this.checkValueTagSyntax(tag)
      }
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
    // No-op in HED 2, checks definition syntax in HED 3.
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
      // If this tag has the "requireChild" attribute, then by virtue of even being in the dataset it is missing a required child.
      this.pushIssue('childRequired', { tag: tag })
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
  // eslint-disable-next-line no-unused-vars
  checkValueTagSyntax(tag) {}

  /**
   * Check if an individual HED tag is in the schema or is an allowed extension.
   */
  checkIfTagIsValid(tag, previousTag) {
    if (tag.existsInSchema || tag.takesValue) {
      return
    }
    // Whether this tag has an ancestor with the 'extensionAllowed' attribute.
    const isExtensionAllowedTag = tag.allowsExtensions
    if (!isExtensionAllowedTag && previousTag?.takesValue) {
      // This tag isn't an allowed extension, but the previous tag takes a value.
      // This is likely caused by an extraneous comma.
      this.pushIssue('extraCommaOrInvalid', {
        tag: tag,
        previousTag: previousTag,
      })
    } else if (!isExtensionAllowedTag) {
      // This is not a valid tag.
      this.pushIssue('invalidTag', { tag: tag })
    } else if (!NAME_CLASS_REGEX.test(tag._remainder)) {
      this.pushIssue('invalidTag', { tag: tag })
    } else if (!this.options.isEventLevel && this.options.checkForWarnings) {
      // This is an allowed extension.
      this.pushIssue('extension', { tag: tag })
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
