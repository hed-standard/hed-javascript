const { validateHedDataset } = require('../dataset')
const { validateHedString } = require('../event')
const { buildSchema } = require('../schema')
const { sidecarValueHasHed } = require('../../utils/bids')
const { BidsDataset, BidsHedIssue, BidsIssue } = require('./types')

/**
 * Validate a BIDS dataset.
 *
 * @param {BidsDataset} dataset The BIDS dataset.
 * @param {object} schemaDefinition The version spec for the schema to be loaded.
 * @return {Promise<Array<BidsIssue>>} Any issues found.
 */
function validateBidsDataset(dataset, schemaDefinition) {
  let issues = []
  // loop through event data files
  return buildSchema(schemaDefinition).then((hedSchema) => {
    const [sidecarErrorsFound, sidecarIssues] = validateSidecars(
      dataset.sidecarData,
      hedSchema,
    )
    if (sidecarErrorsFound) {
      return sidecarIssues
    }
    issues = issues.concat(sidecarIssues)
    for (const eventFileData of dataset.eventData) {
      const eventFileIssues = validateBidsEventFile(eventFileData, hedSchema)
      issues = issues.concat(eventFileIssues)
    }
    return issues
  })
}

function validateBidsEventFile(eventFileData, hedSchema) {
  // get the json sidecar dictionary associated with the event data

  const [hedStrings, tsvIssues] = parseTsvHed(eventFileData)
  if (!hedStrings) {
    return []
  } else {
    const datasetIssues = validateDataset(hedStrings, hedSchema, eventFileData)
    return [].concat(tsvIssues, datasetIssues)
  }
}

function validateSidecars(sidecarData, hedSchema) {
  let issues = []
  let sidecarErrorsFound = false
  // validate the HED strings in the json sidecars
  for (const sidecar of sidecarData) {
    const sidecarDictionary = sidecar.sidecarData
    const sidecarHedValueStrings = []
    let sidecarHedCategoricalStrings = []
    const sidecarHedData =
      Object.values(sidecarDictionary).filter(sidecarValueHasHed)
    for (const sidecarValue of sidecarHedData) {
      if (typeof sidecarValue.HED === 'string') {
        sidecarHedValueStrings.push(sidecarValue.HED)
      } else {
        sidecarHedCategoricalStrings = sidecarHedCategoricalStrings.concat(
          Object.values(sidecarValue.HED),
        )
      }
    }
    const valueStringIssues = validateSidecarStrings(
      sidecarHedValueStrings,
      hedSchema,
      sidecar.file,
      true,
    )
    const categoricalStringIssues = validateSidecarStrings(
      sidecarHedCategoricalStrings,
      hedSchema,
      sidecar.file,
      false,
    )
    const fileIssues = [].concat(valueStringIssues, categoricalStringIssues)
    sidecarErrorsFound =
      sidecarErrorsFound ||
      fileIssues.some((fileIssue) => {
        return fileIssue.isError()
      })
    issues = issues.concat(fileIssues)
  }
  return [sidecarErrorsFound, issues]
}

function validateSidecarStrings(
  sidecarHedStrings,
  hedSchema,
  jsonFileObject,
  areValueStrings,
) {
  let sidecarIssues = []
  for (const hedString of sidecarHedStrings) {
    const [isHedStringValid, hedIssues] = validateHedString(
      hedString,
      hedSchema,
      true,
      areValueStrings,
    )
    if (!isHedStringValid) {
      const convertedIssues = convertHedIssuesToBidsIssues(
        hedIssues,
        jsonFileObject,
      )
      sidecarIssues = sidecarIssues.concat(convertedIssues)
    }
  }
  return sidecarIssues
}

function parseTsvHed(eventFileData) {
  const hedStrings = []
  const issues = []
  const hedColumnIndex = eventFileData.parsedTsv.headers.indexOf('HED')
  const sidecarHedColumnIndices = {}
  for (const sidecarHedColumn of eventFileData.sidecarHedData.keys()) {
    const sidecarHedColumnHeader =
      eventFileData.parsedTsv.headers.indexOf(sidecarHedColumn)
    if (sidecarHedColumnHeader > -1) {
      sidecarHedColumnIndices[sidecarHedColumn] = sidecarHedColumnHeader
    }
  }
  if (hedColumnIndex === -1 && sidecarHedColumnIndices.length === 0) {
    return [[], []]
  }

  for (const rowCells of eventFileData.parsedTsv.rows.slice(1)) {
    // get the 'HED' field
    const hedStringParts = []
    if (rowCells[hedColumnIndex] && rowCells[hedColumnIndex] !== 'n/a') {
      hedStringParts.push(rowCells[hedColumnIndex])
    }
    for (const sidecarHedColumn in sidecarHedColumnIndices) {
      const sidecarHedIndex = sidecarHedColumnIndices[sidecarHedColumn]
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
          issues.push(new BidsIssue(108, eventFileData.file, rowCell))
        }
      }
    }

    if (hedStringParts.length === 0) {
      continue
    }
    hedStrings.push(hedStringParts.join(','))
  }
  return [hedStrings, issues]
}

function validateDataset(hedStrings, hedSchema, eventFileData) {
  const [isHedDatasetValid, hedIssues] = validateHedDataset(
    hedStrings,
    hedSchema,
    true,
  )
  if (!isHedDatasetValid) {
    return convertHedIssuesToBidsIssues(hedIssues, eventFileData.file)
  } else {
    return []
  }
}

function convertHedIssuesToBidsIssues(hedIssues, file) {
  return hedIssues.map((hedIssue) => {
    return new BidsHedIssue(hedIssue, file)
  })
}

module.exports = validateBidsDataset
