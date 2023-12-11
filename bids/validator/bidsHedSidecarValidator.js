import { BidsHedIssue } from '../types/issues'
import ParsedHedString from '../../parser/parsedHedString'
// IMPORTANT: This import cannot be shortened to '../../validator', as this creates a circular dependency until v4.0.0.
import { validateHedString } from '../../validator/event/init'
import { generateIssue } from '../../common/issues/issues'

/**
 * Validator for HED data in BIDS JSON sidecars.
 */
export class BidsHedSidecarValidator {
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
   * Validate a collection of BIDS sidecars. This method returns the complete issue list for convenience.
   *
   * @returns {BidsHedIssue[]} Any issues found during validation of the sidecars.
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
    return this.issues
  }

  /**
   * Validate an individual BIDS sidecar.
   *
   * @param {BidsSidecar} sidecar A BIDS sidecar.
   * @returns {BidsHedIssue[]} All issues found.
   */
  validateSidecar(sidecar) {
    return [...this._validateSidecarStrings(sidecar), ...BidsHedSidecarValidator.validateSidecarCurlyBraces(sidecar)]
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
   */
  static validateSidecarCurlyBraces(sidecar) {
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
}
