import ParsedHedString from './parsedHedString'
import ParsedHedColumnSplice from './parsedHedColumnSplice'
import ParsedHedGroup from './parsedHedGroup'
import { generateIssue } from '../common/issues/issues'

/**
 * Substitute replacement strings for column splice templates.
 *
 * @param {ParsedHedString} parsedString The parsed HED string in which to make column splices.
 * @param {Map<string, ParsedHedString>} columnReplacements A mapping from column names to their replacement strings.
 * @param {Schemas} hedSchemas The active HED schema collection (passed to the {@link ParsedHedGroup} constructor).
 * @returns {[ParsedHedString, Issue[]]} A new parsed HED string with the replacements made, and any issues found.
 */
export function spliceColumns(parsedString, columnReplacements, hedSchemas) {
  const originalData = parsedString.parseTree
  const [newData, issues] = spliceSubstrings(parsedString, originalData, columnReplacements, hedSchemas)
  return [new ParsedHedString(parsedString.hedString, newData), issues]
}

/**
 * Splice replacement strings into a list of substrings.
 *
 * @param {ParsedHedString} parsedString The parsed HED string in which to make column splices.
 * @param {ParsedHedSubstring[]} substrings The parsed HED substrings in which to make column splices.
 * @param {Map<string, ParsedHedString>} columnReplacements A mapping from column names to their replacement strings.
 * @param {Schemas} hedSchemas The active HED schema collection (passed to the {@link ParsedHedGroup} constructor).
 * @returns {[ParsedHedSubstring[], Issue[]]} A new list of parsed HED substrings with the replacements made, and any issues found.
 */
function spliceSubstrings(parsedString, substrings, columnReplacements, hedSchemas) {
  const newData = []
  const issues = []
  for (const substring of substrings) {
    if (substring instanceof ParsedHedColumnSplice) {
      const [substitution, subIssues] = spliceTemplate(substring, columnReplacements)
      newData.push(...substitution)
      if (substitution.length === 0) {
        newData.push(substring)
      }
      issues.push(...subIssues)
    } else if (substring instanceof ParsedHedGroup) {
      const [substitution, subIssues] = spliceGroup(parsedString, substring, columnReplacements, hedSchemas)
      newData.push(substitution)
      issues.push(...subIssues)
    } else {
      newData.push(substring)
    }
  }
  return [newData, issues]
}

/**
 * Splice a replacement string in place of a column template.
 *
 * @param {ParsedHedColumnSplice} columnTemplate The parsed HED column splice template in which to make the column splice.
 * @param {Map<string, ParsedHedString>} columnReplacements A mapping from column names to their replacement strings.
 * @returns {[ParsedHedSubstring[]|null, Issue[]]} The spliced column substitution, and any issues found.
 */
function spliceTemplate(columnTemplate, columnReplacements) {
  const columnName = columnTemplate.originalTag
  const replacementString = columnReplacements.get(columnName)
  if (replacementString === undefined) {
    return [[], [generateIssue('undefinedCurlyBraces', { column: columnName })]]
  }
  if (replacementString.columnSplices.length > 0) {
    return [[], [generateIssue('recursiveCurlyBraces', { column: columnName })]]
  }
  return [replacementString.parseTree, []]
}

/**
 * Splice replacement strings into a parsed HED tag group.
 *
 * @param {ParsedHedString} parsedString The parsed HED string in which to make column splices.
 * @param {ParsedHedGroup} group The parsed HED group in which to make column splices.
 * @param {Map<string, ParsedHedString>} columnReplacements A mapping from column names to their replacement strings.
 * @param {Schemas} hedSchemas The active HED schema collection (passed to the {@link ParsedHedGroup} constructor).
 * @returns {[ParsedHedGroup, Issue[]]} A new parsed HED group with the replacements made, and any issues found.
 */
function spliceGroup(parsedString, group, columnReplacements, hedSchemas) {
  const [newData, issues] = spliceSubstrings(parsedString, group.tags, columnReplacements, hedSchemas)
  const newGroup = new ParsedHedGroup(newData, hedSchemas, parsedString.hedString, group.originalBounds)
  return [newGroup, issues]
}
