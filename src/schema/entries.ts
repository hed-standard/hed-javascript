/** This module holds the schema entity classes.
 * @module schema/entries
 */
import pluralize from 'pluralize'
pluralize.addUncountableRule('hertz')

import { IssueError } from '../issues/issues'
import type SchemaParser from './parser'

/**
 * SchemaEntries class
 */
export class SchemaEntries {
  /**
   * The schema's properties.
   */
  readonly properties: SchemaEntryManager<SchemaProperty>

  /**
   * The schema's attributes.
   */
  readonly attributes: SchemaEntryManager<SchemaAttribute>

  /**
   * The schema's value classes.
   */
  readonly valueClasses: SchemaEntryManager<SchemaValueClass>

  /**
   * The schema's unit classes.
   */
  readonly unitClasses: SchemaEntryManager<SchemaUnitClass>

  /**
   * The schema's unit modifiers.
   */
  readonly unitModifiers: SchemaEntryManager<SchemaUnitModifier>

  /**
   * The schema's tags.
   */
  tags: SchemaEntryManager<SchemaTag>

  /**
   * Constructor.
   * @param schemaParser A constructed schema parser.
   */
  constructor(schemaParser: SchemaParser) {
    this.properties = new SchemaEntryManager(schemaParser.properties)
    this.attributes = new SchemaEntryManager(schemaParser.attributes)
    this.valueClasses = schemaParser.valueClasses
    this.unitClasses = schemaParser.unitClasses
    this.unitModifiers = schemaParser.unitModifiers
    this.tags = schemaParser.tags
  }
}

/**
 * A manager of {@link SchemaEntry} objects.
 */
export class SchemaEntryManager<T extends SchemaEntry> {
  /**
   * The definitions managed by this entry manager.
   */
  private readonly _definitions: Map<string, T>

  /**
   * Constructor.
   *
   * @param definitions A map of schema entry definitions.
   */
  constructor(definitions: Map<string, T>) {
    this._definitions = definitions
  }

  /**
   * Return a copy of the managed definition map.
   */
  public get definitions(): Map<string, T> {
    return new Map(this._definitions)
  }

  /**
   * Iterator over the entry manager's entries.
   */
  public [Symbol.iterator](): MapIterator<[string, T]> {
    return this._definitions.entries()
  }

  /**
   * Iterator over the entry manager's keys.
   */
  public keys(): MapIterator<string> {
    return this._definitions.keys()
  }

  /**
   * Iterator over the entry manager's keys.
   */
  public values(): MapIterator<T> {
    return this._definitions.values()
  }

  /**
   * Determine whether the entry with the given name exists.
   *
   * @param name The name of the entry.
   * @return Whether the entry exists.
   */
  public hasEntry(name: string): boolean {
    return this._definitions.has(name)
  }

  /**
   * Get the entry with the given name.
   *
   * @param name The name of the entry to retrieve.
   * @returns The entry with that name.
   */
  public getEntry(name: string): T {
    return this._definitions.get(name)
  }

  /**
   * Get a collection of entries with the given boolean attribute.
   *
   * @param booleanAttributeName The name of boolean attribute to filter on.
   * @returns A subset of the managed collection with the given boolean attribute.
   */
  public getEntriesWithBooleanAttribute(booleanAttributeName: string): Map<string, T> {
    return this.filter(([, v]) => {
      return v.hasBooleanAttribute(booleanAttributeName)
    })
  }

  /**
   * Filter the map underlying this manager.
   *
   * @param fn The filtering function.
   * @returns A subset of the managed collection satisfying the filter.
   */
  public filter(fn: (entry: [string, T]) => boolean): Map<string, T> {
    const pairArray = Array.from(this._definitions.entries())
    return new Map(pairArray.filter((entry) => fn(entry)))
  }

  /**
   * The number of entries in this collection.
   *
   * @returns The number of entries in this collection.
   */
  public get length(): number {
    return this._definitions.size
  }
}

