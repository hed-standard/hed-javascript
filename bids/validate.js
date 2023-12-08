import { validateHedDatasetWithContext } from '../validator/dataset'
import { validateHedString } from '../validator/event'
import { buildBidsSchemas } from './schema'
import { generateIssue, Issue, IssueError } from '../common/issues/issues'
import ParsedHedString from '../parser/parsedHedString'
import { parseHedString } from '../parser/main'
import { spliceColumns } from '../parser/columnSplicer'
import { BidsEventFile } from './types/tsv'
import { BidsDataset } from './types/dataset'
import { BidsHedIssue, BidsIssue } from './types/issues'

/**
 * Validate a BIDS dataset.
 *
 * @param {BidsDataset} dataset The BIDS dataset.
 * @param {object} schemaDefinition The version spec for the schema to be loaded.
 * @returns {Promise<BidsIssue[]>} Any issues found.
 */
export function validateBidsDataset(dataset, schemaDefinition) {
  return buildBidsSchemas(dataset, schemaDefinition).then(
    ([hedSchemas, schemaLoadIssues]) => {
      return (
        new BidsHedValidator(dataset, hedSchemas)
          .validateFullDataset()
          /*.catch(BidsIssue.generateInternalErrorPromise)*/
          .then((issues) =>
            issues.concat(BidsHedIssue.fromHedIssues(schemaLoadIssues, dataset.datasetDescription.file)),
          )
      )
    },
    (issues) => BidsHedIssue.fromHedIssues(issues, dataset.datasetDescription.file),
  )
}

/**
 * A validator for HED content in a BIDS dataset.
 */
class BidsHedValidator {
  /**
   * The BIDS dataset being validated.
   * @type {BidsDataset}
   */
  dataset
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
   * @param {BidsDataset} dataset The BIDS dataset being validated.
   * @param {Schemas} hedSchemas The HED schema collection being validated against.
   */
  constructor(dataset, hedSchemas) {
    this.dataset = dataset
    this.hedSchemas = hedSchemas
    this.issues = []
  }

