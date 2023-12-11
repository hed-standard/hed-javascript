import { BidsHedSidecarValidator } from './bidsHedSidecarValidator'
import { BidsHedIssue } from '../types/issues'
import { BidsEventFile } from '../types/tsv'
import { parseHedString } from '../../parser/main'
import ColumnSplicer from '../../parser/columnSplicer'
import ParsedHedString from '../../parser/parsedHedString'
import { generateIssue } from '../../common/issues/issues'
import { validateHedDatasetWithContext } from '../../validator/dataset'

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
   * @type {BidsHedIssue[]}
   */
  issues

  /**
   * Constructor.
   *
   * @param {BidsTsvFile} tsvFile The BIDS TSV file being validated.
   * @param {Schemas} hedSchemas The HED schema collection being validated against.
   */
  constructor(tsvFile, hedSchemas) {
    this.tsvFile = tsvFile
    this.hedSchemas = hedSchemas
    this.issues = []
  }

  /**
   * Validate a BIDS TSV file. This method returns the complete issue list for convenience.
   *
   * @returns {BidsHedIssue[]} Any issues found during validation of this TSV file.
   */
  validate() {
    const parsingIssues = BidsHedIssue.fromHedIssues(
      this.tsvFile.mergedSidecar.parseHedStrings(this.hedSchemas),
      this.tsvFile.file,
    )
    const curlyBraceIssues = BidsHedSidecarValidator.validateSidecarCurlyBraces(this.tsvFile.mergedSidecar)
    const syntaxIssues = [...parsingIssues, ...curlyBraceIssues]
    this.issues.push(...syntaxIssues)
    if (syntaxIssues.length > 0) {
      return this.issues
    }

    const hedStrings = this.parseHed()
    if (hedStrings.length > 0) {
      this.validateCombinedDataset(hedStrings)
    }

    return this.issues
  }

  /**
   * Combine the BIDS sidecar HED data into a BIDS TSV file's HED data.
   *
   * @returns {ParsedHedString[]} The combined HED string collection for this BIDS TSV file.
   */
  parseHed() {
    const tsvHedRows = this._generateHedRows()
    if (tsvHedRows === null) {
      // There is no HED data.
      return []
    }

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
   * Generate a list of rows with column-to-value mappings.
   *
   * @returns {Map<string, string>[]} A list of single-row column-to-value mappings.
   * @private
   */
  _generateHedRows() {
    const tsvHedColumns = Array.from(this.tsvFile.parsedTsv.entries()).filter(
      ([header]) => this.tsvFile.sidecarHedData.has(header) || header === 'HED',
    )
    if (tsvHedColumns.length === 0) {
      return null
    }

    const tsvHedRows = []
    for (const [header, data] of tsvHedColumns) {
      data.forEach((value, index) => {
        if (tsvHedRows[index] === undefined) {
          tsvHedRows[index] = new Map()
        }
        tsvHedRows[index].set(header, value)
      })
    }
    return tsvHedRows
  }

  /**
   * Parse a row in a TSV file.
   *
   * @param {Map<string, string>} rowCells The column-to-value mapping for a single row.
   * @param {number} tsvLine The index of this row in the TSV file.
   * @return {ParsedHedString} A parsed HED string.
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

    const hedString = hedStringParts.join(',')

    return this._parseHedRowString(rowCells, tsvLine, hedString)
  }

  /**
   * Parse a row's generated HED string in a TSV file.
   *
   * @param {Map<string, string>} rowCells The column-to-value mapping for a single row.
   * @param {number} tsvLine The index of this row in the TSV file.
   * @param {string} hedString The unparsed HED string for this row.
   * @return {ParsedHedString} A parsed HED string.
   * @private
   */
  _parseHedRowString(rowCells, tsvLine, hedString) {
    const columnSpliceMapping = this._generateColumnSpliceMapping(rowCells)

    const [parsedString, parsingIssues] = parseHedString(hedString, this.hedSchemas)
    const flatParsingIssues = Object.values(parsingIssues).flat()
    if (flatParsingIssues.length > 0) {
      this.issues.push(...BidsHedIssue.fromHedIssues(...flatParsingIssues, this.tsvFile.file, { tsvLine }))
      return null
    }

    const columnSplicer = new ColumnSplicer(parsedString, columnSpliceMapping, rowCells, this.hedSchemas)
    const splicedParsedString = columnSplicer.splice()
    const splicingIssues = columnSplicer.issues
    if (splicingIssues.length > 0) {
      this.issues.push(...BidsHedIssue.fromHedIssues(splicingIssues, this.tsvFile.file))
      return null
    }
    splicedParsedString.context.set('tsvLine', tsvLine)

    return splicedParsedString
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

    for (const [columnName, columnValue] of rowCells.entries()) {
      if (columnValue === 'n/a') {
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
    const sidecarHedData = this.tsvFile.sidecarHedData.get(columnName)
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

  /**
   * Validate the HED data in a combined event TSV file/sidecar BIDS data collection.
   *
   * @param {ParsedHedString[]} hedStrings The HED strings in the data collection.
   */
  validateCombinedDataset(hedStrings) {
    const [, hedIssues] = validateHedDatasetWithContext(
      hedStrings,
      this.tsvFile.mergedSidecar.hedStrings,
      this.hedSchemas,
      {
        checkForWarnings: true,
        validateDatasetLevel: this.tsvFile instanceof BidsEventFile,
      },
    )
    this.issues.push(...BidsHedIssue.fromHedIssues(hedIssues, this.tsvFile.file))
  }
}
