import { Memoizer } from '../../utils/types'

/**
 * A parsed HED substring.
 */
export default class ParsedHedSubstring extends Memoizer {
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
}
