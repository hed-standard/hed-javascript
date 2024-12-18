import { BidsHedIssue, BidsIssue } from '../types/issues'
import { BidsTsvEvent, BidsTsvRow } from '../types/tsv'
import { parseHedString, parseHedStrings } from '../../parser/parser'
import ColumnSplicer from '../../parser/columnSplicer'
import ParsedHedString from '../../parser/parsedHedString'
import { generateIssue } from '../../common/issues/issues'
import { validateHedDatasetWithContext } from '../../validator/dataset'
import { groupBy } from '../../utils/map'

/**
 * Validator for HED data in BIDS TSV files.
 */
export class BidsHedTsvValidator {
  /**
   * The BIDS TSV file being validated.
   * @type {BidsTsvFile}
   */
  tsvFile
  /**
   * The HED schema collection being validated against.
   * @type {Schemas}
   */
  hedSchemas
  /**
   * The issues found during validation.
   * @type {BidsIssue[]}
   */
  issues

  /**
   * Constructor.
   *
   * @param {BidsTsvFile} tsvFile The BIDS TSV file being validated.
   * @param {Schemas} hedSchemas
   */
  constructor(tsvFile, hedSchemas) {
    this.tsvFile = tsvFile
    this.hedSchemas = hedSchemas // Will be set when the file is validated
    this.issues = []
  }

  /**
   * Validate a BIDS TSV file. This method returns the complete issue list for convenience.
   *
   * @returns {BidsIssue[]} Any issues found during validation of this TSV file.
   */
  validate() {
    if (this.tsvFile.mergedSidecar) {
      const sidecarIssues = this.tsvFile.mergedSidecar.validate(this.hedSchemas)
      this.issues.push(...sidecarIssues)
      if (BidsIssue.anyAreErrors(sidecarIssues)) {
        return this.issues
      }
    }

    // Valid Hed column
    const hedColumnIssues = this._validateHedColumn()
    this.issues.push(...hedColumnIssues)
    if (BidsIssue.anyAreErrors(this.issues)) {
      return this.issues
    }
    // Now do a full validation
    const bidsHedTsvParser = new BidsHedTsvParser(this.tsvFile, this.hedSchemas)
    const bidsEvents = bidsHedTsvParser.parse()
    this.issues.push(...bidsHedTsvParser.issues)
    if (!BidsIssue.anyAreErrors(this.issues)) {
      this.validateDataset(bidsEvents)
    }
    return this.issues
  }

  /**
   * Validate this TSV file's HED column.
   *
   * @returns {BidsIssue[]} All issues found.
   * @private
   */
  _validateHedColumn() {
    if (this.tsvFile.hedColumnHedStrings.length === 0) {
      // no HED column strings to validate
      return []
    }
    return this.tsvFile.hedColumnHedStrings.flatMap((hedString, rowIndexMinusTwo) =>
      this._validateHedColumnString(hedString, rowIndexMinusTwo + 2),
    )
  }

  /**
   * Validate a string in this TSV file's HED column.
   *
   * @param {string} hedString The string to be validated.
   * @param {number} rowIndex The index of this row in the TSV file.
   * @returns {BidsIssue[]} All issues found.
   * @private
   */
  _validateHedColumnString(hedString, rowIndex) {
    if (!hedString) {
      return []
    }

    const issues = []
    const [parsedString, parsingIssues] = parseHedString(hedString, this.hedSchemas, false, false, false)
    issues.push(...BidsHedIssue.fromHedIssues(parsingIssues, this.tsvFile.file, { tsvLine: rowIndex }))

    if (parsedString === null) {
      return issues
    }

    if (parsedString.columnSplices.length > 0) {
      issues.push(
        BidsHedIssue.fromHedIssue(
          generateIssue('curlyBracesInHedColumn', {
            string: parsedString.hedString,
            tsvLine: rowIndex.toString(),
          }),
          this.tsvFile.file,
        ),
      )
      return issues
    }

    const defIssues = [
      ...this.tsvFile.mergedSidecar.definitions.validateDefs(parsedString, this.hedSchemas, false),
      ...this.tsvFile.mergedSidecar.definitions.validateDefExpands(parsedString, this.hedSchemas, false),
    ]
    const convertedIssues = BidsHedIssue.fromHedIssues(defIssues, this.tsvFile.file, { tsvLine: rowIndex })
    issues.push(...convertedIssues)
    return issues
  }

  /**
   * Validate the HED data in a combined event TSV file/sidecar BIDS data collection.
   *
   * @param {BidsTsvElements[]} bidsEvents The HED strings in the data collection.
   */
  validateDataset(bidsEvents) {
    const hedStrings = bidsEvents.map((event) => event.hedString)
    const [parsedHedStrings, parsingIssues] = parseHedStrings(hedStrings, this.hedSchemas, true, false, false)
    this.issues.push(...BidsHedIssue.fromHedIssues(parsingIssues, this.tsvFile.file))
  }
}

export class BidsHedTsvParser {
  /**
   * The BIDS TSV file being parsed.
   * @type {BidsTsvFile}
   */
  tsvFile
  /**
   * The HED schema collection being parsed against.
   * @type {Schemas}
   */
  hedSchemas
  /**
   * The issues found during parsing.
   * @type {BidsIssue[]}
   */
  issues

  /**
   * Constructor.
   *
   * @param {BidsTsvFile} tsvFile The BIDS TSV file being parsed.
   * @param {Schemas} hedSchemas The HED schema collection being parsed against.
   */
  constructor(tsvFile, hedSchemas) {
    this.tsvFile = tsvFile
    this.hedSchemas = hedSchemas
    this.issues = []
  }

