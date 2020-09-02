const utils = require('../utils')
const stringParser = require('./stringParser')
const Schema = require('./schema').Schema

const openingGroupCharacter = '('
const closingGroupCharacter = ')'
const comma = ','
const tilde = '~'
const delimiters = [comma, tilde]

const uniqueType = 'unique'
const requiredType = 'required'
const requireChildType = 'requireChild'
const unitsElement = 'units'
const clockTimeUnitClass = 'clockTime'
const dateTimeUnitClass = 'dateTime'
const timeUnitClass = 'time'

const digitExpression = /^-?[\d.]+(?:[Ee]-?\d+)?$/

// Validation tests

/**
 * Check if group parentheses match. Pushes an issue if they don't match.
 */
const countTagGroupParentheses = function(hedString) {
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
      utils.generateIssue('parentheses', {
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
const isCommaMissingAfterClosingParenthesis = function(
  lastNonEmptyCharacter,
  currentCharacter,
) {
  return (
    lastNonEmptyCharacter === closingGroupCharacter &&
    !delimiters.includes(currentCharacter)
  )
}

/**
 * Check for delimiter issues in a HED string (e.g. missing commas adjacent to groups, extra commas or tildes).
 */
const findDelimiterIssuesInHedString = function(hedString) {
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
          utils.generateIssue('extraDelimiter', {
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
        issues.push(utils.generateIssue('invalidTag', { tag: currentTag }))
      }
    } else if (
      isCommaMissingAfterClosingParenthesis(
        lastNonEmptyValidCharacter,
        currentCharacter,
      )
    ) {
      issues.push(
        utils.generateIssue('commaMissing', {
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
      utils.generateIssue('extraDelimiter', {
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
const checkCapitalization = function(
  originalTag,
  formattedTag,
  hedSchema,
  doSemanticValidation,
) {
  const issues = []
  const tagNames = originalTag.split('/')
  if (
    doSemanticValidation &&
    utils.HED.tagTakesValue(formattedTag, hedSchema)
  ) {
    tagNames.pop()
  }
  for (const tagName of tagNames) {
    const correctTagName = utils.string.capitalizeString(tagName)
    if (tagName !== correctTagName && !camelCase.test(tagName)) {
      issues.push(utils.generateIssue('capitalization', { tag: originalTag }))
    }
  }
  return issues
}

/**
 * Check for duplicate tags at the top level or within a single group.
 * NOTE: Nested groups are treated as single tags for this validation.
 */
const checkForDuplicateTags = function(originalTagList, formattedTagList) {
  const issues = []
  const tagListLength = formattedTagList.length
  const duplicateIndices = []
  for (let i = 0; i < tagListLength; i++) {
    for (let j = 0; j < tagListLength; j++) {
      if (i === j) {
        continue
      }
      if (
        formattedTagList[i] !== tilde &&
        formattedTagList[i] === formattedTagList[j] &&
        !duplicateIndices.includes(i) &&
        !duplicateIndices.includes(j)
      ) {
        duplicateIndices.push(i, j)
        issues.push(
          utils.generateIssue('duplicateTag', { tag: originalTagList[i] }),
        )
      }
    }
  }
  return issues
}

/**
 * Check for multiple instances of a unique tag.
 */
const checkForMultipleUniqueTags = function(
  originalTagList,
  formattedTagList,
  hedSchema,
) {
  const issues = []
  const uniqueTagPrefixes = hedSchema.dictionaries[uniqueType]
  for (const uniqueTagPrefix in uniqueTagPrefixes) {
    let foundOne = false
    for (const formattedTag of formattedTagList) {
      if (formattedTag.startsWith(uniqueTagPrefix)) {
        if (!foundOne) {
          foundOne = true
        } else {
          issues.push(
            utils.generateIssue('multipleUniqueTags', {
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
 * Verify that the tilde count in a single group does not exceed 2.
 */
const checkNumberOfGroupTildes = function(originalTagGroup, parsedTagGroup) {
  const issues = []
  const tildeCount = utils.array.getElementCount(parsedTagGroup, tilde)
  if (tildeCount > 2) {
    issues.push(
      utils.generateIssue('tooManyTildes', { tagGroup: originalTagGroup }),
    )
    return issues
  }
  return []
}

/**
 * Check if a tag is missing a required child.
 */
const checkIfTagRequiresChild = function(originalTag, formattedTag, hedSchema) {
  const issues = []
  const invalid = formattedTag in hedSchema.dictionaries[requireChildType]
  if (invalid) {
    issues.push(utils.generateIssue('childRequired', { tag: originalTag }))
  }
  return issues
}

/**
 * Check that all required tags are present.
 */
const checkForRequiredTags = function(parsedString, hedSchema) {
  const issues = []
  const formattedTopLevelTagList = parsedString.formattedTopLevelTags
  const requiredTagPrefixes = hedSchema.dictionaries[requiredType]
  for (const requiredTagPrefix in requiredTagPrefixes) {
    let foundOne = false
    for (const formattedTag of formattedTopLevelTagList) {
      if (formattedTag.startsWith(requiredTagPrefix)) {
        foundOne = true
        break
      }
    }
    if (!foundOne) {
      issues.push(
        utils.generateIssue('requiredPrefixMissing', {
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
const checkIfTagUnitClassUnitsExist = function(
  originalTag,
  formattedTag,
  hedSchema,
) {
  const issues = []
  if (utils.HED.isUnitClassTag(formattedTag, hedSchema)) {
    const tagUnitValues = utils.HED.getTagName(formattedTag)
    const invalid = digitExpression.test(tagUnitValues)
    if (invalid) {
      const defaultUnit = utils.HED.getUnitClassDefaultUnit(
        formattedTag,
        hedSchema,
      )
      issues.push(
        utils.generateIssue('unitClassDefaultUsed', {
          tag: originalTag,
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
const checkIfTagUnitClassUnitsAreValid = function(
  originalTag,
  formattedTag,
  hedSchema,
) {
  const issues = []
  if (
    !utils.HED.tagExistsInSchema(formattedTag, hedSchema) &&
    utils.HED.isUnitClassTag(formattedTag, hedSchema)
  ) {
    const tagUnitClasses = utils.HED.getTagUnitClasses(formattedTag, hedSchema)
    const originalTagUnitValue = utils.HED.getTagName(originalTag)
    const formattedTagUnitValue = utils.HED.getTagName(formattedTag)
    const tagUnitClassUnits = utils.HED.getTagUnitClassUnits(
      formattedTag,
      hedSchema,
    )
    if (dateTimeUnitClass in hedSchema.dictionaries[unitsElement]) {
      if (
        tagUnitClasses.includes(dateTimeUnitClass) &&
        utils.string.isDateTime(formattedTagUnitValue)
      ) {
        return []
      }
    }
    if (clockTimeUnitClass in hedSchema.dictionaries[unitsElement]) {
      if (
        tagUnitClasses.includes(clockTimeUnitClass) &&
        utils.string.isClockFaceTime(formattedTagUnitValue)
      ) {
        return []
      }
    } else if (timeUnitClass in hedSchema.dictionaries[unitsElement]) {
      if (
        tagUnitClasses.includes(timeUnitClass) &&
        utils.string.isClockFaceTime(formattedTagUnitValue)
      ) {
        return []
      }
    }
    const validUnit = digitExpression.test(
      utils.HED.validateUnits(
        originalTagUnitValue,
        formattedTagUnitValue,
        tagUnitClassUnits,
        hedSchema,
      ),
    )
    if (!validUnit) {
      issues.push(
        utils.generateIssue('unitClassInvalidUnit', {
          tag: originalTag,
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
const checkIfTagIsValid = function(
  originalTag,
  formattedTag,
  previousOriginalTag,
  previousFormattedTag,
  hedSchema,
) {
  const issues = []
  if (
    utils.HED.tagExistsInSchema(formattedTag, hedSchema) || // This tag itself exists in the HED schema.
    utils.HED.tagTakesValue(formattedTag, hedSchema) || // This tag is a valid value-taking tag in the HED schema.
    formattedTag === tilde // This "tag" is a tilde.
  ) {
    return []
  }
  // Whether this tag has an ancestor with the 'extensionAllowed' attribute.
  const isExtensionAllowedTag = utils.HED.isExtensionAllowedTag(
    formattedTag,
    hedSchema,
  )
  if (
    !isExtensionAllowedTag &&
    utils.HED.tagTakesValue(previousFormattedTag, hedSchema)
  ) {
    // This tag isn't an allowed extension, but the previous tag takes a value.
    // This is likely caused by an extraneous comma.
    issues.push(
      utils.generateIssue('extraCommaOrInvalid', {
        tag: originalTag,
        previousTag: previousOriginalTag,
      }),
    )
    return issues
  } else if (!isExtensionAllowedTag) {
    // This is not a valid tag.
    issues.push(utils.generateIssue('invalidTag', { tag: originalTag }))
    return issues
  } else {
    // This is an allowed extension.
    return []
  }
}

// Validation groups

/**
 * Validate the full HED string.
 */
const validateFullHedString = function(hedString) {
  const issues = [].concat(
    countTagGroupParentheses(hedString),
    findDelimiterIssuesInHedString(hedString),
  )
  return issues
}

/**
 * Validate an individual HED tag.
 */
const validateIndividualHedTag = function(
  originalTag,
  formattedTag,
  previousOriginalTag,
  previousFormattedTag,
  hedSchema,
  doSemanticValidation,
  checkForWarnings,
) {
  let issues = []
  if (doSemanticValidation) {
    issues = issues.concat(
      checkIfTagIsValid(
        originalTag,
        formattedTag,
        previousOriginalTag,
        previousFormattedTag,
        hedSchema,
      ),
      checkIfTagUnitClassUnitsAreValid(originalTag, formattedTag, hedSchema),
      checkIfTagRequiresChild(originalTag, formattedTag, hedSchema),
    )
    if (checkForWarnings) {
      issues = issues.concat(
        checkIfTagUnitClassUnitsExist(originalTag, formattedTag, hedSchema),
      )
    }
  }
  if (checkForWarnings) {
    issues = issues.concat(
      checkCapitalization(
        originalTag,
        formattedTag,
        hedSchema,
        doSemanticValidation,
      ),
    )
  }
  return issues
}

/**
 * Validate the individual HED tags in a parsed HED string object.
 */
const validateIndividualHedTags = function(
  parsedString,
  hedSchema,
  doSemanticValidation,
  checkForWarnings,
) {
  let issues = []
  let previousOriginalTag = ''
  let previousFormattedTag = ''
  for (let i = 0; i < parsedString.tags.length; i++) {
    const originalTag = parsedString.tags[i]
    const formattedTag = parsedString.formattedTags[i]
    issues = issues.concat(
      validateIndividualHedTag(
        originalTag,
        formattedTag,
        previousOriginalTag,
        previousFormattedTag,
        hedSchema,
        doSemanticValidation,
        checkForWarnings,
      ),
    )
    previousOriginalTag = originalTag
    previousFormattedTag = formattedTag
  }
  return issues
}

/**
 * Validate a HED tag level.
 */
const validateHedTagLevel = function(
  originalTagList,
  formattedTagList,
  hedSchema,
  doSemanticValidation,
) {
  let issues = []
  if (doSemanticValidation) {
    issues = issues.concat(
      checkForMultipleUniqueTags(originalTagList, formattedTagList, hedSchema),
    )
  }
  issues = issues.concat(
    checkForDuplicateTags(originalTagList, formattedTagList),
  )
  return issues
}

/**
 * Validate the HED tag levels in a parsed HED string object.
 */
const validateHedTagLevels = function(
  parsedString,
  hedSchema,
  doSemanticValidation,
) {
  let issues = []
  for (let i = 0; i < parsedString.tagGroups.length; i++) {
    const originalTagList = parsedString.tagGroups[i]
    const formattedTagList = parsedString.formattedTagGroups[i]
    issues = issues.concat(
      validateHedTagLevel(originalTagList, formattedTagList, hedSchema),
    )
  }
  issues = issues.concat(
    validateHedTagLevel(
      parsedString.topLevelTags,
      parsedString.formattedTopLevelTags,
      hedSchema,
      doSemanticValidation,
    ),
  )
  return issues
}

/**
 * Validate a HED tag group.
 */
const validateHedTagGroup = function(originalTagGroup, parsedTagGroup) {
  return checkNumberOfGroupTildes(originalTagGroup, parsedTagGroup)
}

/**
 * Validate the HED tag groups in a parsed HED string.
 */
const validateHedTagGroups = function(parsedString) {
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
const validateTopLevelTags = function(
  parsedString,
  hedSchema,
  doSemanticValidation,
  checkForWarnings,
) {
  if (doSemanticValidation && checkForWarnings) {
    return checkForRequiredTags(parsedString, hedSchema)
  } else {
    return []
  }
}

/**
 * Validate a HED string.
 *
 * @param hedString The HED string to validate.
 * @param hedSchema The HED schema to validate against.
 * @param checkForWarnings Whether to check for warnings or only errors.
 * @returns {Array} Whether the HED string is valid and any issues found.
 */
const validateHedString = function(
  hedString,
  hedSchema = {},
  checkForWarnings = false,
) {
  const doSemanticValidation = hedSchema instanceof Schema
  const fullHedStringIssues = validateFullHedString(hedString)
  if (fullHedStringIssues.length !== 0) {
    return [false, fullHedStringIssues]
  }

  const [parsedString, parsedStringIssues] = stringParser.parseHedString(
    hedString,
  )
  if (parsedStringIssues.length !== 0) {
    return [false, parsedStringIssues]
  }

  const issues = [].concat(
    validateTopLevelTags(
      parsedString,
      hedSchema,
      doSemanticValidation,
      checkForWarnings,
    ),
    validateIndividualHedTags(
      parsedString,
      hedSchema,
      doSemanticValidation,
      checkForWarnings,
    ),
    validateHedTagLevels(parsedString, hedSchema, doSemanticValidation),
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
}