/**
 * SchemaEntry class
 */
export class SchemaEntry {
  /**
   * The name of this schema entry.
   */
  private readonly _name: string

  constructor(name: string) {
    this._name = name
  }

  /**
   * The name of this schema entry.
   */
  public get name(): string {
    return this._name
  }

  /**
   * Whether this schema entry has this attribute (by name).
   *
   * This method is a stub to be overridden in {@link SchemaEntryWithAttributes}.
   *
   * @param attributeName The attribute to check for.
   * @returns Whether this schema entry has this attribute.
   */
  // eslint-disable-next-line no-unused-vars
  public hasBooleanAttribute(attributeName: string): boolean {
    return false
  }
}

/**
 * A schema property.
 */
export class SchemaProperty extends SchemaEntry {}

/**
 * A schema attribute.
 */
export class SchemaAttribute extends SchemaEntry {
  /**
   * The properties assigned to this schema attribute.
   */
  readonly _properties: Set<SchemaProperty>

  /**
   * Constructor.
   *
   * @param name The name of the schema attribute.
   * @param properties The properties assigned to this schema attribute.
   */
  constructor(name: string, properties: Set<SchemaProperty>) {
    super(name)
    this._properties = properties
  }

  /**
   * The collection of properties for this schema attribute.
   */
  public get properties(): Set<SchemaProperty> {
    return new Set(this._properties)
  }
}

/**
 * SchemaEntryWithAttributes class
 */
export class SchemaEntryWithAttributes extends SchemaEntry {
  /**
   * The set of boolean attributes this schema entry has.
   */
  readonly booleanAttributes: Set<SchemaAttribute>

  /**
   * The collection of value attributes this schema entry has.
   */
  readonly valueAttributes: Map<SchemaAttribute, string[]>

  /**
   * The set of boolean attribute names this schema entry has.
   */
  readonly booleanAttributeNames: Set<string>

  /**
   * The collection of value attribute names this schema entry has.
   */
  readonly valueAttributeNames: Map<string, string[]>

  constructor(name: string, booleanAttributes: Set<SchemaAttribute>, valueAttributes: Map<SchemaAttribute, string[]>) {
    super(name)
    this.booleanAttributes = booleanAttributes
    this.valueAttributes = valueAttributes
    this.booleanAttributeNames = new Set()
    for (const attribute of this.booleanAttributes) {
      this.booleanAttributeNames.add(attribute.name)
    }
    this.valueAttributeNames = new Map()
    for (const [attributeName, value] of this.valueAttributes) {
      this.valueAttributeNames.set(attributeName.name, value)
    }
  }

  /**
   * Whether this schema entry has this attribute (by name).
   * @param attributeName The attribute to check for.
   * @returns Whether this schema entry has this attribute.
   */
  public hasAttribute(attributeName: string): boolean {
    return this.booleanAttributeNames.has(attributeName) || this.valueAttributeNames.has(attributeName)
  }

  /**
   * Whether this schema entry has this boolean attribute (by name).
   * @param attributeName The attribute to check for.
   * @returns Whether this schema entry has this attribute.
   */
  public hasBooleanAttribute(attributeName: string): boolean {
    return this.booleanAttributeNames.has(attributeName)
  }

  /**
   * Retrieve a single value of a value attribute (by name) on this schema entry, throwing an error if more than one value exists.
   * @param attributeName The attribute whose value should be returned.
   * @returns The value of the attribute.
   * @throws {IssueError} If the attribute has more than one value.
   */
  public getSingleAttributeValue(attributeName: string): string | undefined {
    const attributeValues = this.valueAttributeNames.get(attributeName)
    if (attributeValues === undefined) {
      return undefined
    } else if (attributeValues.length > 1) {
      IssueError.generateAndThrowInternalError(
        `More than one value exists for attribute ${attributeName}, when only one value was expected.`,
      )
    }
    return attributeValues[0]
  }

