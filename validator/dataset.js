const { validateHedString } = require('./hedString')

/**
 * Parse the dataset's definitions and evaluate labels in the dataset.
 *
 * @param {string[]} hedStrings The dataset's HED strings.
 * @param {Schema} hedSchema The HED schema.
 * @return {[Definitions, string[]]} The definitions and the evaluated HED strings.
 */
const parseDefinitions = function(hedStrings, hedSchema) {
  // TODO: Implement
  return [{}, hedStrings]
}

/**
 * Perform dataset-level validation on a HED dataset.
 *
 * @param {Definitions} definitions The parsed dataset definitions.
 * @param {string[]} hedStrings The dataset's HED strings.
 * @param {Schema} hedSchema The HED schema.
 * @return {[boolean, object[]]} Whether the HED dataset is valid and any issues found.
 */
const validateDataset = function(definitions, hedStrings, hedSchema) {
  // TODO: Implement
  return [true, []]
}

/**
 * Validate a group of HED strings.
 *
 * @param {string[]} hedStrings A group of HED strings.
 * @param {Schema} hedSchema The HED schema.
 * @param {boolean} checkForWarnings Whether to check for warnings or only errors.
 * @return {Array} Whether the HED strings is valid and any issues found.
 */
const validateHedStrings = function(hedStrings, hedSchema, checkForWarnings) {
  let stringsValid = true
  let stringIssues = []
  for (const hedString of hedStrings) {
    const [valid, issues] = validateHedString(
      hedString,
      hedSchema,
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
 * @param {Schema} hedSchema The HED schema.
 * @param {boolean} checkForWarnings Whether to check for warnings or only errors.
 * @return {Array} Whether the HED dataset is valid and any issues found.
 */
const validateHedDataset = function(
  hedStrings,
  hedSchema,
  checkForWarnings = false,
) {
  const [stringsValid, stringIssues] = validateHedStrings(
    hedStrings,
    hedSchema,
    checkForWarnings,
  )
  if (!stringsValid) {
    return [false, stringIssues]
  }

  const [definitions, newHedStrings] = parseDefinitions(hedStrings, hedSchema)
  return validateDataset(definitions, newHedStrings, hedSchema)
}

module.exports = {
  validateHedDataset: validateHedDataset,
}
