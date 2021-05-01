const utils = require('../utils')
const {
  parseHedString,
  ParsedHedString,
  ParsedHedTag,
} = require('./stringParser')
const { buildSchemaAttributesObject } = require('./schema')
const { Schemas } = require('../utils/schema')

const openingGroupCharacter = '('
const closingGroupCharacter = ')'
const comma = ','
const delimiters = [comma]

const uniqueType = 'unique'
const requiredType = 'required'
const requireChildType = 'requireChild'
const unitsElement = 'units'
const clockTimeUnitClass = 'clockTime'
const dateTimeUnitClass = 'dateTime'
const timeUnitClass = 'time'

// Validation tests

/**
 * Substitute certain illegal characters and report warnings when found.
 */
const substituteCharacters = function (hedString) {
  const issues = []
  const illegalCharacterMap = { '\0': ['ASCII NUL', ' '] }
  const flaggedCharacters = /[^\w\d./$ :-]/g
  const replaceFunction = function (match, offset) {
    if (match in illegalCharacterMap) {
      const [name, replacement] = illegalCharacterMap[match]
      issues.push(
        utils.issues.generateIssue('invalidCharacter', {
          character: name,
          index: offset,
          string: hedString,
        }),
      )
      return replacement
    } else {
      return match
    }
  }
  const fixedString = hedString.replace(flaggedCharacters, replaceFunction)

  return [fixedString, issues]
}

/**
 * Check if group parentheses match. Pushes an issue if they don't match.
 */
const countTagGroupParentheses = function (hedString) {
  const issues = []
  const numberOfOpeningParentheses = utils.string.getCharacterCount(
    hedString,
    openingGroupCharacter,
  )
  const numberOfClosingParentheses = utils.string.getCharacterCount(
    hedString,
    closingGroupCharacter,
  )
  if (numberOfOpeningParentheses !== numberOfClosingParentheses) {
    issues.push(
      utils.issues.generateIssue('parentheses', {
        opening: numberOfOpeningParentheses,
        closing: numberOfClosingParentheses,
      }),
    )
  }
  return issues
}

/**
 * Check if a comma is missing after an opening parenthesis.
 */
const isCommaMissingAfterClosingParenthesis = function (
  lastNonEmptyCharacter,
  currentCharacter,
) {
  return (
    lastNonEmptyCharacter === closingGroupCharacter &&
    !(
      delimiters.includes(currentCharacter) ||
      currentCharacter === closingGroupCharacter
    )
  )
}

/**
 * Check for delimiter issues in a HED string (e.g. missing commas adjacent to groups, extra commas or tildes).
 */
const findDelimiterIssuesInHedString = function (hedString) {
  const issues = []
  let lastNonEmptyValidCharacter = ''
  let lastNonEmptyValidIndex = 0
  let currentTag = ''
  for (let i = 0; i < hedString.length; i++) {
    const currentCharacter = hedString.charAt(i)
    currentTag += currentCharacter
    if (utils.string.stringIsEmpty(currentCharacter)) {
      continue
    }
    if (delimiters.includes(currentCharacter)) {
      if (currentTag.trim() === currentCharacter) {
        issues.push(
          utils.issues.generateIssue('extraDelimiter', {
            character: currentCharacter,
            index: i,
            string: hedString,
          }),
        )
        currentTag = ''
        continue
      }
      currentTag = ''
    } else if (currentCharacter === openingGroupCharacter) {
      if (currentTag.trim() === openingGroupCharacter) {
        currentTag = ''
      } else {
        issues.push(
          utils.issues.generateIssue('invalidTag', { tag: currentTag }),
        )
      }
    } else if (
      isCommaMissingAfterClosingParenthesis(
        lastNonEmptyValidCharacter,
        currentCharacter,
      )
    ) {
      issues.push(
        utils.issues.generateIssue('commaMissing', {
          tag: currentTag.slice(0, -1),
        }),
      )
      break
    }
    lastNonEmptyValidCharacter = currentCharacter
    lastNonEmptyValidIndex = i
  }
  if (delimiters.includes(lastNonEmptyValidCharacter)) {
    issues.push(
      utils.issues.generateIssue('extraDelimiter', {
        character: lastNonEmptyValidCharacter,
        index: lastNonEmptyValidIndex,
        string: hedString,
      }),
    )
  }
  return issues
}

