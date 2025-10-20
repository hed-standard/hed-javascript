/** This module holds the tsv validator class.
 * @module bids/validator/tsvValidator
 */
import { BidsHedIssue } from '../types/issues'
import { BidsTsvElement, BidsTsvRow } from '../types/tsv'
import { BidsValidator } from './validator'
import { parseHedString, parseStandaloneString } from '../../parser/parser'
import ParsedHedString from '../../parser/parsedHedString'
import { generateIssue } from '../../issues/issues'
import { ReservedChecker } from '../../parser/reservedChecker'
import { cleanupEmpties, getTagListString } from '../../parser/parseUtils'
import { EventManager } from '../../parser/eventManager'

/**
 * Validator for HED data in BIDS TSV files.
 */
export class BidsHedTsvValidator extends BidsValidator {
  /**
   * The BIDS TSV file being validated.
   * @type {BidsTsvFile}
   */
  tsvFile

  /**
   * The singleton instance of the checker for reserved requirements.
   * @type {ReservedChecker}
   */
  reserved

  /**
   * Constructor.
   *
   * @param {BidsTsvFile} tsvFile - The BIDS TSV file being validated.
   * @param {HedSchemas} hedSchemas - The HED schemas used to validate the tsv file.
   */
  constructor(tsvFile, hedSchemas) {
    super(hedSchemas)
    this.tsvFile = tsvFile
    this.reserved = ReservedChecker.getInstance()
  }

  /**
   * Validate a BIDS TSV file. This method returns the complete issue list for convenience.
   */
  validate() {
    // Validate the BIDS sidecar if it exists and return if there are errors
    if (this.tsvFile.mergedSidecar) {
      const issues = this.tsvFile.mergedSidecar.validate(this.hedSchemas)
      const splitErrors = BidsHedIssue.splitErrors(issues)
      this.errors.push(...(splitErrors.get('error') ?? []))
      this.warnings.push(...(splitErrors.get('warning') ?? []))
      if (this.errors.length > 0) {
        return
      }
    }

    // Valid the HED column by itself.
    this._validateHedColumn()
    if (this.errors.length > 0) {
      return
    }
    // Now assemble the events and do a full validation.
    const bidsHedTsvParser = new BidsHedTsvParser(this.tsvFile, this.hedSchemas)
    const [bidsEvents, errorIssues, warningIssues] = bidsHedTsvParser.parse()
    this.errors.push(...errorIssues)
    this.warnings.push(...warningIssues)
    if (this.errors.length > 0) {
      return
    }
    this.validateDataset(bidsEvents)
    if (this.errors.length === 0 && this.tsvFile.mergedSidecar?.hasHedData) {
      this._checkMissingHedWarning()
      this._checkMissingValueWarnings()
    }
  }

  /**
   * Check for a warning if the HED column is used as a splice but no HED column exists.
   * @private
   */
  _checkMissingHedWarning() {
    // Check for HED column used as splice but no HED column
    if (this.tsvFile.mergedSidecar.columnSpliceReferences.has('HED') && !this.tsvFile.parsedTsv.has('HED')) {
      this.warnings.push(BidsHedIssue.fromHedIssue(generateIssue('hedUsedAsSpliceButNoTsvHed', {}), this.tsvFile.file))
    }
  }

  /**
   * Check for categorical column value in tsv but not in sidecar.
   * @private
   */
  _checkMissingValueWarnings() {
    for (const columnName of this.tsvFile.parsedTsv.keys()) {
      const sidecarColumn = this.tsvFile.mergedSidecar?.sidecarKeys.get(columnName)
      if (!sidecarColumn || sidecarColumn.isValueKey) {
        continue
      }
      const toRemove = new Set(['', 'n/a', null, undefined])
      const tsvColumnValues = new Set(this.tsvFile.parsedTsv.get(columnName))
      const cleanedValues = new Set([...tsvColumnValues].filter((value) => !toRemove.has(value)))
      const missingValues = [...cleanedValues].filter((value) => !sidecarColumn.categoryMap.has(value))
      if (missingValues.length > 0) {
        const values = '[' + missingValues.join(', ') + ']'
        this.warnings.push(
          BidsHedIssue.fromHedIssue(
            generateIssue('sidecarKeyMissing', { sidecarKey: columnName, values: values }),
            this.tsvFile.file,
          ),
        )
      }
    }
  }

  /**
   * Validate this TSV file's HED column.
   *
   * @private
   */
  _validateHedColumn() {
    if (this.tsvFile.hedColumnHedStrings.length > 0) {
      this.tsvFile.hedColumnHedStrings.flatMap((hedString, rowIndexMinusTwo) =>
        this._validateHedColumnString(hedString, rowIndexMinusTwo + 2),
      )
    }
  }

