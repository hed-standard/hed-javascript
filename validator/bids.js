const { validateHedDataset } = require('./dataset')
const { validateHedString } = require('./event')
const { buildSchema } = require('./schema')
const { ParsedHedString, ParsedHedGroup } = require('./stringParser')
const { Issue } = require('../utils/issues/issues')

class BidsData {
  constructor() {
    /**
     * A mapping from unparsed HED strings to ParsedHedString objects.
     * @type {Map<string, ParsedHedString>}
     */
    this.parsedStringMapping = new Map()
    /**
     * A Mapping from definition names to their associated ParsedHedGroup objects.
     * @type {Map<string, ParsedHedGroup>}
     */
    this.definitions = new Map()
    /**
     * A list of HED validation issues.
     * This will be converted to BidsIssue objects later on.
     * @type {Issue[]}
     */
    this.hedIssues = []
  }
}

class BidsFileData extends BidsData {
  constructor(name, file) {
    super()
    /**
     * The file object representing this file data.
     * This is used to generate BidsIssue objects.
     * @type {object}
     */
    this.file = file
  }
}

class BidsEventFile extends BidsFileData {
  constructor(name, potentialSidecars, mergedDictionary, parsedTsv, file) {
    super(name, file)
    /**
     * The potential JSON sidecar data.
     * @type {string[]}
     */
    this.potentialSidecars = potentialSidecars
    /**
     * The merged sidecar dictionary.
     * @type {object}
     */
    this.mergedDictionary = mergedDictionary
    /**
     * This file's parsed TSV data.
     * @type {object<string, *[]>}
     */
    this.parsedTsv = parsedTsv

    this.sidecarHedData = this.mergeSidecarHed()
  }

  mergeSidecarHed() {
    const sidecarHedTags = Object.entries(this.mergedDictionary)
      .map(([sidecarKey, sidecarValue]) => {
        if (sidecarValueHasHed(sidecarValue)) {
          return [sidecarKey, sidecarValue.HED]
        } else {
          return false
        }
      })
      .filter((x) => Boolean(x))
    return new Map(sidecarHedTags)
  }
}

class BidsSidecar extends BidsFileData {
  constructor(name, sidecarData = {}, file) {
    super(name, file)
    /**
     * The unparsed sidecar data.
     * @type {object}
     */
    this.sidecarData = sidecarData
  }
}

class BidsDataset extends BidsData {
  constructor(eventData, sidecarData) {
    super()
    this.eventData = eventData
    this.sidecarData = sidecarData
  }
}

class BidsIssue {
  constructor(issueCode, file, evidence) {
    this.code = issueCode
    this.file = file
    this.evidence = evidence
  }

  isError() {
    return this.code === 104 || this.code === 106
  }
}

class BidsHedIssue extends BidsIssue {
  constructor(hedIssue, file) {
    super(hedIssue.level === 'warning' ? 105 : 104, file, hedIssue.message)
    /**
     * The HED Issue object corresponding to this object.
     * @type {Issue}
     */
    this.hedIssue = hedIssue
  }
}

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

function sidecarValueHasHed(sidecarValue) {
  return (
    sidecarValue !== null &&
    typeof sidecarValue === 'object' &&
    sidecarValue.HED !== undefined
  )
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

module.exports = {
  BidsDataset: BidsDataset,
  BidsEventFile: BidsEventFile,
  BidsHedIssue: BidsHedIssue,
  BidsIssue: BidsIssue,
  BidsSidecar: BidsSidecar,
  validateBidsDataset: validateBidsDataset,
}