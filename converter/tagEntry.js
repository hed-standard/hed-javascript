/**
 * A tag dictionary entry.
 *
 * @param {String} shortTag The short version of the tag.
 * @param {String} longTag The long version of the tag.
 * @param {String} longFormattedTag The formatted long version of the tag.
 * @constructor
 */
const TagEntry = function(shortTag, longTag, longFormattedTag) {
  this.shortTag = shortTag
  this.longTag = longTag
  this.longFormattedTag = longFormattedTag
}

module.exports = TagEntry
