const { ParsedHedString, ParsedHedGroup } = require('./stringParser')
const { Issue, generateIssue } = require('../utils/issues/issues')

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
  constructor(file) {
    super()
    /**
     * The real file object representing this file data.
     * This is used to generate BidsIssue objects.
     * @type {File}
     */
    this.file = file
  }
}

class BidsEventFile extends BidsFileData {
  constructor(potentialSidecars, parsedTsv, file) {
    super(file)
    /**
     * The potential JSON sidecar data.
     * @type {object}
     */
    this.potentialSidecars = potentialSidecars
    /**
     * This file's parsed TSV data.
     * @type {object<string, *[]>}
     */
    this.parsedTsv = parsedTsv
  }
}

class BidsSidecar extends BidsFileData {
  constructor(sidecarData, file) {
    super(file)
    /**
     * The unparsed sidecar data.
     * @type {object}
     */
    this.sidecarData = sidecarData
  }
}

class BidsDataset extends BidsData {}

class BidsIssue {
  constructor(hedIssue) {
    /**
     * The HED Issue object corresponding to this object.
     * @type {Issue}
     */
    this.hedIssue = hedIssue
  }
  get errorCode() {
    return this.hedIssue.level === 'warning' ? 105 : 104
  }
}