const camelCase = /([A-Z-]+\s*[a-z-]*)+/

/**
 * Check if tag level capitalization is valid (CamelCase).
 */
const checkCapitalization = function (tag, hedSchemas, doSemanticValidation) {
  const issues = []
  const tagNames = tag.originalTag.split('/')
  if (
    doSemanticValidation &&
    utils.HED.tagTakesValue(tag.formattedTag, hedSchemas.baseSchema.attributes)
  ) {
    tagNames.pop()
  }
  for (const tagName of tagNames) {
    const correctTagName = utils.string.capitalizeString(tagName)
    if (tagName !== correctTagName && !camelCase.test(tagName)) {
      issues.push(
        utils.issues.generateIssue('capitalization', { tag: tag.originalTag }),
      )
    }
  }
  return issues
}

/**
 * Check for duplicate tags at the top level or within a single group.
 * NOTE: Nested groups are treated as single tags for this validation.
 */
const checkForDuplicateTags = function (tagList) {
  const issues = []
  const tagListLength = tagList.length
  const duplicateIndices = []
  for (let i = 0; i < tagListLength; i++) {
    for (let j = 0; j < tagListLength; j++) {
      if (i === j) {
        continue
      }
      if (
        tagList[i].formattedTag === tagList[j].formattedTag &&
        !duplicateIndices.includes(i) &&
        !duplicateIndices.includes(j)
      ) {
        duplicateIndices.push(i, j)
        if (
          tagList[i].originalTag.toLowerCase() ===
          tagList[j].originalTag.toLowerCase()
        ) {
          issues.push(
            utils.issues.generateIssue('duplicateTag', {
              tag: tagList[i].originalTag,
            }),
          )
        } else {
          issues.push(
            utils.issues.generateIssue('duplicateTag', {
              tag: tagList[i].canonicalTag,
            }),
          )
        }
      }
    }
  }
  return issues
}

/**
 * Check for multiple instances of a unique tag.
 */
const checkForMultipleUniqueTags = function (tagList, hedSchemas) {
  const issues = []
  const uniqueTagPrefixes =
    hedSchemas.baseSchema.attributes.dictionaries[uniqueType]
  for (const uniqueTagPrefix in uniqueTagPrefixes) {
    let foundOne = false
    for (const tag of tagList) {
      if (tag.formattedTag.startsWith(uniqueTagPrefix)) {
        if (!foundOne) {
          foundOne = true
        } else {
          issues.push(
            utils.issues.generateIssue('multipleUniqueTags', {
              tag: uniqueTagPrefix,
            }),
          )
          break
        }
      }
    }
  }
  return issues
}

/**
 * Check if a tag is missing a required child.
 */
const checkIfTagRequiresChild = function (tag, hedSchemas) {
  const issues = []
  const invalid =
    tag.formattedTag in
    hedSchemas.baseSchema.attributes.dictionaries[requireChildType]
  if (invalid) {
    issues.push(
      utils.issues.generateIssue('childRequired', { tag: tag.originalTag }),
    )
  }
  return issues
}

/**
 * Check that all required tags are present.
 */
const checkForRequiredTags = function (parsedString, hedSchemas) {
  const issues = []
  const topLevelTagList = parsedString.topLevelTags
  const requiredTagPrefixes =
    hedSchemas.baseSchema.attributes.dictionaries[requiredType]
  for (const requiredTagPrefix in requiredTagPrefixes) {
    let foundOne = false
    for (const tag of topLevelTagList) {
      if (tag.formattedTag.startsWith(requiredTagPrefix)) {
        foundOne = true
        break
      }
    }
    if (!foundOne) {
      issues.push(
        utils.issues.generateIssue('requiredPrefixMissing', {
          tagPrefix: requiredTagPrefix,
        }),
      )
    }
  }
  return issues
}

