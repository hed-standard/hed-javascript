import ParsedHedSubstring from './parsedHedSubstring'

/**
 * Tagging superclass for column splices.
 */
export class ParsedHedColumnSplice extends ParsedHedSubstring {}

/**
 * A template for an inline column splice in a {@link ParsedHedString} or {@link ParsedHedGroup}.
 */
export class ParsedHedColumnTemplate extends ParsedHedColumnSplice {}

/**
 * A substituted inline column splice in a {@link ParsedHedString} or {@link ParsedHedGroup}.
 */
export class ParsedHedColumnSubstitution extends ParsedHedColumnSplice {
  /**
   * The column splice template.
   * @type {ParsedHedColumnTemplate}
   */
  columnTemplate
  /**
   * The replacement parsed HED contents.
   * @type {ParsedHedString}
   */
  replacementString

  /**
   * Constructor.
   * @param {ParsedHedColumnTemplate} columnTemplate The column splice template.
   * @param {ParsedHedString} replacementString The replacement parsed HED contents.
   */
  constructor(columnTemplate, replacementString) {
    super(columnTemplate.originalTag, columnTemplate.originalBounds)
    this.columnTemplate = columnTemplate
    this.replacementString = replacementString
  }

  /**
   * Retrieve a copy of the replacement HED string data.
   * @return {ParsedHedSubstring[]}
   */
  get data() {
    return this.replacementString.parseTree.slice()
  }
}
