import ParsedHedSubstring from './parsedHedSubstring'

/**
 * A template for an inline column splice in a {@link ParsedHedString} or {@link ParsedHedGroup}.
 */
export class ParsedHedColumnSplice extends ParsedHedSubstring {
  /**
   * Nicely format this column splice template.
   *
   * @returns {string}
   */
  format() {
    return '{' + this.originalTag + '}'
  }

  equivalent(other) {
    return other instanceof ParsedHedColumnSplice && this.originalTag === other.originalTag
  }
}

export default ParsedHedColumnSplice
