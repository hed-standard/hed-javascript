import { validateHedDatasetWithContext } from '../validator/dataset'
import { validateHedString } from '../validator/event'
import { BidsDataset, BidsHedIssue, BidsIssue } from './types'
import { buildBidsSchemas } from './schema'
import { generateIssue, Issue, IssueError } from '../common/issues/issues'

/**
 * Validate a BIDS dataset.
 *
 * @param {BidsDataset} dataset The BIDS dataset.
 * @param {object} schemaDefinition The version spec for the schema to be loaded.
 * @return {Promise<BidsIssue[]>} Any issues found.
 */
export function validateBidsDataset(dataset, schemaDefinition) {
  return buildBidsSchemas(dataset, schemaDefinition).then(
    ([hedSchemas, schemaLoadIssues]) => {
      return validateFullDataset(dataset, hedSchemas)
        .catch(BidsIssue.generateInternalErrorPromise)
        .then((issues) =>
          issues.concat(convertHedIssuesToBidsIssues(schemaLoadIssues, dataset.datasetDescription.file)),
        )
    },
    (issues) => convertHedIssuesToBidsIssues(issues, dataset.datasetDescription.file),
  )
}

/**
 * Validate a full BIDS dataset using a HED schema collection.
 *
 * @param {BidsDataset} dataset A BIDS dataset.
 * @param {Schemas} hedSchemas A HED schema collection.
 * @return {Promise<BidsIssue[]>|Promise<never>} Any issues found.
 */
function validateFullDataset(dataset, hedSchemas) {
  try {
    const [sidecarErrorsFound, sidecarIssues] = validateSidecars(dataset.sidecarData, hedSchemas)
    const [hedColumnErrorsFound, hedColumnIssues] = validateHedColumn(dataset.eventData, hedSchemas)
    if (sidecarErrorsFound || hedColumnErrorsFound) {
      return Promise.resolve([...sidecarIssues, ...hedColumnIssues])
    }
    const eventFileIssues = dataset.eventData.map((eventFileData) => {
      return validateBidsEventFile(eventFileData, hedSchemas)
    })
    return Promise.resolve([].concat(sidecarIssues, hedColumnIssues, ...eventFileIssues))
  } catch (e) {
    return Promise.reject(e)
  }
}

/**
 * Validate a BIDS event TSV file.
 *
 * @param {BidsEventFile} eventFileData A BIDS event TSV file.
 * @param {Schemas} hedSchemas A HED schema collection.
 * @return {BidsIssue[]} Any issues found.
 */
function validateBidsEventFile(eventFileData, hedSchemas) {
  const [hedStrings, tsvIssues] = parseTsvHed(eventFileData)
  if (!hedStrings) {
    return []
  } else {
    const datasetIssues = validateCombinedDataset(hedStrings, hedSchemas, eventFileData)
    return [...tsvIssues, ...datasetIssues]
  }
}

/**
 * Validate a collection of BIDS sidecars.
 *
 * @param {BidsSidecar[]} sidecarData A collection of BIDS sidecars.
 * @param {Schemas} hedSchemas A HED schema collection.
 * @return {[boolean, BidsHedIssue[]]} Whether errors (as opposed to warnings) were founds, and all issues found.
 */
function validateSidecars(sidecarData, hedSchemas) {
  const issues = []
  // validate the HED strings in the json sidecars
  for (const sidecar of sidecarData) {
    const valueStringIssues = validateStrings(sidecar.hedValueStrings, hedSchemas, sidecar.file, {
      expectValuePlaceholderString: true,
      definitionsAllowed: 'no',
    })
    const categoricalStringIssues = validateStrings(sidecar.hedCategoricalStrings, hedSchemas, sidecar.file, {
      expectValuePlaceholderString: false,
      definitionsAllowed: 'exclusive',
    })
    issues.push(...valueStringIssues, ...categoricalStringIssues)
  }
  const sidecarErrorsFound = issues.some((issue) => issue.isError())
  return [sidecarErrorsFound, issues]
}

/**
 * Validate the HED columns of a collection of BIDS event TSV files.
 *
 * @param {BidsEventFile[]} eventData A collection of BIDS event TSV files.
 * @param {Schemas} hedSchemas A HED schema collection.
 * @return {[boolean, BidsHedIssue[]]} Whether errors (as opposed to warnings) were founds, and all issues found.
 */
function validateHedColumn(eventData, hedSchemas) {
  const issues = eventData.flatMap((eventFileData) => {
    return validateStrings(eventFileData.hedColumnHedStrings, hedSchemas, eventFileData.file, {
      expectValuePlaceholderString: false,
      definitionsAllowed: 'no',
    })
  })
  const errorsFound = issues.some((issue) => issue.isError())
  return [errorsFound, issues]
}

