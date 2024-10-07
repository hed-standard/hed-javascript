import isPlainObject from 'lodash/isPlainObject'

import { BidsFile } from './basic'
import { convertParsedTSVData, parseTSV } from '../tsvParser'
import { BidsSidecar } from './json'
import ParsedHedString from '../../parser/parsedHedString'
import BidsHedTsvValidator from '../validator/bidsHedTsvValidator'
import { IssueError } from '../../common/issues/issues'

/**
 * A BIDS TSV file.
 */
export class BidsTsvFile extends BidsFile {
  /**
   * This file's parsed TSV data.
   * @type {Map<string, string[]>}
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
   * @param {{headers: string[], rows: string[][]}|Map<string, string[]>|string} tsvData This file's TSV data.
   * @param {object} file The file object representing this file.
   * @param {string[]} potentialSidecars The list of potential JSON sidecars.
   * @param {object} mergedDictionary The merged sidecar data.
   */
  constructor(name, tsvData, file, potentialSidecars = [], mergedDictionary = {}) {
    super(name, file, BidsHedTsvValidator)

    if (typeof tsvData === 'string') {
      this.parsedTsv = parseTSV(tsvData)
    } else if (tsvData instanceof Map) {
      this.parsedTsv = tsvData
    } else if (isPlainObject(tsvData)) {
      this.parsedTsv = convertParsedTSVData(tsvData)
    } else {
      IssueError.generateAndThrow('internalError', { message: 'parsedTsv has an invalid type' })
    }

    this.potentialSidecars = potentialSidecars
    this.mergedSidecar = new BidsSidecar(name, mergedDictionary, this.file)
    this.sidecarHedData = this.mergedSidecar.hedData
    this._parseHedColumn()
  }

  _parseHedColumn() {
    const hedColumn = this.parsedTsv.get('HED')
    if (hedColumn === undefined) {
      this.hedColumnHedStrings = []
    } else {
      this.hedColumnHedStrings = hedColumn.map((hedCell) => (hedCell && hedCell !== 'n/a' ? hedCell : ''))
    }
  }

  /**
   * Determine whether this file has any HED data.
   *
   * @todo To be replaced with property in version 4.0.0.
   *
   * @returns {boolean}
   */
  hasHedData() {
    return this.parsedTsv.has('HED') || this.mergedSidecar.hasHedData()
  }

  /**
   * Whether this TSV file is a timeline file.
   *
   * @returns {boolean}
   */
  get isTimelineFile() {
    return this.parsedTsv.has('onset')
  }
}

/**
 * A BIDS events.tsv file.
 *
 * @deprecated Use {@link BidsTsvFile}. Will be removed in version 4.0.0.
 */
export class BidsEventFile extends BidsTsvFile {
  /**
   * Constructor.
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
 *
 * @deprecated Use {@link BidsTsvFile}. Will be removed in version 4.0.0.
 */
export class BidsTabularFile extends BidsTsvFile {
  /**
   * Constructor.
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

/**
 * A row in a BIDS TSV file.
 */
export class BidsTsvRow extends ParsedHedString {
  /**
   * The parsed string representing this row.
   * @type {ParsedHedString}
   */
  parsedString
  /**
   * The column-to-value mapping for this row.
   * @type {Map<string, string>}
   */
  rowCells
  /**
   * The file this row belongs to.
   * @type {BidsTsvFile}
   */
  tsvFile
  /**
   * The line number in {@link BidsTsvRow.tsvFile} this line is located at.
   * @type {number}
   */
  tsvLine

  /**
   * Constructor.
   *
   * @param {ParsedHedString} parsedString The parsed string representing this row.
   * @param {Map<string, string>} rowCells The column-to-value mapping for this row.
   * @param {BidsTsvFile} tsvFile The file this row belongs to.
   * @param {number} tsvLine The line number in {@link tsvFile} this line is located at.
   */
  constructor(parsedString, rowCells, tsvFile, tsvLine) {
    super(parsedString.hedString, parsedString.parseTree)
    this.parsedString = parsedString
    this.context = parsedString.context
    this.rowCells = rowCells
    this.tsvFile = tsvFile
    this.tsvLine = tsvLine
  }

  /**
   * Override of {@link Object.prototype.toString}.
   *
   * @returns {string}
   */
  toString() {
    return super.toString() + ` in TSV file "${this.tsvFile.name}" at line ${this.tsvLine}`
  }

  /**
   * The onset of this row.
   *
   * @return {number} The onset of this row.
   */
  get onset() {
    const value = Number(this.rowCells.get('onset'))
    if (Number.isNaN(value)) {
      IssueError.generateAndThrow('internalError', {
        message: 'Attempting to access the onset of a TSV row without one.',
      })
    }
    return value
  }
}

/**
 * An event in a BIDS TSV file.
 */
export class BidsTsvEvent extends ParsedHedString {
  /**
   * The file this row belongs to.
   * @type {BidsTsvFile}
   */
  tsvFile
  /**
   * The TSV rows making up this event.
   * @type {BidsTsvRow[]}
   */
  tsvRows

  /**
   * Constructor.
   *
   * @param {BidsTsvFile} tsvFile The file this row belongs to.
   * @param {BidsTsvRow[]} tsvRows The TSV rows making up this event.
   */
  constructor(tsvFile, tsvRows) {
    super(tsvRows.map((tsvRow) => tsvRow.hedString).join(', '), tsvRows.map((tsvRow) => tsvRow.parseTree).flat())
    this.tsvFile = tsvFile
    this.tsvRows = tsvRows
  }

  /**
   * The lines in the TSV file corresponding to this event.
   *
   * @return {string} The lines in the TSV file corresponding to this event.
   */
  get tsvLines() {
    return this.tsvRows.map((tsvRow) => tsvRow.tsvLine).join(', ')
  }

  /**
   * Override of {@link Object.prototype.toString}.
   *
   * @returns {string}
   */
  toString() {
    return super.toString() + ` in TSV file "${this.tsvFile.name}" at line(s) ${this.tsvLines}`
  }
}
