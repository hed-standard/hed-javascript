const date = require('date-and-time')

/**
 * Check if a string is empty or only whitespace.
 *
 * @param string The string to check.
 * @returns {boolean} Whether the string is empty.
 */
const stringIsEmpty = function(string) {
  return !string.trim()
}

/**
 * Get number of instances of an character in a string.
 *
 * @param string The string to search.
 * @param characterToCount The character to search for.
 * @returns {number} The number of instances of the character in the string.
 */
const getCharacterCount = function(string, characterToCount) {
  return string.split(characterToCount).length - 1
}

/**
 * Get all indices of a given character in a string.
 *
 * Courtesy of https://stackoverflow.com/a/10710406/6147595.
 *
 * @param string The string to search.
 * @param characterToFind The character to search for.
 * @return {Array} The list of all indices of that character in this string.
 */
const getCharacterIndices = function(string, characterToFind) {
  const indices = []
  let i = -1
  while ((i = string.indexOf(characterToFind, i + 1)) >= 0) {
    indices.push(i)
  }
  return indices
}

/**
 * Get a copy of a string with the first letter capitalized.
 *
 * @param string The string to capitalize.
 * @returns {string} The capitalized string.
 */
const capitalizeString = function(string) {
  return string.charAt(0).toUpperCase() + string.substring(1)
}

/**
 * Replace the last part of a HED tag with a new ending.
 *
 * @param formattedTag The formatted HED tag to check.
 * @param newEnding The new ending for the HED tag.
 * @returns {string} The HED tag with the last part replaced with the new ending.
 */
const replaceTagNameWithNewEnding = function(formattedTag, newEnding) {
  let newTag = newEnding
  const lastTagSlashIndex = formattedTag.lastIndexOf('/')
  if (lastTagSlashIndex !== -1) {
    newTag = formattedTag.substring(0, lastTagSlashIndex) + '/' + newEnding
  }
  return newTag
}

/**
 * Determine if a string is a valid hour-minute time.
 *
 * @param timeString The string to check.
 * @return {boolean} Whether the string is a valid hour-minute time.
 */
const isHourMinuteTime = function(timeString) {
  return date.isValid(timeString, 'HH:mm')
}

module.exports = {
  stringIsEmpty: stringIsEmpty,
  getCharacterCount: getCharacterCount,
  getCharacterIndices: getCharacterIndices,
  capitalizeString: capitalizeString,
  replaceTagNameWithNewEnding: replaceTagNameWithNewEnding,
  isHourMinuteTime: isHourMinuteTime,
}
