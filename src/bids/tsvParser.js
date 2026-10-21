/**
 * This module provides functions for parsing TSV files.
 *
 * @module bids/tsvParser
 */

import { isPaddedName } from '../utils/string'

const stripBOM = (str) => str.replace(/^\uFEFF/, '')
const normalizeEOL = (str) => str.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
const isContentfulRow = (row) => row && !/^\s*$/.test(row)
// A line with a tab has at least two columns, so it is a header even when every name is blank or padded.
const isHeaderRow = (row) => row.includes('\t') || isContentfulRow(row)

/**
 * Split TSV contents into cells: the first header row, then one array per contentful row after it.
 *
 * The header cells are the column names exactly as written (specification 3.2.10); the cells of the other rows
 * are trimmed.
 *
 * @param {string} contents The contents of a TSV file.
 * @returns {string[][]} The rows of the file.
 */
const splitRows = (contents) => {
  const lines = stripBOM(normalizeEOL(contents)).split('\n')
  const headerIndex = lines.findIndex(isHeaderRow)
  if (headerIndex < 0) {
    return []
  }
  const dataRows = lines
    .slice(headerIndex + 1)
    .filter(isContentfulRow)
    .map((str) => str.split('\t').map((cell) => cell.trim()))
  return [lines[headerIndex].split('\t'), ...dataRows]
}

/**
 * Build the column map of a table, keeping only the first column of a repeated header name.
 *
 * A repeated name is an error (specification 3.2.10, TABULAR_INVALID) that {@link findDuplicateHeaders} detects;
 * keeping one column per name keeps every column aligned with the rows instead of interleaving two columns.
 *
 * @param {string[]} headers The column names.
 * @param {string[][]} rows The rows; rows[0] is skipped as the header row.
 * @returns {Map<string, string[]>} The cells of each column.
 */
function buildColumns(headers, rows) {
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
 * @returns {Map<string, string[]>} The parsed contents of the TSV file.
 */
export function parseTSV(contents) {
  const rows = splitRows(contents)
  return buildColumns(rows.length ? rows[0] : [], rows)
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
 * Return the cells of the first header line of TSV contents (see {@link splitRows}), without splitting the other lines.
 *
 * Line breaks are \r\n, \r or \n, as in {@link splitRows}, so the result equals the header row that
 * {@link parseTSV} uses. The cells are not trimmed.
 *
 * @param {string} contents The contents of a TSV file.
 * @returns {string[]} The header cells; empty when the contents have no header line.
 */
export function parseTSVHeader(contents) {
  const text = stripBOM(contents)
  const lineBreak = /\r\n|\r|\n/g
  let start = 0
  while (start <= text.length) {
    lineBreak.lastIndex = start
    const match = lineBreak.exec(text)
    const line = text.slice(start, match ? match.index : text.length)
    if (isHeaderRow(line)) {
      return line.split('\t')
    }
    if (!match) {
      break
    }
    start = lineBreak.lastIndex
  }
  return []
}

/**
 * Find the column names that appear more than once in parsed TSV data in the old BIDS format.
 *
 * @param {{headers: string[], rows: string[][]}} oldParsedTsv Parsed TSV data using the old format
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
 * @param {{headers: string[], rows: string[][]}} oldParsedTsv Parsed TSV data using the old format
 * @returns {Map<string, string[]>} The parsed contents of the TSV file, using the new format.
 */
export function convertParsedTSVData(oldParsedTsv) {
  return buildColumns(oldParsedTsv.headers, oldParsedTsv.rows)
}

export default parseTSV
