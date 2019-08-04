// Wrappers around more basic functions.
const strings = require('./string')

/**
 * Replace the end of a HED tag with a pound sign.
 */
const replaceTagNameWithPound = function(formattedTag) {
  return strings.replaceTagNameWithNewEnding(formattedTag, '#')
}

/**
 * Get the indices of all slashes in a HED tag.
 */
const getTagSlashIndices = function(tag) {
  return strings.getCharacterIndices(tag, '/')
}

/**
 * Get the last part of a HED tag.
 */
const getTagName = function(tag) {
  const lastSlashIndex = tag.lastIndexOf('/')
  if (lastSlashIndex === -1) {
    return tag
  } else {
    return tag.substring(lastSlashIndex + 1)
  }
}

module.exports = {
  replaceTagNameWithPound: replaceTagNameWithPound,
  getTagSlashIndices: getTagSlashIndices,
  getTagName: getTagName,
}
