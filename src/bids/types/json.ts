/**
 * This module contains classes for representing BIDS JSON files, including {@link BidsJsonFile} and {@link BidsSidecar}.
 *
 * @module bids/types/json
 */
import isPlainObject from 'lodash/isPlainObject'

import { parseHedString } from '../../parser/parser'
import ParsedHedString from '../../parser/parsedHedString'
import { BidsFile } from './file'
import BidsHedSidecarValidator from '../validator/sidecarValidator'
import { IssueError, addIssueParameters, type Issue } from '../../issues/issues'
import { DefinitionManager, Definition } from '../../parser/definitionManager'
import { type HedSchemas } from '../../schema/containers'
import { type ParsedHedColumnSplice } from '../../parser/parsedHedColumnSplice'

const ILLEGAL_SIDECAR_KEYS = new Set(['hed', 'n/a'])

type BidsSidecarHedEntry = { HED: unknown }

/**
 * A BIDS JSON file.
 */
export class BidsJsonFile extends BidsFile {
  /**
   * This file's JSON data.
   */
  public readonly jsonData: Record<string, unknown>

  /**
   * Constructor for a BIDS JSON file.
   *
   * Note: This class is used for non-sidecars such as dataset_description.json and does not have a validation method.
   *
   * @param name The name of the JSON file.
   * @param file The file object representing this file.
   * @param jsonData The JSON data for this file.
   */
  public constructor(name: string, file: object, jsonData: Record<string, unknown>) {
    super(name, file, BidsHedSidecarValidator)
    this.jsonData = jsonData
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
   * The extracted keys for this sidecar.
   */
  sidecarKeys: Map<string, BidsSidecarKey>

  /**
   * The extracted HED data for this sidecar.
   */
  hedData: Map<string, string | Map<string, string>>

  /**
   * The parsed HED data for this sidecar.
   */
  parsedHedData: Map<string, ParsedHedString | Map<string, ParsedHedString>>

  /**
   * The extracted HED value strings.
   */
  hedValueStrings: string[]

  /**
   * The extracted HED categorical strings.
   */
  hedCategoricalStrings: string[]

  /**
   * The mapping of column splice references.
   */
  columnSpliceMapping: Map<string, Set<string>>

  /**
   * The set of column splice references.
   */
  columnSpliceReferences: Set<string>

  /**
   * The object that manages definitions.
   */
  definitions: DefinitionManager

  /**
   * Constructor for a BIDS sidecar. Used for files like events.json, participants.json, etc.
   *
   * @param name The name of the sidecar file.
   * @param file The file object representing this file.
   * @param sidecarData The raw JSON data.
   * @param defManager The external definitions to use.
   */
  public constructor(
    name: string,
    file: object,
    sidecarData: Record<string, unknown> = {},
    defManager: DefinitionManager | null = null,
  ) {
    super(name, file, sidecarData)
    this.columnSpliceMapping = new Map()
    this.columnSpliceReferences = new Set()
    this._setDefinitions(defManager)
    this._filterHedStrings()
    this._categorizeHedStrings()
  }

  /**
   * Determine whether this file has any HED data.
   *
   * @returns {boolean}
   */
  public get hasHedData(): boolean {
    return this.sidecarKeys.size > 0
  }

  /**
   * Parse this sidecar's HED strings within the sidecar structure.
   *
   * Note: This is called during the sidecar validation process.
   *
   * The parsed strings are placed into {@link parsedHedData}.
   *
   * @param hedSchemas The HED schema collection.
   * @param fullValidation True if full validation should be performed.
   * @returns Any errors and warnings found.
   */
  parseSidecarKeys(hedSchemas: HedSchemas, fullValidation: boolean = false): [Issue[], Issue[]] {
    this.parsedHedData = new Map()
    const errors = []
    const warnings = []
    for (const [name, sidecarKey] of this.sidecarKeys.entries()) {
      const [errorIssues, warningIssues] = sidecarKey.parseHed(
        hedSchemas,
        fullValidation && !this.columnSpliceReferences.has(name),
      )
      const updateParams = { sidecarKey: name, filePath: this.file?.path }
      addIssueParameters(errorIssues, updateParams)
      addIssueParameters(warningIssues, updateParams)
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
   * @param defManager The definition manager.
   */
  private _setDefinitions(defManager: DefinitionManager | null): void {
    if (defManager instanceof DefinitionManager) {
      this.definitions = defManager
    } else if (defManager == null) {
      this.definitions = new DefinitionManager()
    } else {
      IssueError.generateAndThrow('invalidDefinitionManager', {
        defManager: String(defManager),
        filePath: this.file?.path,
      })
    }
  }

  /**
   * Create the sidecar key map from the JSON.
   */
  private _filterHedStrings(): void {
    this.sidecarKeys = new Map(
      Object.entries(this.jsonData)
        .map(([key, value]): [string, BidsSidecarKey] | null => {
          const trimmedKey = key.trim()
          const lowerKey = trimmedKey.toLowerCase()
          if (ILLEGAL_SIDECAR_KEYS.has(lowerKey)) {
            IssueError.generateAndThrow('illegalSidecarHedKey', {
              filePath: this.file?.path,
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
   * @param key An object key.
   * @param value An object value.
   * @param topKey The top-level key, if any.
   * @throws {IssueError} If an invalid "HED" key is found.
   */
  private _verifyKeyHasNoDeepHed(key: string, value: unknown, topKey: string | null = null): void {
    if (key.toUpperCase() === 'HED') {
      IssueError.generateAndThrow('illegalSidecarHedDeepKey', {
        key: topKey,
        filePath: this.file?.path,
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
   * @param sidecarValue A BIDS sidecar value.
   * @returns Whether the sidecar value has HED data.
   */
  private static _sidecarValueHasHed(sidecarValue: unknown): sidecarValue is BidsSidecarHedEntry {
    return sidecarValue !== null && typeof sidecarValue === 'object' && 'HED' in sidecarValue
  }

  /**
   * Categorize the column strings into value strings and categorical strings
   */
  private _categorizeHedStrings(): void {
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
   */
  private _generateSidecarColumnSpliceMap(): void {
    this.columnSpliceMapping = new Map()
    this.columnSpliceReferences = new Set()

    for (const [sidecarKey, hedData] of this.parsedHedData) {
      if (hedData instanceof ParsedHedString) {
        this._parseValueSplice(sidecarKey, hedData)
      } else if (hedData instanceof Map) {
        this._parseCategorySplice(sidecarKey, hedData)
      } else if (hedData) {
        IssueError.generateAndThrow('illegalSidecarData', { sidecarKey: sidecarKey, filePath: this.file?.path })
      }
    }
  }

  /**
   *
   * @param sidecarKey The column to be checked for column splices.
   * @param hedData The parsed HED string to check for column splices.
   */
  private _parseValueSplice(sidecarKey: string, hedData: ParsedHedString): void {
    if (hedData.columnSplices.length > 0) {
      const keyReferences = this._processColumnSplices(new Set(), hedData.columnSplices)
      this.columnSpliceMapping.set(sidecarKey, keyReferences)
    }
  }

  /**
   *
   * @param sidecarKey The column to be checked for column splices.
   * @param hedData A Map with columnValue --> parsed HED string for a sidecar key to check for column splices.
   */
  private _parseCategorySplice(sidecarKey: string, hedData: Map<string, ParsedHedString>): void {
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
   *
   * @param keyReferences
   * @param columnSplices
   * @returns
   */
  private _processColumnSplices(
    keyReferences: Set<string> | null,
    columnSplices: ParsedHedColumnSplice[],
  ): Set<string> {
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
   */
  readonly name: string

  /**
   * The unparsed category mapping.
   */
  readonly categoryMap: Map<string, string>

  /**
   * The parsed category mapping.
   */
  parsedCategoryMap: Map<string, ParsedHedString>

  /**
   * The unparsed value string.
   */
  readonly valueString: string

  /**
   * The parsed value string.
   */
  parsedValueString: ParsedHedString

  /**
   * Weak reference to the sidecar.
   */
  readonly sidecar: BidsSidecar

  /**
   * Indication of whether this key is for definitions.
   */
  hasDefinitions: boolean

  /**
   * Constructor for BidsSidecarKey.
   *
   * @param key The name of this key.
   * @param data The data for this key.
   * @param sidecar The parent sidecar.
   */
  public constructor(key: string, data: unknown, sidecar: BidsSidecar) {
    this.name = key
    this.hasDefinitions = false // May reset to true when definitions for this key are checked
    this.sidecar = sidecar
    if (typeof data === 'string') {
      this.valueString = data
    } else if (!isPlainObject(data)) {
      IssueError.generateAndThrow('illegalSidecarHedType', { sidecarKey: key, filePath: sidecar?.file?.path })
    } else {
      this.categoryMap = new Map(Object.entries(data))
    }
  }

  /**
   * Parse the HED data for this key.
   *
   * ###Note: This sets the parsedHedData as a side effect.
   *
   * @param hedSchemas The HED schema collection.
   * @param fullValidation True if full validation should be performed.
   * @returns Errors and warnings that result from parsing.
   */
  public parseHed(hedSchemas: HedSchemas, fullValidation: boolean = false): [Issue[], Issue[]] {
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
   * @param hedSchemas The HED schemas to use.
   * @param fullValidation True if full validation should be performed.
   * @returns Errors due for the value.
   */
  private _parseValueString(hedSchemas: HedSchemas, fullValidation: boolean): [Issue[], Issue[]] {
    const [parsedString, errorIssues, warningIssues] = parseHedString(
      this.valueString,
      hedSchemas,
      false,
      true,
      fullValidation,
    )
    this.parsedValueString = parsedString
    return [errorIssues, warningIssues]
  }

  /**
   * Parse the categorical values associated with this key.
   * @param hedSchemas The HED schemas used to check against.
   * @param fullValidation True if full validation should be performed.
   * @returns A list of error issues and warning issues.
   */
  private _parseCategory(hedSchemas: HedSchemas, fullValidation: boolean): [Issue[], Issue[]] {
    this.parsedCategoryMap = new Map()
    const errors = []
    const warnings = []

    for (const [value, string] of this.categoryMap) {
      const trimmedValue = value.trim()
      if (ILLEGAL_SIDECAR_KEYS.has(trimmedValue.toLowerCase())) {
        IssueError.generateAndThrow('illegalSidecarHedCategoricalValue', {
          sidecarKey: this.name,
          filePath: this.sidecar?.file?.path,
        })
      } else if (typeof string !== 'string') {
        IssueError.generateAndThrow('illegalSidecarHedType', {
          sidecarKey: this.name,
          filePath: this.sidecar?.file?.path,
        })
      }
      const [parsedString, errorIssues, warningIssues] = parseHedString(string, hedSchemas, true, true, fullValidation)
      this.parsedCategoryMap.set(value, parsedString)
      warnings.push(...warningIssues)
      errors.push(...errorIssues)
      if (errorIssues.length === 0) {
        const defIssues = this._checkDefinitions(parsedString)
        errors.push(...defIssues)
      }
    }
    return [errors, warnings]
  }

  /**
   * Check for definitions in the HED string.
   * @param parsedString The string to check for definitions.
   * @returns Errors that occur.
   */
  private _checkDefinitions(parsedString: ParsedHedString): Issue[] {
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
   */
  public get isValueKey(): boolean {
    return Boolean(this.valueString)
  }
}
