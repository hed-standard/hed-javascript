/**
 * This module contains classes for representing BIDS TSV files and their components.
 *
 * @module bids/types/tsv
 */
import isPlainObject from 'lodash/isPlainObject'

import { BidsFile } from './file'
import { convertParsedTSVData, findHeaderProblems, parseTSV, parseTSVHeader } from '../tsvParser'
import { BidsSidecar } from './json'
import BidsHedTsvValidator from '../validator/tsvValidator'
import { IssueError } from '../../issues/issues'
import { stripNameWhitespace } from '../../utils/string'

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
   * The column names that appear more than once in the header (TABULAR_INVALID); empty for Map data.
   * @type {string[]}
   */
  duplicateColumns

  /**
   * The column names that begin or end with whitespace (TABULAR_INVALID), each once in header order.
   * @type {string[]}
   */
  paddedColumns

  /**
   * The 1-based positions of the blank column names (TABULAR_INVALID).
   * @type {number[]}
   */
  blankColumns

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

  constructor(name, file, tsvData, mergedDictionary = {}, defManager = null) {
    super(name, file, BidsHedTsvValidator)

    let headers
    if (typeof tsvData === 'string') {
      this.parsedTsv = parseTSV(tsvData)
      headers = parseTSVHeader(tsvData)
    } else if (tsvData instanceof Map) {
      this.parsedTsv = new Map(tsvData)
      headers = [...tsvData.keys()]
    } else if (isPlainObject(tsvData)) {
      this.parsedTsv = convertParsedTSVData(tsvData)
      headers = tsvData.headers
    } else {
      const msg = 'The tsvData was not a string, Map or plain object, so a BidsTsvFile could not be created.'
      IssueError.generateAndThrow('internalError', { message: msg, filePath: file.path })
    }
    const { padded, blank, duplicate } = findHeaderProblems(headers)
    this.paddedColumns = padded
    this.blankColumns = blank
    this.duplicateColumns = duplicate

    this.mergedSidecar = new BidsSidecar(name, this.file, mergedDictionary, defManager)
    this._parseHedColumn()
  }

  /**
   * Parse the HED column from the TSV data.
   * @private
   */
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
    // A padded "HED" header is still the HED column, so the file is checked and its header reported.
    return (
      this.parsedTsv.has('HED') ||
      this.paddedColumns.some((column) => stripNameWhitespace(column) === 'HED') ||
      this.mergedSidecar.hasHedData
    )
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
 * An element in a BIDS TSV file.
 */
export class BidsTsvElement {
  /**
   * The string representation of this row
   * @type {string}
   */
  hedString

  /**
   * The ParsedHedString representation of this row
   * @type {import('../../parser/parsedHedString.js').ParsedHedString}
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
   * @type {string}
   */
  tsvLine

  constructor(hedString, tsvFile, onset, tsvLine) {
    this.hedString = hedString
    this.parsedHedString = null
    this.file = tsvFile.file
    this.fileName = tsvFile.name
    this.onset = onset
    this.tsvLine = tsvLine
  }

  /**
   * Override of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString | Object.prototype.toString}.
   *
   * @returns {string} The string representation of this element.
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
   * @type {Map<string, string>}
   */
  rowCells

  constructor(hedString, tsvFile, tsvLine, rowCells) {
    const onset = rowCells.has('onset') ? rowCells.get('onset') : undefined
    super(hedString, tsvFile, onset, tsvLine.toString())
    this.rowCells = rowCells
  }
}
