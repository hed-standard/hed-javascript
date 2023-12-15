import { Memoizer } from '../utils/types'

/**
 * A parsed HED substring.
 */
export class ParsedHedSubstring extends Memoizer {
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
    super()

    this.originalTag = originalTag
    this.originalBounds = originalBounds
  }

  /**
   * Determine whether this tag is a descendant of another tag.
   *
   * This is a default implementation. Subclasses should override as appropriate.
   *
   * @param {ParsedHedTag|string} parent The possible parent tag.
   * @return {boolean} Whether {@code parent} is the parent tag of this tag.
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  isDescendantOf(parent) {
    return false
  }

  /**
   * Nicely format this substring.
   *
   * This is left blank for the subclasses to override.
   *
   * @returns {string}
   * @abstract
   */
  format() {}

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
