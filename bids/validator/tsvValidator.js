import { BidsHedIssue, BidsIssue } from '../types/issues'
import { BidsTsvEvent, BidsTsvRow } from '../types/tsv'
import { parseHedString } from '../../parser/parser'
import ColumnSplicer from '../../parser/columnSplicer'
import ParsedHedString from '../../parser/parsedHedString'
import { generateIssue } from '../../common/issues/issues'
import { validateHedDatasetWithContext } from '../../validator/dataset'
import { groupBy } from '../../utils/map'
import { validateHedString } from '../../validator/event/init'

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
    const hedStrings = bidsHedTsvParser.parse()
    this.issues.push(...bidsHedTsvParser.issues)
    if (!BidsIssue.anyAreErrors(this.issues)) {
      this.validateCombinedDataset(hedStrings)
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
    const options = {
      checkForWarnings: true,
      expectValuePlaceholderString: false,
      definitionsAllowed: false,
    }

    const [parsedString, parsingIssues] = parseHedString(hedString, this.hedSchemas, false, false)
    issues.push(
      ...BidsHedIssue.fromHedIssues(Object.values(parsingIssues).flat(), this.tsvFile.file, { tsvLine: rowIndex }),
    )

    if (parsedString === null) {
      return issues
    }

    if (parsedString.columnSplices.length > 0) {
      issues.push(
        BidsHedIssue.fromHedIssue(
          generateIssue('curlyBracesInHedColumn', {
            string: parsedString.hedString,
            tsvLine: rowIndex,
          }),
          this.tsvFile.file,
        ),
      )
      return issues
    }

    const [, hedIssues] = validateHedString(parsedString, this.hedSchemas, options)
    const convertedIssues = BidsHedIssue.fromHedIssues(hedIssues, this.tsvFile.file, { tsvLine: rowIndex })
    issues.push(...convertedIssues)

    return issues
  }

  /**
   * Validate the HED data in a combined event TSV file/sidecar BIDS data collection.
   *
   * @param {ParsedHedString[]} hedStrings The HED strings in the data collection.
   */
  validateCombinedDataset(hedStrings) {
    const [, hedIssues] = validateHedDatasetWithContext(hedStrings, this.tsvFile.mergedSidecar, this.hedSchemas, {
      checkForWarnings: true,
      validateDatasetLevel: this.tsvFile.isTimelineFile,
    })
    this.issues.push(...BidsHedIssue.fromHedIssues(hedIssues, this.tsvFile.file))
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
   * @return {BidsTsvRow} A parsed HED string.
   * @private
   */
  _parseHedRow(rowCells, tsvLine) {
    const hedStringParts = []
    for (const [columnName, columnValue] of rowCells.entries()) {
      const hedStringPart = this._parseRowCell(columnName, columnValue, tsvLine)
      if (hedStringPart !== null && !this.tsvFile.mergedSidecar.columnSpliceReferences.has(columnName)) {
        hedStringParts.push(hedStringPart)
      }
    }
    if (hedStringParts.length === 0) return null

    const hedString = hedStringParts.join(',')

    return this._parseHedRowString(rowCells, tsvLine, hedString)
  }

  /**
   * Parse a row's generated HED string in a TSV file.
   *
   * @param {Map<string, string>} rowCells The column-to-value mapping for a single row.
   * @param {number} tsvLine The index of this row in the TSV file.
   * @param {string} hedString The unparsed HED string for this row.
   * @return {BidsTsvRow} A parsed HED string.
   * @private
   */
  _parseHedRowString(rowCells, tsvLine, hedString) {
    const columnSpliceMapping = this._generateColumnSpliceMapping(rowCells)
    const [parsedString, parsingIssues] = parseHedString(hedString, this.hedSchemas, false, false)
    const flatParsingIssues = Object.values(parsingIssues).flat()
    if (flatParsingIssues.length > 0) {
      this.issues.push(...BidsHedIssue.fromHedIssues(flatParsingIssues, this.tsvFile.file, { tsvLine }))
      return null
    }

    const columnSplicer = new ColumnSplicer(parsedString, columnSpliceMapping, rowCells, this.hedSchemas)
    const splicedParsedString = columnSplicer.splice()
    const splicingIssues = columnSplicer.issues
    if (splicingIssues.length > 0) {
      this.issues.push(...BidsHedIssue.fromHedIssues(splicingIssues, this.tsvFile.file, { tsvLine }))
      return null
    }

    return new BidsTsvRow(splicedParsedString, rowCells, this.tsvFile, tsvLine)
  }

  /**
   * Generate the column splice mapping for a BIDS TSV file row.
   *
   * @param {Map<string, string>} rowCells The column-to-value mapping for a single row.
   * @return {Map<string, ParsedHedString>} A mapping of column names to their corresponding parsed sidecar strings.
   * @private
   */
  _generateColumnSpliceMapping(rowCells) {
    const columnSpliceMapping = new Map()
    if (!this.tsvFile.mergedSidecar.hasHedData()) {
      return columnSpliceMapping
    }

    for (const [columnName, columnValue] of rowCells.entries()) {
      if (columnValue === 'n/a' || columnValue === '') {
        columnSpliceMapping.set(columnName, null)
        continue
      }

      const sidecarEntry = this.tsvFile.mergedSidecar.parsedHedData.get(columnName)

      if (sidecarEntry instanceof ParsedHedString) {
        columnSpliceMapping.set(columnName, sidecarEntry)
      } else if (sidecarEntry instanceof Map) {
        columnSpliceMapping.set(columnName, sidecarEntry.get(columnValue))
      }
    }

    return columnSpliceMapping
  }

  /**
   * Parse a sidecar column cell in a TSV file.
   *
   * @param {string} columnName The name of the column/sidecar key.
   * @param {string} cellValue The value of the cell.
   * @param {number} tsvLine The index of this row in the TSV file.
   * @return {string|null} A HED substring, or null if none was found.
   * @private
   */
  _parseRowCell(columnName, cellValue, tsvLine) {
    if (!cellValue || cellValue === 'n/a') {
      return null
    }
    if (columnName === 'HED') {
      return cellValue
    }
    const sidecarHedData = this.tsvFile.mergedSidecar.hedData.get(columnName)
    if (!sidecarHedData) {
      return null
    }
    if (typeof sidecarHedData === 'string') {
      return sidecarHedData.replace('#', cellValue)
    } else {
      const sidecarHedString = sidecarHedData[cellValue]
      if (sidecarHedString !== undefined) {
        return sidecarHedString
      }
    }
    this.issues.push(
      BidsHedIssue.fromHedIssue(
        generateIssue('sidecarKeyMissing', {
          key: cellValue,
          column: columnName,
          file: this.tsvFile.file.relativePath,
        }),
        this.tsvFile.file,
        { tsvLine },
      ),
    )
    return null
  }
}

export default BidsHedTsvValidator
