const { parseHedString } = require('../parser/main')
const ParsedHedString = require('../parser/parsedString')
const { Schemas } = require('../../common/schema')

const { HedValidator, Hed2Validator } = require('./validator')
const { Hed3Validator } = require('./hed3')

/**
 * Perform initial validation on a HED string and parse it so further validation can be performed.
 *
 * @param {string|ParsedHedString} hedString The HED string to validate.
 * @param {Schemas} hedSchemas The HED schemas to validate against.
 * @param {Object<string, boolean>} options Any validation options passed in.
 * @param {Map<string, ParsedHedGroup>?} definitions The definitions for this HED dataset.
 * @return {[ParsedHedString, Issue[], HedValidator]} The parsed HED string, the actual HED schema collection to use, any issues found, and whether to perform semantic validation.
 */
const initiallyValidateHedString = function (hedString, hedSchemas, options, definitions = null) {
  const doSemanticValidation = hedSchemas instanceof Schemas
  if (!doSemanticValidation) {
    hedSchemas = new Schemas(null)
  }
  let parsedString, parsingIssues
  // Skip parsing if we're passed an already-parsed string.
  if (hedString instanceof ParsedHedString) {
    parsedString = hedString
    parsingIssues = { syntax: [], delimiter: [] }
  } else {
    ;[parsedString, parsingIssues] = parseHedString(hedString, hedSchemas)
  }
  if (parsedString === null) {
    return [null, [].concat(Object.values(parsingIssues)), null]
  } else if (parsingIssues.syntax.length + parsingIssues.delimiter.length > 0) {
    hedSchemas = new Schemas(null)
  }
  let hedValidator
  switch (hedSchemas.generation) {
    case 0:
      hedValidator = new HedValidator(parsedString, hedSchemas, options)
      break
    case 2:
      hedValidator = new Hed2Validator(parsedString, hedSchemas, options)
      break
    case 3:
      hedValidator = new Hed3Validator(parsedString, hedSchemas, definitions, options)
  }
  const allParsingIssues = [].concat(...Object.values(parsingIssues))
  return [parsedString, allParsingIssues, hedValidator]
}

/**
 * Validate a HED string.
 *
 * @param {string|ParsedHedString} hedString The HED string to validate.
 * @param {Schemas} hedSchemas The HED schemas to validate against.
 * @param {boolean} checkForWarnings Whether to check for warnings or only errors.
 * @param {boolean} expectValuePlaceholderString Whether this string is expected to have a '#' placeholder representing a value.
 * @returns {[boolean, Issue[]]} Whether the HED string is valid and any issues found.
 * @deprecated
 */
const validateHedString = function (
  hedString,
  hedSchemas,
  checkForWarnings = false,
  expectValuePlaceholderString = false,
) {
  const [parsedString, parsedStringIssues, hedValidator] = initiallyValidateHedString(hedString, hedSchemas, {
    checkForWarnings: checkForWarnings,
    expectValuePlaceholderString: expectValuePlaceholderString,
  })
  if (parsedString === null) {
    return [false, parsedStringIssues]
  }

  hedValidator.validateStringLevel()
  const issues = [].concat(parsedStringIssues, hedValidator.issues)

  return [issues.length === 0, issues]
}

/**
 * Validate a HED event string.
 *
 * @param {string|ParsedHedString} hedString The HED event string to validate.
 * @param {Schemas} hedSchemas The HED schemas to validate against.
 * @param {boolean} checkForWarnings Whether to check for warnings or only errors.
 * @returns {[boolean, Issue[]]} Whether the HED string is valid and any issues found.
 * @deprecated
 */
const validateHedEvent = function (hedString, hedSchemas, checkForWarnings = false) {
  const [parsedString, parsedStringIssues, hedValidator] = initiallyValidateHedString(hedString, hedSchemas, {
    checkForWarnings: checkForWarnings,
  })
  if (parsedString === null) {
    return [false, parsedStringIssues]
  }

  hedValidator.validateEventLevel()
  const issues = [].concat(parsedStringIssues, hedValidator.issues)

  return [issues.length === 0, issues]
}

/**
 * Validate a HED event string.
 *
 * @param {string|ParsedHedString} hedString The HED event string to validate.
 * @param {Schemas} hedSchemas The HED schemas to validate against.
 * @param {Map<string, ParsedHedGroup>} definitions The dataset's parsed definitions.
 * @param {boolean} checkForWarnings Whether to check for warnings or only errors.
 * @returns {[boolean, Issue[]]} Whether the HED string is valid and any issues found.
 */
const validateHedEventWithDefinitions = function (hedString, hedSchemas, definitions, checkForWarnings = false) {
  const [parsedString, parsedStringIssues, hedValidator] = initiallyValidateHedString(
    hedString,
    hedSchemas,
    { checkForWarnings: checkForWarnings },
    definitions,
  )
  if (parsedString === null) {
    return [false, parsedStringIssues]
  }

  hedValidator.validateEventLevel()
  const issues = [].concat(parsedStringIssues, hedValidator.issues)

  return [issues.length === 0, issues]
}

module.exports = {
  validateHedString,
  validateHedEvent,
  validateHedEventWithDefinitions,
}
