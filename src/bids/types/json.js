/**
 * This module contains classes for representing BIDS JSON files, including {@link BidsJsonFile} and {@link BidsSidecar}.
 *
 * @module json
 */
import isPlainObject from 'lodash/isPlainObject'

import { parseHedString } from '../../parser/parser'
import ParsedHedString from '../../parser/parsedHedString'
import { BidsFile } from './file'
import BidsHedSidecarValidator from '../validator/sidecarValidator'
import { IssueError, updateIssueParameters } from '../../issues/issues'
import { DefinitionManager, Definition } from '../../parser/definitionManager'

const ILLEGAL_SIDECAR_KEYS = new Set(['hed', 'n/a'])

/**
 * A BIDS JSON file.
 */
export class BidsJsonFile extends BidsFile {
  /**
   * This file's JSON data.
   * @type {Object}
   */
  jsonData

  /**
   * Constructor for a BIDS JSON file.
   *
   * Note: This class is used for non-sidecars such as dataset_description.json and does not have a validation method.
   *
   * @param {string} name The name of the JSON file.
   * @param {Object} file The file object representing this file.
   * @param {Object} jsonData The JSON data for this file.
   */
  constructor(name, file, jsonData) {
    super(name, file, BidsHedSidecarValidator)
    this.jsonData = jsonData
  }

  /**
   * Parse a BIDS JSON file from a BIDS dataset path.
   *
   * @param {string} datasetRoot The root path of the dataset.
   * @param {string} relativePath The relative path of the file within the dataset.
   * @returns {Promise<BidsJsonFile>} The built JSON file object.
   */
  static async createFromBidsDatasetPath(datasetRoot, relativePath) {
    const [contents, fileObject] = await BidsFile.readBidsFileFromDatasetPath(datasetRoot, relativePath)
    const jsonData = JSON.parse(contents)
    return new BidsJsonFile(relativePath, fileObject, jsonData)
  }
}

/**
 * @property {Map} sidecarKeys
 * @property {Map} hedData
 * @property {Map} parsedHedData
 * @property {string[]} hedValueStrings
 * @property {string[]} hedCategoricalStrings
 * @property {Map} columnSpliceMapping
 * @property {Set<string>} columnSpliceReferences
 * @property {DefinitionManager} definitions
 */
export class BidsSidecar extends BidsJsonFile {
  /**
   * The extracted keys for this sidecar (string --> BidsSidecarKey)
   * @type {Map}
   */
  sidecarKeys

  /**
   * The extracted HED data for this sidecar (string --> string | Object: string, string
   * @type {Map}
   */
  hedData

  /**
   * The parsed HED data for this sidecar (string --> ParsedHedString | Map: string --> ParsedHedString).
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
   * The mapping of column splice references (string --> Set of string).
   * @type {Map}
   */
  columnSpliceMapping

  /**
   * The set of column splice references.
   * @type {Set<string>}
   */
  columnSpliceReferences

  /**
   * The object that manages definitions.
   * @type {DefinitionManager}
   */
  definitions

  /**
   * Constructor for a BIDS sidecar. Used for files like events.json, participants.json, etc.
   *
   * @param {string} name The name of the sidecar file.
   * @param {Object} file The file object representing this file.
   * @param {Object} sidecarData The raw JSON data.
   * @param {DefinitionManager} defManager The external definitions to use.
   */
  constructor(name, file, sidecarData = {}, defManager = undefined) {
    super(name, file, sidecarData)
    this.columnSpliceMapping = new Map()
    this.columnSpliceReferences = new Set()
    this._setDefinitions(defManager)
    this._filterHedStrings()
    this._categorizeHedStrings()
  }

  /**
   * Parse a BIDS sidecar from a BIDS dataset path.
   *
   * @param {string} datasetRoot The root path of the dataset.
   * @param {string} relativePath The relative path of the file within the dataset.
   * @returns {Promise<BidsSidecar>} The built sidecar object.
   */
  static async createFromBidsDatasetPath(datasetRoot, relativePath) {
    const [contents, fileObject] = await BidsFile.readBidsFileFromDatasetPath(datasetRoot, relativePath)
    const jsonData = JSON.parse(contents)
    return new BidsSidecar(relativePath, fileObject, jsonData)
  }

  /**
   * Determine whether this file has any HED data.
   *
   * @returns {boolean}
   */
  get hasHedData() {
    return this.sidecarKeys.size > 0
  }

