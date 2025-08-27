/** String-related utility functions
 * @module utils/string
 * */

/**
 * Get number of instances of a character in a string.
 *
 * @param {string} string The string to search.
 * @param {string} characterToCount The character to search for.
 * @returns {number} The number of instances of the character in the string.
 */
export function getCharacterCount(string, characterToCount) {
  return string.split(characterToCount).length - 1
}

/**
 * Split a string on a given delimiter, trim the substrings, and remove any blank substrings from the returned array.
 *
 * @param {string} string The string to split.
 * @param {string} delimiter The delimiter on which to split.
 * @returns {string[]} The split string with blanks removed and the remaining entries trimmed.
 */
export function splitStringTrimAndRemoveBlanks(string, delimiter = ',') {
  return string
    .split(delimiter)
    .map((item) => item.trim())
    .filter(Boolean)
}

/**
 * Parse a template literal string.
 *
 * Copied from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals.
 *
 * @param {string[]} strings The literal parts of the template string.
 * @param {(number|string)} keys The keys of the closure arguments.
 * @returns {function(...[*]): string} A closure to fill the string template.
 */
export function stringTemplate(strings, ...keys) {
  return function (...values) {
    const dict = values[values.length - 1] ?? {}
    const result = [strings[0]]
    keys.forEach((key, i) => {
      const value = Number.isInteger(key) ? values[key] : dict[key]
      result.push(value, strings[i + 1])
    })
    return result.join('')
  }
}
