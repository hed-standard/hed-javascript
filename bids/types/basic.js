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
   * The file object representing this file data.
   * This is used to generate {@link BidsIssue} objects.
   * @type {object}
   */
  file

  constructor(name, file) {
    this.name = name
    this.file = file
  }

  /**
   * Determine whether this file has any HED data.
   *
   * @returns {boolean}
   */
  hasHedData() {
    return false
  }
}
