/**
 * This module provides functions for parsing TSV files.
 *
 * @module bids/tsvParser
 */

const stripBOM = (str) => str.replace(/^\uFEFF/, '')
const normalizeEOL = (str) => str.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
const isContentfulRow = (row) => row && !/^\s*$/.test(row)

/**
 * Split TSV contents into trimmed cells, one array per contentful row; the first row is the header.
 *
 * @param {string} contents The contents of a TSV file.
 * @returns {string[][]} The rows of the file.
 */
const splitRows = (contents) =>
  stripBOM(normalizeEOL(contents))
    .split('\n')
    .filter(isContentfulRow)
    .map((str) => str.split('\t').map((cell) => cell.trim()))

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
 * @param {string[]} headers The column names.
 * @returns {string[]} Each repeated name once, in order of its second appearance.
 */
function repeatedNames(headers) {
  const seen = new Set()
  const repeated = new Set()
  for (const header of headers) {
    if (seen.has(header)) {
      repeated.add(header)
    }
    seen.add(header)
  }
  return [...repeated]
}

/**
 * Parse a TSV file
 *
 * A column name repeated in the header keeps only its first column (see {@link findDuplicateHeaders}).
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
 * @param {string} contents The contents of a TSV file.
 * @returns {string[]} Each repeated name once; empty when every name is unique.
 */
export function findDuplicateHeaders(contents) {
  const rows = splitRows(contents)
  return repeatedNames(rows.length ? rows[0] : [])
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
