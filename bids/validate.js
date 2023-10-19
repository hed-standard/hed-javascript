import { validateHedDatasetWithContext } from '../validator/dataset'
import { validateHedString } from '../validator/event'
import { BidsDataset, BidsEventFile, BidsHedIssue, BidsIssue } from './types'
import { buildBidsSchemas } from './schema'
import { generateIssue, Issue, IssueError } from '../common/issues/issues'
import ParsedHedString from '../validator/parser/parsedHedString'

/**
 * Validate a BIDS dataset.
 *
 * @param {BidsDataset} dataset The BIDS dataset.
 * @param {object} schemaDefinition The version spec for the schema to be loaded.
 * @returns {Promise<BidsIssue[]>} Any issues found.
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
 * @returns {Promise<BidsIssue[]>|Promise<never>} Any issues found.
 */
function validateFullDataset(dataset, hedSchemas) {
  try {
    const [sidecarErrorsFound, sidecarIssues] = validateSidecars(dataset.sidecarData, hedSchemas)
    const [hedColumnErrorsFound, hedColumnIssues] = validateHedColumn(dataset.eventData, hedSchemas)
    if (sidecarErrorsFound || hedColumnErrorsFound) {
      return Promise.resolve([...sidecarIssues, ...hedColumnIssues])
    }
    const eventFileIssues = dataset.eventData.map((eventFileData) => {
      return validateBidsTsvFile(eventFileData, hedSchemas)
    })
    return Promise.resolve([].concat(sidecarIssues, hedColumnIssues, ...eventFileIssues))
  } catch (e) {
    return Promise.reject(e)
  }
}

/**
 * Validate a BIDS TSV file.
 *
 * @param {BidsTsvFile} tsvFileData A BIDS TSV file.
 * @param {Schemas} hedSchemas A HED schema collection.
 * @returns {BidsIssue[]} Any issues found.
 */
function validateBidsTsvFile(tsvFileData, hedSchemas) {
  const [hedStrings, tsvIssues] = parseTsvHed(tsvFileData)
  if (!hedStrings) {
    return []
  } else {
    const datasetIssues = validateCombinedDataset(hedStrings, hedSchemas, tsvFileData)
    return [...tsvIssues, ...datasetIssues]
  }
}

/**
 * Validate a collection of BIDS sidecars.
 *
 * @param {BidsSidecar[]} sidecarData A collection of BIDS sidecars.
 * @param {Schemas} hedSchemas A HED schema collection.
 * @returns {[boolean, BidsHedIssue[]]} Whether errors (as opposed to warnings) were founds, and all issues found.
 */
function validateSidecars(sidecarData, hedSchemas) {
  const issues = []
  // validate the HED strings in the json sidecars
  for (const sidecar of sidecarData) {
    issues.push(...convertHedIssuesToBidsIssues(sidecar.parseHedStrings(hedSchemas), sidecar.file))
    const sidecarIssues = validateSidecar(sidecar, hedSchemas)
    issues.push(...sidecarIssues)
  }
  const sidecarErrorsFound = issues.some((issue) => issue.isError())
  return [sidecarErrorsFound, issues]
}

function validateSidecar(sidecar, hedSchemas) {
  const issues = []
  for (const [sidecarKey, hedData] of sidecar.parsedHedData) {
    if (hedData instanceof ParsedHedString) {
      const options = {
        checkForWarnings: true,
        expectValuePlaceholderString: true,
        definitionsAllowed: 'no',
      }
      issues.push(...validateSidecarString(sidecarKey, hedData, sidecar, options, hedSchemas))
    } else if (hedData instanceof Map) {
      for (const valueString of hedData.values()) {
        const options = {
          checkForWarnings: true,
          expectValuePlaceholderString: false,
          definitionsAllowed: 'exclusive',
        }
        issues.push(...validateSidecarString(sidecarKey, valueString, sidecar, options, hedSchemas))
      }
    } else {
      throw new Error('Unexpected type found in sidecar parsedHedData map.')
    }
  }
  return issues
}

