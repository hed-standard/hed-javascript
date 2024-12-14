/**
 * A parsed HED substring.
 */
export class ParsedHedSubstring {
  /**
   * The original pre-parsed version of the HED tag.
   * @type {string}
   */
  originalTag
  /**
   * The bounds of the HED tag in the original HED string.
   * @type {int[]}
   */
  originalBounds

  /**
   * Constructor.
   * @param {string} originalTag The original HED tag.
   * @param {number[]} originalBounds The bounds of the HED tag in the original HED string.
   */
  constructor(originalTag, originalBounds) {
    this.originalTag = originalTag
    this.originalBounds = originalBounds
  }

  /**
   * Nicely format this substring. This is left blank for the subclasses to override.
   *
   * This is left blank for the subclasses to override.
   *
   * @param {boolean} long - Whether the tags should be in long form.
   * @returns {string}
   * @abstract
   */
  format(long = true) {}

  /**
   * Get the normalized version of the objet.
   *
   * @returns {string}
   * @abstract
   */
  get normalized() {
    return ''
  }

  /**
   * Override of {@link Object.prototype.toString}.
   *
   * @returns {string} The original form of this HED substring.
   */
  toString() {
    return this.originalTag
  }
}

export default ParsedHedSubstring
