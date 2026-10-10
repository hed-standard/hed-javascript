/**
 * String-related utility functions
 * @module utils/string
 */
import { type JsonObject } from './types'
/**
 * Get number of instances of a character in a string.
 *
 * @param string - The string to search.
 * @param characterToCount - The character to search for.
 * @returns The number of instances of the character in the string.
 */
export declare function getCharacterCount(string: string, characterToCount: string): number
/**
 * Split a string on a given delimiter, trim the substrings, and remove any blank substrings from the returned array.
 *
 * @param string - The string to split.
 * @param delimiter - The delimiter on which to split.
 * @returns The split string with blanks removed and the remaining entries trimmed.
 */
export declare function splitStringTrimAndRemoveBlanks(string: string, delimiter?: string): string[]
/**
 * Parse a JSON string.
 *
 * @param jsonText A JSON string.
 * @returns The parsed JSON object.
 */
export declare function parseJson(jsonText: string): JsonObject
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
 * @param strings - The literal parts of the template string.
 * @param parameterKeys - The keys of the closure arguments.
 * @returns A closure to fill the string template.
 */
export declare function issueMessageTemplate(
  strings: TemplateStringsArray,
  ...parameterKeys: Array<number | string>
): IssueMessageTemplateString