  /**
   * Retrieve all values of a value attribute (by name) on this schema entry.
   * @param attributeName The attribute whose value should be returned.
   * @returns The values of the attribute.
   */
  public getAttributeValues(attributeName: string): string[] | undefined {
    return this.valueAttributeNames.get(attributeName)
  }
}

/**
 * SchemaUnit class
 */
export class SchemaUnit extends SchemaEntryWithAttributes {
  /**
   * The legal derivatives of this unit.
   */
  private readonly _derivativeUnits: string[]

  /**
   * Constructor.
   *
   * @param name The name of the unit.
   * @param booleanAttributes This unit's boolean attributes.
   * @param valueAttributes This unit's key-value attributes.
   * @param unitModifiers The collection of unit modifiers.
   */
  constructor(
    name: string,
    booleanAttributes: Set<SchemaAttribute>,
    valueAttributes: Map<SchemaAttribute, string[]>,
    unitModifiers: SchemaEntryManager<SchemaUnitModifier>,
  ) {
    super(name, booleanAttributes, valueAttributes)

    this._derivativeUnits = [name]
    if (!this.isSIUnit) {
      this._pushPluralUnit()
      return
    }
    if (this.isUnitSymbol) {
      const SIUnitSymbolModifiers = unitModifiers.getEntriesWithBooleanAttribute('SIUnitSymbolModifier')
      for (const modifierName of SIUnitSymbolModifiers.keys()) {
        this._derivativeUnits.push(modifierName + name)
      }
    } else {
      const SIUnitModifiers = unitModifiers.getEntriesWithBooleanAttribute('SIUnitModifier')
      const pluralUnit = this._pushPluralUnit()
      for (const modifierName of SIUnitModifiers.keys()) {
        this._derivativeUnits.push(modifierName + name, modifierName + pluralUnit)
      }
    }
  }

  private _pushPluralUnit(): string | null {
    if (!this.isUnitSymbol) {
      const pluralUnit = pluralize.plural(this.name)
      this._derivativeUnits.push(pluralUnit)
      return pluralUnit
    }
    return null
  }

  public *derivativeUnits(): Generator<string, void, void> {
    for (const unit of this._derivativeUnits) {
      yield unit
    }
  }

  public get isPrefixUnit(): boolean {
    return this.hasAttribute('unitPrefix')
  }

  public get isSIUnit(): boolean {
    return this.hasAttribute('SIUnit')
  }

  public get isUnitSymbol(): boolean {
    return this.hasAttribute('unitSymbol')
  }

  /**
   * Determine if a value has this unit.
   *
   * @param value Either the whole value or the part after a blank (if not a prefix unit)
   * @returns Whether the value has these units.
   */
  public validateUnit(value: string): boolean {
    if (value == null || value === '') {
      return false
    }
    if (this.isPrefixUnit) {
      return value.startsWith(this.name)
    }

    for (const dUnit of this.derivativeUnits()) {
      if (value === dUnit) {
        return true
      }
    }
    return false
  }
}

/**
 * SchemaUnitClass class
 */
export class SchemaUnitClass extends SchemaEntryWithAttributes {
  /**
   * The units for this unit class.
   * @type {Map<string, SchemaUnit>}
   */
  private readonly _units: Map<string, SchemaUnit>

  /**
   * Constructor.
   *
   * @param name The name of this unit class.
   * @param booleanAttributes The boolean attributes for this unit class.
   * @param valueAttributes The value attributes for this unit class.
   * @param units The units for this unit class.
   */
  constructor(
    name: string,
    booleanAttributes: Set<SchemaAttribute>,
    valueAttributes: Map<SchemaAttribute, string[]>,
    units: Map<string, SchemaUnit>,
  ) {
    super(name, booleanAttributes, valueAttributes)
    this._units = units
  }

  /**
   * Get the units for this unit class.
   */
  public get units(): Map<string, SchemaUnit> {
    return new Map(this._units)
  }

