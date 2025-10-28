/**
 * This module provides functions for parsing TSV files.
 *
 * @module bids/tsvParser
 */

export type ParsedTSV = Map<string, string[]>
type OldParsedTSV = {
  headers: string[]
  rows: string[][]
}

const stripBOM = (str: string) => str.replace(/^\uFEFF/, '')
const normalizeEOL = (str: string) => str.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
const isContentfulRow = (row: string) => row && !/^\s*$/.test(row)

/**
 * Parse a TSV file.
 *
 * @param contents The contents of a TSV file.
 * @returns The parsed contents of the TSV file.
 */
export function parseTSV(contents: string): ParsedTSV {
  const rows = stripBOM(normalizeEOL(contents))
    .split('\n')
    .filter(isContentfulRow)
    .map((str) => str.split('\t').map((cell) => cell.trim()))

  if (rows.length === 0) {
    return new Map<string, string[]>()
  }

  const headers = rows[0]

  return createTsvMap(headers, rows)
}

/**
 * Convert parsed TSV file data from the old BIDS format to the new BIDS format.
 *
 * @param oldParsedTsv Parsed TSV data using the old format
 * @returns The parsed contents of the TSV file, using the new format.
 */
export function convertParsedTSVData(oldParsedTsv: OldParsedTSV): ParsedTSV {
  return createTsvMap(oldParsedTsv.headers, oldParsedTsv.rows)
}

/**
 * Create a parsed TSV map.
 *
 * @param headers The list of headers.
 * @param rows The grid of rows and cells.
 * @returns The parsed contents of the TSV file.
 */
function createTsvMap(headers: string[], rows: string[][]): ParsedTSV {
  const columns = new Map<string, string[]>()

  for (const header of headers) {
    columns.set(header, [])
  }
  for (let i = 1; i < rows.length; i++) {
    for (let j = 0; j < headers.length; j++) {
      columns.get(headers[j]).push(rows[i][j])
    }
  }

  return columns
}

export default parseTSV
