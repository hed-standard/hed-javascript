/**
 * String-related utility functions
 * @module utils/string
 */

/**
 * Get number of instances of a character in a string.
 *
 * @param string The string to search.
 * @param characterToCount The character to search for.
 * @returns The number of instances of the character in the string.
 */
export function getCharacterCount(string: string, characterToCount: string): number {
  return string.split(characterToCount).length - 1
}

/**
 * Split a string on a given delimiter, trim the substrings, and remove any blank substrings from the returned array.
 *
 * @param string The string to split.
 * @param delimiter The delimiter on which to split.
 * @returns The split string with blanks removed and the remaining entries trimmed.
 */
export function splitStringTrimAndRemoveBlanks(string: string, delimiter: string = ','): string[] {
  return string
    .split(delimiter)
    .map((item) => item.trim())
    .filter(Boolean)
}

export type IssueMessageTemplateString = (
  parameterValues: Record<string, string>,
  start?: number,
  end?: number,
) => string

/**
 * Parse a template literal string.
 *
 * Adapted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals.
 *
 * @param strings The literal parts of the template string.
 * @param parameterKeys The keys of the closure arguments.
 * @returns A closure to fill the string template.
 */
export function issueMessageTemplate(
  strings: TemplateStringsArray,
  ...parameterKeys: Array<number | string>
): IssueMessageTemplateString {
  return function (parameterValues: Record<string, string>, start?: number, end?: number) {
    const bounds = [start, end]
    const result = [strings[0]]
    parameterKeys.forEach((key, i) => {
      const value = typeof key === 'number' ? bounds[key]?.toString() : parameterValues[key]
      result.push(value, strings[i + 1])
    })
    return result.join('')
  }
}
