import path from 'path'

import { BidsHedIssue } from './issues'
import { generateIssue } from '../../issues/issues'
import { readFile } from '../../utils/files'

/**
 * A BIDS file.
 */
export class BidsFile {
  /**
   * The name of this file.
   * @type {string}
   */
  name

  /**
   * The Object representing this file data.
   * This is used to generate {@link BidsHedIssue} objects.
   * @type {Object}
   */
  file

  /**
   * The validator class used to validate this file.
   * @private
   */
  _validatorClass

  /**
   * Constructor.
   *
   * @param {string} name - The name of the file -- used for messages.
   * @param {Object} file - The representation of the file for error messages.
   * @param {function} validatorClass - The validator class corresponding to this file.
   */
  constructor(name, file, validatorClass) {
    this.name = name
    this.file = file
    this._validatorClass = validatorClass
  }

  /**
   * Read a BIDS file from a relative path within a dataset.
   *
   * @param {string} datasetRoot The root path of the dataset.
   * @param {string} relativePath The relative path of the file within the dataset.
   * @returns {Promise<Array>} A Promise that resolves to a two-element array containing the file contents and a mocked BIDS-type file object.
   */
  static async readBidsFileFromDatasetPath(datasetRoot, relativePath) {
    const filePath = path.join(datasetRoot, relativePath)
    const fileObject = { path: filePath }
    return [await readFile(filePath), fileObject]
  }

  /**
   * Read a BIDS file from a path.
   *
   * @param {string} filePath The actual path of the file.
   * @returns {Promise<Array>} A Promise that resolves to a two-element array containing the file contents and a mocked BIDS-type file object.
   */
  static async readBidsFile(filePath) {
    const fileObject = { path: filePath }
    return [await readFile(filePath), fileObject]
  }

  /**
   * Validate this validator's tsv file.
   *
   * @param {Schemas} schemas - The HED schemas used to validate this file.
   * @returns {BidsHedIssue[]} - Any issues found during validation of this TSV file.
   */
  validate(schemas) {
    if (!this.hasHedData) {
      return []
    }
    if (!schemas) {
      return [
        BidsHedIssue.fromHedIssue(
          generateIssue('missingSchemaSpecification', {
            message: 'No valid HED schema specification was supplied.',
          }),
          this.file,
        ),
      ]
    }

    try {
      const validator = new this.validatorClass(this, schemas)
      validator.validate()
      return [...validator.errors, ...validator.warnings]
    } catch (error) {
      // The low-level parsing throws exceptions with the issue encapsulated.
      return BidsHedIssue.fromHedIssues(error, this.file)
    }
  }

  /**
   * Whether this is a TSV file timeline file.
   *
   * @returns {boolean}
   */
  get isTimelineFile() {
    return false
  }

  /**
   * Determine whether this file has any HED data.
   *
   * @returns {boolean}
   */
  get hasHedData() {
    return false
  }

  /**
   * The validator class used to validate this file.
   *
   * @returns {function} The validator class used to validate this file.
   */
  get validatorClass() {
    return this._validatorClass
  }
}
