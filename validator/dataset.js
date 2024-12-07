import zip from 'lodash/zip'

import { generateIssue, Issue } from '../common/issues/issues'
import { validateHedEventWithDefinitions } from './event'
import { parseHedStrings } from '../parser/parser'
import { filterNonEqualDuplicates } from '../utils/map'

/**
 * Parse the dataset's definitions and evaluate labels in the dataset.
 *
 * @param {ParsedHedString[]} parsedHedStrings The dataset's parsed HED strings.
 * @returns {[Map, Issue[]]} The definition map and any issues found.
 */
export const parseDefinitions = function (parsedHedStrings) {
  const issues = []
  const parsedHedStringDefinitions = parsedHedStrings.flatMap((parsedHedString) =>
    parsedHedString ? parsedHedString.definitions : [],
  )
  const [definitionMap, definitionDuplicates] = filterNonEqualDuplicates(
    parsedHedStringDefinitions,
    (definition, other) => definition.definitionGroup.equivalent(other.definitionGroup),
  )
  for (const [duplicateKey, duplicateValue] of definitionDuplicates) {
    issues.push(
      generateIssue('duplicateDefinition', {
        definition: duplicateKey,
        tagGroup: duplicateValue.originalTag,
      }),
    )
  }
  return [definitionMap, issues]
}

/**
 * Check a parsed HED group for its onset and offset ordering.
 *
 * @param {ParsedHedGroup} parsedGroup A parsed HED group.
 * @param {Set<string>} activeScopes The active duration scopes, represented by the groups' canonical Def tags.
 * @returns {Issue[]} Any issues found.
 */
const checkGroupForTemporalOrder = (parsedGroup, activeScopes) => {
  if (parsedGroup.isOnsetGroup) {
    activeScopes.add(parsedGroup.defNameAndValue)
  }
  if (parsedGroup.isInsetGroup && !activeScopes.has(parsedGroup.defNameAndValue)) {
    return [
      generateIssue('inactiveOnset', {
        definition: parsedGroup.defNameAndValue,
        tag: 'Inset',
      }),
    ]
  }
  if (parsedGroup.isOffsetGroup && !activeScopes.delete(parsedGroup.defNameAndValue)) {
    return [
      generateIssue('inactiveOnset', {
        definition: parsedGroup.defNameAndValue,
        tag: 'Offset',
      }),
    ]
  }
  return []
}

/**
 * Validate onset and offset ordering.
 *
 * @param {ParsedHedString[]} hedStrings The dataset's HED strings.
 * @param {Schemas} hedSchemas The HED schema container object.
 * @returns {Issue[]} Any issues found.
 */
export const validateTemporalOrder = function (hedStrings, hedSchemas) {
  const issues = []
  const activeScopes = new Set()
  for (const hedString of hedStrings) {
    const temporalGroups = hedString.tagGroups.filter((tagGroup) => tagGroup.isTemporalGroup)
    const defNames = temporalGroups.map((tagGroup) => tagGroup.defNameAndValue)
    const [defToGroup, duplicates] = filterNonEqualDuplicates(zip(defNames, temporalGroups), (tagGroup, other) =>
      tagGroup.equivalent(other),
    )
    const duplicateDefs = new Set(duplicates.map((duplicate) => duplicate[0]))
    for (const duplicate of duplicateDefs) {
      issues.push(
        generateIssue('duplicateTemporal', {
          string: hedString.hedString,
          definition: duplicate,
        }),
      )
    }
    for (const parsedGroup of defToGroup.values()) {
      issues.push(...checkGroupForTemporalOrder(parsedGroup, activeScopes))
    }
  }
  return issues
}

/**
 * Perform dataset-level validation on a HED dataset.
 *
 * @param {Definitions} definitions The parsed dataset definitions.
 * @param {ParsedHedString[]} hedStrings The dataset's HED strings.
 * @param {Schemas} hedSchemas The HED schema container object.
 * @returns {Issue[]} Whether the HED dataset is valid and any issues found.
 */
