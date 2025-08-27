/**
 * This module provides functions for parsing TSV files.
 *
 * @module bids/tsvParser
 */

const stripBOM = (str) => str.replace(/^\uFEFF/, '')
const normalizeEOL = (str) => str.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
const isContentfulRow = (row) => row && !/^\s*$/.test(row)

/**
 * Parse a TSV file
 *
 * @param {string} contents The contents of a TSV file.
 * @returns {Map<string, string[]>} The parsed contents of the TSV file.
 */
export function parseTSV(contents) {
  const columns = new Map()
  const rows = stripBOM(normalizeEOL(contents))
    .split('\n')
    .filter(isContentfulRow)
    .map((str) => str.split('\t').map((cell) => cell.trim()))
  const headers = rows.length ? rows[0] : []

  headers.forEach((x) => {
    columns.set(x, [])
  })
  for (let i = 1; i < rows.length; i++) {
    for (let j = 0; j < headers.length; j++) {
      columns.get(headers[j])?.push(rows[i][j])
    }
  }
  for (const [key, value] of columns) {
    columns.set(key, value)
  }
  return columns
}
/**
 * Convert parsed TSV file data from the old BIDS format to the new BIDS format.
 *
 * @param {{headers: string[], rows: string[][]}} oldParsedTsv Parsed TSV data using the old format
 * @returns {Map<string, string[]>} The parsed contents of the TSV file, using the new format.
 */
export function convertParsedTSVData(oldParsedTsv) {
  const columns = new Map()

  oldParsedTsv.headers.forEach((x) => {
    columns.set(x, [])
  })
  for (let i = 1; i < oldParsedTsv.rows.length; i++) {
    for (let j = 0; j < oldParsedTsv.headers.length; j++) {
      columns.get(oldParsedTsv.headers[j])?.push(oldParsedTsv.rows[i][j])
    }
  }
  for (const [key, value] of columns) {
    columns.set(key, value)
  }
  return columns
}

export default parseTSV