/**
 * Check that the unit exists if the tag has a declared unit class.
 */
const checkIfTagUnitClassUnitsExist = function (
  tag,
  hedSchemas,
  allowPlaceholders = false,
) {
  const issues = []
  if (
    utils.HED.isUnitClassTag(tag.formattedTag, hedSchemas.baseSchema.attributes)
  ) {
    const tagUnitValues = utils.HED.getTagName(tag.formattedTag)
    const invalid = utils.HED.validateValue(tagUnitValues, allowPlaceholders)
    if (invalid) {
      const defaultUnit = utils.HED.getUnitClassDefaultUnit(
        tag.formattedTag,
        hedSchemas.baseSchema.attributes,
      )
      issues.push(
        utils.issues.generateIssue('unitClassDefaultUsed', {
          tag: tag.originalTag,
          defaultUnit: defaultUnit,
        }),
      )
    }
    return issues
  } else {
    return []
  }
}

/**
 * Check that the unit is valid for the tag's unit class.
 */
const checkIfTagUnitClassUnitsAreValid = function (
  tag,
  hedSchemas,
  allowPlaceholders = false,
) {
  const issues = []
  if (
    !utils.HED.tagExistsInSchema(
      tag.formattedTag,
      hedSchemas.baseSchema.attributes,
    ) &&
    utils.HED.isUnitClassTag(tag.formattedTag, hedSchemas.baseSchema.attributes)
  ) {
    const tagUnitClasses = utils.HED.getTagUnitClasses(
      tag.formattedTag,
      hedSchemas.baseSchema.attributes,
    )
    const originalTagUnitValue = utils.HED.getTagName(tag.originalTag)
    const formattedTagUnitValue = utils.HED.getTagName(tag.formattedTag)
    const tagUnitClassUnits = utils.HED.getTagUnitClassUnits(
      tag.formattedTag,
      hedSchemas.baseSchema.attributes,
    )
    if (
      dateTimeUnitClass in
      hedSchemas.baseSchema.attributes.dictionaries[unitsElement]
    ) {
      if (
        tagUnitClasses.includes(dateTimeUnitClass) &&
        utils.string.isDateTime(formattedTagUnitValue)
      ) {
        return []
      }
    }
    if (
      clockTimeUnitClass in
      hedSchemas.baseSchema.attributes.dictionaries[unitsElement]
    ) {
      if (
        tagUnitClasses.includes(clockTimeUnitClass) &&
        utils.string.isClockFaceTime(formattedTagUnitValue)
      ) {
        return []
      }
    } else if (
      timeUnitClass in
      hedSchemas.baseSchema.attributes.dictionaries[unitsElement]
    ) {
      if (
        tagUnitClasses.includes(timeUnitClass) &&
        utils.string.isClockFaceTime(formattedTagUnitValue)
      ) {
        return []
      }
    }
    const value = utils.HED.validateUnits(
      originalTagUnitValue,
      formattedTagUnitValue,
      tagUnitClassUnits,
      hedSchemas.baseSchema.attributes,
    )
    const validUnit = utils.HED.validateValue(value, allowPlaceholders)
    if (!validUnit) {
      issues.push(
        utils.issues.generateIssue('unitClassInvalidUnit', {
          tag: tag.originalTag,
          unitClassUnits: tagUnitClassUnits.sort().join(','),
        }),
      )
    }
    return issues
  } else {
    return []
  }
}

/**
 * Check if an individual HED tag is in the schema or is an allowed extension.
 */
