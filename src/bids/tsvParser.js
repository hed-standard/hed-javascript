/**
 * This module provides functions for parsing TSV files.
 * @module bids/tsvParser
 */

import { isPaddedName, stripNameWhitespace } from '../utils/string'

/**
 * Parsed TSV data: each column name with the column's cells.
 * @typedef {Map<string, string[]>} ParsedTSV
 */

/**
 * Parsed TSV data in the old BIDS format.
 * @typedef {{headers: string[], rows: string[][]}} OldParsedTSV
 */

const stripBOM = (str) => str.replace(/^\uFEFF/, '')
const normalizeEOL = (str) => str.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

/**
 * Split TSV contents into lines (specification 3.2.10).
 *
 * Line breaks are \r\n, \r or \n. One line break at the end of the contents ends the last line and is not itself a
 * line; any other empty line is kept, so that it can be reported. Line 1 is always the first line, even when empty.
 *
 * @param {string} contents The contents of a TSV file.
 * @returns {string[]} The lines of the file; empty when the contents are empty.
 */
const splitLines = (contents) => {
  const text = stripBOM(normalizeEOL(contents))
  if (text.length === 0) {
    return []
  }
  const lines = text.split('\n')
  if (lines[lines.length - 1] === '') {
    lines.pop()
  }
  return lines
}

/**
 * Split TSV contents into cells: the first line, which is the header, then one array per line after it.
 *
 * The header cells are the column names and the other cells the values, all exactly as written (specification
 * 3.2.9.1 and 3.2.10): nothing is trimmed, as for Map and {headers, rows} input. Every line is kept, so that row
 * index i is file line i + 1; an empty line becomes the row `['']` (see {@link findRowProblems}).
 *
 * @param {string} contents The contents of a TSV file.
 * @returns {string[][]} The rows of the file.
 */
const splitRows = (contents) => splitLines(contents).map((line) => line.split('\t'))

/**
 * Determine whether a TSV cell is a missing value: empty or `n/a` once any leading or trailing blank, tab, line feed
 * or carriage return is removed.
 *
 * Used for the HED column and in assembly, where a cell such as `n/a ` is missing, as hedtools reads it. A padded
 * value in a column with HED annotations never gets this far: it is reported as TABULAR_INVALID first.
 *
 * @param {*} value A cell value.
 * @returns {boolean} Whether the cell holds no value.
 */
export function isMissingTsvValue(value) {
  if (value === null || value === undefined) {
    return true
  }
  const text = stripNameWhitespace(String(value))
  return text === '' || text === 'n/a'
}

/**
 * Build the column map of a table, keeping only the first column of a repeated header name.
 *
 * A repeated name is an error (specification 3.2.10, TABULAR_INVALID) that {@link findDuplicateHeaders} detects;
 * keeping one column per name keeps every column aligned with the rows instead of interleaving two columns.
 *
 * @param {string[]} headers The column names.
 * @param {string[][]} rows The rows; rows[0] is skipped as the header row.
 * @returns {ParsedTSV} The cells of each column.
 */
function createTsvMap(headers, rows) {
  const firstIndex = new Map()
  headers.forEach((header, index) => {
    if (!firstIndex.has(header)) {
      firstIndex.set(header, index)
    }
  })
  const columns = new Map()
  for (const [header, index] of firstIndex) {
    columns.set(
      header,
      rows.slice(1).map((row) => row[index]),
    )
  }
  return columns
}

/**
 * Return the names that appear more than once in a list of column names.
 *
 * Names are compared exactly as written. Padded and blank names are left out: they are reported as such
 * (see {@link findHeaderProblems}), not as repeats.
 *
 * @param {string[]} headers The column names.
 * @returns {string[]} Each repeated name once, in order of its second appearance.
 */
function repeatedNames(headers) {
  const seen = new Set()
  const repeated = new Set()
  for (const header of headers) {
    if (header === '' || isPaddedName(header)) {
      continue
    }
    if (seen.has(header)) {
      repeated.add(header)
    }
    seen.add(header)
  }
  return [...repeated]
}

/**
 * Find the column names that break the rules for the first line of a tabular file (specification 3.2.10).
 *
 * @param {string[]} headers The column names, exactly as written.
 * @returns {{padded: string[], blank: number[], duplicate: string[]}} Each name that begins or ends with
 *   whitespace once, in header order; the 1-based positions of the blank names; and each other name that
 *   appears more than once (see {@link findDuplicateHeaders}).
 */
export function findHeaderProblems(headers) {
  const padded = [...new Set(headers.filter(isPaddedName))]
  const blank = headers.flatMap((header, index) => (header === '' ? [index + 1] : []))
  return { padded, blank, duplicate: repeatedNames(headers) }
}

