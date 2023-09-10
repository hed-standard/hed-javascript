/**
 * Module for parsing TSV files.
 *
 * Copied from https://github.com/bids-standard/bids-validator/blob/6fc6d152b52266934575442e61f1477ba18f42ec/bids-validator/validators/tsv/tsvParser.js
 */

const stripBOM = (str) => str.replace(/^\uFEFF/, '')
const normalizeEOL = (str) => str.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
const isContentfulRow = (row) => row && !/^\s*$/.test(row)

/**
 * Parse a TSV file.
 *
 * @param {string} contents The contents of a TSV file.
 * @returns {{headers: string[], rows: string[][]}} The parsed contents of the TSV file.
 */
function parseTSV(contents) {
  const content = {
    headers: [],
    rows: [],
  }
  contents = stripBOM(contents)
  content.rows = normalizeEOL(contents)
    .split('\n')
    .filter(isContentfulRow)
    .map((str) => str.split('\t'))
  content.headers = content.rows.length ? content.rows[0] : []
  return content
}

export default parseTSV
