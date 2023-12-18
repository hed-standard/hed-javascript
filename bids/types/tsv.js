import { BidsFile } from './basic'
import { convertParsedTSVData, parseTSV } from '../tsvParser'
import { BidsSidecar } from './json'

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
    super(name, file)
    let parsedTsvData
    if (typeof tsvData === 'string') {
      parsedTsvData = parseTSV(tsvData)
    } else if (tsvData === Object(tsvData)) {
      parsedTsvData = convertParsedTSVData(tsvData)
    } else {
      parsedTsvData = tsvData
    }
    this.parsedTsv = parsedTsvData
    this.potentialSidecars = potentialSidecars

    this.mergedSidecar = new BidsSidecar(name, mergedDictionary, null)
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
   * @returns {boolean}
   */
  hasHedData() {
    return this.parsedTsv.has('HED')
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
