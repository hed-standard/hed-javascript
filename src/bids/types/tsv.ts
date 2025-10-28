/**
 * This module contains classes for representing BIDS TSV files and their components.
 *
 * @module bids/types/tsv
 */
import isPlainObject from 'lodash/isPlainObject'

import { BidsFile } from './file'
import { convertParsedTSVData, parseTSV, OldParsedTSV, ParsedTSV } from '../tsvParser'
import { BidsSidecar } from './json'
import BidsHedTsvValidator from '../validator/tsvValidator'
import { IssueError } from '../../issues/issues'
import { DefinitionManager } from '../../parser/definitionManager'
import ParsedHedString from '../../parser/parsedHedString'

/**
 * A BIDS TSV file.
 */
export class BidsTsvFile extends BidsFile<BidsHedTsvValidator> {
  /**
   * This file's parsed TSV data.
   */
  parsedTsv: ParsedTSV

  /**
   * HED strings in the "HED" column of the TSV data.
   */
  hedColumnHedStrings: string[]

  /**
   * The pseudo-sidecar object representing the merged sidecar data.
   */
  mergedSidecar: BidsSidecar

  /**
   * Constructor.
   *
   * @param name The name of this file.
   * @param file The Object representing this file data.
   * @param tsvData This file's TSV data.
   * @param mergedDictionary This file's merged JSON dictionary.
   * @param defManager This file's definition manager.
   */
  constructor(
    name: string,
    file: any,
    tsvData: string | ParsedTSV | OldParsedTSV,
    mergedDictionary: Record<string, any> = {},
    defManager: DefinitionManager = null,
  ) {
    super(name, file, BidsHedTsvValidator)

    if (typeof tsvData === 'string') {
      this.parsedTsv = parseTSV(tsvData)
    } else if (tsvData instanceof Map) {
      this.parsedTsv = new Map(tsvData)
    } else if (isPlainObject(tsvData)) {
      this.parsedTsv = convertParsedTSVData(tsvData)
    } else {
      const msg = 'The tsvData was not a string, Map or plain object, so a BidsTsvFile could not be created.'
      IssueError.generateAndThrow('internalError', { message: msg, filePath: file.path })
    }

    this.mergedSidecar = new BidsSidecar(name, this.file, mergedDictionary, defManager)
    this._parseHedColumn()
  }

  /**
   * Parse the HED column from the TSV data.
   */
  private _parseHedColumn(): void {
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
   * @returns Whether this file has any HED data.
   */
  public get hasHedData(): boolean {
    return this.parsedTsv.has('HED') || this.mergedSidecar.hasHedData
  }

  /**
   * Whether this TSV file is a timeline file.
   *
   * @returns Whether this TSV file is a timeline file.
   */
  public get isTimelineFile(): boolean {
    return this.parsedTsv.has('onset')
  }
}

/**
 * An element in a BIDS TSV file.
 */
export class BidsTsvElement {
  /**
   * The string representation of this element.
   */
  hedString: string

  /**
   * The ParsedHedString representation of this element.
   */
  parsedHedString: ParsedHedString | null

  /**
   * The file this element belongs to (usually just the path).
   */
  file: any

  /**
   * The name of the file this element belongs to (usually just the path).
   */
  fileName: string

  /**
   * The onset represented by this element or a NaN.
   *
   * @todo This probably should be a number. Move numeric conversion to this file?
   */
  onset: string

  /**
   * The line number(s) (including the header) represented by this element.
   */
  tsvLine: string

  /**
   * Constructor.
   *
   * @param hedString The string representation of this element.
   * @param tsvFile The file this element belongs to (usually just the path).
   * @param onset The onset represented by this element or a NaN.
   * @param tsvLine The line number(s) (including the header) represented by this element.
   */
  constructor(hedString: string, tsvFile: BidsTsvFile, onset: string, tsvLine: string) {
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
   * @returns The string representation of this element.
   */
  public toString(): string {
    const onsetString = this.onset ? ` with onset=${this.onset}` : ''
    return this.hedString + ` in TSV file "${this.fileName}" at line(s) ${this.tsvLine}` + onsetString
  }

  /**
   * Create a string list of a list of BidsTsvElement objects.
   *
   * @param elements A list of elements to construct line numbers from.
   * @returns A string with the list of line numbers for error messages.
   */
  public static getTsvLines(elements: BidsTsvElement[]): string {
    return elements.map((element) => element.tsvLine).join(',')
  }
}

/**
 * A row in a BIDS TSV file.
 */
export class BidsTsvRow extends BidsTsvElement {
  /**
   * The map of column name to value for this row.
   */
  rowCells: Map<string, string>

  /**
   * Constructor.
   *
   * @param hedString The string representation of this row.
   * @param tsvFile The file this row belongs to (usually just the path).
   * @param tsvLine The line number (including the header) represented by this row.
   * @param rowCells The map of column name to value for this row.
   */
  constructor(hedString: string, tsvFile: BidsTsvFile, tsvLine: number, rowCells: Map<string, string>) {
    const onset = rowCells.get('onset') ?? ''
    super(hedString, tsvFile, onset, tsvLine.toString())
    this.rowCells = rowCells
  }
}
