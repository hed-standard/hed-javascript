const { ParsedHedString, ParsedHedGroup } = require('../stringParser')
const { sidecarValueHasHed } = require('../../utils/bids')
const { Issue } = require('../../utils/issues/issues')

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

module.exports = {
  BidsDataset: BidsDataset,
  BidsEventFile: BidsEventFile,
  BidsHedIssue: BidsHedIssue,
  BidsIssue: BidsIssue,
  BidsSidecar: BidsSidecar,
}