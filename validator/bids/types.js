import { sidecarValueHasHed } from '../../utils/bids'
import { Issue } from '../../common/issues/issues'

class BidsData {
  /**
   * A mapping from unparsed HED strings to ParsedHedString objects.
   * @type {Map<string, ParsedHedString>}
   */
  parsedStringMapping
  /**
   * A Mapping from definition names to their associated ParsedHedGroup objects.
   * @type {Map<string, ParsedHedGroup>}
   */
  definitions
  /**
   * A list of HED validation issues.
   * This will be converted to BidsIssue objects later on.
   * @type {Issue[]}
   */
  hedIssues

  constructor() {
    this.parsedStringMapping = new Map()
    this.definitions = new Map()
    this.hedIssues = []
  }
}

class BidsFile extends BidsData {
  /**
   * The file object representing this file data.
   * This is used to generate BidsIssue objects.
   * @type {object}
   */
  file

  constructor(name, file) {
    super()
    this.file = file
  }
}

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

export class BidsTsvFile extends BidsFile {
  /**
   * This file's parsed TSV data.
   * @type {object}
   */
  parsedTsv
  /**
   * HED strings in the "HED" column of the TSV data.
   * @type {string[]}
   */
  hedColumnHedStrings

  constructor(name, parsedTsv, file) {
    super(name, file)
    this.parsedTsv = parsedTsv
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

export class BidsEventFile extends BidsTsvFile {
  /**
   * The potential JSON sidecar data.
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

  constructor(name, potentialSidecars, mergedDictionary, parsedTsv, file) {
    super(name, parsedTsv, file)
    this.potentialSidecars = potentialSidecars

    this.mergedSidecar = new BidsSidecar(name, mergedDictionary, null)
    this.sidecarHedData = this.mergedSidecar.hedData
  }
}

export class BidsSidecar extends BidsJsonFile {
  /**
   * The extracted HED data for this sidecar.
   * @type {Map<string, string|Object<string, string>>}
   */
  hedData
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

// TODO: Remove in v4.0.0.
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
