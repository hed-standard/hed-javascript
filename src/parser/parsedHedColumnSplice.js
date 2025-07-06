import ParsedHedSubstring from './parsedHedSubstring'
import ParsedHedGroup from './parsedHedGroup'
import ParsedHedString from './parsedHedString'

/**
 * A template for an inline column splice in a HED string.
 *
 * @see {@link ParsedHedString}
 * @see {@link ParsedHedGroup}
 */
export class ParsedHedColumnSplice extends ParsedHedSubstring {
  /**
   * The normalized string representation of this column splice.
   * @type {string}
   * @private
   */
  _normalized

  /**
   * Constructor.
   *
   * @param {string} columnName The token for this tag.
   * @param {number[]} bounds The collection of HED schemas.
   */
  constructor(columnName, bounds) {
    super(columnName, bounds) // Sets originalTag and originalBounds
    this._normalized = this.format(false) // Sets various forms of the tag.
  }

  /**
   * Get the normalized version of the object.
   *
   * @returns {string}
   */
  get normalized() {
    return this._normalized
  }

  /**
   * Nicely format this column splice template.
   *
   * @param {boolean} long Whether the tags should be in long form.
   * @returns {string} The formatted column splice template.
   */
  // eslint-disable-next-line no-unused-vars
  format(long = true) {
    return '{' + this.originalTag + '}'
  }

  /**
   * Determine if this column splice is equivalent to another.
   *
   * @param {ParsedHedColumnSplice} other The other column splice.
   * @returns {boolean} Whether the two column splices are equivalent.
   */
  equivalent(other) {
    return other instanceof ParsedHedColumnSplice && this.originalTag === other.originalTag
  }
}

export default ParsedHedColumnSplice
