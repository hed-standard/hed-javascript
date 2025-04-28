/**
 * A parsed HED substring.
 */
export class ParsedHedSubstring {
  constructor(originalTag, originalBounds) {
    this.originalTag = originalTag
    this.originalBounds = originalBounds
  }

  toString() {
    return this.originalTag
  }
}

export default ParsedHedSubstring
