/**
 * A tag dictionary entry.
 *
 * @param {string} shortTag The short version of the tag.
 * @param {string} longTag The long version of the tag.
 * @constructor
 */
const TagEntry = function(shortTag, longTag) {
  this.shortTag = shortTag
  this.longTag = longTag
  this.longFormattedTag = longTag.toLowerCase()
}

/**
 * Short-to-long mapping.
 *
 * @param {object} mappingData A dictionary mapping forms to Tag instances.
 * @param {boolean} hasNoDuplicates Whether the mapping has no duplicates.
 * @constructor
 */
const Mapping = function(mappingData, hasNoDuplicates) {
  this.mappingData = mappingData
  this.hasNoDuplicates = hasNoDuplicates
}

module.exports = {
  TagEntry: TagEntry,
  Mapping: Mapping,
}
