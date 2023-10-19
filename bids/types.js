import { sidecarValueHasHed } from './utils'
import { generateIssue, Issue } from '../common/issues/issues'
import parseTSV from './tsvParser'
import { parseHedString } from '../validator/parser/main'

/**
 * Base class for BIDS data.
 * @deprecated Will be removed in v4.0.0.
 */
class BidsData {
  /**
   * A mapping from unparsed HED strings to ParsedHedString objects.
   * @deprecated Will be removed in v4.0.0.
   * @type {Map<string, ParsedHedString>}
   */
  parsedStringMapping
  /**
   * A Mapping from definition names to their associated ParsedHedGroup objects.
   * @deprecated Will be removed in v4.0.0.
   * @type {Map<string, ParsedHedGroup>}
   */
  definitions
  /**
   * A list of HED validation issues.
   * This will be converted to BidsIssue objects later on.
   * @deprecated Will be removed in v4.0.0.
   * @type {Issue[]}
   */
  hedIssues

  constructor() {
    this.parsedStringMapping = new Map()
    this.definitions = new Map()
    this.hedIssues = []
  }
}

/**
 * A BIDS file.
 */
class BidsFile extends BidsData {
  /**
   * The name of this file.
   * @type {string}
   */
  name
  /**
   * The file object representing this file data.
   * This is used to generate BidsIssue objects.
   * @type {object}
   */
  file

  constructor(name, file) {
    super()
    this.name = name
    this.file = file
  }
}

/**
 * A BIDS JSON file.
 */
export class BidsJsonFile extends BidsFile {
  /**
   * This file's JSON data.
   * @type {object}
   */
  jsonData

  constructor(name, jsonData, file) {
    super(name, file)
    this.jsonData = jsonData
  }
}

/**
 * A BIDS TSV file.
 */
export class BidsTsvFile extends BidsFile {
  /**
   * This file's parsed TSV data.
   * @type {{headers: string[], rows: string[][]}}
   */
  parsedTsv
  /**
   * HED strings in the "HED" column of the TSV data.
   * @type {string[]}
   */
  hedColumnHedStrings
  /**
   * The list of potential JSON sidecars.
   * @type {string[]}
   */
  potentialSidecars
  /**
   * The pseudo-sidecar object representing the merged sidecar data.
   * @type {BidsSidecar}
   */
  mergedSidecar
  /**
   * The extracted HED data for the merged pseudo-sidecar.
   * @type {Map<string, string|Object<string, string>>}
   */
  sidecarHedData

  /**
   * Constructor.
   *
   * @todo This interface is provisional and subject to modification in version 4.0.0.
   *
   * @param {string} name The name of the TSV file.
   * @param {{headers: string[], rows: string[][]}|string} tsvData This file's TSV data.
   * @param {object} file The file object representing this file.
   * @param {string[]} potentialSidecars The list of potential JSON sidecars.
   * @param {object} mergedDictionary The merged sidecar data.
   */
  constructor(name, tsvData, file, potentialSidecars = [], mergedDictionary = {}) {
    super(name, file)
    if (typeof tsvData === 'string') {
      tsvData = parseTSV(tsvData)
    }
    this.parsedTsv = tsvData
    this.potentialSidecars = potentialSidecars

    this.mergedSidecar = new BidsSidecar(name, mergedDictionary, null)
    this.sidecarHedData = this.mergedSidecar.hedData
    this._parseHedColumn()
  }

  _parseHedColumn() {
    const hedColumnIndex = this.parsedTsv.headers.indexOf('HED')
    if (hedColumnIndex === -1) {
      this.hedColumnHedStrings = []
    } else {
      this.hedColumnHedStrings = this.parsedTsv.rows
        .slice(1)
        .map((rowCells) => rowCells[hedColumnIndex])
        .map((hedCell) => (hedCell && hedCell !== 'n/a' ? hedCell : ''))
    }
  }
}

/**
 * A BIDS events.tsv file.
 */
export class BidsEventFile extends BidsTsvFile {
  /**
   * Constructor.
   *
   * @todo This interface is subject to modification in version 4.0.0.
   *
   * @param {string} name The name of the event TSV file.
   * @param {string[]} potentialSidecars The list of potential JSON sidecars.
   * @param {object} mergedDictionary The merged sidecar data.
   * @param {{headers: string[], rows: string[][]}|string} tsvData This file's TSV data.
   * @param {object} file The file object representing this file.
   */
  constructor(name, potentialSidecars, mergedDictionary, tsvData, file) {
    super(name, tsvData, file, potentialSidecars, mergedDictionary)
  }
}

/**
 * A BIDS TSV file other than an events.tsv file.
 */
export class BidsTabularFile extends BidsTsvFile {
  /**
   * Constructor.
   *
   * @todo This interface is subject to modification in version 4.0.0.
   *
   * @param {string} name The name of the TSV file.
   * @param {string[]} potentialSidecars The list of potential JSON sidecars.
   * @param {object} mergedDictionary The merged sidecar data.
   * @param {{headers: string[], rows: string[][]}|string} tsvData This file's TSV data.
   * @param {object} file The file object representing this file.
   */
  constructor(name, potentialSidecars, mergedDictionary, tsvData, file) {
    super(name, tsvData, file, potentialSidecars, mergedDictionary)
  }
}

