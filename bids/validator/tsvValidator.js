import { BidsHedIssue, BidsIssue } from '../types/issues'
import { BidsTsvRow } from '../types/tsv'
import { parseHedString } from '../../parser/parser'
import ParsedHedString from '../../parser/parsedHedString'
import { generateIssue } from '../../common/issues/issues'
import { SpecialChecker } from '../../parser/special'
import { getTagListString } from '../../parser/parseUtils'
import { EventManager } from '../../parser/eventManager'

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
    this.special = SpecialChecker.getInstance()
    this.issues = []
  }

  /**
   * Validate a BIDS TSV file. This method returns the complete issue list for convenience.
   *
   * @returns {BidsIssue[]} Any issues found during validation of this TSV file.
   */
  validate() {
    // Validate the BIDS sidecar if it exists.
    if (this.tsvFile.mergedSidecar) {
      const sidecarIssues = this.tsvFile.mergedSidecar.validate(this.hedSchemas)
      this.issues.push(...sidecarIssues)
      if (BidsIssue.anyAreErrors(sidecarIssues)) {
        return this.issues
      }
    }

    // Valid the HED column by itself.
    const hedColumnIssues = this._validateHedColumn()
    this.issues.push(...hedColumnIssues)
    if (BidsIssue.anyAreErrors(this.issues)) {
      return this.issues
    }
    // Now do a full validation
    const bidsHedTsvParser = new BidsHedTsvParser(this.tsvFile, this.hedSchemas)
    const [bidsEvents, parsingIssues] = bidsHedTsvParser.parse()
    this.issues.push(...parsingIssues)
    if (!BidsIssue.anyAreErrors(this.issues)) {
      this.issues.push(...this.validateDataset(bidsEvents))
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
   * @param {BidsTsvElement[]} elements - The HED strings in the data collection.
   * @returns {BidsHedIssue[]} - errors for dataset
   */
  validateDataset(elements) {
    const issues = this._checkNoTopTags(elements)
    if (issues.length > 0) {
      return issues
    }
    if (this.tsvFile.isTimelineFile) {
      return this._validateTemporal(elements)
    }
    return this._checkNoTime(elements)
  }

  /**
   * Check the temporal relationships among events.
   * @param {BidsTsvElement[]} elements - The elements representing the tsv file.
   * @returns {BidsHedIssue[]} - Errors in temporal relationships among events
   * @private
   */
  _validateTemporal(elements) {
    const eventManager = new EventManager()
    const [eventList, temporalIssues] = eventManager.parseEvents(elements)
    if (temporalIssues.length > 0) {
      return temporalIssues
    }
    return eventManager.validate(eventList)
  }

  /**
   * Top group tag requirements may not be satisfied until all splices have been done.
   * @param {BidsTsvElement[]} elements - The elements to be checked
   * @returns {BidsHedIssue[]} - Issues from final check of top groups
   * @private
   */
  _checkNoTopTags(elements) {
    const topGroupIssues = []
    for (const element of elements) {
      const topTags = element.parsedHedString ? element.parsedHedString.topLevelTags : []
      const badTags = topTags.filter((tag) => SpecialChecker.hasTopLevelTagGroupAttribute(tag))
      if (badTags.length > 0) {
        topGroupIssues.push(
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidTopLevelTag', { tag: getTagListString(badTags), string: element.hedString }),
            element.file,
            { tsvLine: element.tsvLine },
          ),
        )
      }
    }
    return topGroupIssues
  }

  /**
   * Verify that this non-temporal file does not contain any temporal tags.
   *
   * @param {BidsTsvElement[]} elements
   */
  _checkNoTime(elements) {
    const timeIssues = []
    for (const element of elements) {
      if (element.parsedHedString.tags.some((tag) => this.special.temporalTags.has(tag.schemaTag.name))) {
        timeIssues.push(
          BidsHedIssue.fromHedIssue(
            generateIssue('temporalTagInNonTemporalContext', { string: element.hedString, tsvLine: element.tsvLine }),
            this.tsvFile.file,
          ),
        )
      }
    }
    return timeIssues
  }
}

export class BidsHedTsvParser {
  static nullSet = new Set([null, undefined, '', 'n/a'])
  static braceRegEx = /\{([^{}]*?)\}/g
  static parenthesesRegEx = /\(\s*[,\s]*(\(\s*[,\s]*\))*[,\s]*\)/g
  static internalCommaRegEx = /,\s*,/g
  static leadingCommaRegEx = /^\s*,+\s*/
  static trailingCommaRegEx = /\s*,+\s*$/
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
   * Constructor.
   *
   * @param {BidsTsvFile} tsvFile The BIDS TSV file being parsed.
   * @param {Schemas} hedSchemas The HED schema collection being parsed against.
   */
  constructor(tsvFile, hedSchemas) {
    this.tsvFile = tsvFile
    this.hedSchemas = hedSchemas
  }

  /**
   * Combine the BIDS sidecar HED data into a BIDS TSV file's HED data.
   *
   * @returns {[BidsTsvElement[], BidsHedIssue[]]} The combined HED string collection for this BIDS TSV file.
   */
  parse() {
    const tsvHedRows = this._generateHedRows()
    const tsvElements = this._parseHedRows(tsvHedRows)
    const parsingIssues = this._parseElementStrings(tsvElements)
    return [tsvElements, parsingIssues]
  }