const checkIfTagIsValid = function (
  tag,
  previousTag,
  hedSchemas,
  allowPlaceholders,
  checkForWarnings,
) {
  const issues = []
  if (
    utils.HED.tagExistsInSchema(
      tag.formattedTag,
      hedSchemas.baseSchema.attributes,
    ) || // This tag itself exists in the HED schema.
    utils.HED.tagTakesValue(
      tag.formattedTag,
      hedSchemas.baseSchema.attributes,
    ) // This tag is a valid value-taking tag in the HED schema.
  ) {
    return []
  }
  // Whether this tag has an ancestor with the 'extensionAllowed' attribute.
  const isExtensionAllowedTag = utils.HED.isExtensionAllowedTag(
    tag.formattedTag,
    hedSchemas.baseSchema.attributes,
  )
  if (allowPlaceholders && tag.formattedTag.split('#').length === 2) {
    const valueTag = utils.HED.replaceTagNameWithPound(tag.formattedTag)
    if (
      valueTag.split('#').length !== 2 || // To avoid a redundant issue.
      utils.HED.tagTakesValue(valueTag, hedSchemas.baseSchema.attributes)
    ) {
      return []
    } else {
      issues.push(
        utils.issues.generateIssue('invalidPlaceholder', {
          tag: tag.originalTag,
        }),
      )
      return issues
    }
  }
  if (
    !isExtensionAllowedTag &&
    utils.HED.tagTakesValue(
      previousTag.formattedTag,
      hedSchemas.baseSchema.attributes,
    )
  ) {
    // This tag isn't an allowed extension, but the previous tag takes a value.
    // This is likely caused by an extraneous comma.
    issues.push(
      utils.issues.generateIssue('extraCommaOrInvalid', {
        tag: tag.originalTag,
        previousTag: previousTag.originalTag,
      }),
    )
    return issues
  } else if (!isExtensionAllowedTag) {
    // This is not a valid tag.
    issues.push(
      utils.issues.generateIssue('invalidTag', { tag: tag.originalTag }),
    )
    return issues
  } else {
    // This is an allowed extension.
    if (checkForWarnings) {
      issues.push(
        utils.issues.generateIssue('extension', { tag: tag.originalTag }),
      )
      return issues
    } else {
      return []
    }
  }
}

/**
 * Check basic placeholder syntax.
 *
 * @param {ParsedHedTag} tag A HED tag.
 * @return {Issue[]} Any issues found.
 */
const checkPlaceholderSyntax = function (tag) {
  if (tag.formattedTag.split('#').length < 2) {
    return []
  } else if (tag.formattedTag.split('#').length === 2) {
    const valueTag = utils.HED.replaceTagNameWithPound(tag.formattedTag)
    if (valueTag.split('#').length !== 2) {
      return [
        utils.issues.generateIssue('invalidPlaceholder', {
          tag: tag.originalTag,
        }),
      ]
    } else {
      return []
    }
  } else {
    // More than two placeholders.
    return [
      utils.issues.generateIssue('invalidPlaceholder', {
        tag: tag.originalTag,
      }),
    ]
  }
}

// Validation groups

/**
 * Validate the full HED string.
 */
const validateFullHedString = function (hedString) {
  const [fixedHedString, substitutionIssues] = substituteCharacters(hedString)
  const issues = [].concat(
    countTagGroupParentheses(fixedHedString),
    findDelimiterIssuesInHedString(fixedHedString),
  )
  return [substitutionIssues, issues]
}

/**
 * Validate an individual HED tag.
 */
const validateIndividualHedTag = function (
  tag,
  previousTag,
  hedSchemas,
  doSemanticValidation,
  checkForWarnings,
  allowPlaceholders,
) {
  let issues = []
  if (doSemanticValidation) {
    issues = issues.concat(
      checkIfTagIsValid(
        tag,
        previousTag,
        hedSchemas,
        allowPlaceholders,
        checkForWarnings,
      ),
      checkIfTagUnitClassUnitsAreValid(tag, hedSchemas, allowPlaceholders),
      checkIfTagRequiresChild(tag, hedSchemas),
    )
    if (checkForWarnings) {
      issues = issues.concat(
        checkIfTagUnitClassUnitsExist(tag, hedSchemas, allowPlaceholders),
      )
    }
  }
  if (checkForWarnings) {
    issues = issues.concat(
      checkCapitalization(tag, hedSchemas, doSemanticValidation),
    )
  }
  if (allowPlaceholders) {
    issues = issues.concat(checkPlaceholderSyntax(tag))
  }
  return issues
}