  /**
   * Combine the BIDS sidecar HED data into a BIDS TSV file's HED data.
   *
   * @returns {ParsedHedString[]} The combined HED string collection for this BIDS TSV file.
   */
  parse() {
    const tsvHedRows = this._generateHedRows()
    const hedStrings = this._parseHedRows(tsvHedRows)

    if (this.tsvFile.isTimelineFile) {
      return this._mergeEventRows(hedStrings)
    }

    return hedStrings
  }

  /**
   * Generate a list of rows with column-to-value mappings.
   *
   * @returns {Map<string, string>[]} A list of single-row column-to-value mappings.
   * @private
   */
  _generateHedRows() {
    const tsvHedColumns = Array.from(this.tsvFile.parsedTsv.entries()).filter(
      ([header]) => this.tsvFile.mergedSidecar.hedData.has(header) || header === 'HED' || header === 'onset',
    )

    const tsvHedRows = []
    for (const [header, data] of tsvHedColumns) {
      data.forEach((value, index) => {
        tsvHedRows[index] ??= new Map()
        tsvHedRows[index].set(header, value)
      })
    }
    return tsvHedRows
  }

  /**
   * Parse the HED rows in the TSV file.
   *
   * @param {Map<string, string>[]} tsvHedRows A list of single-row column-to-value mappings.
   * @return {BidsTsvRow[]} A list of row-based parsed HED strings.
   * @private
   */
  _parseHedRows(tsvHedRows) {
    const hedStrings = []
    tsvHedRows.forEach((row, index) => {
      const hedString = this._parseHedRow(row, index + 2)
      if (hedString !== null) {
        hedStrings.push(hedString)
      }
    })
    return hedStrings
  }

  /**
   * Merge rows with the same onset time into a single event string.
   *
   * @param {BidsTsvRow[]} rowStrings A list of row-based parsed HED strings.
   * @return {BidsTsvEvent[]} A list of event-based parsed HED strings.
   * @private
   */
  _mergeEventRows(rowStrings) {
    const eventStrings = []
    const groupedTsvRows = groupBy(rowStrings, (rowString) => rowString.onset)
    const sortedOnsetTimes = Array.from(groupedTsvRows.keys()).sort((a, b) => a - b)
    for (const onset of sortedOnsetTimes) {
      const onsetRows = groupedTsvRows.get(onset)
      const onsetEventString = new BidsTsvEvent(this.tsvFile, onsetRows)
      eventStrings.push(onsetEventString)
    }
    return eventStrings
  }

  /**
   * Parse a row in a TSV file.
   *
   * @param {Map<string, string>} rowCells The column-to-value mapping for a single row.
   * @param {number} tsvLine The index of this row in the TSV file.
   * @returns {BidsTsvRow} A parsed HED string.
   * @private
   */
  _parseHedRow(rowCells, tsvLine) {
    const nullSet = new Set([null, undefined, '', 'n/a'])
    const hedStringParts = []
    const columnMap = this._getColumnMapping(rowCells)
    this.spliceValues(columnMap)

    for (const [columnName, columnValue] of rowCells.entries()) {
      // If a splice, it can't be used in an assembled HED string.
      if (this.tsvFile.mergedSidecar.columnSpliceReferences.has(columnName) || nullSet.has(columnValue)) {
        continue
      }
      if (columnMap.has(columnName) && !nullSet.has(columnMap.get(columnName))) {
        hedStringParts.push(columnMap.get(columnName))
      }
    }
    const hedString = hedStringParts.join(',')
    if (hedString === '') {
      return null
    }
    return new BidsTsvRow(hedString, this.tsvFile, tsvLine, rowCells)
  }

  /**
   * Generate a mapping from tsv columns to strings (may have splices in the strings)
   *
   * @param {Map<string, string>} rowCells The column-to-value mapping for a single row.
   * @returns {Map<string, string>} A mapping of column names to their corresponding parsed sidecar strings.
   * @private
   */
  _getColumnMapping(rowCells) {
    const columnMap = new Map()
    if (!this.tsvFile.mergedSidecar.hasHedData()) {
      return columnMap
    }

    for (const [columnName, columnValues] of this.tsvFile.mergedSidecar.parsedHedData.entries()) {
      if (!rowCells.has(columnName)) {
        continue
      }
      const rowColumnValue = rowCells.get(columnName)
      if (rowColumnValue === 'n/a' || rowColumnValue === '') {
        columnMap.set(columnName, '')
        continue
      }

      if (columnValues instanceof ParsedHedString) {
        const columnString = columnValues.hedString.replace('#', rowColumnValue)
        columnMap.set(columnName, columnString)
      } else if (columnValues instanceof Map) {
        columnMap.set(columnName, columnValues.get(rowColumnValue).hedString)
      }
    }
    if (rowCells.has('HED')) {
      columnMap.set('HED', rowCells.get('HED'))
    }

    return columnMap
  }

  /**
   * Update the map to splice in the values for columns that have splices.
   * @param columnMap
   */
  spliceValues(columnMap) {
    const regex = /\{([^{}]*?)\}/g
    for (const [column, spliceList] of this.tsvFile.mergedSidecar.columnSpliceMapping) {
      if (!columnMap.has(column)) {
        continue
      }
      const unspliced = columnMap.get(column)
      const result = unspliced.replace(regex, (match, content) => {
        return columnMap.has(content) ? columnMap.get(content) : ''
      })
      console.log(unspliced)
      console.log(result)
      columnMap.set(column, result)
    }
  }
}

export default BidsHedTsvValidator
