import isPlainObject from 'lodash/isPlainObject'

import { sidecarValueHasHed } from '../utils'
import { parseHedString } from '../../parser/parser'
import ParsedHedString from '../../parser/parsedHedString'
import { BidsFile } from './basic'
import BidsHedSidecarValidator from '../validator/sidecarValidator'
import { IssueError } from '../../common/issues/issues'

const ILLEGAL_SIDECAR_KEYS = new Set(['hed', 'n/a'])

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
    super(name, file, BidsHedSidecarValidator)
    this.jsonData = jsonData
  }
}

export class BidsSidecar extends BidsJsonFile {
  /**
   * The extracted keys for this sidecar.
   * @type {Map<string, BidsSidecarKey>}
   */
  sidecarKeys
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
        const trimmedSidecarKey = sidecarKey.trim()
        if (ILLEGAL_SIDECAR_KEYS.has(trimmedSidecarKey.toLowerCase())) {
          IssueError.generateAndThrow('illegalSidecarHedKey')
        }
        if (sidecarValueHasHed(sidecarValue)) {
          return [trimmedSidecarKey, new BidsSidecarKey(trimmedSidecarKey, sidecarValue.HED, this)]
        } else {
          this._verifyKeyHasNoDeepHed(sidecarKey, sidecarValue)
          return null
        }
      })
      .filter((x) => x !== null)
    this.sidecarKeys = new Map(sidecarHedTags)
  }

  /**
   * Verify that a column has no deeply nested "HED" keys.
   *
   * @param {string} key An object key.
   * @param {*} value An object value.
   * @throws {IssueError} If an invalid "HED" key is found.
   * @private
   */
  _verifyKeyHasNoDeepHed(key, value) {
    if (key.toUpperCase() === 'HED') {
      IssueError.generateAndThrow('illegalSidecarHedDeepKey')
    }
    if (!isPlainObject(value)) {
      return
    }
    for (const [subkey, subvalue] of Object.entries(value)) {
      this._verifyKeyHasNoDeepHed(subkey, subvalue)
    }
  }

  _categorizeHedStrings() {
    this.hedValueStrings = []
    this.hedCategoricalStrings = []
    this.hedData = new Map()
    for (const [key, sidecarValue] of this.sidecarKeys.entries()) {
      if (sidecarValue.isValueKey) {
        this.hedValueStrings.push(sidecarValue.valueString)
        this.hedData.set(key, sidecarValue.valueString)
      } else {
        this.hedCategoricalStrings.push(...Object.values(sidecarValue.categoryMap))
        this.hedData.set(key, sidecarValue.categoryMap)
      }
    }
  }

  /**
   * Determine whether this file has any HED data.
   *
   * @returns {boolean}
   */
  hasHedData() {
    return this.sidecarKeys.size > 0
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
    for (const [name, sidecarKey] of this.sidecarKeys.entries()) {
      issues.push(...sidecarKey.parseHed(hedSchemas))
      if (sidecarKey.isValueKey) {
        this.parsedHedData.set(name, sidecarKey.parsedValueString)
      } else {
        this.parsedHedData.set(name, sidecarKey.parsedCategoryMap)
      }
    }
    this._generateSidecarColumnSpliceMap()
    return issues
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
        IssueError.generateAndThrow('internalConsistencyError', {
          message: 'Unexpected type found in sidecar parsedHedData map.',
        })
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

export class BidsSidecarKey {
  /**
   * The name of this key.
   * @type {string}
   */
  name
  /**
   * The unparsed category mapping.
   * @type {Object<string, string>}
   */
  categoryMap
  /**
   * The parsed category mapping.
   * @type {Map<string, ParsedHedString>}
   */
  parsedCategoryMap
  /**
   * The unparsed value string.
   * @type {string}
   */
  valueString
  /**
   * The parsed value string.
   * @type {ParsedHedString}
   */
  parsedValueString
  /**
   * Weak reference to the sidecar.
   * @type {WeakRef<BidsSidecar>}
   */
  sidecar

  /**
   * Constructor.
   *
   * @param {string} key The name of this key.
   * @param {string|Object<string, string>} data The data for this key.
   * @param {BidsSidecar} sidecar The parent sidecar.
   */
  constructor(key, data, sidecar) {
    this.name = key
    this.sidecar = new WeakRef(sidecar)
    if (typeof data === 'string') {
      this.valueString = data
    } else if (!isPlainObject(data)) {
      IssueError.generateAndThrow('illegalSidecarHedType', { key: key, file: sidecar.file.relativePath })
    } else {
      this.categoryMap = data
    }
  }

  /**
   * Parse the HED data for this key.
   *
   * @param {Schemas} hedSchemas The HED schema collection.
   * @returns {Issue[]} Any issues found.
   */
  parseHed(hedSchemas) {
    if (this.isValueKey) {
      return this._parseValueString(hedSchemas)
    }
    return this._parseCategory(hedSchemas)
  }

  _parseValueString(hedSchemas) {
    const [parsedString, parsingIssues] = parseHedString(this.valueString, hedSchemas)
    const flatIssues = Object.values(parsingIssues).flat()
    this.parsedValueString = parsedString
    return flatIssues
  }

  _parseCategory(hedSchemas) {
    const issues = []
    this.parsedCategoryMap = new Map()
    for (const [value, string] of Object.entries(this.categoryMap)) {
      const trimmedValue = value.trim()
      if (ILLEGAL_SIDECAR_KEYS.has(trimmedValue.toLowerCase())) {
        IssueError.generateAndThrow('illegalSidecarHedCategoricalValue')
      } else if (typeof string !== 'string') {
        IssueError.generateAndThrow('illegalSidecarHedType', {
          key: value,
          file: this.sidecar.deref()?.file?.relativePath,
        })
      }
      const [parsedString, parsingIssues] = parseHedString(string, hedSchemas)
      this.parsedCategoryMap.set(value, parsedString)
      issues.push(...Object.values(parsingIssues).flat())
    }
    return issues
  }

  /**
   * Whether this key is a categorical key.
   * @returns {boolean}
   */
  get isCategoricalKey() {
    return Boolean(this.categoryMap)
  }

  /**
   * Whether this key is a value key.
   * @returns {boolean}
   */
  get isValueKey() {
    return Boolean(this.valueString)
  }
}

/**
 * Fallback default dataset_description.json file.
 * @deprecated Will be removed in v4.0.0.
 * @type {BidsJsonFile}
 */
export const fallbackDatasetDescription = new BidsJsonFile('./dataset_description.json', null)