/**
 * Parse a TSV file
 *
 * The column names are kept exactly as written. A column name repeated in the header keeps only its first column
 * (see {@link findDuplicateHeaders}).
 *
 * @param {string} contents The contents of a TSV file.
 * @returns {ParsedTSV} The parsed contents of the TSV file.
 */
export function parseTSV(contents) {
  const rows = splitRows(contents)
  return createTsvMap(rows.length ? rows[0] : [], rows)
}

/**
 * Find the column names that appear more than once in the header of TSV contents.
 *
 * Names are compared exactly as written; padded and blank names are not counted (see {@link findHeaderProblems}).
 *
 * @param {string} contents The contents of a TSV file.
 * @returns {string[]} Each repeated name once; empty when every name is unique.
 */
export function findDuplicateHeaders(contents) {
  return repeatedNames(parseTSVHeader(contents))
}

/**
 * Return the cells of the first line of TSV contents, the header (see {@link splitRows}), without splitting the other
 * lines.
 *
 * Line breaks are \r\n, \r or \n, as in {@link splitRows}, so the result equals the header row that
 * {@link parseTSV} uses. The cells are not trimmed. An empty first line is one blank column name, `['']`.
 *
 * @param {string} contents The contents of a TSV file.
 * @returns {string[]} The header cells; empty when the contents are empty.
 */
export function parseTSVHeader(contents) {
  const text = stripBOM(contents)
  if (text.length === 0) {
    return []
  }
  const match = /\r\n|\r|\n/.exec(text)
  return text.slice(0, match ? match.index : text.length).split('\t')
}

/**
 * Determine whether a cell of the first non-empty line of TSV contents is `HED` once its leading and trailing
 * whitespace is removed.
 *
 * Such a file carries HED even when a malformed first line hides its HED column (specification 3.2.10), so it is
 * validated and the malformed line reported.
 *
 * @param {string} contents The contents of a TSV file.
 * @returns {boolean} Whether the first non-empty line names a HED column.
 */
export function firstNonEmptyLineHasHed(contents) {
  const line = splitLines(contents).find((text) => text !== '')
  return line !== undefined && line.split('\t').some((cell) => stripNameWhitespace(cell) === 'HED')
}

/**
 * The lines of a tabular file that break the line rules of specification 3.2.10.
 * @typedef {Object} TsvRowProblems
 * @property {number[]} emptyLines The 1-based numbers of the empty lines other than the first.
 * @property {{line: number, cells: number, expected: number}[]} badCellCounts Each other line whose number of
 *   tab-separated cells differs from the first line's.
 */

/**
 * Find the lines other than the first that are empty or have a different number of cells than the first line
 * (specification 3.2.10, TABULAR_INVALID).
 *
 * An empty line is reported as an empty line only, not also as a wrong cell count. For text contents, an empty line
 * is a line with no characters; for {headers, rows} data, a row with no cells, since a row `['']` is one empty
 * cell. In {headers, rows} data, rows[0] is the header row and the expected count is the number of headers.
 *
 * @param {string|OldParsedTSV} data The contents of a TSV file, or parsed TSV data in the old BIDS format.
 * @returns {TsvRowProblems} The empty lines and the lines with a wrong cell count, by 1-based file line number.
 */
export function findRowProblems(data) {
  const problems = { emptyLines: [], badCellCounts: [] }
  let expected
  let rows
  if (typeof data === 'string') {
    const lines = splitLines(data)
    if (lines.length === 0) {
      return problems
    }
    expected = lines[0].split('\t').length
    rows = lines.map((line) => (line === '' ? null : line.split('\t')))
  } else {
    expected = data.headers.length
    rows = data.rows.map((row) => (row.length === 0 ? null : row))
  }
  rows.forEach((row, index) => {
    if (index === 0) {
      return
    }
    if (row === null) {
      problems.emptyLines.push(index + 1)
    } else if (row.length !== expected) {
      problems.badCellCounts.push({ line: index + 1, cells: row.length, expected })
    }
  })
  return problems
}

/**
 * Find the column names that appear more than once in parsed TSV data in the old BIDS format.
 *
 * @param {OldParsedTSV} oldParsedTsv Parsed TSV data using the old format
 * @returns {string[]} Each repeated name once; empty when every name is unique.
 */
export function findDuplicateParsedHeaders(oldParsedTsv) {
  return repeatedNames(oldParsedTsv.headers)
}

/**
 * Convert parsed TSV file data from the old BIDS format to the new BIDS format.
 *
 * A column name repeated in the headers keeps only its first column (see {@link findDuplicateParsedHeaders}).
 *
 * @param {OldParsedTSV} oldParsedTsv Parsed TSV data using the old format
 * @returns {ParsedTSV} The parsed contents of the TSV file, using the new format.
 */
export function convertParsedTSVData(oldParsedTsv) {
  return createTsvMap(oldParsedTsv.headers, oldParsedTsv.rows)
}

export default parseTSV