  /**
   * Parse this sidecar's HED strings within the sidecar structure.
   *
   * The parsed strings are placed into {@link parsedHedData}.
   *
   * @param {Schemas} hedSchemas - The HED schema collection.
   * @param {boolean} fullValidation - True if full validation should be performed.
   * @returns {Array} [Issue[], Issue[]] Any errors and warnings found
   */
  parseHed(hedSchemas, fullValidation = false) {
    this.parsedHedData = new Map()
    const errors = []
    const warnings = []
    for (const [name, sidecarKey] of this.sidecarKeys.entries()) {
      const [errorIssues, warningIssues] = sidecarKey.parseHed(
        hedSchemas,
        fullValidation && !this.columnSpliceReferences.has(name),
      )
      errors.push(...errorIssues)
      warnings.push(...warningIssues)
      if (sidecarKey.isValueKey) {
        this.parsedHedData.set(name, sidecarKey.parsedValueString)
      } else {
        this.parsedHedData.set(name, sidecarKey.parsedCategoryMap)
      }
    }
    this._generateSidecarColumnSpliceMap()
    return [errors, warnings]
  }

  /**
   * Set the definition manager for this sidecar.
   * @param defManager
   * @private
   */
  _setDefinitions(defManager) {
    if (defManager instanceof DefinitionManager) {
      this.definitions = defManager
    } else if (defManager == null) {
      this.definitions = new DefinitionManager()
    } else {
      IssueError.generateAndThrow('invalidDefinitionManager', {
        defManager: String(defManager),
        filePath: this.file.path,
      })
    }
  }

  /**
   * Create the sidecar key map from the JSON.
   * @private
   */
  _filterHedStrings() {
    this.sidecarKeys = new Map(
      Object.entries(this.jsonData)
        .map(([key, value]) => {
          const trimmedKey = key.trim()
          const lowerKey = trimmedKey.toLowerCase()
          if (ILLEGAL_SIDECAR_KEYS.has(lowerKey)) {
            IssueError.generateAndThrow('illegalSidecarHedKey', {
              filePath: this.file.path,
              sidecarKey: trimmedKey,
            })
          }

          if (BidsSidecar._sidecarValueHasHed(value)) {
            return [trimmedKey, new BidsSidecarKey(trimmedKey, value.HED, this)]
          }

          this._verifyKeyHasNoDeepHed(key, value, key)
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
   * @param {string|null} topKey The top-level key, if any.
   * @throws {IssueError} If an invalid "HED" key is found.
   * @private
   */
  _verifyKeyHasNoDeepHed(key, value, topKey = null) {
    if (key.toUpperCase() === 'HED') {
      IssueError.generateAndThrow('illegalSidecarHedDeepKey', {
        key: topKey,
        filePath: this.file.path,
        sidecarKey: topKey,
      })
    }
    if (!isPlainObject(value)) {
      return
    }
    for (const [subkey, subvalue] of Object.entries(value)) {
      this._verifyKeyHasNoDeepHed(subkey, subvalue, topKey)
    }
  }

  /**
   * Determine whether a sidecar value has HED data.
   *
   * @param {Object} sidecarValue A BIDS sidecar value.
   * @returns {boolean} Whether the sidecar value has HED data.
   * @private
   */
  static _sidecarValueHasHed(sidecarValue) {
    return sidecarValue !== null && typeof sidecarValue === 'object' && 'HED' in sidecarValue
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
      } else if (sidecarValue.categoryMap) {
        this.hedCategoricalStrings.push(...sidecarValue.categoryMap.values())
        this.hedData.set(key, sidecarValue.categoryMap)
      }
    }
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
      if (hedData instanceof ParsedHedString) {
        this._parseValueSplice(sidecarKey, hedData)
      } else if (hedData instanceof Map) {
        this._parseCategorySplice(sidecarKey, hedData)
      } else if (hedData) {
        IssueError.generateAndThrow('illegalSidecarData', { sidecarKey: sidecarKey, filePath: this.file.path })
      }
    }
  }

  /**
   *
   * @param {BidsSidecarKey} sidecarKey - The column to be checked for column splices.
   * @param {ParsedHedString} hedData - The parsed HED string to check for column splices.
   * @private
   */
  _parseValueSplice(sidecarKey, hedData) {
    if (hedData.columnSplices.length > 0) {
      const keyReferences = this._processColumnSplices(new Set(), hedData.columnSplices)
      this.columnSpliceMapping.set(sidecarKey, keyReferences)
    }
  }

  /**
   *
   * @param {BidsSidecarKey} sidecarKey - The column to be checked for column splices.
   * @param {Map<string, ParsedHedString>} hedData - A Map with columnValue --> parsed HED string for a sidecar key to check for column splices.
   * @private
   */
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
   * Add a list of columnSplices to a key set.
   * @param {Set<string>|null} keyReferences
   * @param {ParsedHedColumnSplice[]} columnSplices
   * @returns {Set<string>}
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
}

export class BidsSidecarKey {
  /**
   * The name of this key -- usually corresponds to a column name in a TSV file.
   * @type {string}
   */
  name

