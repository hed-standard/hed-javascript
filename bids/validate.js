import { validateHedDatasetWithContext } from '../validator/dataset'
import { validateHedString } from '../validator/event'
import { BidsDataset, BidsEventFile, BidsHedIssue, BidsIssue } from './types'
import { buildBidsSchemas } from './schema'
import { generateIssue, Issue, IssueError } from '../common/issues/issues'
import ParsedHedString from '../parser/parsedHedString'
import { parseHedString } from '../parser/main'

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
      return new BidsHedValidator(dataset, hedSchemas)
        .validateFullDataset()
        .catch(BidsIssue.generateInternalErrorPromise)
        .then((issues) =>
          issues.concat(convertHedIssuesToBidsIssues(schemaLoadIssues, dataset.datasetDescription.file)),
        )
    },
    (issues) => convertHedIssuesToBidsIssues(issues, dataset.datasetDescription.file),
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
      issues.push(...convertHedIssuesToBidsIssues(sidecar.parseHedStrings(this.hedSchemas), sidecar.file))
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
    for (const [sidecarKey, hedData] of sidecar.parsedHedData) {
      if (hedData instanceof ParsedHedString) {
        const options = {
          checkForWarnings: true,
          expectValuePlaceholderString: true,
          definitionsAllowed: 'no',
        }
        issues.push(...this._validateSidecarString(sidecarKey, hedData, sidecar, options))
      } else if (hedData instanceof Map) {
        for (const valueString of hedData.values()) {
          const options = {
            checkForWarnings: true,
            expectValuePlaceholderString: false,
            definitionsAllowed: 'exclusive',
          }
          issues.push(...this._validateSidecarString(sidecarKey, valueString, sidecar, options))
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
    return convertHedIssuesToBidsIssues(hedIssues, sidecar.file, { sidecarKey })
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
    const references = this._generateSidecarCurlyBraceMap(sidecar)

    for (const [key, referredKeys] of references) {
      for (const referredKey of referredKeys) {
        if (references.has(referredKey)) {
          issues.push(
            convertHedIssueToBidsIssue(
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
   * Generate a mapping of an individual BIDS sidecar's curly brace references.
   *
   * @param {BidsSidecar} sidecar A BIDS sidecar.
   * @returns {Map<string, Set<string>>} The mapping of curly brace references in the sidecar.
   * @private
   */
  _generateSidecarCurlyBraceMap(sidecar) {
    const references = new Map()

    for (const [sidecarKey, hedData] of sidecar.parsedHedData) {
      if (hedData === null) {
        // Skipped
      } else if (hedData instanceof ParsedHedString) {
        if (hedData.columnSplices.length === 0) {
          continue
        }

        const keyReferences = new Set()

        for (const columnSplice of hedData.columnSplices) {
          keyReferences.add(columnSplice.originalTag)
        }

        references.set(sidecarKey, keyReferences)
      } else if (hedData instanceof Map) {
        let keyReferences = null

        for (const valueString of hedData.values()) {
          if (valueString === null || valueString.columnSplices.length === 0) {
            continue
          }

          keyReferences ??= new Set()

          for (const columnSplice of valueString.columnSplices) {
            keyReferences.add(columnSplice.originalTag)
          }
        }

        if (keyReferences instanceof Set) {
          references.set(sidecarKey, keyReferences)
        }
      } else {
        throw new Error('Unexpected type found in sidecar parsedHedData map.')
      }
    }

    return references
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
    const issues = []
    for (const hedString of eventFileData.hedColumnHedStrings) {
      if (!hedString) {
        continue
      }
      const options = {
        checkForWarnings: true,
        expectValuePlaceholderString: false,
        definitionsAllowed: 'no',
      }
      const [parsedString, parsingIssues] = parseHedString(hedString, this.hedSchemas)
      issues.push(...convertHedIssuesToBidsIssues(Object.values(parsingIssues).flat(), eventFileData.file))
      if (parsedString === null) {
        continue
      }
      if (parsedString.columnSplices.length > 0) {
        issues.push(
          convertHedIssueToBidsIssue(
            generateIssue('curlyBracesInHedColumn', { column: parsedString.columnSplices[0].format() }),
            eventFileData.file,
          ),
        )
        continue
      }
      const [, hedIssues] = validateHedString(parsedString, this.hedSchemas, options)
      const convertedIssues = convertHedIssuesToBidsIssues(hedIssues, eventFileData.file)
      issues.push(...convertedIssues)
    }
    return issues
  }

  /**
   * Validate a BIDS TSV file.
   *
   * @param {BidsTsvFile} tsvFileData A BIDS TSV file.
   */
  validateBidsTsvFile(tsvFileData) {
    const hedStrings = this.parseTsvHed(tsvFileData)
    if (hedStrings.length > 0) {
      this.validateCombinedDataset(hedStrings, tsvFileData)
    }
  }

  /**
   * Combine the BIDS sidecar HED data into a BIDS TSV file's HED data.
   *
   * @param {BidsTsvFile} tsvFileData A BIDS TSV file.
   * @returns {string[]} The combined HED string collection for this BIDS TSV file.
   */
  parseTsvHed(tsvFileData) {
    const sidecarHedColumns = this._generateTsvSidecarColumns(tsvFileData)
    if (tsvFileData.hedColumnHedStrings.length + sidecarHedColumns.size === 0) {
      // There is no HED data.
      return []
    }
    const sidecarHedRows = this._generateTsvSidecarRows(sidecarHedColumns)

    const hedStrings = []

    sidecarHedRows.forEach((rowCells, rowIndex) => {
      const hedStringParts = []
      // get the 'HED' field
      if (tsvFileData.hedColumnHedStrings[rowIndex]) {
        hedStringParts.push(tsvFileData.hedColumnHedStrings[rowIndex])
      }
      for (const [columnName, columnValue] of rowCells.entries()) {
        const hedStringPart = this._parseTsvSidecarColumnValue(tsvFileData, columnName, columnValue)
        if (hedStringPart !== null) {
          hedStringParts.push(hedStringPart)
        }
      }

      if (hedStringParts.length > 0) {
        hedStrings.push(hedStringParts.join(','))
      }
    })

    return hedStrings
  }

  /**
   * Generate a map with the subset of TSV columns actually in the TSV file's merged sidecar.
   *
   * @param {BidsTsvFile} tsvFileData A BIDS TSV file.
   * @returns {Map<string, string[]>} The subset of TSV columns in the merged sidecar.
   * @private
   */
  _generateTsvSidecarColumns(tsvFileData) {
    const sidecarHedColumns = new Map()
    for (const [header, data] of tsvFileData.parsedTsv.entries()) {
      if (tsvFileData.sidecarHedData.has(header)) {
        sidecarHedColumns.set(header, data)
      }
    }
    return sidecarHedColumns
  }

  /**
   * Generate a map with the subset of TSV columns actually in the TSV file's merged sidecar.
   *
   * @param {Map<string, string[]>} sidecarHedColumns The subset of TSV columns in the merged sidecar.
   * @returns {Map<string, string>[]} A list of single-row column-to-value mappings.
   * @private
   */
  _generateTsvSidecarRows(sidecarHedColumns) {
    const sidecarHedRows = []
    for (const [header, data] of sidecarHedColumns.parsedTsv.entries()) {
      data.forEach((value, index) => {
        if (sidecarHedRows[index] === undefined) {
          sidecarHedRows[index] = new Map()
        }
        sidecarHedRows[index].set(header, value)
      })
    }
    return sidecarHedRows
  }

  /**
   * Parse a sidecar column cell in a TSV file.
   *
   * @param {BidsTsvFile} tsvFileData A BIDS TSV file.
   * @param {string} columnName The name of the column/sidecar key.
   * @param {string} columnValue The value of the column.
   * @return {string|null} A HED substring, or null if none was found.
   * @private
   */
  _parseTsvSidecarColumnValue(tsvFileData, columnName, columnValue) {
    const sidecarHedData = tsvFileData.sidecarHedData.get(columnName)
    if (!sidecarHedData || !columnValue || columnValue === 'n/a') {
      return null
    }
    if (typeof sidecarHedData === 'string') {
      return sidecarHedData.replace('#', columnValue)
    } else {
      const sidecarHedString = sidecarHedData[columnValue]
      if (sidecarHedString !== undefined) {
        return sidecarHedString
      }
    }
    this.issues.push(
      new BidsHedIssue(
        generateIssue('sidecarKeyMissing', {
          key: columnValue,
          column: columnName,
          file: tsvFileData.file.relativePath,
        }),
        tsvFileData.file,
      ),
    )
    return null
  }

  /**
   * Validate the HED data in a combined event TSV file/sidecar BIDS data collection.
   *
   * @param {string[]} hedStrings The HED strings in the data collection.
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
    this.issues.push(...convertHedIssuesToBidsIssues(hedIssues, tsvFileData.file))
  }
}

/**
 * Convert one or more HED issues into BIDS-compatible issues.
 *
 * @param {IssueError|Issue[]} hedIssues One or more HED-format issues.
 * @param {Object} file A BIDS-format file object used to generate {@link BidsHedIssue} objects.
 * @param {Object?} extraParameters Any extra parameters to inject into the {@link Issue} objects.
 * @returns {BidsHedIssue[]} The passed issue(s) in BIDS-compatible format.
 */
function convertHedIssuesToBidsIssues(hedIssues, file, extraParameters) {
  if (hedIssues instanceof IssueError) {
    return [convertHedIssueToBidsIssue(hedIssues.issue, file, extraParameters)]
  } else {
    return hedIssues.map((hedIssue) => convertHedIssueToBidsIssue(hedIssue, file, extraParameters))
  }
}

/**
 * Convert a single HED issue into a BIDS-compatible issue.
 *
 * @param {Issue} hedIssue One HED-format issue.
 * @param {Object} file A BIDS-format file object used to generate a {@link BidsHedIssue} object.
 * @param {Object?} extraParameters Any extra parameters to inject into the {@link Issue} object.
 * @returns {BidsHedIssue} The passed issue in BIDS-compatible format.
 */
function convertHedIssueToBidsIssue(hedIssue, file, extraParameters) {
  if (extraParameters) {
    Object.assign(hedIssue.parameters, extraParameters)
    hedIssue.generateMessage()
  }
  return new BidsHedIssue(hedIssue, file)
}
