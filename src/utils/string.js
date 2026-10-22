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
 * The whitespace that a column name or a top-level sidecar key must not begin or end with: blank, tab, LF and CR
 * (specification 3.2.10). Other Unicode spaces, which String.prototype.trim also removes, are not in the set.
 * @type {string}
 */
export const NAME_WHITESPACE = ' \t\n\r'

/**
 * Determine whether a name begins or ends with {@link NAME_WHITESPACE}.
 *
 * @param {string} name A column name or a top-level sidecar key.
 * @returns {boolean} Whether the first or last character of the name is in {@link NAME_WHITESPACE}.
 */
export function isPaddedName(name) {
  return (
    typeof name === 'string' &&
    name.length > 0 &&
    (NAME_WHITESPACE.includes(name[0]) || NAME_WHITESPACE.includes(name[name.length - 1]))
  )
}

/**
 * Return a column name as text, as a text header would hold it.
 *
 * A string is returned unchanged. `null`, `undefined` and `NaN` become `''` (a blank name). A whole number is
 * written without a decimal point and in full digits (`1` and `1.0` both become `'1'`), as hedtools writes
 * it; anything else goes through `String` (`1.5` becomes `'1.5'`).
 *
 * @param {*} name A column name from a Map key or an old-format header.
 * @returns {string} The name as text.
 */
export function columnNameText(name) {
  if (typeof name === 'string') {
    return name
  }
  if (name === null || name === undefined || Number.isNaN(name)) {
    return ''
  }
  if (Number.isInteger(name)) {
    return BigInt(name).toString()
  }
  return String(name)
}

/**
 * Remove {@link NAME_WHITESPACE} from both ends of a name, leaving any other Unicode space in place.
 *
 * @param {string} name A column name or a top-level sidecar key.
 * @returns {string} The name without leading or trailing blanks, tabs, LFs or CRs.
 */
export function stripNameWhitespace(name) {
  let start = 0
  let end = name.length
  while (start < end && NAME_WHITESPACE.includes(name[start])) {
    start++
  }
  while (end > start && NAME_WHITESPACE.includes(name[end - 1])) {
    end--
  }
  return name.slice(start, end)
}

/**
 * Parse a template literal string.
 *
 * Adapted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals.
 *
 * @param {string[]} strings - The literal parts of the template string.
 * @param {...(number|string)} parameterKeys - The keys of the closure arguments.
 * @returns {function(Object<string, string>, number=, number=): string} A closure to fill the string template.
 */
export function issueMessageTemplate(strings, ...parameterKeys) {
  return function (parameterValues, start, end) {
    const bounds = [start, end]
    const result = [strings[0]]
    parameterKeys.forEach((key, i) => {
      const value = typeof key === 'number' ? String(bounds[key]) : parameterValues[key]
      result.push(value, strings[i + 1])
    })
    return result.join('')
  }
}