export const validateDataset = function (definitions, hedStrings, hedSchemas) {
  // TODO: Implement
  const temporalOrderIssues = validateTemporalOrder(hedStrings, hedSchemas)
  return temporalOrderIssues
}

/**
 * Validate a group of HED strings.
 *
 * @param {(string[]|ParsedHedString[])} parsedHedStrings The dataset's parsed HED strings.
 * @param {Schemas} hedSchemas The HED schema container object.
 * @param {DefinitionManager} definitions The dataset's parsed definitions.
 * @param {Object} settings The configuration settings for validation.
 * @returns {[boolean, Issue[]]} Whether the HED strings are valid and any issues found.
 */
export const validateHedEvents = function (parsedHedStrings, hedSchemas, definitions, settings) {
  let stringsValid = true
  let stringIssues = []
  for (const hedString of parsedHedStrings) {
    const [valid, issues] = validateHedEventWithDefinitions(hedString, hedSchemas, definitions, settings)
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
 * @returns {[boolean, Issue[]]} Whether the HED dataset is valid and any issues found.
 */
export const validateHedDataset = function (hedStrings, hedSchemas, ...args) {
  let settings
  if (args[0] === Object(args[0])) {
    settings = {
      checkForWarnings: args[0].checkForWarnings ?? false,
      validateDatasetLevel: args[0].validateDatasetLevel ?? true,
    }
  } else {
    settings = {
      checkForWarnings: args[0] ?? false,
      validateDatasetLevel: true,
    }
  }
  if (hedStrings.length === 0) {
    return [true, []]
  }
  const [parsedHedStrings, parsingIssues] = parseHedStrings(hedStrings, hedSchemas, false)
  const [definitions, definitionIssues] = parseDefinitions(parsedHedStrings)
  const [stringsValid, stringIssues] = validateHedEvents(parsedHedStrings, hedSchemas, definitions, settings)
  let datasetIssues = []
  if (stringsValid && settings.validateDatasetLevel) {
    datasetIssues = validateDataset(definitions, parsedHedStrings, hedSchemas)
  }
  const issues = stringIssues.concat(...Object.values(parsingIssues), definitionIssues, datasetIssues)

  return Issue.issueListWithValidStatus(issues)
}

/**
 * Validate a HED dataset with additional context.
 *
 * @param {string[]|ParsedHedString[]} hedStrings The dataset's HED strings.
 * @param {BidsSidecar} contextHedStrings The dataset's context HED strings.
 * @param {Schemas} hedSchemas The HED schema container object.
 * @param {boolean} checkForWarnings Whether to check for warnings or only errors.
 * @returns {[boolean, Issue[]]} Whether the HED dataset is valid and any issues found.
 */
export const validateHedDatasetWithContext = function (hedStrings, context, hedSchemas, ...args) {
  let settings
  if (args[0] === Object(args[0])) {
    settings = {
      checkForWarnings: args[0].checkForWarnings ?? false,
      validateDatasetLevel: args[0].validateDatasetLevel ?? true,
    }
  } else {
    settings = {
      checkForWarnings: args[0] ?? false,
      validateDatasetLevel: true,
    }
  }
  if (hedStrings.length + context.hedStrings.length === 0) {
    return [true, []]
  }
  const [parsedHedStrings, parsingIssues] = parseHedStrings(hedStrings, hedSchemas, false)
  //const [parsedContextHedStrings, contextParsingIssues] = parseHedStrings(contextHedStrings, hedSchemas, false)
  //const combinedParsedHedStrings = parsedHedStrings.concat(parsedContextHedStrings)
  //const [definitions, definitionIssues] = parseDefinitions(combinedParsedHedStrings)
  const [stringsValid, stringIssues] = validateHedEvents(parsedHedStrings, hedSchemas, context.definitions, settings)
  let datasetIssues = []
  if (stringsValid && settings.validateDatasetLevel) {
    datasetIssues = validateDataset(context.definitions, parsedHedStrings, hedSchemas)
  }
  const issues = stringIssues.concat(...Object.values(parsingIssues), datasetIssues)

  return Issue.issueListWithValidStatus(issues)
}
