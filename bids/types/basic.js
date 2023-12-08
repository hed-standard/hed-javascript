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
   * This is used to generate BidsIssue objects.
   * @type {object}
   */
  file

  constructor(name, file) {
    this.name = name
    this.file = file
  }
}