function validateSidecarString(sidecarKey, sidecarString, sidecar, options, hedSchemas) {
  const [, hedIssues] = validateHedString(sidecarString, hedSchemas, options)
  return convertHedIssuesToBidsIssues(hedIssues, sidecar.file, { sidecarKey })
}

/**
 * Validate the HED columns of a collection of BIDS event TSV files.
 *
 * @param {BidsEventFile[]} eventData A collection of BIDS event TSV files.
 * @param {Schemas} hedSchemas A HED schema collection.
 * @returns {[boolean, BidsHedIssue[]]} Whether errors (as opposed to warnings) were founds, and all issues found.
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
 * Combine the BIDS sidecar HED data into a BIDS TSV file's HED data.
 *
 * @param {BidsTsvFile} tsvFileData A BIDS TSV file.
 * @returns {[string[], BidsIssue[]]} The combined HED strings for this BIDS TSV file, and all issues found during the combination.
 */
function parseTsvHed(tsvFileData) {
  const hedStrings = []
  const issues = []
  const sidecarHedColumnIndices = {}
  for (const sidecarHedColumn of tsvFileData.sidecarHedData.keys()) {
    const sidecarHedColumnHeader = tsvFileData.parsedTsv.headers.indexOf(sidecarHedColumn)
    if (sidecarHedColumnHeader > -1) {
      sidecarHedColumnIndices[sidecarHedColumn] = sidecarHedColumnHeader
    }
  }
  if (tsvFileData.hedColumnHedStrings.length + sidecarHedColumnIndices.length === 0) {
    return [[], []]
  }

  tsvFileData.parsedTsv.rows.slice(1).forEach((rowCells, rowIndex) => {
    // get the 'HED' field
    const hedStringParts = []
    if (tsvFileData.hedColumnHedStrings[rowIndex]) {
      hedStringParts.push(tsvFileData.hedColumnHedStrings[rowIndex])
    }
    for (const [sidecarHedColumn, sidecarHedIndex] of Object.entries(sidecarHedColumnIndices)) {
      const sidecarHedData = tsvFileData.sidecarHedData.get(sidecarHedColumn)
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
                file: tsvFileData.file.relativePath,
              }),
              tsvFileData.file,
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
 * @param {BidsTsvFile} tsvFileData The BIDS event TSV file being validated.
 * @returns {BidsHedIssue[]} Any issues found.
 */
function validateCombinedDataset(hedStrings, hedSchemas, tsvFileData) {
  const [, hedIssues] = validateHedDatasetWithContext(hedStrings, tsvFileData.mergedSidecar.hedStrings, hedSchemas, {
    checkForWarnings: true,
    validateDatasetLevel: tsvFileData instanceof BidsEventFile,
  })
  return convertHedIssuesToBidsIssues(hedIssues, tsvFileData.file)
}

/**
 * Validate a set of HED strings.
 *
 * @param {string[]} hedStrings The HED strings to validate.
 * @param {Schemas} hedSchemas The HED schema collection to validate against.
 * @param {Object} fileObject A BIDS-format file object used to generate {@link BidsHedIssue} objects.
 * @param {Object} settings Options to pass to {@link validateHedString}.
 * @returns {BidsHedIssue[]} Any issues found.
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
 * @param {Object?} extraParameters Any extra parameters to inject into the {@link Issue} objects.
 * @returns {BidsHedIssue[]} The passed issue(s) in BIDS-compatible format.
 */
function convertHedIssuesToBidsIssues(hedIssues, file, extraParameters) {
  if (hedIssues instanceof IssueError) {
    if (extraParameters) {
      Object.assign(hedIssues.issue.parameters, extraParameters)
      hedIssues.issue.generateMessage()
    }
    return [new BidsHedIssue(hedIssues.issue, file)]
  } else {
    return hedIssues.map((hedIssue) => {
      if (extraParameters) {
        Object.assign(hedIssue.parameters, extraParameters)
        hedIssue.generateMessage()
      }
      return new BidsHedIssue(hedIssue, file)
    })
  }
}
