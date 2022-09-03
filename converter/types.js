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
   * @type {Map<string, TagEntry|TagEntry[]>}
   */
  mappingData
  /**
   * Whether the mapping has no duplicates.
   * @type {boolean}
   */
  hasNoDuplicates

  /**
   * Constructor.
   * @param {Map<string, (TagEntry|TagEntry[])>} mappingData A dictionary mapping forms to TagEntry instances.
   * @param {boolean} hasNoDuplicates Whether the mapping has no duplicates.
   */
  constructor(mappingData, hasNoDuplicates) {
    this.mappingData = mappingData
    this.hasNoDuplicates = hasNoDuplicates
  }
}
