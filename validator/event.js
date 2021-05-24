const utils = require('../utils')
const {
  parseHedString,
  ParsedHedString,
  ParsedHedTag,
  hedStringIsAGroup,
} = require('./stringParser')
const { generateIssue } = require('../utils/issues')
const { buildSchemaAttributesObject } = require('./schema')
const { Schemas } = require('../utils/schema')
const { convertHedStringToLong } = require('../converter/converter')

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
        generateIssue('invalidCharacter', {
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
      generateIssue('parentheses', {
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
          generateIssue('extraDelimiter', {
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
        issues.push(generateIssue('invalidTag', { tag: currentTag }))
      }
    } else if (
      isCommaMissingAfterClosingParenthesis(
        lastNonEmptyValidCharacter,
        currentCharacter,
      )
    ) {
      issues.push(
        generateIssue('commaMissing', {
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
      generateIssue('extraDelimiter', {
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
      issues.push(generateIssue('capitalization', { tag: tag.originalTag }))
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
            generateIssue('duplicateTag', {
              tag: tagList[i].originalTag,
            }),
          )
        } else {
          issues.push(
            generateIssue('duplicateTag', {
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
            generateIssue('multipleUniqueTags', {
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
    issues.push(generateIssue('childRequired', { tag: tag.originalTag }))
  }
  return issues
}

/**
 * Check that all required tags are present.
 */
const checkForRequiredTags = function (topLevelTags, hedSchemas) {
  const issues = []
  const requiredTagPrefixes =
    hedSchemas.baseSchema.attributes.dictionaries[requiredType]
  for (const requiredTagPrefix in requiredTagPrefixes) {
    let foundOne = false
    for (const tag of topLevelTags) {
      if (tag.formattedTag.startsWith(requiredTagPrefix)) {
        foundOne = true
        break
      }
    }
    if (!foundOne) {
      issues.push(
        generateIssue('requiredPrefixMissing', {
          tagPrefix: requiredTagPrefix,
        }),
      )
    }
  }
  return issues
}

/**
 * Check that the unit is valid for the tag's unit class.
 *
 * @param {ParsedHedTag} tag A HED tag.
 * @param {Schemas} hedSchemas The HED schema collection.
 * @param {boolean} checkForWarnings Whether to check for warnings.
 * @param {boolean} allowPlaceholders Whether to treat value-taking tags with '#' placeholders as valid.
 * @return {Issue[]} Any issues found.
 */
const checkIfTagUnitClassUnitsAreValid = function (
  tag,
  hedSchemas,
  checkForWarnings,
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
      if (tagUnitClasses.includes(dateTimeUnitClass)) {
        if (utils.string.isDateTime(formattedTagUnitValue)) {
          return []
        } else {
          issues.push(generateIssue('invalidValue', { tag: tag.originalTag }))
          return issues
        }
      }
    }
    if (
      clockTimeUnitClass in
      hedSchemas.baseSchema.attributes.dictionaries[unitsElement]
    ) {
      if (tagUnitClasses.includes(clockTimeUnitClass)) {
        if (utils.string.isClockFaceTime(formattedTagUnitValue)) {
          return []
        } else {
          issues.push(generateIssue('invalidValue', { tag: tag.originalTag }))
          return issues
        }
      }
    } else if (
      timeUnitClass in
      hedSchemas.baseSchema.attributes.dictionaries[unitsElement]
    ) {
      if (
        tagUnitClasses.includes(timeUnitClass) &&
        tag.originalTag.includes(':')
      ) {
        if (utils.string.isClockFaceTime(formattedTagUnitValue)) {
          return []
        } else {
          issues.push(generateIssue('invalidValue', { tag: tag.originalTag }))
          return issues
        }
      }
    }
    const [foundUnit, validUnit, value] = utils.HED.validateUnits(
      originalTagUnitValue,
      tagUnitClassUnits,
      hedSchemas.baseSchema.attributes,
    )
    const validValue = utils.HED.validateValue(
      value,
      allowPlaceholders,
      hedSchemas.baseSchema.attributes.tagHasAttribute(
        utils.HED.replaceTagNameWithPound(tag.formattedTag),
        'isNumeric',
      ),
      hedSchemas.isHed3,
    )
    if (!foundUnit && checkForWarnings) {
      const defaultUnit = utils.HED.getUnitClassDefaultUnit(
        tag.formattedTag,
        hedSchemas.baseSchema.attributes,
      )
      issues.push(
        generateIssue('unitClassDefaultUsed', {
          tag: tag.originalTag,
          defaultUnit: defaultUnit,
        }),
      )
    } else if (!validUnit) {
      issues.push(
        generateIssue('unitClassInvalidUnit', {
          tag: tag.originalTag,
          unitClassUnits: tagUnitClassUnits.sort().join(','),
        }),
      )
    } else if (!validValue) {
      issues.push(generateIssue('invalidValue', { tag: tag.originalTag }))
    }
    return issues
  } else {
    return []
  }
}

/**
 * Check the syntax of tag values.
 *
 * @param {ParsedHedTag} tag A HED tag.
 * @param {Schemas} hedSchemas The HED schema collection.
 * @param {boolean} allowPlaceholders Whether to treat value-taking tags with '#' placeholders as valid.
 * @return {Issue[]} Any issues found.
 */
const checkValueTagSyntax = function (tag, hedSchemas, allowPlaceholders) {
  if (
    utils.HED.tagTakesValue(
      tag.formattedTag,
      hedSchemas.baseSchema.attributes,
    ) &&
    !utils.HED.isUnitClassTag(
      tag.formattedTag,
      hedSchemas.baseSchema.attributes,
    )
  ) {
    const isValidValue = utils.HED.validateValue(
      utils.HED.getTagName(tag.formattedTag),
      allowPlaceholders,
      hedSchemas.baseSchema.attributes.tagHasAttribute(
        utils.HED.replaceTagNameWithPound(tag.formattedTag),
        'isNumeric',
      ),
      hedSchemas.isHed3,
    )
    if (!isValidValue) {
      return [generateIssue('invalidValue', { tag: tag.originalTag })]
    } else {
      return []
    }
  } else {
    // Unit class tags are handled by the two functions above.
    return []
  }
}

/**
 * Check if an individual HED tag is in the schema or is an allowed extension.
 */
const checkIfTagIsValid = function(
  tag,
  previousTag,
  hedSchemas,
  checkForWarnings,
  allowPlaceholders,
) {
  const issues = []
  if (
    utils.HED.tagExistsInSchema(
      tag.formattedTag,
      hedSchemas.baseSchema.attributes,
    ) || // This tag itself exists in the HED schema.
    utils.HED.tagTakesValue(tag.formattedTag, hedSchemas.baseSchema.attributes) // This tag is a valid value-taking tag in the HED schema.
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
        generateIssue('invalidPlaceholder', {
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
      generateIssue('extraCommaOrInvalid', {
        tag: tag.originalTag,
        previousTag: previousTag.originalTag,
      }),
    )
    return issues
  } else if (!isExtensionAllowedTag) {
    // This is not a valid tag.
    issues.push(generateIssue('invalidTag', { tag: tag.originalTag }))
    return issues
  } else {
    // This is an allowed extension.
    if (checkForWarnings) {
      issues.push(generateIssue('extension', { tag: tag.originalTag }))
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
        generateIssue('invalidPlaceholder', {
          tag: tag.originalTag,
        }),
      ]
    } else {
      return []
    }
  } else {
    // More than two placeholders.
    return [
      generateIssue('invalidPlaceholder', {
        tag: tag.originalTag,
      }),
    ]
  }
}

// HED 3 checks

/**
 * Check the syntax of HED 3 definitions.
 *
 * @param {ParsedHedTag[]} tagGroup The tag group.
 * @param {Schemas} hedSchemas The HED schema collection.
 * @return {Issue[]} Any issues found.
 */
const checkDefinitionSyntax = function (tagGroup, hedSchemas) {
  const definitionShortTag = 'definition'
  const defExpandShortTag = 'def-expand'
  const defShortTag = 'def'
  const [definitionParentTag, definitionParentTagIssues] =
    convertHedStringToLong(hedSchemas, definitionShortTag)
  const [defExpandParentTag, defExpandParentTagIssues] = convertHedStringToLong(
    hedSchemas,
    defExpandShortTag,
  )
  const issues = [].concat(definitionParentTagIssues, defExpandParentTagIssues)
  let definitionTagFound = false
  let defExpandTagFound = false
  let definitionName
  for (const tag of tagGroup) {
    if (tag.canonicalTag.startsWith(definitionParentTag)) {
      definitionTagFound = true
      definitionName = utils.HED.getTagName(tag.originalTag)
      break
    } else if (tag.canonicalTag.startsWith(defExpandParentTag)) {
      defExpandTagFound = true
      definitionName = utils.HED.getTagName(tag.originalTag)
      break
    }
  }
  if (!(definitionTagFound || defExpandTagFound)) {
    return []
  }
  let tagGroupValidated = false
  let tagGroupIssueGenerated = false
  for (const tag of tagGroup) {
    if (hedStringIsAGroup(tag.formattedTag)) {
      if (tagGroupValidated && !tagGroupIssueGenerated) {
        issues.push(
          generateIssue('multipleTagGroupsInDefinition', {
            definition: definitionName,
          }),
        )
        tagGroupIssueGenerated = true
        continue
      }
      tagGroupValidated = true
      if (
        tag.formattedTag.indexOf(definitionShortTag) >= 0 ||
        tag.formattedTag.indexOf(defExpandShortTag) >= 0
      ) {
        issues.push(
          generateIssue('nestedDefinition', {
            definition: definitionName,
          }),
        )
      } else if (tag.formattedTag.indexOf(defShortTag) >= 0) {
        issues.push(
          generateIssue('nestedDefinition', {
            definition: definitionName,
          }),
        )
      }
    } else if (
      (definitionTagFound &&
        !tag.canonicalTag.startsWith(definitionParentTag)) ||
      (defExpandTagFound && !tag.canonicalTag.startsWith(defExpandParentTag))
    ) {
      issues.push(
        generateIssue('illegalDefinitionGroupTag', {
          tag: tag.originalTag,
          definition: definitionName,
        }),
      )
    }
  }
  return issues
}

/**
 * Check for invalid top-level definition tags.
 *
 * @param {ParsedHedTag[]} topLevelTags The list of top-level tags.
 * @param {Schemas} hedSchemas The HED schema collection.
 * @return {Issue[]} Any issues found.
 */
const checkForInvalidTopLevelDefinitionTags = function (
  topLevelTags,
  hedSchemas,
) {
  let issues = []
  const invalidShortTags = ['Definition', 'Def-expand']
  for (const invalidShortTag of invalidShortTags) {
    const [invalidTag, invalidTagIssues] = convertHedStringToLong(
      hedSchemas,
      invalidShortTag,
    )
    issues = issues.concat(invalidTagIssues)
    for (const topLevelTag of topLevelTags) {
      if (topLevelTag.canonicalTag.startsWith(invalidTag)) {
        issues.push(
          generateIssue('topLevelDefinitionTag', {
            tag: topLevelTag.originalTag,
          }),
        )
      }
    }
  }
  return issues
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
        checkForWarnings,
        allowPlaceholders,
      ),
      checkIfTagUnitClassUnitsAreValid(
        tag,
        hedSchemas,
        checkForWarnings,
        allowPlaceholders,
      ),
      checkIfTagRequiresChild(tag, hedSchemas),
      checkValueTagSyntax(tag, hedSchemas, allowPlaceholders),
    )
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
    if (hedSchemas.isHed3) {
      issues = issues.concat(checkDefinitionSyntax(tagList, hedSchemas))
    }
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
    issues = issues.concat(
      validateHedTagLevel(tagList, hedSchemas, doSemanticValidation),
    )
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
  let issues = []
  const topLevelTags = parsedString.topLevelTags
  if (hedSchemas.isHed3) {
    // This is false when doSemanticValidation is false (i.e. there is no loaded schema).
    issues = issues.concat(
      checkForInvalidTopLevelDefinitionTags(topLevelTags, hedSchemas),
    )
  }
  if (doSemanticValidation && checkForWarnings) {
    issues = issues.concat(checkForRequiredTags(topLevelTags, hedSchemas))
  }
  return issues
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
    const [substitutionIssues, fullHedStringIssues] =
      validateFullHedString(hedString)
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
  const [fullStringValid, parsedStringValid, initialIssues, parsedString] =
    initiallyValidateHedString(hedString, hedSchemas, doSemanticValidation)
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
  const [fullStringValid, parsedStringValid, initialIssues, parsedString] =
    initiallyValidateHedString(hedString, hedSchemas, doSemanticValidation)
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