  /**
   * Parse element HED strings
   * @param { BidsTsvElement []}  tsvElements -
   * @returns {BidsHedIssue[]}
   */
  _parseElementStrings(tsvElements) {
    if (tsvElements.length === 0) {
      return []
    }

    // Add the parsed HED strings to the elements and quite if there are serious errors
    const cummulativeIssues = []
    for (const element of tsvElements) {
      const [parsedHedString, parsingIssues] = parseHedString(element.hedString, this.hedSchemas, true, false, false)
      element.parsedHedString = parsedHedString
      if (parsingIssues.length > 0) {
        cummulativeIssues.push(
          ...BidsHedIssue.fromHedIssues(parsingIssues, this.tsvFile.file, { tsvLine: element.tsvLine }),
        )
      }
    }
    return cummulativeIssues
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
   * Parse the rows in the TSV file into HED strings.
   *
   * @param {Map<string, string>[]} tsvHedRows - A list of single-row column-to-value mappings.
   * @returns {BidsTsvRow[]} - A list of row-based parsed HED strings.
   * @private
   */
  _parseHedRows(tsvHedRows) {
    const hedRows = []
    tsvHedRows.forEach((row, index) => {
      const hedRow = this._parseHedRow(row, index + 2)
      if (hedRow !== null) {
        hedRows.push(hedRow)
      }
    })
    return hedRows
  }

  /**
   * Parse a row in a TSV file into a BIDS row.
   *
   * @param {Map<string, string>} rowCells - The column-to-value mapping for a single row.
   * @param {number} tsvLine - The index of this row in the TSV file.
   * @returns {BidsTsvRow} - A parsed HED string.
   * @private
   */
  _parseHedRow(rowCells, tsvLine) {
    const hedStringParts = []
    const columnMap = this._getColumnMapping(rowCells)
    this.spliceValues(columnMap)

    for (const [columnName, columnValue] of rowCells.entries()) {
      // If a splice, it can't be used in an assembled HED string.
      if (
        this.tsvFile.mergedSidecar.columnSpliceReferences.has(columnName) ||
        BidsHedTsvParser.nullSet.has(columnValue)
      ) {
        continue
      }
      if (columnMap.has(columnName) && !BidsHedTsvParser.nullSet.has(columnMap.get(columnName))) {
        hedStringParts.push(columnMap.get(columnName))
      }
    }
    const hedString = hedStringParts.join(',')
    if (hedString === '' || hedString === 'n/a') {
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

    if (rowCells.has('HED')) {
      columnMap.set('HED', rowCells.get('HED'))
    }

    if (!this.tsvFile.mergedSidecar.hasHedData()) {
      return columnMap
    }

    // Check for the columns with HED data in the sidecar
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

    return columnMap
  }

  /**
   * Update the map to splice-in the values for columns that have splices.
   * @param { Map <string, string>} columnMap - Map of column name to HED string for a row.
   *
   * Note: Updates the map in place.
   */
  spliceValues(columnMap) {
    // Only iterate over the column names that have splices
    for (const column of this.tsvFile.mergedSidecar.columnSpliceMapping.keys()) {
      if (!columnMap.has(column)) {
        continue
      }
      const unspliced = columnMap.get(column)
      const result = this._replaceSplices(unspliced, columnMap)
      columnMap.set(column, result)
    }
  }

  /**
   * Replace a HED string containing slices with a resolved version for the column value in a row.
   *
   * @param {string} unspliced - A HED string possibly with unresolved splices.
   * @param {Map<string, string>} columnMap - The map of column name to HED string for a row.
   * @returns {string} - The fully resolved HED string with no splices.
   * @private
   */
  _replaceSplices(unspliced, columnMap) {
    const result = unspliced.replace(BidsHedTsvParser.braceRegEx, (match, content) => {
      // Resolve the replacement value
      const resolved = columnMap.has(content) ? columnMap.get(content) : ''
      // Replace with resolved value or empty string if in nullSet
      return BidsHedTsvParser.nullSet.has(resolved) ? '' : resolved
    })
    return this._spliceCleanup(result)
  }

  /**
   * Remove empty tags or groups which occur because of an empty splice.
   * @param {string} spliced - The result of splice removal -- which could have empty tags or groups.
   * @returns {string} - The string with empty tags or groups removed.
   * @private
   */
  _spliceCleanup(spliced) {
    let result = spliced

    // Remove extra internal empty parentheses due to empty splices
    while (BidsHedTsvParser.parenthesesRegEx.test(result)) {
      result = result.replace(BidsHedTsvParser.parenthesesRegEx, '')
    }
    // Remove leading commas
    result = result.replace(BidsHedTsvParser.leadingCommaRegEx, '')

    // Remove trailing commas
    result = result.replace(BidsHedTsvParser.trailingCommaRegEx, '')

    // Remove extra empty commas due to empty splices
    return result.replace(BidsHedTsvParser.internalCommaRegEx, ',')
  }
}

export default BidsHedTsvValidator
