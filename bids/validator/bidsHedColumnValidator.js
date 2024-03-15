import { parseHedString } from '../../parser/main'
import { BidsHedIssue } from '../types/issues'
import { generateIssue } from '../../common/issues/issues'
// IMPORTANT: This import cannot be shortened to '../../validator', as this creates a circular dependency until v4.0.0.
import { validateHedString } from '../../validator/event/init'

/**
 * Validator for HED data in BIDS TSV file "HED" columns.
 */
export class BidsHedColumnValidator {
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
   * Validate the "HED" columns in this dataset. This method returns the complete issue list for convenience.
   *
   * @returns {BidsHedIssue[]} Any issues found during validation of the "HED" columns in this dataset.
   */
  validate() {
    const issues = this.dataset.eventData.flatMap((eventFileData) => this._validateFileHedColumn(eventFileData))
    this.issues.push(...issues)
    return this.issues
  }

  /**
   * Validate an individual BIDS event file's HED column.
   *
   * @param {BidsEventFile} eventFileData The BIDS event file whose HED column is to be validated.
   * @returns {BidsHedIssue[]} All issues found.
   * @private
   */
  _validateFileHedColumn(eventFileData) {
    return eventFileData.hedColumnHedStrings.flatMap((hedString, rowIndexMinusTwo) =>
      this._validateFileHedColumnString(eventFileData, hedString, rowIndexMinusTwo + 2),
    )
  }

  /**
   * Validate a string in an individual BIDS event file's HED column.
   *
   * @param {BidsEventFile} eventFileData The BIDS event file whose HED column is to be validated.
   * @param {string} hedString The string to be validated.
   * @param {number} rowIndex The index of this row in the TSV file.
   * @returns {BidsHedIssue[]} All issues found.
   * @private
   */
  _validateFileHedColumnString(eventFileData, hedString, rowIndex) {
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
    issues.push(
      ...BidsHedIssue.fromHedIssues(Object.values(parsingIssues).flat(), eventFileData.file, { tsvLine: rowIndex }),
    )

    if (parsedString === null) {
      return issues
    }

    if (parsedString.columnSplices.length > 0) {
      issues.push(
        BidsHedIssue.fromHedIssue(
          generateIssue('curlyBracesInHedColumn', {
            column: parsedString.columnSplices[0].format(),
            tsvLine: rowIndex,
          }),
          eventFileData.file,
        ),
      )
      return issues
    }

    const [, hedIssues] = validateHedString(parsedString, this.hedSchemas, options)
    const convertedIssues = BidsHedIssue.fromHedIssues(hedIssues, eventFileData.file, { tsvLine: rowIndex })
    issues.push(...convertedIssues)

    return issues
  }
}
