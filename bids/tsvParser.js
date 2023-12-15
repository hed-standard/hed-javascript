/**
 * Module for parsing TSV files.
 *
 * Adapted from https://github.com/bids-standard/bids-validator/blob/6fc6d152b52266934575442e61f1477ba18f42ec/bids-validator/validators/tsv/tsvParser.js
 * and https://github.com/bids-standard/bids-validator/blob/a5c63b445e3103bcc0843deac192033a9f0b4c5b/bids-validator/src/files/tsv.ts
 */

const stripBOM = (str) => str.replace(/^\uFEFF/, '')
const normalizeEOL = (str) => str.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
const isContentfulRow = (row) => row && !/^\s*$/.test(row)

/**
 * Parse a TSV file.
 *
 * @param {string} contents The contents of a TSV file.
 * @returns {Map<string, string[]>} The parsed contents of the TSV file.
 */
export function parseTSV(contents) {
  const columns = new Map()
  const rows = stripBOM(normalizeEOL(contents))
    .split('\n')
    .filter(isContentfulRow)
    .map((str) => str.split('\t'))
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
