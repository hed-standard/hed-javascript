/**
 * A tag dictionary entry.
 */
export class TagEntry {
  /**
   * The short version of the tag.
   * @type {string}
   */
  shortTag
  /**
   * The long version of the tag.
   * @type {string}
   */
  longTag
  /**
   * The formatted long version of the tag.
   * @type {string}
   */
  longFormattedTag
  /**
   * Whether this tag takes a value.
   * @type {boolean}
   */
  takesValue

  /**
   * Constructor.
   * @param {string} shortTag The short version of the tag.
   * @param {string} longTag The long version of the tag.
   */
  constructor(shortTag, longTag) {
    this.shortTag = shortTag
    this.longTag = longTag
    this.longFormattedTag = longTag.toLowerCase()
  }
}

/**
 * A short-to-long mapping.
 */
export class Mapping {
  /**
   * A dictionary mapping forms to TagEntry instances.
   * @type {Map<string, TagEntry>}
   */
  mappingData

  /**
   * Constructor.
   * @param {Map<string, TagEntry>} mappingData A dictionary mapping forms to TagEntry instances.
   */
  constructor(mappingData) {
    this.mappingData = mappingData
  }
}