  /**
   * Get the default unit for this unit class.
   */
  public get defaultUnit(): SchemaUnit | undefined {
    return this._units.get(this.getSingleAttributeValue('defaultUnits'))
  }

  /**
   * Extracts the Unit class and remainder
   * @returns Unit class, unit string, and value string
   */
  public extractUnit(value: string): [SchemaUnit | null, string | null, string] {
    let actualUnit = null // The Unit class of the value
    let actualValueString = null // The actual value part of the value
    let actualUnitString = null
    let lastPart = null
    let firstPart = null
    const index = value.indexOf(' ')
    if (index !== -1) {
      lastPart = value.slice(index + 1)
      firstPart = value.slice(0, index)
    } else {
      // no blank -- there are no units
      return [null, null, value]
    }
    actualValueString = firstPart
    actualUnitString = lastPart
    for (const unit of this._units.values()) {
      if (!unit.isPrefixUnit && unit.validateUnit(lastPart)) {
        // Checking if it is non-prefixed unit
        actualValueString = firstPart
        actualUnitString = lastPart
        actualUnit = unit
        break
      } else if (!unit.isPrefixUnit) {
        continue
      }
      if (unit.validateUnit(firstPart)) {
        actualUnit = unit
        actualValueString = value.substring(unit.name.length + 1)
        actualUnitString = unit.name
        break
      }
      // If it got here, can only be a prefix Unit
    }
    return [actualUnit, actualUnitString, actualValueString]
  }
}

/**
 * SchemaUnitModifier class
 */
export class SchemaUnitModifier extends SchemaEntryWithAttributes {}

/**
 * SchemaValueClass class
 */
export class SchemaValueClass extends SchemaEntryWithAttributes {
  /**
   * The character class-based regular expression.
   */
  private readonly _charClassRegex: RegExp
  /**
   * The "word form"-based regular expression.
   */
  private readonly _wordRegex: RegExp

  /**
   * Constructor.
   *
   * @param name The name of this value class.
   * @param booleanAttributes The boolean attributes for this value class.
   * @param valueAttributes The value attributes for this value class.
   * @param charClassRegex The character class-based regular expression for this value class.
   * @param wordRegex The "word form"-based regular expression for this value class.
   */

  constructor(
    name: string,
    booleanAttributes: Set<SchemaAttribute>,
    valueAttributes: Map<SchemaAttribute, string[]>,
    charClassRegex: RegExp,
    wordRegex: RegExp,
  ) {
    super(name, booleanAttributes, valueAttributes)
    this._charClassRegex = charClassRegex
    this._wordRegex = wordRegex
  }

  /**
   * Determine if a value is valid according to this value class.
   *
   * @param value A HED value.
   * @returns Whether the value conforms to this value class.
   */
  public validateValue(value: string): boolean {
    return this._wordRegex.test(value) && this._charClassRegex.test(value)
  }
}

/**
 * A tag in a HED schema.
 */
export class SchemaTag extends SchemaEntryWithAttributes {
  /**
   * This tag's parent tag.
   */
  private _parent: SchemaTag

  /**
   * This tag's unit classes.
   */
  private readonly _unitClasses: SchemaUnitClass[]

  /**
   * This tag's value-classes
   */
  private readonly _valueClasses: SchemaValueClass[]

  /**
   * This tag's value-taking child.
   */
  private _valueTag: SchemaValueTag

  /**
   * This tag's ancestor tags.
   */
  #ancestors: SchemaTag[]

  /**
   * Constructor.
   *
   * @param name The name of this tag.
   * @param booleanAttributes The boolean attributes for this tag.
   * @param valueAttributes The value attributes for this tag.
   * @param unitClasses The unit classes for this tag.
   * @param valueClasses The value classes for this tag.
   */
  constructor(
    name: string,
    booleanAttributes: Set<SchemaAttribute>,
    valueAttributes: Map<SchemaAttribute, string[]>,
    unitClasses: SchemaUnitClass[],
    valueClasses: SchemaValueClass[],
  ) {
    super(name, booleanAttributes, valueAttributes)
    this._unitClasses = unitClasses ?? []
    this._valueClasses = valueClasses ?? []
  }

