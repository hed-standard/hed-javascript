import { sidecarValueHasHed } from '../utils'
import { generateIssue } from '../../common/issues/issues'
import { parseHedString } from '../../parser/main'
import ParsedHedString from '../../parser/parsedHedString'
import { BidsFile } from './basic'

/**
 * A BIDS JSON file.
 */
export class BidsJsonFile extends BidsFile {
  /**
   * This file's JSON data.
   * @type {object}
   */
  jsonData

  constructor(name, jsonData, file) {
    super(name, file)
    this.jsonData = jsonData
  }
}

export class BidsSidecar extends BidsJsonFile {
  /**
   * The extracted HED data for this sidecar.
   * @type {Map<string, string|Object<string, string>>}
   */
  hedData
  /**
   * The parsed HED data for this sidecar.
   * @type {Map<string, ParsedHedString|Map<string, ParsedHedString>>}
   */
  parsedHedData
  /**
   * The extracted HED value strings.
   * @type {string[]}
   */
  hedValueStrings
  /**
   * The extracted HED categorical strings.
   * @type {string[]}
   */
  hedCategoricalStrings
  /**
   * The mapping of column splice references.
   * @type {Map<string, Set<string>>}
   */
  columnSpliceMapping
  /**
   * The set of column splice references.
   * @type {Set<string>}
   */
  columnSpliceReferences

  /**
   * Constructor.
   *
   * @param {string} name The name of the sidecar file.
   * @param {Object} sidecarData The raw JSON data.
   * @param {Object} file The file object representing this file.
   */
  constructor(name, sidecarData = {}, file) {
    super(name, sidecarData, file)

    this._filterHedStrings()
    this._categorizeHedStrings()
  }

  _filterHedStrings() {
    const sidecarHedTags = Object.entries(this.jsonData)
      .map(([sidecarKey, sidecarValue]) => {
        if (sidecarValueHasHed(sidecarValue)) {
          return [sidecarKey, sidecarValue.HED]
        } else {
          return []
        }
      })
      .filter((x) => x.length > 0)
    this.hedData = new Map(sidecarHedTags)
  }

  _categorizeHedStrings() {
    this.hedValueStrings = []
    this.hedCategoricalStrings = []
    for (const sidecarValue of this.hedData.values()) {
      if (typeof sidecarValue === 'string') {
        this.hedValueStrings.push(sidecarValue)
      } else {
        this.hedCategoricalStrings.push(...Object.values(sidecarValue))
      }
    }
  }

  /**
   * Parse this sidecar's HED strings within the sidecar structure.
   *
   * The parsed strings are placed into {@link parsedHedData}.
   *
   * @param {Schemas} hedSchemas The HED schema collection.
   * @returns {Issue[]} Any issues found.
   */
  parseHedStrings(hedSchemas) {
    this.parsedHedData = new Map()
    const issues = []
    for (const [key, value] of this.hedData) {
      issues.push(...this._parseSidecarKey(key, value, hedSchemas))
    }
    this._generateSidecarColumnSpliceMap()
    return issues
  }

  _parseSidecarKey(key, data, hedSchemas) {
    if (typeof data === 'string') {
      return this._parseHedString(this.parsedHedData, key, data, hedSchemas)
    } else if (data !== Object(data)) {
      return [generateIssue('illegalSidecarHedType', { key: key, file: this.name })]
    }
    const issues = []
    const keyMap = new Map()
    for (const [value, string] of Object.entries(data)) {
      issues.push(...this._parseHedString(keyMap, value, string, hedSchemas))
    }
    this.parsedHedData.set(key, keyMap)
    return issues
  }

  _parseHedString(map, key, string, hedSchemas) {
    const [parsedString, parsingIssues] = parseHedString(string, hedSchemas)
    map.set(key, parsedString)
    return Object.values(parsingIssues).flat()
  }

  /**
   * Generate a mapping of an individual BIDS sidecar's curly brace references.
   *
   * @private
   */
  _generateSidecarColumnSpliceMap() {
    this.columnSpliceMapping = new Map()
    this.columnSpliceReferences = new Set()

    for (const [sidecarKey, hedData] of this.parsedHedData) {
      if (hedData === null) {
        // Skipped
      } else if (hedData instanceof ParsedHedString) {
        if (hedData.columnSplices.length === 0) {
          continue
        }

        const keyReferences = new Set()

        for (const columnSplice of hedData.columnSplices) {
          keyReferences.add(columnSplice.originalTag)
          this.columnSpliceReferences.add(columnSplice.originalTag)
        }

        this.columnSpliceMapping.set(sidecarKey, keyReferences)
      } else if (hedData instanceof Map) {
        let keyReferences = null

        for (const valueString of hedData.values()) {
          if (valueString === null || valueString.columnSplices.length === 0) {
            continue
          }

          keyReferences ??= new Set()

          for (const columnSplice of valueString.columnSplices) {
            keyReferences.add(columnSplice.originalTag)
            this.columnSpliceReferences.add(columnSplice.originalTag)
          }
        }

        if (keyReferences instanceof Set) {
          this.columnSpliceMapping.set(sidecarKey, keyReferences)
        }
      } else {
        throw new Error('Unexpected type found in sidecar parsedHedData map.')
      }
    }
  }

  /**
   * The extracted HED strings.
   * @returns {string[]}
   */
  get hedStrings() {
    return this.hedValueStrings.concat(this.hedCategoricalStrings)
  }

  /**
   * An alias for {@link jsonData}.
   * @returns {Object}
   */
  get sidecarData() {
    return this.jsonData
  }
}

/**
 * Fallback default dataset_description.json file.
 * @deprecated Will be removed in v4.0.0.
 * @type {BidsJsonFile}
 */
export const fallbackDatasetDescription = new BidsJsonFile('./dataset_description.json', null)
