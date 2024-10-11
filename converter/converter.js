import { parseHedString } from '../parser/parser'

/**
 * Convert a HED string.
 *
 * @param {Schemas} hedSchemas The HED schema collection.
 * @param {string} hedString The HED tag to convert.
 * @param {boolean} long Whether the tags should be in long form.
 * @returns {[string, Issue[]]} The converted string and any issues.
 */
const convertHedString = function (hedSchemas, hedString, long) {
  const [parsedString, issues] = parseHedString(hedString, hedSchemas)
  const flattenedIssues = Object.values(issues).flat()
  if (flattenedIssues.some((issue) => issue.level === 'error')) {
    return [hedString, flattenedIssues]
  }
  const convertedString = parsedString.format(long)
  return [convertedString, flattenedIssues]
}

/**
 * Convert a HED string to long form.
 *
 * @param {Schemas} schemas The schema container object containing short-to-long mappings.
 * @param {string} hedString The HED tag to convert.
 * @returns {[string, Issue[]]} The long-form string and any issues.
 * @deprecated Replaced with {@link ParsedHedString}. Will be removed in version 4.0.0 or earlier.
 */
export const convertHedStringToLong = function (schemas, hedString) {
  return convertHedString(schemas, hedString, true)
}

/**
 * Convert a HED string to short form.
 *
 * @param {Schemas} schemas The schema container object containing short-to-long mappings.
 * @param {string} hedString The HED tag to convert.
 * @returns {[string, Issue[]]} The short-form string and any issues.
 * @deprecated Replaced with {@link ParsedHedString}. Will be removed in version 4.0.0 or earlier.
 */
export const convertHedStringToShort = function (schemas, hedString) {
  return convertHedString(schemas, hedString, false)
}
