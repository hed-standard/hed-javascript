import isPlainObject from 'lodash/isPlainObject'

import { BidsFile } from './file'
import { convertParsedTSVData, parseTSV } from '../tsvParser'
import { BidsSidecar } from './json'
import BidsHedTsvValidator from '../validator/tsvValidator'
import { IssueError } from '../../issues/issues'

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
   * The pseudo-sidecar object representing the merged sidecar data.
   * @type {BidsSidecar}
   */
  mergedSidecar

  /**
   * Constructor.
   *
   * @param {string} name - The name of the TSV file.
   * @param {Object} file - The file object representing this file.
   * @param {{headers: string[], rows: string[][]}|Map|string} tsvData - This file's TSV data.
   * @param {Object} mergedDictionary - The merged sidecar data.
   * @param {DefinitionManager} defManager - The definition manager for this file.
   */
  constructor(name, file, tsvData, mergedDictionary = {}, defManager = undefined) {
    super(name, file, BidsHedTsvValidator)

    if (typeof tsvData === 'string') {
      this.parsedTsv = parseTSV(tsvData)
    } else if (tsvData instanceof Map) {
      this.parsedTsv = new Map(tsvData)
    } else if (isPlainObject(tsvData)) {
      this.parsedTsv = convertParsedTSVData(tsvData)
    } else {
      IssueError.generateAndThrowInternalError('parsedTsv has an invalid type')
    }

    this.mergedSidecar = new BidsSidecar(name, this.file, mergedDictionary, defManager)
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
   * @returns {boolean}
   */
  get hasHedData() {
    return this.parsedTsv.has('HED') || this.mergedSidecar.hasHedData
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

export class BidsTsvElement {
  /**
   * The string representation of this row
   * @type {string}
   */
  hedString

  /**
   * The ParsedHedString representation of this row
   * @type {ParsedHedString}
   */
  parsedHedString

  /**
   * The file this row belongs to (usually just the path).
   * @type {Object}
   */
  file

  /**
   * The onset represented by this row or a NaN.
   * @type {Number}
   */
  onset

  /**
   * The line number(s) (including the header) represented by this row.
   */
  tsvLine

  /**
   * Constructor.
   *
   * @param {string} hedString The HED string representing this row
   * @param {BidsTsvFile} tsvFile The file this row belongs to.
   * @param {number} onset - The onset for this element or undefined if none
   * @param {string} tsvLine The line number(s) (string) corresponding to the lines in {@link tsvFile} this line is located at.
   */
  constructor(hedString, tsvFile, onset, tsvLine) {
    this.hedString = hedString
    this.parsedHedString = null
    this.file = tsvFile.file
    this.fileName = tsvFile.name
    this.onset = onset
    this.tsvLine = tsvLine
  }

  /**
   * Override of {@link object.prototype.toString}.
   *
   * @returns {string}
   */
  toString() {
    const onsetString = this.onset ? ` with onset=${this.onset.toString()}` : ''
    return this.hedString + ` in TSV file "${this.fileName}" at line(s) ${this.tsvLine}` + onsetString
  }

  /**
   * Create a string list of a list of BidsTsvElement objects.
   * @param {BidsTsvElement[]} elements - A list of elements to construct line numbers from.
   * @returns {string} - A string with the list of line numbers for error messages.
   */
  static getTsvLines(elements) {
    return elements.map((element) => element.tsvLine).join(',')
  }
}

/**
 * A row in a BIDS TSV file.
 */
export class BidsTsvRow extends BidsTsvElement {
  /**
   * The map of column name to value for this row.
   * @type {Map}
   */
  rowCells

  /**
   * Constructor.
   *
   * @param {string} hedString The parsed string representing this row.
   * @param {Map} rowCells The column-to-value mapping for this row.
   * @param {BidsTsvFile} tsvFile The file this row belongs to.
   * @param {number} tsvLine The line number in {@link tsvFile} this line is located at.
   */
  constructor(hedString, tsvFile, tsvLine, rowCells) {
    const onset = rowCells.has('onset') ? rowCells.get('onset') : undefined
    super(hedString, tsvFile, onset, tsvLine.toString())
    this.rowCells = rowCells
  }
}
