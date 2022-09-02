import { Memoizer } from '../../utils/types'

/**
 * A parsed HED substring.
 */
export default class ParsedHedSubstring extends Memoizer {
  /**
   * Constructor.
   * @param {string} originalTag The original HED tag.
   * @param {number[]} originalBounds The bounds of the HED tag in the original HED string.
   */
  constructor(originalTag, originalBounds) {
    super()
    /**
     * The original pre-parsed version of the HED tag.
     * @type {string}
     */
    this.originalTag = originalTag
    /**
     * The bounds of the HED tag in the original HED string.
     * @type {int[]}
     */
    this.originalBounds = originalBounds
  }
}
