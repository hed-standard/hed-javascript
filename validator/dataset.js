const { validateHedString } = require('./hedString')

const parseDefinitions = function(hedStrings, hedSchema) {
  // TODO: Implement
  return [{}, hedStrings]
}

const validateDataset = function(definitions, hedStrings, hedSchema) {
  // TODO: Implement
  return [true, []]
}

const validateHedStrings = function(hedStrings, hedSchema, checkForWarnings) {
  let datasetValid = true
  let datasetIssues = []
  for (const hedString of hedStrings) {
    const [valid, issues] = validateHedString(
      hedString,
      hedSchema,
      checkForWarnings,
    )
    datasetValid = datasetValid && valid
    datasetIssues = datasetIssues.concat(issues)
  }
  return [datasetValid, datasetIssues]
}

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