/**
 * Validate the individual HED tags in a parsed HED string object.
 */
const validateIndividualHedTags = function (
  parsedString,
  hedSchemas,
  doSemanticValidation,
  checkForWarnings,
  allowPlaceholders = false,
) {
  let issues = []
  let previousTag = new ParsedHedTag('', '', [0, 0], hedSchemas)
  for (let i = 0; i < parsedString.tags.length; i++) {
    const tag = parsedString.tags[i]
    issues = issues.concat(
      validateIndividualHedTag(
        tag,
        previousTag,
        hedSchemas,
        doSemanticValidation,
        checkForWarnings,
        allowPlaceholders,
      ),
    )
    previousTag = tag
  }
  return issues
}

/**
 * Validate a HED tag level.
 */
const validateHedTagLevel = function (
  tagList,
  hedSchemas,
  doSemanticValidation,
) {
  let issues = []
  if (doSemanticValidation) {
    issues = issues.concat(checkForMultipleUniqueTags(tagList, hedSchemas))
  }
  issues = issues.concat(checkForDuplicateTags(tagList))
  return issues
}

/**
 * Validate the HED tag levels in a parsed HED string object.
 */
const validateHedTagLevels = function (
  parsedString,
  hedSchemas,
  doSemanticValidation,
) {
  let issues = []
  for (let i = 0; i < parsedString.tagGroups.length; i++) {
    const tagList = parsedString.tagGroups[i]
    issues = issues.concat(validateHedTagLevel(tagList, hedSchemas))
  }
  issues = issues.concat(
    validateHedTagLevel(
      parsedString.topLevelTags,
      hedSchemas,
      doSemanticValidation,
    ),
  )
  return issues
}

/**
 * Validate a HED tag group.
 */
const validateHedTagGroup = function (originalTagGroup, parsedTagGroup) {
  return []
}

/**
 * Validate the HED tag groups in a parsed HED string.
 */
const validateHedTagGroups = function (parsedString) {
  let issues = []
  for (let i = 0; i < parsedString.tagGroups.length; i++) {
    const parsedTag = parsedString.tagGroups[i]
    const originalTag = parsedString.tagGroupStrings[i]
    issues = issues.concat(validateHedTagGroup(originalTag, parsedTag))
  }
  return issues
}

/**
 * Validate the top-level HED tags in a parsed HED string.
 */
const validateTopLevelTags = function (
  parsedString,
  hedSchemas,
  doSemanticValidation,
  checkForWarnings,
) {
  if (doSemanticValidation && checkForWarnings) {
    return checkForRequiredTags(parsedString, hedSchemas)
  } else {
    return []
  }
}

/**
 * Perform initial validation on a HED string and parse it so further validation can be performed.
 *
 * @param {string|ParsedHedString} hedString The HED string to validate.
 * @param {Schemas} hedSchemas The HED schemas to validate against.
 * @param {boolean} doSemanticValidation Whether to perform semantic validation.
 * @return {[boolean, Issue[], ParsedHedString[]]} Whether validation passed, any issues, and any parsed string data.
 */