  /**
   * This tag's unit classes.
   */
  public get unitClasses(): SchemaUnitClass[] {
    return this._unitClasses.slice() // The slice prevents modification
  }

  /**
   * Whether this tag has any unit classes.
   */
  public get hasUnitClasses(): boolean {
    return this._unitClasses.length !== 0
  }

  /**
   * This tag's value classes.
   */
  public get valueClasses(): SchemaValueClass[] {
    return this._valueClasses.slice()
  }

  /**
   * This tag's value-taking child tag.
   */
  public get valueTag(): SchemaValueTag {
    return this._valueTag
  }

  /**
   * Set the tag's value-taking child tag.
   * @param newValueTag The new value-taking child tag.
   */
  public set valueTag(newValueTag: SchemaValueTag) {
    if (!this._isPrivateFieldSet(this._valueTag, 'value tag')) {
      this._valueTag = newValueTag
    }
  }

  /**
   * This tag's parent tag.
   */
  public get parent(): SchemaTag {
    return this._parent
  }

  /**
   * Set the tag's parent tag.
   * @param newParent The new parent tag.
   */
  public set parent(newParent: SchemaTag) {
    if (!this._isPrivateFieldSet(this._parent, 'parent')) {
      this._parent = newParent
    }
  }

  /**
   * Throw an error if a private field is already set.
   *
   * @param field The field being set.
   * @param fieldName The name of the field (for error reporting).
   * @return Whether the field is set (never returns true).
   * @throws {IssueError} If the field is already set.
   * @private
   */
  private _isPrivateFieldSet(field: any, fieldName: string): boolean {
    if (field !== undefined) {
      IssueError.generateAndThrowInternalError(
        `Attempted to set ${fieldName} for schema tag ${this.longName} when it already has one.`,
      )
    }
    return false
  }

  /**
   * Return all of this tag's ancestors.
   */
  public get ancestors(): SchemaTag[] {
    if (this.#ancestors !== undefined) {
      return this.#ancestors
    }
    this.#ancestors = this.parent ? [this.parent, ...this.parent.ancestors] : []
    return this.#ancestors
  }

  /**
   * This tag's long name.
   */
  public get longName(): string {
    const nameParts = this.ancestors.map((parentTag) => parentTag.name)
    nameParts.reverse()
    nameParts.push(this.name)
    return nameParts.join('/')
  }

  /**
   * Extend this tag's short name.
   *
   * @param extension The extension.
   * @returns The extended short string.
   */
  public extend(extension: string): string {
    if (extension) {
      return this.name + '/' + extension
    } else {
      return this.name
    }
  }

  /**
   * Extend this tag's long name.
   *
   * @param extension The extension.
   * @returns The extended long string.
   */
  public longExtend(extension: string): string {
    if (extension) {
      return this.longName + '/' + extension
    } else {
      return this.longName
    }
  }
}

/**
 * A value-taking tag in a HED schema.
 */
export class SchemaValueTag extends SchemaTag {
  /**
   * This tag's long name.
   */
  public get longName(): string {
    const nameParts = this.ancestors.map((parentTag) => parentTag.name)
    nameParts.reverse()
    nameParts.push('#')
    return nameParts.join('/')
  }

  /**
   * Extend this tag's short name.
   *
   * @param extension The extension.
   * @returns The extended short string.
   */
  public extend(extension: string): string {
    return this.parent.extend(extension)
  }

  /**
   * Extend this tag's long name.
   *
   * @param extension The extension.
   * @returns The extended long string.
   */
  public longExtend(extension: string): string {
    return this.parent.longExtend(extension)
  }
}
