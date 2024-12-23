import ParsedHedSubstring from './parsedHedSubstring'

/**
 * A template for an inline column splice in a {@link ParsedHedString} or {@link ParsedHedGroup}.
 */
export class ParsedHedColumnSplice extends ParsedHedSubstring {
  /**
   * Nicely format this column splice template.
   *
   * @param {boolean} long Whether the tags should be in long form.
   * @returns {string}
   */
  // eslint-disable-next-line no-unused-vars
  format(long = true) {
    return '{' + this.originalTag + '}'
  }

  equivalent(other) {
    return other instanceof ParsedHedColumnSplice && this.originalTag === other.originalTag
  }
}

export default ParsedHedColumnSplice