  /**
   * Validate a string in this TSV file's HED column.
   *
   * @param {string} hedString - The string to be validated.
   * @param {number} rowIndex - The index of this row in the TSV file.
   * @private
   */
  _validateHedColumnString(hedString, rowIndex) {
    if (!hedString) {
      return
    }
    const [parsedString, errorIssues, warningIssues] = parseStandaloneString(
      hedString,
      this.hedSchemas,
      this.tsvFile.mergedSidecar.definitions,
    )

    this.errors.push(...BidsHedIssue.fromHedIssues(errorIssues, this.tsvFile.file, { tsvLine: rowIndex }))
    this.warnings.push(...BidsHedIssue.fromHedIssues(warningIssues, this.tsvFile.file, { tsvLine: rowIndex }))
  }

  /**
   * Validate the HED data in a combined event TSV file/sidecar BIDS data collection.
   */
  validateDataset(elements) {
    // Final top-tag detection cannot be done until the strings are fully assembled and finalized.
    this._checkNoTopTags(elements)
    if (this.errors.length > 0) {
      return
    }
    // Temporal files have to check Onset, Inset, Offset consistency.
    if (this.tsvFile.isTimelineFile) {
      this._validateTemporal(elements)
    } else {
      // Non-temporal files cannot have temporal tags.
      this._checkNoTime(elements)
    }
  }

  /**
   * Check the temporal relationships among events.
   *
   * @param {BidsTsvElement[]} elements - The elements representing the tsv file.
   * @private
   */
  _validateTemporal(elements) {
    // Check basic temporal conflicts such as Offset before Onset, or temporal tags with same def at same time.
    const eventManager = new EventManager()
    const [eventList, temporalIssues] = eventManager.parseEvents(elements)
    if (temporalIssues.length > 0) {
      this.errors.push(...temporalIssues)
      return
    }
    // There still may be non-temporal duplicates when multiple rows with the same onset.
    this._checkDuplicatesAcrossRows(elements)
    if (this.errors.length === 0) {
      this.errors.push(...eventManager.validate(eventList))
    }
  }

  /**
   * Check for duplicate tags when multiple rows with the same onset.
   *
   * ### Note:
   * Duplicate onsets are relatively rare and duplicates for single rows are checked when a ParsedHedString is
   * constructed.
   *
   * @param {BidsTsvElement[]} elements - The elements representing the tsv file.
   * @returns {BidsHedIssue[]} - Errors in temporal relationships among events.
   * @private
   */
  _checkDuplicatesAcrossRows(elements) {
    const duplicateMap = this._getOnsetMap(elements)
    for (const elementList of duplicateMap.values()) {
      if (elementList.length === 1) {
        continue
      }
      // Assemble the HED strings associated with same onset into single string. Use the parse duplicate detection.
      const rowString = elementList.map((element) => element.hedString).join(',')
      const [, errorIssues, warningIssues] = parseHedString(rowString, this.hedSchemas, false, false, true)
      const tsvLines = BidsTsvElement.getTsvLines(elementList)
      this.errors.push(...BidsHedIssue.fromHedIssues(errorIssues, this.tsvFile.file, { tsvLine: tsvLines }))
      this.warnings.push(...BidsHedIssue.fromHedIssues(warningIssues, this.tsvFile.file, { tsvLine: tsvLines }))
    }
  }

  /**
   * Get map of onsets to BidsTsvElements.
   *
   * @param {BidsTsvElement[]} elements - The elements representing the tsv file.
   * @returns {Map} - Map of onset value to a list of elements with that onset.
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
   * @private
   */
  _checkNoTopTags(elements) {
    for (const element of elements) {
      const topTags = element.parsedHedString ? element.parsedHedString.topLevelTags : []
      const badTags = topTags.filter((tag) => ReservedChecker.hasTopLevelTagGroupAttribute(tag))
      if (badTags.length > 0) {
        this.errors.push(
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidTopLevelTag', { tag: getTagListString(badTags), string: element.hedString }),
            element.file,
            { tsvLine: element.tsvLine },
          ),
        )
      }
    }
  }

  /**
   * Verify that this non-temporal file does not contain any temporal tags.
   *
   * @param {BidsTsvElement[]} elements - The elements representing a tsv file (with HED string parsed).
   */
  _checkNoTime(elements) {
    for (const element of elements) {
      if (element.parsedHedString.tags.some((tag) => this.reserved.timelineTags.has(tag.schemaTag.name))) {
        this.errors.push(
          BidsHedIssue.fromHedIssue(
            generateIssue('temporalTagInNonTemporalContext', { string: element.hedString, tsvLine: element.tsvLine }),
            this.tsvFile.file,
          ),
        )
      }
    }
  }
}