export class BidsSidecar extends BidsJsonFile {
  /**
   * The extracted HED data for this sidecar.
   * @type {Map<string, string|Object<string, string>>}
   */
  hedData
  /**
   * The parsed HED data for this sidecar.
   * @type {Map<string, ParsedHedString|Map<string, ParsedHedString>>}
   */
  parsedHedData
  /**
   * The extracted HED value strings.
   * @type {string[]}
   */
  hedValueStrings
  /**
   * The extracted HED categorical strings.
   * @type {string[]}
   */
  hedCategoricalStrings

  /**
   * Constructor.
   *
   * @param {string} name The name of the sidecar file.
   * @param {Object} sidecarData The raw JSON data.
   * @param {Object} file The file object representing this file.
   */
  constructor(name, sidecarData = {}, file) {
    super(name, sidecarData, file)

    this._filterHedStrings()
    this._categorizeHedStrings()
  }

  _filterHedStrings() {
    const sidecarHedTags = Object.entries(this.jsonData)
      .map(([sidecarKey, sidecarValue]) => {
        if (sidecarValueHasHed(sidecarValue)) {
          return [sidecarKey, sidecarValue.HED]
        } else {
          return []
        }
      })
      .filter((x) => x.length > 0)
    this.hedData = new Map(sidecarHedTags)
  }

  _categorizeHedStrings() {
    this.hedValueStrings = []
    this.hedCategoricalStrings = []
    for (const sidecarValue of this.hedData.values()) {
      if (typeof sidecarValue === 'string') {
        this.hedValueStrings.push(sidecarValue)
      } else {
        this.hedCategoricalStrings.push(...Object.values(sidecarValue))
      }
    }
  }

  /**
   * Parse this sidecar's HED strings within the sidecar structure.
   *
   * The parsed strings are placed into {@link parsedHedData}.
   *
   * @param {Schemas} hedSchemas The HED schema collection.
   * @return {Issue[]} Any issues found.
   */
  parseHedStrings(hedSchemas) {
    this.parsedHedData = new Map()
    let issues = []
    for (const [key, strings] of this.hedData) {
      if (typeof strings === 'string') {
        const [parsedString, parsingIssues] = parseHedString(strings, hedSchemas)
        this.parsedHedData.set(key, parsedString)
        issues = issues.concat(...Object.values(parsingIssues))
      } else if (strings === Object(strings)) {
        const keyMap = new Map()
        for (const [value, string] of Object.entries(strings)) {
          const [parsedString, parsingIssues] = parseHedString(string, hedSchemas)
          keyMap.set(value, parsedString)
          issues = issues.concat(...Object.values(parsingIssues))
        }
        this.parsedHedData.set(key, keyMap)
      } else {
        issues.push(generateIssue('illegalSidecarHedType', { key: key, file: this.name }))
      }
    }
    return issues
  }

  /**
   * The extracted HED strings.
   * @returns {string[]}
   */
  get hedStrings() {
    return this.hedValueStrings.concat(this.hedCategoricalStrings)
  }

  /**
   * An alias for {@link jsonData}.
   * @returns {Object}
   */
  get sidecarData() {
    return this.jsonData
  }
}

/**
 * Fallback default dataset_description.json file.
 * @deprecated Will be removed in v4.0.0.
 * @type {BidsJsonFile}
 */
const fallbackDatasetDescription = new BidsJsonFile('./dataset_description.json', null)

export class BidsDataset extends BidsData {
  /**
   * The dataset's event file data.
   * @type {BidsEventFile[]}
   */
  eventData
  /**
   * The dataset's sidecar data.
   * @type {BidsSidecar[]}
   */
  sidecarData
  /**
   * The dataset's dataset_description.json file.
   * @type {BidsJsonFile}
   */
  datasetDescription
  /**
   * The dataset's root directory as an absolute path.
   * @type {string|null}
   */
  datasetRootDirectory

  constructor(eventData, sidecarData, datasetDescription = fallbackDatasetDescription, datasetRootDirectory = null) {
    super()
    this.eventData = eventData
    this.sidecarData = sidecarData
    this.datasetDescription = datasetDescription
    this.datasetRootDirectory = datasetRootDirectory
  }
}

const bidsHedErrorCodes = new Set([104, 106, 107])

export class BidsIssue {
  /**
   * The BIDS issue code.
   * @type {number}
   */
  code
  /**
   * The file associated with this issue.
   * @type {Object}
   */
  file
  /**
   * The evidence for this issue.
   * @type {string}
   */
  evidence

  constructor(issueCode, file, evidence) {
    this.code = issueCode
    this.file = file
    this.evidence = evidence
  }

  /**
   * Whether this issue is an error.
   * @returns {boolean}
   */
  isError() {
    return bidsHedErrorCodes.has(this.code)
  }

  static generateInternalErrorPromise(error) {
    return Promise.resolve([new BidsIssue(107, null, error.message)])
  }
}

export class BidsHedIssue extends BidsIssue {
  /**
   * The HED Issue object corresponding to this object.
   * @type {Issue}
   */
  hedIssue

  constructor(hedIssue, file) {
    super(hedIssue.level === 'warning' ? 105 : 104, file, hedIssue.message)

    this.hedIssue = hedIssue
  }
}
