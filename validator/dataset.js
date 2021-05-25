const { validateHedEvent } = require('./event')

/**
 * Parse the dataset's definitions and evaluate labels in the dataset.
 *
 * @param {string[]} hedStrings The dataset's HED strings.
 * @param {Schemas} hedSchemas The HED schema container object.
 * @return {[Definitions, string[]]} The definitions and the evaluated HED strings.
 */
const parseDefinitions = function(hedStrings, hedSchemas) {
  // TODO: Implement
  return [{}, hedStrings]
}

/**
 * Perform dataset-level validation on a HED dataset.
 *
 * @param {Definitions} definitions The parsed dataset definitions.
 * @param {string[]} hedStrings The dataset's HED strings.
 * @param {Schemas} hedSchemas The HED schema container object.
 * @return {[boolean, Issue[]]} Whether the HED dataset is valid and any issues found.
 */
const validateDataset = function(definitions, hedStrings, hedSchemas) {
  // TODO: Implement
  return [true, []]
}

/**
 * Validate a group of HED strings.
 *
 * @param {string[]} hedStrings A group of HED strings.
 * @param {Schemas} hedSchemas The HED schema container object.
 * @param {boolean} checkForWarnings Whether to check for warnings or only errors.
 * @return {[boolean, Issue[]]} Whether the HED strings are valid and any issues found.
 */
const validateHedEvents = function(hedStrings, hedSchemas, checkForWarnings) {
  let stringsValid = true
  let stringIssues = []
  for (const hedString of hedStrings) {
    const [valid, issues] = validateHedEvent(
      hedString,
      hedSchemas,
      checkForWarnings,
    )
    stringsValid = stringsValid && valid
    stringIssues = stringIssues.concat(issues)
  }
  return [stringsValid, stringIssues]
}

/**
 * Validate a HED dataset.
 *
 * @param {string[]} hedStrings The dataset's HED strings.
 * @param {Schemas} hedSchemas The HED schema container object.
 * @param {boolean} checkForWarnings Whether to check for warnings or only errors.
 * @return {[boolean, Issue[]]} Whether the HED dataset is valid and any issues found.
 */
const validateHedDataset = function(
  hedStrings,
  hedSchemas,
  checkForWarnings = false,
) {
  const [stringsValid, stringIssues] = validateHedEvents(
    hedStrings,
    hedSchemas,
    checkForWarnings,
  )
  if (!stringsValid) {
    return [false, stringIssues]
  }

  const [definitions, newHedStrings] = parseDefinitions(hedStrings, hedSchemas)
  return validateDataset(definitions, newHedStrings, hedSchemas)
}

module.exports = {
  parseDefinitions: parseDefinitions,
  validateDataset: validateDataset,
  validateHedEvents: validateHedEvents,
  validateHedDataset: validateHedDataset,
}