  /**
   * The unparsed category mapping.
   * @type {Map<string, string>}
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
   * @type {BidsSidecar}
   */
  sidecar

  /**
   * Indication of whether this key is for definitions.
   * @type {Boolean}
   */
  hasDefinitions

  /**
   * Constructor for BidsSidecarKey.
   *
   * @param {string} key The name of this key.
   * @param {string|Object<string, string>} data The data for this key.
   * @param {BidsSidecar} sidecar The parent sidecar.
   */
  constructor(key, data, sidecar) {
    this.name = key
    this.hasDefinitions = false // May reset to true when definitions for this key are checked
    this.sidecar = sidecar
    if (typeof data === 'string') {
      this.valueString = data
    } else if (!isPlainObject(data)) {
      IssueError.generateAndThrow('illegalSidecarHedType', { sidecarKey: key, filePath: sidecar.file.path })
    } else {
      this.categoryMap = new Map(Object.entries(data))
    }
  }

  /**
   * Parse the HED data for this key.
   *
   * ###Note: This sets the parsedHedData as a side effect.
   *
   * @param {Schemas} hedSchemas The HED schema collection.
   * @param {boolean} fullValidation True if full validation should be performed.
   * @returns {Array} - [Issue[], Issues[]] Errors and warnings that result from parsing.
   */
  parseHed(hedSchemas, fullValidation = false) {
    if (this.isValueKey) {
      return this._parseValueString(hedSchemas, fullValidation)
    }
    return this._parseCategory(hedSchemas, fullValidation) // This is a Map of string to ParsedHedString
  }

  /**
   * Parse the value string in a sidecar.
   *
   * ### Note:
   *  The value strings cannot contain definitions.
   *
   * @param {Schemas} hedSchemas - The HED schemas to use.
   * @param {boolean} fullValidation - True if full validation should be performed.
   * @returns {Array} - [Issue[], Issue[]] - Errors due for the value.
   * @private
   */
  _parseValueString(hedSchemas, fullValidation) {
    const [parsedString, errorIssues, warningIssues] = parseHedString(
      this.valueString,
      hedSchemas,
      false,
      true,
      fullValidation,
    )
    this.parsedValueString = parsedString
    const updateParams = { sidecarKey: this.name, filePath: this.sidecar?.file?.path }
    updateIssueParameters(errorIssues, updateParams)
    updateIssueParameters(warningIssues, updateParams)
    return [errorIssues, warningIssues]
  }

  /**
   * Parse the categorical values associated with this key.
   * @param {Schemas} hedSchemas - The HED schemas used to check against.
   * @param {boolean} fullValidation - True if full validation should be performed.
   * @returns {Array} - Array[Issue[], Issue[]] A list of error issues and warning issues.
   * @private
   */
  _parseCategory(hedSchemas, fullValidation) {
    this.parsedCategoryMap = new Map()
    const errors = []
    const warnings = []
    const updateParams = { sidecarKey: this.name, filePath: this.sidecar?.file?.path }
    for (const [value, string] of this.categoryMap) {
      const trimmedValue = value.trim()
      if (ILLEGAL_SIDECAR_KEYS.has(trimmedValue.toLowerCase())) {
        IssueError.generateAndThrow('illegalSidecarHedCategoricalValue', updateParams)
      } else if (typeof string !== 'string') {
        IssueError.generateAndThrow('illegalSidecarHedType', updateParams)
      }
      const [parsedString, errorIssues, warningIssues] = parseHedString(string, hedSchemas, true, true, fullValidation)
      this.parsedCategoryMap.set(value, parsedString)
      updateIssueParameters(warningIssues, updateParams)
      warnings.push(...warningIssues)
      updateIssueParameters(errorIssues, updateParams)
      errors.push(...errorIssues)
      if (errorIssues.length === 0) {
        const defIssues = this._checkDefinitions(parsedString)
        updateIssueParameters(defIssues, updateParams)
        errors.push(...defIssues)
      }
    }
    return [errors, warnings]
  }

  /**
   * Check for definitions in the HED string.
   * @param {ParsedHedString} parsedString - The string to check for definitions.
   * @returns {Issue[]} - Errors that occur.
   * @private
   */
  _checkDefinitions(parsedString) {
    const errors = []
    for (const group of parsedString.tagGroups) {
      if (!group.isDefinitionGroup) {
        continue
      }
      this.hasDefinitions = true
      const [def, defIssues] = Definition.createDefinitionFromGroup(group)
      if (defIssues.length > 0) {
        errors.push(...defIssues)
      } else {
        errors.push(...this.sidecar.definitions.addDefinition(def))
      }
    }
    return errors
  }

  /**
   * Whether this key is a value key.
   * @returns {boolean}
   */
  get isValueKey() {
    return Boolean(this.valueString)
  }
}