const initiallyValidateHedString = function (
  hedString,
  hedSchemas,
  doSemanticValidation,
) {
  if (doSemanticValidation) {
    if (!hedSchemas.baseSchema.attributes) {
      hedSchemas.baseSchema.attributes = buildSchemaAttributesObject(
        hedSchemas.baseSchema.xmlData,
      )
    }
  }
  // Skip parsing if we're passed an already-parsed string.
  if (hedString instanceof ParsedHedString) {
    const [substitutionIssues, fullHedStringIssues] = validateFullHedString(
      hedString.hedString,
    )
    if (fullHedStringIssues.length !== 0) {
      return [
        false,
        false,
        fullHedStringIssues.concat(substitutionIssues),
        null,
      ]
    }
    return [true, true, substitutionIssues, hedString]
  } else {
    const [substitutionIssues, fullHedStringIssues] = validateFullHedString(
      hedString,
    )
    if (fullHedStringIssues.length !== 0) {
      return [
        false,
        false,
        fullHedStringIssues.concat(substitutionIssues),
        null,
      ]
    }

    const [parsedString, parsedStringIssues] = parseHedString(
      hedString,
      hedSchemas,
    )
    if (parsedStringIssues.length !== 0) {
      return [
        true,
        false,
        parsedStringIssues.concat(substitutionIssues),
        parsedString,
      ]
    }

    return [true, true, substitutionIssues, parsedString]
  }
}

/**
 * Validate a HED string.
 *
 * @param {string|ParsedHedString} hedString The HED string to validate.
 * @param {Schemas} hedSchemas The HED schemas to validate against.
 * @param {boolean} checkForWarnings Whether to check for warnings or only errors.
 * @param {boolean} allowPlaceholders Whether to treat value-taking tags with '#' placeholders as valid.
 * @returns {[boolean, Issue[]]} Whether the HED string is valid and any issues found.
 */
const validateHedString = function (
  hedString,
  hedSchemas,
  checkForWarnings = false,
  allowPlaceholders = false,
) {
  let doSemanticValidation = hedSchemas instanceof Schemas
  if (!doSemanticValidation) {
    hedSchemas = new Schemas(null)
  }
  const [
    fullStringValid,
    parsedStringValid,
    initialIssues,
    parsedString,
  ] = initiallyValidateHedString(hedString, hedSchemas, doSemanticValidation)
  if (!fullStringValid) {
    return [false, initialIssues]
  } else if (!parsedStringValid) {
    doSemanticValidation = false
    hedSchemas = new Schemas(null)
  }

  const issues = initialIssues.concat(
    validateIndividualHedTags(
      parsedString,
      hedSchemas,
      doSemanticValidation,
      checkForWarnings,
      allowPlaceholders,
    ),
    validateHedTagGroups(parsedString),
  )
  if (issues.length === 0) {
    return [true, []]
  } else {
    return [false, issues]
  }
}

/**
 * Validate a HED event string.
 *
 * @param {string|ParsedHedString} hedString The HED event string to validate.
 * @param {Schemas} hedSchemas The HED schemas to validate against.
 * @param {boolean} checkForWarnings Whether to check for warnings or only errors.
 * @returns {[boolean, Issue[]]} Whether the HED string is valid and any issues found.
 */
const validateHedEvent = function (
  hedString,
  hedSchemas,
  checkForWarnings = false,
) {
  const doSemanticValidation = hedSchemas instanceof Schemas
  if (!doSemanticValidation) {
    hedSchemas = new Schemas(null)
  }
  const [
    fullStringValid,
    parsedStringValid,
    initialIssues,
    parsedString,
  ] = initiallyValidateHedString(hedString, hedSchemas, doSemanticValidation)
  if (!(fullStringValid && parsedStringValid)) {
    return [false, initialIssues]
  }

  const issues = initialIssues.concat(
    validateTopLevelTags(
      parsedString,
      hedSchemas,
      doSemanticValidation,
      checkForWarnings,
    ),
    validateIndividualHedTags(
      parsedString,
      hedSchemas,
      doSemanticValidation,
      checkForWarnings,
    ),
    validateHedTagLevels(parsedString, hedSchemas, doSemanticValidation),
    validateHedTagGroups(parsedString),
  )
  if (issues.length === 0) {
    return [true, []]
  } else {
    return [false, issues]
  }
}

module.exports = {
  validateIndividualHedTags: validateIndividualHedTags,
  validateHedTagGroups: validateHedTagGroups,
  validateHedTagLevels: validateHedTagLevels,
  validateTopLevelTags: validateTopLevelTags,
  validateHedString: validateHedString,
  validateHedEvent: validateHedEvent,
}