  /**
   * Validate a full BIDS dataset using a HED schema collection.
   *
   * @returns {Promise<BidsIssue[]>|Promise<never>} Any issues found.
   */
  validateFullDataset() {
    try {
      const sidecarErrorsFound = this.validateSidecars()
      const hedColumnErrorsFound = this.validateHedColumn()
      if (sidecarErrorsFound || hedColumnErrorsFound) {
        return Promise.resolve(this.issues)
      }
      for (const eventFileData of this.dataset.eventData) {
        this.validateBidsTsvFile(eventFileData)
      }
      return Promise.resolve(this.issues)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  /**
   * Validate a collection of BIDS sidecars.
   *
   * @returns {boolean} Whether errors (as opposed to warnings) were founds.
   */
  validateSidecars() {
    const issues = []
    // validate the HED strings in the json sidecars
    for (const sidecar of this.dataset.sidecarData) {
      issues.push(...BidsHedIssue.fromHedIssues(sidecar.parseHedStrings(this.hedSchemas), sidecar.file))
      const sidecarIssues = this.validateSidecar(sidecar)
      issues.push(...sidecarIssues)
    }
    this.issues.push(...issues)
    return issues.some((issue) => issue.isError())
  }

  /**
   * Validate an individual BIDS sidecar.
   *
   * @param {BidsSidecar} sidecar A BIDS sidecar.
   * @returns {BidsHedIssue[]} All issues found.
   */
  validateSidecar(sidecar) {
    return [...this._validateSidecarStrings(sidecar), ...this._validateSidecarCurlyBraces(sidecar)]
  }

  /**
   * Validate an individual BIDS sidecar's HED strings.
   *
   * @param {BidsSidecar} sidecar A BIDS sidecar.
   * @returns {BidsHedIssue[]} All issues found.
   */
  _validateSidecarStrings(sidecar) {
    const issues = []

    const categoricalOptions = {
      checkForWarnings: true,
      expectValuePlaceholderString: false,
      definitionsAllowed: 'exclusive',
    }
    const valueOptions = {
      checkForWarnings: true,
      expectValuePlaceholderString: true,
      definitionsAllowed: 'no',
    }

    for (const [sidecarKey, hedData] of sidecar.parsedHedData) {
      if (hedData instanceof ParsedHedString) {
        issues.push(...this._validateSidecarString(sidecarKey, hedData, sidecar, valueOptions))
      } else if (hedData instanceof Map) {
        for (const valueString of hedData.values()) {
          issues.push(...this._validateSidecarString(sidecarKey, valueString, sidecar, categoricalOptions))
        }
      } else {
        throw new Error('Unexpected type found in sidecar parsedHedData map.')
      }
    }

    return issues
  }

  /**
   * Validate an individual BIDS sidecar string.
   *
   * @param {string} sidecarKey The sidecar key this string belongs to.
   * @param {ParsedHedString} sidecarString The parsed sidecar HED string.
   * @param {BidsSidecar} sidecar The BIDS sidecar.
   * @param {Object} options Options specific to this validation run to pass to {@link validateHedString}.
   * @returns {BidsHedIssue[]} All issues found.
   * @private
   */
  _validateSidecarString(sidecarKey, sidecarString, sidecar, options) {
    // Parsing issues already pushed in validateSidecars()
    if (sidecarString === null) {
      return []
    }

    const [, hedIssues] = validateHedString(sidecarString, this.hedSchemas, options)
    return BidsHedIssue.fromHedIssues(hedIssues, sidecar.file, { sidecarKey })
  }

  /**
   * Validate an individual BIDS sidecar's curly braces.
   *
   * @param {BidsSidecar} sidecar A BIDS sidecar.
   * @returns {BidsHedIssue[]} All issues found.
   * @private
   */
  _validateSidecarCurlyBraces(sidecar) {
    const issues = []
    const references = sidecar.columnSpliceMapping

    for (const [key, referredKeys] of references) {
      for (const referredKey of referredKeys) {
        if (references.has(referredKey)) {
          issues.push(
            BidsHedIssue.fromHedIssue(
              generateIssue('recursiveCurlyBracesWithKey', { column: referredKey, referrer: key }),
              sidecar.file,
            ),
          )
        }
      }
    }

    return issues
  }

  /**
   * Validate the HED columns of a collection of BIDS event TSV files.
   *
   * @returns {boolean} Whether errors (as opposed to warnings) were founds.
   */
  validateHedColumn() {
    const issues = this.dataset.eventData.flatMap((eventFileData) => this._validateFileHedColumn(eventFileData))
    this.issues.push(...issues)
    return issues.some((issue) => issue.isError())
  }

  /**
   * Validate an individual BIDS event file's HED column.
   *
   * @param {BidsEventFile} eventFileData The BIDS event file whose HED column is to be validated.
   * @returns {BidsHedIssue[]} All issues found.
   * @private
   */
  _validateFileHedColumn(eventFileData) {
    return eventFileData.hedColumnHedStrings.flatMap((hedString) =>
      this._validateFileHedColumnString(eventFileData, hedString),
    )
  }

  /**
   * Validate a string in an individual BIDS event file's HED column.
   *
   * @param {BidsEventFile} eventFileData The BIDS event file whose HED column is to be validated.
   * @param {string} hedString The string to be validated.
   * @returns {BidsHedIssue[]} All issues found.
   * @private
   */
  _validateFileHedColumnString(eventFileData, hedString) {
    if (!hedString) {
      return []
    }

    const issues = []
    const options = {
      checkForWarnings: true,
      expectValuePlaceholderString: false,
      definitionsAllowed: 'no',
    }

    const [parsedString, parsingIssues] = parseHedString(hedString, this.hedSchemas)
    issues.push(...BidsHedIssue.fromHedIssues(Object.values(parsingIssues).flat(), eventFileData.file))

    if (parsedString === null) {
      return issues
    }

    if (parsedString.columnSplices.length > 0) {
      issues.push(
        BidsHedIssue.fromHedIssue(
          generateIssue('curlyBracesInHedColumn', { column: parsedString.columnSplices[0].format() }),
          eventFileData.file,
        ),
      )
      return issues
    }

    const [, hedIssues] = validateHedString(parsedString, this.hedSchemas, options)
    const convertedIssues = BidsHedIssue.fromHedIssues(hedIssues, eventFileData.file)
    issues.push(...convertedIssues)

    return issues
  }

  /**
   * Validate a BIDS TSV file.
   *
   * @param {BidsTsvFile} tsvFileData A BIDS TSV file.
   */
  validateBidsTsvFile(tsvFileData) {
    const parsingIssues = BidsHedIssue.fromHedIssues(
      tsvFileData.mergedSidecar.parseHedStrings(this.hedSchemas),
      tsvFileData.file,
    )
    const curlyBraceIssues = this._validateSidecarCurlyBraces(tsvFileData.mergedSidecar)
    const syntaxIssues = [...parsingIssues, ...curlyBraceIssues]
    this.issues.push(...syntaxIssues)
    if (syntaxIssues.length > 0) {
      return
    }

    const hedStrings = this.parseTsvHed(tsvFileData)
    if (hedStrings.length > 0) {
      this.validateCombinedDataset(hedStrings, tsvFileData)
    }
  }

  /**
   * Combine the BIDS sidecar HED data into a BIDS TSV file's HED data.
   *
   * @param {BidsTsvFile} tsvFileData A BIDS TSV file.
   * @returns {ParsedHedString[]} The combined HED string collection for this BIDS TSV file.
   */
  parseTsvHed(tsvFileData) {
    const tsvHedColumns = this._generateTsvHedColumns(tsvFileData)
    if (tsvHedColumns.size === 0) {
      // There is no HED data.
      return []
    }
    const tsvHedRows = this._generateTsvHedRows(tsvHedColumns)

    const hedStrings = []

    tsvHedRows.forEach((row, index) => {
      const hedString = this._parseTsvHedRow(tsvFileData, row, index + 2)
      if (hedString !== null) {
        hedStrings.push(hedString)
      }
    })

    return hedStrings
  }

  /**
   * Generate a map with the subset of TSV columns actually containing HED data.
   *
   * @param {BidsTsvFile} tsvFileData A BIDS TSV file.
   * @returns {Map<string, string[]>} The subset of TSV columns containing HED data.
   * @private
   */
  _generateTsvHedColumns(tsvFileData) {
    const tsvHedColumns = new Map()
    for (const [header, data] of tsvFileData.parsedTsv.entries()) {
      if (tsvFileData.sidecarHedData.has(header) || header === 'HED') {
        tsvHedColumns.set(header, data)
      }
    }
    return tsvHedColumns
  }

  /**
   * Generate a list of rows with column-to-value mappings.
   *
   * @param {Map<string, string[]>} tsvHedColumns The subset of TSV columns containing HED data.
   * @returns {Map<string, string>[]} A list of single-row column-to-value mappings.
   * @private
   */
  _generateTsvHedRows(tsvHedColumns) {
    const tsvHedRows = []
    for (const [header, data] of tsvHedColumns.entries()) {
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
   * @param {BidsTsvFile} tsvFileData A BIDS TSV file.
   * @param {Map<string, string>} rowCells The column-to-value mapping for a single row.
   * @param {number} tsvLine The index of this row in the TSV file.
   * @return {ParsedHedString} A parsed HED string.
   * @private
   */
  _parseTsvHedRow(tsvFileData, rowCells, tsvLine) {
    const hedStringParts = []
    for (const [columnName, columnValue] of rowCells.entries()) {
      const hedStringPart = this._parseTsvRowCell(tsvFileData, columnName, columnValue, tsvLine)
      if (hedStringPart !== null && !tsvFileData.mergedSidecar.columnSpliceReferences.has(columnName)) {
        hedStringParts.push(hedStringPart)
      }
    }

    const hedString = hedStringParts.join(',')

    return this._parseTsvHedRowString(tsvFileData, rowCells, tsvLine, hedString)
  }

  /**
   * Parse a row's generated HED string in a TSV file.
   *
   * @param {BidsTsvFile} tsvFileData A BIDS TSV file.
   * @param {Map<string, string>} rowCells The column-to-value mapping for a single row.
   * @param {number} tsvLine The index of this row in the TSV file.
   * @param {string} hedString The unparsed HED string for this row.
   * @return {ParsedHedString} A parsed HED string.
   * @private
   */
  _parseTsvHedRowString(tsvFileData, rowCells, tsvLine, hedString) {
    const columnSpliceMapping = this._generateColumnSpliceMapping(tsvFileData, rowCells)

    const [parsedString, parsingIssues] = parseHedString(hedString, this.hedSchemas)
    const flatParsingIssues = Object.values(parsingIssues).flat()
    if (flatParsingIssues.length > 0) {
      this.issues.push(...BidsHedIssue.fromHedIssues(...flatParsingIssues, tsvFileData.file, { tsvLine }))
      return null
    }

    const [splicedParsedString, splicingIssues] = spliceColumns(parsedString, columnSpliceMapping, this.hedSchemas)
    if (splicingIssues.length > 0) {
      this.issues.push(...BidsHedIssue.fromHedIssues(splicingIssues, tsvFileData.file, { tsvLine }))
      return null
    }
    splicedParsedString.context.set('tsvLine', tsvLine)

    return splicedParsedString
  }

  /**
   * Generate the column splice mapping for a BIDS TSV file row.
   *
   * @param {BidsTsvFile} tsvFileData A BIDS TSV file.
   * @param {Map<string, string>} rowCells The column-to-value mapping for a single row.
   * @return {Map<string, ParsedHedString>} A mapping of column names to their corresponding parsed sidecar strings.
   * @private
   */
  _generateColumnSpliceMapping(tsvFileData, rowCells) {
    const columnSpliceMapping = new Map()

    for (const [columnName, columnValue] of rowCells.entries()) {
      if (columnValue === 'n/a') {
        columnSpliceMapping.set(columnName, null)
        continue
      }

      const sidecarEntry = tsvFileData.mergedSidecar.parsedHedData.get(columnName)

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
   * @param {BidsTsvFile} tsvFileData A BIDS TSV file.
   * @param {string} columnName The name of the column/sidecar key.
   * @param {string} cellValue The value of the cell.
   * @param {number} tsvLine The index of this row in the TSV file.
   * @return {string|null} A HED substring, or null if none was found.
   * @private
   */
  _parseTsvRowCell(tsvFileData, columnName, cellValue, tsvLine) {
    if (!cellValue || cellValue === 'n/a') {
      return null
    }
    if (columnName === 'HED') {
      return cellValue
    }
    const sidecarHedData = tsvFileData.sidecarHedData.get(columnName)
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
          file: tsvFileData.file.relativePath,
        }),
        tsvFileData.file,
        { tsvLine },
      ),
    )
    return null
  }

  /**
   * Validate the HED data in a combined event TSV file/sidecar BIDS data collection.
   *
   * @param {ParsedHedString[]} hedStrings The HED strings in the data collection.
   * @param {BidsTsvFile} tsvFileData The BIDS event TSV file being validated.
   */
  validateCombinedDataset(hedStrings, tsvFileData) {
    const [, hedIssues] = validateHedDatasetWithContext(
      hedStrings,
      tsvFileData.mergedSidecar.hedStrings,
      this.hedSchemas,
      {
        checkForWarnings: true,
        validateDatasetLevel: tsvFileData instanceof BidsEventFile,
      },
    )
    this.issues.push(...BidsHedIssue.fromHedIssues(hedIssues, tsvFileData.file))
  }
}
