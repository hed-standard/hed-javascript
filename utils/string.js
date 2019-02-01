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
 * Get a copy of a string with the first letter capitalized.
 *
 * @param string The string to capitalize.
 * @returns {string} The capitalized string.
 */
const capitalizeString = function(string) {
  return string.charAt(0).toUpperCase() + string.substring(1)
}

module.exports = {
  stringIsEmpty: stringIsEmpty,
  getCharacterCount: getCharacterCount,
  capitalizeString: capitalizeString,
}
