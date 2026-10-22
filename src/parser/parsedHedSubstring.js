/**
 * A parsed HED substring.
 * @module parser/parsedHedSubstring
 */

export default class ParsedHedSubstring {
  /**
   * The original pre-parsed version of the HED tag.
   * @type {string}
   */
  originalTag
  /**
   * The bounds of the HED tag in the original HED string.
   * @type {number[]}
   */
  originalBounds

  /**
   * Constructor.
   *
   * @param {string} originalTag The original HED tag.
   * @param {number[]} originalBounds The bounds of the HED tag in the original HED string.
   */
  constructor(originalTag, originalBounds) {
    this.originalTag = originalTag
    this.originalBounds = originalBounds
  }

  /**
   * Nicely format this substring.
   *
   * @param {boolean} long - Whether the tags should be in long form.
   * @returns {string} A nicely formatted version of this substring.
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  format(long) {}

  /**
   * Get the normalized version of the object.
   *
   * @returns {string} The normalized version of this substring.
   * @abstract
   */
  get normalized() {
    return ''
  }

  /**
   * Determine if this substring is equivalent to another.
   *
   * @param {*} other - The other substring.
   * @returns {boolean} Whether the two substrings are equivalent.
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  equivalent(other) {}

  /**
   * Override of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString Object.prototype.toString}.
   *
   * @returns {string} The original form of this HED substring.
   */
  toString() {
    return this.originalTag
  }
}