/**
 * Class that performs basic parsing and splicing.
 */
export class BidsHedTsvParser {
  static nullSet = new Set([null, undefined, '', 'n/a'])
  static braceRegEx = /\{([^{}]*?)\}/g

  /**
   * The BIDS TSV file being parsed.
   * @type {BidsTsvFile}
   */
  tsvFile

  /**
   * The HED schema collection being parsed against.
   * @type {HedSchemas}
   */
  hedSchemas

  /**
   * Constructor.
   *
   * @param {BidsTsvFile} tsvFile The BIDS TSV file being parsed.
   * @param {HedSchemas} hedSchemas The HED schema collection being parsed against.
   */
  constructor(tsvFile, hedSchemas) {
    this.tsvFile = tsvFile
    this.hedSchemas = hedSchemas
  }

  /**
   * Combine the BIDS sidecar HED data into a BIDS TSV file's HED data.
   *
   * @returns {Array} - Returns a two-element array [BidsTsvElement[], BidsHedIssue[], BidsHedIssue[]].
   */
  parse() {
    const tsvHedRows = this._generateHedRows()
    const tsvElements = this._parseHedRows(tsvHedRows)
    const [errors, warnings] = this._parseElementStrings(tsvElements)
    return [tsvElements, errors, warnings]
  }

  /**
   * Parse element HED strings.
   *
   * @param {BidsTsvElement[]} elements - The objects representing tsv rows with their parsed HEd strings.
   * @returns {Array} -  [BidsHedIssue[], BidsHedIssue[]] The errors and warnings resulting in creating the parsed HED strings.
   */
  _parseElementStrings(elements) {
    if (elements.length === 0) {
      return [[], []]
    }

    // Add the parsed HED strings to the elements and quite if there are serious errors
    const errors = []
    const warnings = []
    for (const element of elements) {
      const [parsedHedString, errorIssues, warningIssues] = parseHedString(
        element.hedString,
        this.hedSchemas,
        false,
        false,
        true,
      )
      element.parsedHedString = parsedHedString
      errors.push(...BidsHedIssue.fromHedIssues(errorIssues, this.tsvFile.file, { tsvLine: element.tsvLine }))
      warnings.push(...BidsHedIssue.fromHedIssues(warningIssues, this.tsvFile.file, { tsvLine: element.tsvLine }))
    }
    return [errors, warnings]
  }

  /**
   * Generate a list of rows with column-to-value mappings.
   *
   * @returns {Array} A list of single-row column-to-value mappings.
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
   * @param {Map[]} tsvHedRows - A list of single-row column-to-value mappings.
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
   * @param {Map} rowCells - The column-to-value mapping for a single row.
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
   * @param {Map} rowCells - The column-to-value mapping for a single row.
   * @returns {Map} - A mapping of column names to their corresponding parsed sidecar strings.
   * @private
   */
  _getColumnMapping(rowCells) {
    const columnMap = new Map()

    if (rowCells.has('HED')) {
      columnMap.set('HED', rowCells.get('HED'))
    }

    if (!this.tsvFile.mergedSidecar.hasHedData) {
      return columnMap
    }

    // Check for the columns with HED data in the sidecar
    for (const [columnName, columnValues] of this.tsvFile.mergedSidecar.parsedHedData.entries()) {
      if (!rowCells.has(columnName)) {
        columnMap.set(columnName, '')
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
        columnMap.set(columnName, columnValues.get(rowColumnValue)?.hedString)
      }
    }

    return columnMap
  }

  /**
   * Update the map to splice-in the values for columns that have splices.
   *
   * @param {Map} columnMap - Map of column name to HED string for a row.
   *
   * Note: Updates the map in place.
   */
  spliceValues(columnMap) {
    if (!(this.tsvFile.mergedSidecar?.columnSpliceMapping?.size > 0)) {
      return
    }
    // Only iterate over the column names that have splices
    for (const column of this.tsvFile.mergedSidecar.columnSpliceMapping.keys()) {
      // if (!columnMap.has(column)) {
      //   continue
      // }
      const unspliced = columnMap.get(column)

      const result = this._replaceSplices(unspliced, columnMap)
      //console.log(`Column ${column}: ${unspliced} => ${result}`)
      columnMap.set(column, result)
    }
  }

  /**
   * Replace a HED string containing slices with a resolved version for the column value in a row.
   *
   * @param {string} unspliced - A HED string possibly with unresolved splices.
   * @param {Map} columnMap - The map of column name to HED string for a row.
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
    return cleanupEmpties(result)
  }
}

export default BidsHedTsvValidator
