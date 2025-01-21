import isPlainObject from 'lodash/isPlainObject'

import { sidecarValueHasHed } from '../utils'
import { parseHedString } from '../../parser/parser'
import ParsedHedString from '../../parser/parsedHedString'
import { BidsFile } from './basic'
import BidsHedSidecarValidator from '../validator/sidecarValidator'
import { IssueError } from '../../common/issues/issues'
import { DefinitionManager, Definition } from '../../parser/definitionManager'

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
   * The extracted keys for this bidsFile (string --> BidsSidecarKey)
   * @type {Map}
   */
  sidecarKeys
  /**
   * The extracted HED data for this bidsFile (string --> string | Object: string, string
   * @type {Map}
   */
  hedData
  /**
   * The parsed HED data for this bidsFile (string --> ParsedHedString | Map: string --> ParsedHedString
   * @type {Map}
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
   * The mapping of column splice references (string --> Set of string)
   * @type {Map}
   */
  columnSpliceMapping
  /**
   * The set of column splice references.
   * @type {Set<string>}
   */
  columnSpliceReferences

  /**
   * The object that manages definitions
   * @type {DefinitionManager}
   */
  definitions

  /**
   * Constructor.
   *
   * @param {string} name The name of the bidsFile file.
   * @param {Object} sidecarData The raw JSON data.
   * @param {Object} file The file object representing this file.
   * @param {DefinitionManager } defManager - The external definitions to use
   */
  constructor(name, sidecarData = {}, file, defManager = null) {
    super(name, sidecarData, file)
    this.columnSpliceMapping = new Map()
    this.columnSpliceReferences = new Set()
    this._setDefinitions(defManager)
    this._filterHedStrings()
    this._categorizeHedStrings()
  }

  _setDefinitions(defManager) {
    if (defManager instanceof DefinitionManager) {
      this.definitions = defManager
    } else if (!defManager) {
      this.definitions = new DefinitionManager()
    } else {
      IssueError.generateAndThrow('internalError', {
        message: 'Improper format for defManager parameter -- must be null or DefinitionManager',
      })
    }
  }

  /**
   * Create the bidsFile key map from the JSON.
   * @private
   */
  _filterHedStrings() {
    this.sidecarKeys = new Map(
      Object.entries(this.jsonData)
        .map(([key, value]) => {
          const trimmedKey = key.trim()
          const lowerKey = trimmedKey.toLowerCase()

          if (ILLEGAL_SIDECAR_KEYS.has(lowerKey)) {
            IssueError.generateAndThrow('illegalSidecarHedKey')
          }

          if (sidecarValueHasHed(value)) {
            return [trimmedKey, new BidsSidecarKey(trimmedKey, value.HED, this)]
          }

          this._verifyKeyHasNoDeepHed(key, value)
          return null
        })
        .filter(Boolean),
    )
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

  /**
   * Categorize the column strings into value strings and categorical strings
   * @private
   */
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
   * Parse this bidsFile's HED strings within the bidsFile structure.
   *
   * The parsed strings are placed into {@link parsedHedData}.
   *
   * @param {Schemas} hedSchemas - The HED schema collection.
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
   * Generate a mapping of an individual BIDS bidsFile's curly brace references.
   *
   * @private
   */
  _generateSidecarColumnSpliceMap() {
    this.columnSpliceMapping = new Map()
    this.columnSpliceReferences = new Set()

    for (const [sidecarKey, hedData] of this.parsedHedData) {
      if (hedData instanceof ParsedHedString) {
        this._parseValueSplice(sidecarKey, hedData)
      } else if (hedData instanceof Map) {
        this._parseCategorySplice(sidecarKey, hedData)
      } else if (hedData) {
        IssueError.generateAndThrow('internalConsistencyError', {
          message: 'Unexpected type found in bidsFile parsedHedData map.',
        })
      }
    }
  }

  _parseValueSplice(sidecarKey, hedData) {
    if (hedData.columnSplices.length > 0) {
      const keyReferences = this._processColumnSplices(new Set(), hedData.columnSplices)
      this.columnSpliceMapping.set(sidecarKey, keyReferences)
    }
  }

  _parseCategorySplice(sidecarKey, hedData) {
    let keyReferences = null
    for (const valueString of hedData.values()) {
      if (valueString?.columnSplices.length > 0) {
        keyReferences = this._processColumnSplices(keyReferences, valueString.columnSplices)
      }
    }
    if (keyReferences instanceof Set) {
      this.columnSpliceMapping.set(sidecarKey, keyReferences)
    }
  }

  /**
   * Add a list of columnSplices to a key map.
   * @param {Set} keyReferences
   * @param {ParsedHedColumnSplice[]} columnSplices
   * @returns {*|Set<any>}
   * @private
   */
  _processColumnSplices(keyReferences, columnSplices) {
    keyReferences ??= new Set()
    for (const columnSplice of columnSplices) {
      keyReferences.add(columnSplice.originalTag)
      this.columnSpliceReferences.add(columnSplice.originalTag)
    }
    return keyReferences
  }

  /**
   * The extracted HED strings.
   * @returns {string[]}
   */
  get hedStrings() {
    return this.hedValueStrings.concat(this.hedCategoricalStrings)
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
   * Weak reference to the bidsFile.
   * @type {BidsSidecar}
   */
  sidecar

  hasDefinitions

  /**
   * Constructor.
   *
   * @param {string} key The name of this key.
   * @param {string|Object<string, string>} data The data for this key.
   * @param {BidsSidecar} sidecar The parent bidsFile.
   */
  constructor(key, data, sidecar) {
    this.name = key
    this.hasDefinitions = false // May reset to true when definitions for this key are checked
    this.sidecar = sidecar
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

  /**
   * Parse the value string in a bidsFile
   * @param {Schemas} hedSchemas - The HED schemas to use.
   * @returns {Issue[]}
   * @private
   *
   * Note: value strings cannot contain definitions
   */
  _parseValueString(hedSchemas) {
    const [parsedString, parsingIssues] = parseHedString(this.valueString, hedSchemas, false, true)
    this.parsedValueString = parsedString
    return parsingIssues
  }

  /**
   * Parse the categorical values associated with this key.
   * @param {Schemas} hedSchemas - The HED schemas used to check against.
   * @returns {Issue[]} - A list of issues if any
   * @private
   */
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
          file: this.sidecar?.file?.relativePath,
        })
      }
      const [parsedString, parsingIssues] = parseHedString(string, hedSchemas, true, true)
      this.parsedCategoryMap.set(value, parsedString)
      issues.push(...parsingIssues)
      if (parsingIssues.length === 0) {
        issues.push(...this._checkDefinitions(parsedString))
      }
    }
    return issues
  }

  _checkDefinitions(parsedString) {
    const issues = []
    for (const group of parsedString.tagGroups) {
      if (!group.isDefinitionGroup) {
        continue
      }
      this.hasDefinitions = true
      const [def, defIssues] = Definition.createDefinitionFromGroup(group)
      if (defIssues.length > 0) {
        issues.push(...defIssues)
      } else {
        issues.push(...this.sidecar.definitions.addDefinition(def))
      }
    }
    return issues
  }

  /**
   * Whether this key is a value key.
   * @returns {boolean}
   */
  get isValueKey() {
    return Boolean(this.valueString)
  }
}