/**
 * Combine the BIDS sidecar HED data into a BIDS event TSV file's HED data.
 *
 * @param {BidsEventFile} eventFileData A BIDS event TSV file.
 * @return {[string[], BidsIssue[]]} The combined HED strings for this BIDS event TSV file, and all issues found during the combination.
 */
function parseTsvHed(eventFileData) {
  const hedStrings = []
  const issues = []
  const sidecarHedColumnIndices = {}
  for (const sidecarHedColumn of eventFileData.sidecarHedData.keys()) {
    const sidecarHedColumnHeader = eventFileData.parsedTsv.headers.indexOf(sidecarHedColumn)
    if (sidecarHedColumnHeader > -1) {
      sidecarHedColumnIndices[sidecarHedColumn] = sidecarHedColumnHeader
    }
  }
  if (eventFileData.hedColumnHedStrings.length + sidecarHedColumnIndices.length === 0) {
    return [[], []]
  }

  eventFileData.parsedTsv.rows.slice(1).forEach((rowCells, rowIndex) => {
    // get the 'HED' field
    const hedStringParts = []
    if (eventFileData.hedColumnHedStrings[rowIndex]) {
      hedStringParts.push(eventFileData.hedColumnHedStrings[rowIndex])
    }
    for (const [sidecarHedColumn, sidecarHedIndex] of Object.entries(sidecarHedColumnIndices)) {
      const sidecarHedData = eventFileData.sidecarHedData.get(sidecarHedColumn)
      const rowCell = rowCells[sidecarHedIndex]
      if (rowCell && rowCell !== 'n/a') {
        let sidecarHedString
        if (!sidecarHedData) {
          continue
        }
        if (typeof sidecarHedData === 'string') {
          sidecarHedString = sidecarHedData.replace('#', rowCell)
        } else {
          sidecarHedString = sidecarHedData[rowCell]
        }
        if (sidecarHedString !== undefined) {
          hedStringParts.push(sidecarHedString)
        } else {
          issues.push(
            new BidsHedIssue(
              generateIssue('sidecarKeyMissing', {
                key: rowCell,
                column: sidecarHedColumn,
                file: eventFileData.file.relativePath,
              }),
              eventFileData.file,
            ),
          )
        }
      }
    }

    if (hedStringParts.length > 0) {
      hedStrings.push(hedStringParts.join(','))
    }
  })

  return [hedStrings, issues]
}

/**
 * Validate the HED data in a combined event TSV file/sidecar BIDS data collection.
 *
 * @param {string[]} hedStrings The HED strings in the data collection.
 * @param {Schemas} hedSchemas The HED schema collection to validate against.
 * @param {BidsEventFile} eventFileData The BIDS event TSV file being validated.
 * @return {BidsHedIssue[]} Any issues found.
 */
function validateCombinedDataset(hedStrings, hedSchemas, eventFileData) {
  const [, hedIssues] = validateHedDatasetWithContext(
    hedStrings,
    eventFileData.mergedSidecar.hedStrings,
    hedSchemas,
    true,
  )
  return convertHedIssuesToBidsIssues(hedIssues, eventFileData.file)
}

/**
 * Validate a set of HED strings.
 *
 * @param {string[]} hedStrings The HED strings to validate.
 * @param {Schemas} hedSchemas The HED schema collection to validate against.
 * @param {Object} fileObject A BIDS-format file object used to generate {@link BidsHedIssue} objects.
 * @param {Object} settings Options to pass to {@link validateHedString}.
 * @return {BidsHedIssue[]} Any issues found.
 */
function validateStrings(hedStrings, hedSchemas, fileObject, settings) {
  const issues = []
  for (const hedString of hedStrings) {
    if (!hedString) {
      continue
    }
    const options = {
      checkForWarnings: true,
      ...settings,
    }
    const [, hedIssues] = validateHedString(hedString, hedSchemas, options)
    const convertedIssues = convertHedIssuesToBidsIssues(hedIssues, fileObject)
    issues.push(...convertedIssues)
  }
  return issues
}

/**
 * Convert one or more HED issues into BIDS-compatible issues.
 *
 * @param {IssueError|Issue[]} hedIssues One or more HED-format issues.
 * @param {Object} file A BIDS-format file object used to generate {@link BidsHedIssue} objects.
 * @return {BidsHedIssue[]} The passed issue(s) in BIDS-compatible format.
 */
function convertHedIssuesToBidsIssues(hedIssues, file) {
  if (hedIssues instanceof IssueError) {
    return [new BidsHedIssue(hedIssues.issue, file)]
  } else {
    return hedIssues.map((hedIssue) => new BidsHedIssue(hedIssue, file))
  }
}
