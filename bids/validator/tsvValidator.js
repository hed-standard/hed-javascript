import { BidsHedIssue, BidsIssue } from '../types/issues'
import { BidsTsvElement, BidsTsvRow } from '../types/tsv'
import { BidsValidator } from './validator'
import { parseHedString } from '../../parser/parser'
import ParsedHedString from '../../parser/parsedHedString'
import { generateIssue } from '../../common/issues/issues'
import { ReservedChecker } from '../../parser/reservedChecker'
import { getTagListString } from '../../parser/parseUtils'
import { EventManager } from '../../parser/eventManager'

/**
 * Validator for HED data in BIDS TSV files.
 */
export class BidsHedTsvValidator extends BidsValidator {
  /**
   * The BIDS TSV file being validated.
   * @type {ReservedChecker}
   */
  special

  /**
   * Constructor.
   *
   * @param {BidsTsvFile} tsvFile - The BIDS TSV file being validated.
   * @param {Schemas} hedSchemas - The HED schemas used to validate the tsv file.
   */
  constructor(tsvFile, hedSchemas) {
    super(tsvFile, hedSchemas)
    this.special = ReservedChecker.getInstance()
  }

  /**
   * Validate a BIDS TSV file. This method returns the complete issue list for convenience.
   *
   * @returns {BidsIssue[]} - Any issues found during validation of this TSV file.
   */
  validate() {
    // Validate the BIDS bidsFile if it exists.
    if (this.bidsFile.mergedSidecar) {
      const sidecarIssues = this.bidsFile.mergedSidecar.validate(this.hedSchemas)
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
    const bidsHedTsvParser = new BidsHedTsvParser(this.bidsFile, this.hedSchemas)
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
   * @returns {BidsIssue[]} - Issues found in validating the HED column without sidecar information.
   * @private
   */
  _validateHedColumn() {
    if (this.bidsFile.hedColumnHedStrings.length === 0) {
      return []
    }
    return this.bidsFile.hedColumnHedStrings.flatMap((hedString, rowIndexMinusTwo) =>
      this._validateHedColumnString(hedString, rowIndexMinusTwo + 2),
    )
  }

  /**
   * Validate a string in this TSV file's HED column.
   *
   * @param {string} hedString - The string to be validated.
   * @param {number} rowIndex - The index of this row in the TSV file.
   * @returns {BidsIssue[]} - Specific issues found in validating the HED column
   * @private
   */
  _validateHedColumnString(hedString, rowIndex) {
    if (!hedString) {
      return []
    }

    // Find basic parsing issues and return if unable to parse the string. (Warnings are okay.)
    const issues = []
    const [parsedString, parsingIssues] = parseHedString(hedString, this.hedSchemas, false, false, false)
    issues.push(...BidsHedIssue.fromHedIssues(parsingIssues, this.bidsFile.file, { tsvLine: rowIndex }))
    if (parsedString === null) {
      return issues
    }

    // The HED column is not allowed to have column splices.
    if (parsedString.columnSplices.length > 0) {
      issues.push(
        BidsHedIssue.fromHedIssue(
          generateIssue('curlyBracesInHedColumn', {
            string: parsedString.hedString,
            tsvLine: rowIndex.toString(),
          }),
          this.bidsFile.file,
        ),
      )
      return issues
    }

    // Check whether definitions used exist and are used correctly.
    const defIssues = [
      ...this.bidsFile.mergedSidecar.definitions.validateDefs(parsedString, this.hedSchemas, false),
      ...this.bidsFile.mergedSidecar.definitions.validateDefExpands(parsedString, this.hedSchemas, false),
    ]
    const convertedIssues = BidsHedIssue.fromHedIssues(defIssues, this.bidsFile.file, { tsvLine: rowIndex })
    issues.push(...convertedIssues)
    return issues
  }

  /**
   * Validate the HED data in a combined event TSV file/bidsFile BIDS data collection.
   *
   * @param {BidsTsvElement[]} elements - The element objects, which include the strings and row information.
   * @returns {BidsHedIssue[]} - The errors resulting from final validation, including dataset-level checks.
   */
  validateDataset(elements) {
    // Final top-tag detection cannot be done until the strings are fully assembled and finalized.
    const issues = this._checkNoTopTags(elements)
    if (issues.length > 0) {
      return issues
    }
    // Temporal files have to check Onset, Inset, Offset consistency.
    if (this.bidsFile.isTimelineFile) {
      return this._validateTemporal(elements)
    }
    // Non-temporal files cannot have temporal tags.
    return this._checkNoTime(elements)
  }

  /**
   * Check the temporal relationships among events.
   *
   * @param {BidsTsvElement[]} elements - The elements representing the tsv file.
   * @returns {BidsHedIssue[]} - Errors in temporal relationships among events.
   * @private
   */
  _validateTemporal(elements) {
    // Check basic temporal conflicts such as Offset before Onset, or temporal tags with same def at same time.
    const eventManager = new EventManager()
    const [eventList, temporalIssues] = eventManager.parseEvents(elements)
    if (temporalIssues.length > 0) {
      return temporalIssues
    }
    // There still may be non-temporal duplicates when multiple rows with the same onset.
    const duplicateErrors = this._checkDuplicatesAcrossRows(elements)
    if (duplicateErrors.length > 0) {
      return duplicateErrors
    }
    return eventManager.validate(eventList)
  }

  /**
   * Check for duplicate tags when multiple rows with the same onset.
   *
   * @param {BidsTsvElement[]} elements - The elements representing the tsv file.
   * @returns {BidsHedIssue[]} - Errors in temporal relationships among events.
   * @private
   *
   * Note: duplicate onsets are relatively rare and duplicates for single rows are checked when a ParsedHedString is
   * constructed.
   */
  _checkDuplicatesAcrossRows(elements) {
    const duplicateMap = this._getOnsetMap(elements)
    const issues = []
    for (const elementList of duplicateMap.values()) {
      if (elementList.length === 1) {
        continue
      }
      // Assemble the HED strings associated with same onset into single string. Use the parse duplicate detection.
      const rowString = elementList.map((element) => element.hedString).join(',')
      const [parsedString, parsingIssues] = parseHedString(rowString, this.hedSchemas, true, false, false)
      if (parsingIssues.length > 0) {
        const tsvLines = BidsTsvElement.getTsvLines(elementList)
        issues.push(...BidsHedIssue.fromHedIssues(parsingIssues, this.bidsFile.file, { tsvLine: tsvLines }))
      }
    }
    return issues
  }

  /**
   * Get map of onsets to BidsTsvElements.
   *
   * @param {BidsTsvElement[]} elements - The elements representing the tsv file.
   * @returns {Map<Number, BidsTsvElement[]>} - Map of onset value to a list of elements with that onset.
   * @private
   */
  _getOnsetMap(elements) {
    const onsetMap = new Map()
    for (const element of elements) {
      if (!element.hedString) {
        continue
      }
      if (onsetMap.has(element.onset)) {
        onsetMap.get(element.onset).push(element)
      } else {
        onsetMap.set(element.onset, [element])
      }
    }
    return onsetMap
  }

  /**
   * Top group tag requirements may not be satisfied until all splices have been done.
   *
   * @param {BidsTsvElement[]} elements - The elements to be checked.
   * @returns {BidsHedIssue[]} - Issues from final check of top groups.
   * @private
   */
  _checkNoTopTags(elements) {
    const topGroupIssues = []
    for (const element of elements) {
      const topTags = element.parsedHedString ? element.parsedHedString.topLevelTags : []
      const badTags = topTags.filter((tag) => ReservedChecker.hasTopLevelTagGroupAttribute(tag))
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
   * @param {BidsTsvElement[]} elements - The elements representing a tsv file (with HED string parsed).
   * @returns {BidsHedIssue[]} - Issues from checking non-temporal files for temporal tags.
   */
  _checkNoTime(elements) {
    const timeIssues = []
    for (const element of elements) {
      if (element.parsedHedString.tags.some((tag) => this.special.temporalTags.has(tag.schemaTag.name))) {
        timeIssues.push(
          BidsHedIssue.fromHedIssue(
            generateIssue('temporalTagInNonTemporalContext', { string: element.hedString, tsvLine: element.tsvLine }),
            this.bidsFile.file,
          ),
        )
      }
    }
    return timeIssues
  }
}

/**
 * Class that performs basic parsing and splicing.
 */
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
   * Combine the BIDS bidsFile HED data into a BIDS TSV file's HED data.
   *
   * @returns {[BidsTsvElement[], BidsHedIssue[]]} The combined HED string collection for the BIDS TSV file.
   */
  parse() {
    const tsvHedRows = this._generateHedRows()
    const tsvElements = this._parseHedRows(tsvHedRows)
    const parsingIssues = this._parseElementStrings(tsvElements)
    return [tsvElements, parsingIssues]
  }

  /**
   * Parse element HED strings.
   *
   * @param { BidsTsvElement []} elements - The objects representing tsv rows with their parsed HEd strings.
   * @returns {BidsHedIssue[]} - The issues resulting in creating the parsed HED strings.
   */
  _parseElementStrings(elements) {
    if (elements.length === 0) {
      return []
    }

    // Add the parsed HED strings to the elements and quite if there are serious errors
    const cummulativeIssues = []
    for (const element of elements) {
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
   * @param {Map<string, string>} rowCells - The column-to-value mapping for a single row.
   * @returns {Map<string, string>} - A mapping of column names to their corresponding parsed bidsFile strings.
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

    // Check for the columns with HED data in the bidsFile
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
   *
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
