/** String-related utility functions */

/**
 * Get number of instances of an character in a string.
 *
 * @param {string} string The string to search.
 * @param {string} characterToCount The character to search for.
 * @returns {number} The number of instances of the character in the string.
 */
export const getCharacterCount = function (string, characterToCount) {
  return string.split(characterToCount).length - 1
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
export const stringTemplate = function (strings, ...keys) {
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
