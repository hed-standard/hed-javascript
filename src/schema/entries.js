/** This module holds the schema entity classes.
 * @module schema/entries
 */

import pluralize from 'pluralize'
pluralize.addUncountableRule('hertz')

import { IssueError } from '../issues/issues'
import { isExistingGregorianDate } from '../utils/dateTime'
import Memoizer from '../utils/memoizer'

/**
 * SchemaEntries class
 */
export class SchemaEntries extends Memoizer {
  /**
   * The schema's properties.
   * @type {SchemaEntryManager<SchemaProperty>}
   */
  properties

  /**
   * The schema's attributes.
   * @type {SchemaEntryManager<SchemaAttribute>}
   */
  attributes

  /**
   * The schema's value classes.
   * @type {SchemaEntryManager<SchemaValueClass>}
   */
  valueClasses

  /**
   * The schema's unit classes.
   * @type {SchemaEntryManager<SchemaUnitClass>}
   */
  unitClasses

  /**
   * The schema's unit modifiers.
   * @type {SchemaEntryManager<SchemaUnitModifier>}
   */
  unitModifiers

  /**
   * The schema's tags.
   * @type {SchemaEntryManager<SchemaTag>}
   */
  tags

  /**
   * Constructor.
   * @param {SchemaParser} schemaParser A constructed schema parser.
   */
  constructor(schemaParser) {
    super()
    this.properties = schemaParser.properties
    this.attributes = schemaParser.attributes
    this.valueClasses = schemaParser.valueClasses
    this.unitClasses = schemaParser.unitClasses
    this.unitModifiers = schemaParser.unitModifiers
    this.tags = schemaParser.tags
  }
}

/**
 * A manager of {@link SchemaEntry} objects.
 *
 * @template T
 */
export class SchemaEntryManager extends Memoizer {
  /**
   * The definitions managed by this entry manager.
   * @type {Map<string, T>}
   */
  _definitions

  /**
   * Constructor.
   *
   * @param {Map<string, T>} definitions A map of schema entry definitions.
   */
  constructor(definitions) {
    super()
    this._definitions = definitions
  }

  /**
   * Iterator over the entry manager's entries.
   *
   * @template T
   * @returns {IterableIterator} - [string, T]
   */
  [Symbol.iterator]() {
    return this._definitions.entries()
  }

  /**
   * Iterator over the entry manager's keys.
   *
   * @returns {IterableIterator} - [string]
   */
  keys() {
    return this._definitions.keys()
  }

  /**
   * Iterator over the entry manager's keys.
   *
   * @returns {IterableIterator} - [T]
   */
  values() {
    return this._definitions.values()
  }

  /**
   * Determine whether the entry with the given name exists.
   *
   * @param {string} name The name of the entry.
   * @return {boolean} Whether the entry exists.
   */
  hasEntry(name) {
    return this._definitions.has(name)
  }

  /**
   * Get the entry with the given name.
   *
   * @param {string} name - The name of the entry to retrieve.
   * @returns {T} - The entry with that name.
   */
  getEntry(name) {
    return this._definitions.get(name)
  }

  /**
   * A copy of the managed definition map.
   *
   * @returns {Map<string, T>}
   */
  get definitions() {
    return new Map(this._definitions)
  }

  /**
   * Get a collection of entries with the given boolean attribute.
   *
   * @param {string} booleanAttributeName - The name of boolean attribute to filter on.
   * @returns {Map} - string->T representing a  collection of entries with that attribute.
   */
  getEntriesWithBooleanAttribute(booleanAttributeName) {
    return this._memoize(booleanAttributeName, () => {
      return this.filter(([, v]) => {
        return v.hasBooleanAttribute(booleanAttributeName)
      })
    })
  }

  /**
   * Filter the map underlying this manager.
   *
   * @param {function} fn -  ([string, T]): boolean specifying the filtering function.
   * @returns {Map} - string->T representing a  collection of entries with that attribute.
   */
  filter(fn) {
    return SchemaEntryManager._filterDefinitionMap(this._definitions, fn)
  }

  /**
   * Filter a definition map.
   *
   * @template T
   * @param {Map<string, T>} definitionMap The definition map.
   * @param {function} fn -  ([string, T]):boolean specifying the filtering function.
   * @returns {Map} - string->T representing the filtered definitions.
   * @protected
   */
  static _filterDefinitionMap(definitionMap, fn) {
    const pairArray = Array.from(definitionMap.entries())
    return new Map(pairArray.filter((entry) => fn(entry)))
  }

  /**
   * The number of entries in this collection.
   *
   * @returns {number} The number of entries in this collection.
   */
  get length() {
    return this._definitions.size
  }
}

/**
 * SchemaEntry class
 */
export class SchemaEntry extends Memoizer {
  /**
   * The name of this schema entry.
   * @type {string}
   */
  _name

  /**
   * The description of this schema entry.
   * @type {string|undefined}
   */
  _description

  /**
   * Constructor.
   *
   * @param {string} name The name of this schema entry.
   * @param {string|undefined} description The description of this schema entry.
   */
  constructor(name, description) {
    super()
    this._name = name
    this._description = description
  }

  /**
   * The name of this schema entry.
   * @returns {string}
   */
  get name() {
    return this._name
  }

  /**
   * The description of this schema entry.
   * @returns {string|undefined}
   */
  get description() {
    return this._description
  }

  /**
   * Determine if this schema entry is equivalent to another schema entry.
   *
   * Schema entries are equivalent if they have the same name and description. Subclasses compare more.
   *
   * @param {*} other A schema entry to compare with this one.
   * @returns {boolean} Whether the other entry is equivalent to this schema entry.
   */
  equivalent(other) {
    if (!(other instanceof SchemaEntry)) {
      return false
    }
    return this.name === other.name && this.description === other.description
  }

  /**
   * Whether this schema entry has this attribute (by name).
   *
   * This method is a stub to be overridden in {@link SchemaEntryWithAttributes}.
   *
   * @param {string} attributeName The attribute to check for.
   * @returns {boolean} Whether this schema entry has this attribute.
   */
  // eslint-disable-next-line no-unused-vars
  hasBooleanAttribute(attributeName) {
    return false
  }
}

// TODO: Switch back to class constant once upstream bug is fixed.
const categoryProperty = 'categoryProperty'
const typeProperty = 'typeProperty'
const roleProperty = 'roleProperty'

/**
 * A schema property.
 */
export class SchemaProperty extends SchemaEntry {
  /**
   * The type of the property.
   * @type {string}
   */
  _propertyType

  /**
   * Constructor.
   *
   * @param {string} name The name of this property.
   * @param {string|undefined} description The description of this property.
   * @param {string} propertyType The type of the property.
   */
  constructor(name, description, propertyType) {
    super(name, description)
    this._propertyType = propertyType
  }

  /**
   * Determine if this schema property is equivalent to another schema property.
   *
   * Properties are equivalent if they have the same name, description, and type.
   *
   * @param {*} other A schema property to compare with this one.
   * @returns {boolean} Whether the other property is equivalent to this schema property.
   */
  equivalent(other) {
    return other instanceof SchemaProperty && super.equivalent(other) && this._propertyType === other._propertyType
  }

  /**
   * Whether this property describes a schema category.
   * @returns {boolean}
   */
  get isCategoryProperty() {
    return this._propertyType === categoryProperty
  }

  /**
   * Whether this property describes a data type.
   * @returns {boolean}
   */
  get isTypeProperty() {
    return this._propertyType === typeProperty
  }

  /**
   * Whether this property describes a role.
   * @returns {boolean}
   */
  get isRoleProperty() {
    return this._propertyType === roleProperty
  }
}

// Pseudo-properties

// TODO: Switch back to class constant once upstream bug is fixed.
export const nodeProperty = new SchemaProperty('nodeProperty', undefined, categoryProperty)
export const schemaAttributeProperty = new SchemaProperty('schemaAttributeProperty', undefined, categoryProperty)
const stringProperty = new SchemaProperty('stringProperty', undefined, typeProperty)

/**
 * A schema attribute.
 */
export class SchemaAttribute extends SchemaEntry {
  /**
   * The categories of elements this schema attribute applies to.
   * @type {Set<SchemaProperty>}
   */
  _categoryProperties

  /**
   * The data type of this schema attribute.
   * @type {SchemaProperty}
   */
  _typeProperty

  /**
   * The set of role properties for this schema attribute.
   * @type {Set<SchemaProperty>}
   */
  _roleProperties

  /**
   * The names of every property assigned to this schema attribute, including properties this version does not model.
   * @type {Set<string>}
   */
  propertyNames

  /**
   * Constructor.
   *
   * @param {string} name The name of the schema attribute.
   * @param {string|undefined} description The description of the schema attribute.
   * @param {SchemaProperty[]} properties The properties assigned to this schema attribute (undefined entries are
   *     properties this version does not model).
   * @param {Iterable<string>} propertyNames The names of every property assigned to this schema attribute.
   */
  constructor(name, description, properties, propertyNames = []) {
    super(name, description)
    this.propertyNames = new Set(propertyNames)
    for (const property of properties) {
      if (property) {
        this.propertyNames.add(property.name)
      }
    }

    // Parse properties
    const categoryProperties = properties.filter((property) => property?.isCategoryProperty)
    this._categoryProperties = categoryProperties.length === 0 ? new Set([nodeProperty]) : new Set(categoryProperties)
    const typeProperties = properties.filter((property) => property?.isTypeProperty)
    this._typeProperty = typeProperties.length === 0 ? stringProperty : typeProperties[0]
    this._roleProperties = new Set(properties.filter((property) => property?.isRoleProperty))
  }

  /**
   * The categories of elements this schema attribute applies to.
   * @returns {Set<SchemaProperty>|SchemaProperty|undefined}
   */
  get categoryProperty() {
    switch (this._categoryProperties.size) {
      case 0:
        return undefined
      case 1:
        return Array.from(this._categoryProperties)[0]
      default:
        return this._categoryProperties
    }
  }

  /**
   * The data type property of this schema attribute.
   * @returns {SchemaProperty}
   */
  get typeProperty() {
    return this._typeProperty
  }

  /**
   * The set of role properties for this schema attribute.
   * @returns {Set<SchemaProperty>}
   */
  get roleProperties() {
    return new Set(this._roleProperties)
  }

  /**
   * Determine if this schema attribute is equivalent to another schema attribute.
   *
   * Schema attributes are equivalent if they have the same name, description, and properties.
   *
   * @param {*} other A schema attribute to compare with this one.
   * @returns {boolean} Whether the other attribute is equivalent to this schema attribute.
   */
  equivalent(other) {
    if (!(other instanceof SchemaAttribute) || !super.equivalent(other)) {
      return false
    }
    return (
      this.propertyNames.size === other.propertyNames.size &&
      [...this.propertyNames].every((name) => other.propertyNames.has(name))
    )
  }
}

/**
 * SchemaEntryWithAttributes class
 */
export class SchemaEntryWithAttributes extends SchemaEntry {
  /**
   * The set of boolean attributes this schema entry has.
   * @type {Set<SchemaAttribute>}
   */
  booleanAttributes

  /**
   * The collection of value attributes this schema entry has.
   * @type {Map<SchemaAttribute, *>}
   */
  valueAttributes

  /**
   * The set of boolean attribute names this schema entry has.
   * @type {Set<string>}
   */
  booleanAttributeNames

  /**
   * The collection of value attribute names this schema entry has.
   * @type {Map<string, *>}
   */
  valueAttributeNames

  /**
   * The attributes ignored when comparing two declarations of an element: inLibrary names the declaring library and
   * hedId differs between schemas by construction.
   * @type {Set<string>}
   */
  static IGNORED_ATTRIBUTES = new Set(['inLibrary', 'hedId'])

  /**
   * Constructor.
   *
   * @param {string} name The name of this schema entry.
   * @param {string|undefined} description The description of this schema entry.
   * @param {Set<SchemaAttribute>} booleanAttributes The boolean attributes for this schema entry.
   * @param {Map<SchemaAttribute, *>} valueAttributes The value attributes for this schema entry.
   */
  constructor(name, description, booleanAttributes, valueAttributes) {
    super(name, description)
    this.booleanAttributes = booleanAttributes
    this.valueAttributes = valueAttributes
    this._parseAttributeNames()
  }

  /**
   * Determine if this schema entry is equivalent to another schema entry.
   *
   * Entries with attributes are equivalent if they have the same name, description, boolean attributes, and value
   * attributes, ignoring inLibrary and hedId.
   *
   * @param {*} other A schema entry to compare with this one.
   * @returns {boolean} Whether the other entry is equivalent to this schema entry.
   */
  equivalent(other) {
    if (!(other instanceof SchemaEntryWithAttributes) || !super.equivalent(other)) {
      return false
    }
    if (
      this.booleanAttributeNames.size !== other.booleanAttributeNames.size ||
      ![...this.booleanAttributeNames].every((name) => other.booleanAttributeNames.has(name))
    ) {
      return false
    }
    const compared = (entry) =>
      [...entry.valueAttributeNames].filter(([name]) => !SchemaEntryWithAttributes.IGNORED_ATTRIBUTES.has(name))
    const ours = compared(this)
    const theirs = new Map(compared(other))
    if (ours.length !== theirs.size) {
      return false
    }
    const sorted = (values) =>
      [...values]
        .map(String)
        .sort((a, b) => a.localeCompare(b))
        .join('|')
    return ours.every(([name, values]) => theirs.has(name) && sorted(theirs.get(name)) === sorted(values))
  }

  /**
   * Create aliases of the attribute collections keyed on their names.
   *
   * @private
   */
  _parseAttributeNames() {
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
   * @param {string} attributeName The attribute to check for.
   * @returns {boolean} Whether this schema entry has this attribute.
   */
  hasAttribute(attributeName) {
    return this.booleanAttributeNames.has(attributeName) || this.valueAttributeNames.has(attributeName)
  }

  /**
   * Whether this schema entry has this boolean attribute (by name).
   * @param {string} attributeName The attribute to check for.
   * @returns {boolean} Whether this schema entry has this attribute.
   */
  hasBooleanAttribute(attributeName) {
    return this.booleanAttributeNames.has(attributeName)
  }

  /**
   * Retrieve the value of a value attribute (by name) on this schema entry.
   * @param {string} attributeName The attribute whose value should be returned.
   * @param {boolean} alwaysReturnArray Whether to return a singleton array instead of a scalar value.
   * @returns {*} The value of the attribute.
   */
  getAttributeValue(attributeName, alwaysReturnArray = false) {
    return SchemaEntryWithAttributes._getMapArrayValue(this.valueAttributeNames, attributeName, alwaysReturnArray)
  }

  /**
   * Return a map value, with a scalar being returned in lieu of a singleton array if alwaysReturnArray is false.
   *
   * @template K,V
   * @param {Map<K,V>} map The map to search.
   * @param {K} key A key in the map.
   * @param {boolean} alwaysReturnArray Whether to return a singleton array instead of a scalar value.
   * @returns {V|V[]} The value for the key in the passed map.
   * @private
   */
  static _getMapArrayValue(map, key, alwaysReturnArray) {
    const value = map.get(key)
    if (!alwaysReturnArray && Array.isArray(value) && value.length === 1) {
      return value[0]
    } else {
      return value
    }
  }
}

/**
 * SchemaUnit class
 */
export class SchemaUnit extends SchemaEntryWithAttributes {
  /**
   * The legal derivatives of this unit (non-compound units only): the name, its plural, and modified forms.
   * @type {string[]}
   */
  _derivativeUnits

  /**
   * The SI modifiers this unit accepts, mapped to their conversion factors (null if a modifier has none).
   * @type {Map<string, number|null>}
   */
  _modifierFactors

  /**
   * The components of a compound SI unit such as m-per-s^2, or null for every other unit.
   * @type {Array<{base: string, exponent: number, text: string}>|null}
   */
  _compoundComponents

  /**
   * Constructor.
   *
   * @param {string} name The name of the unit.
   * @param {string|undefined} description The description of the unit.
   * @param {Set<SchemaAttribute>} booleanAttributes This unit's boolean attributes.
   * @param {Map<SchemaAttribute, *>} valueAttributes This unit's key-value attributes.
   * @param {SchemaEntryManager<SchemaUnitModifier>} unitModifiers The collection of unit modifiers (of every schema
   *     in the merge group, since units are built after the unit modifiers have been merged).
   */
  constructor(name, description, booleanAttributes, valueAttributes, unitModifiers) {
    super(name, description, booleanAttributes, valueAttributes)
    this._buildForms(unitModifiers)
  }

  /**
   * Determine if this schema unit is equivalent to another schema unit.
   *
   * @param {*} other A schema unit to compare with this one.
   * @returns {boolean} Whether the other unit is equivalent to this schema unit.
   */
  equivalent(other) {
    return other instanceof SchemaUnit && super.equivalent(other)
  }

  /**
   * Build the accepted forms of this unit from the collection of unit modifiers.
   *
   * @param {SchemaEntryManager<SchemaUnitModifier>} unitModifiers The collection of unit modifiers.
   * @private
   */
  _buildForms(unitModifiers) {
    this._derivativeUnits = [this.name]
    this._modifierFactors = new Map()
    this._compoundComponents = null
    if (!this.isSIUnit) {
      this._pushPluralUnit()
      return
    }
    const modifierAttribute = this.isUnitSymbol ? 'SIUnitSymbolModifier' : 'SIUnitModifier'
    for (const [modifierName, modifier] of unitModifiers.getEntriesWithBooleanAttribute(modifierAttribute)) {
      this._modifierFactors.set(modifierName, SchemaUnit._parseFactor(modifier))
    }
    this._compoundComponents = this._parseCompoundComponents()
    if (this._compoundComponents !== null) {
      // A compound unit takes one modifier per component and is matched by validateUnit, not from a list.
      return
    }
    const pluralUnit = this._pushPluralUnit()
    for (const modifierName of this._modifierFactors.keys()) {
      this._derivativeUnits.push(modifierName + this.name)
      if (pluralUnit !== null) {
        this._derivativeUnits.push(modifierName + pluralUnit)
      }
    }
  }

  /**
   * Parse the conversionFactor attribute of a unit or unit modifier.
   *
   * @param {SchemaEntryWithAttributes} entry A unit or unit modifier.
   * @returns {number|null} The factor, or null if the entry has none or it is not a number.
   * @private
   */
  static _parseFactor(entry) {
    const text = entry.getAttributeValue('conversionFactor')
    if (text === undefined) {
      return null
    }
    // Schemas write factors as decimals (0.001), in e-notation (1e-6), or as powers (10^-6).
    const [base, exponent, ...extra] = String(text).split('^')
    const factor = exponent === undefined ? Number(base) : Number(base) ** Number(exponent)
    return extra.length === 0 && Number.isFinite(factor) ? factor : null
  }

  /**
   * Split a compound SI unit name (one containing "-per-" or "^") into its components.
   *
   * @returns {Array<{base: string, exponent: number, text: string}>|null} One entry per component in name order
   *     (the first is the numerator, the rest are denominators), or null if this is not a compound unit.
   * @private
   */
  _parseCompoundComponents() {
    if (!this.name.includes('-per-') && !this.name.includes('^')) {
      return null
    }
    const components = []
    for (const text of this.name.split('-per-')) {
      const [base, exponentText, ...extra] = text.split('^')
      if (base === '' || extra.length > 0) {
        return null
      }
      const exponent = exponentText === undefined ? 1 : Number(exponentText)
      if (!Number.isInteger(exponent)) {
        return null
      }
      components.push({ base: base, exponent: exponent, text: text })
    }
    return components
  }

  /**
   * Match a unit string against this compound unit, allowing one SI modifier per component.
   *
   * @param {string} value The unit string.
   * @returns {string[]|null} The modifier used for each component ('' for none), or null if no match.
   * @private
   */
  _matchCompound(value) {
    const parts = value.split('-per-')
    if (parts.length !== this._compoundComponents.length) {
      return null
    }
    const modifiers = []
    for (const [index, part] of parts.entries()) {
      const expected = this._compoundComponents[index].text
      if (!part.endsWith(expected)) {
        return null
      }
      const modifier = part.slice(0, part.length - expected.length)
      if (modifier !== '' && !this._modifierFactors.has(modifier)) {
        return null
      }
      modifiers.push(modifier)
    }
    return modifiers
  }

  _pushPluralUnit() {
    if (!this.isUnitSymbol) {
      const pluralUnit = pluralize.plural(this._name)
      this._derivativeUnits.push(pluralUnit)
      return pluralUnit
    }
    return null
  }

  *derivativeUnits() {
    for (const unit of this._derivativeUnits) {
      yield unit
    }
  }

  get isPrefixUnit() {
    return this.hasAttribute('unitPrefix')
  }

  get isSIUnit() {
    return this.hasAttribute('SIUnit')
  }

  get isUnitSymbol() {
    return this.hasAttribute('unitSymbol')
  }

  /**
   * Determine if a value has this unit.
   *
   * @param {string} value -- either the whole value or the part after a blank (if not a prefix unit)
   * @returns {boolean} Whether the value has these units.
   */
  validateUnit(value) {
    if (value == null || value === '') {
      return false
    }
    if (this.isPrefixUnit) {
      return value.startsWith(this.name)
    }
    if (this._compoundComponents !== null) {
      return this._matchCompound(value) !== null
    }
    for (const dUnit of this.derivativeUnits()) {
      if (value === dUnit) {
        return true
      }
    }
    return false
  }

  /**
   * Get the factor that converts a value given in a form of this unit to the unit class's base unit.
   *
   * @param {string} value A unit string accepted by validateUnit.
   * @returns {number|null} The conversion factor, or null if this unit has no conversionFactor, the string is not
   *     a form of this unit, or a modifier used has no conversionFactor.
   */
  conversionFactor(value) {
    const baseFactor = SchemaUnit._parseFactor(this)
    if (baseFactor === null || !this.validateUnit(value)) {
      return null
    }
    const modifierFactor =
      this._compoundComponents === null ? this._simpleModifierFactor(value) : this._compoundModifierFactor(value)
    return modifierFactor === null ? null : baseFactor * modifierFactor
  }

  /**
   * Get the combined factor of the modifiers in a form of this compound unit.
   *
   * @param {string} value A unit string accepted by validateUnit.
   * @returns {number|null} The factor (1 when no modifier is used), or null if a modifier used has no factor.
   * @private
   */
  _compoundModifierFactor(value) {
    let factor = 1
    for (const [index, modifier] of this._matchCompound(value).entries()) {
      if (modifier === '') {
        continue
      }
      const modifierFactor = this._modifierFactors.get(modifier)
      if (modifierFactor === null) {
        return null
      }
      const exponent = this._compoundComponents[index].exponent
      factor *= modifierFactor ** (index === 0 ? exponent : -exponent)
    }
    return factor
  }

  /**
   * Get the factor of the modifier in a form of this non-compound unit.
   *
   * @param {string} value A unit string accepted by validateUnit.
   * @returns {number|null} The factor (1 when no modifier is used), or null if the modifier used has no factor.
   * @private
   */
  _simpleModifierFactor(value) {
    const plainForms = this.isUnitSymbol ? [this.name] : [this.name, this._derivativeUnits[1]]
    if (this.isPrefixUnit || plainForms.includes(value)) {
      return 1
    }
    const modifier = [...this._modifierFactors.keys()].find(
      (name) => value.startsWith(name) && plainForms.includes(value.slice(name.length)),
    )
    return modifier === undefined ? null : this._modifierFactors.get(modifier)
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
  _units

  /**
   * Constructor.
   *
   * @param {string} name The name of this unit class.
   * @param {string|undefined} description The description of this unit class.
   * @param {Set<SchemaAttribute>} booleanAttributes The boolean attributes for this unit class.
   * @param {Map<SchemaAttribute, *>} valueAttributes The value attributes for this unit class.
   * @param {Map<string, SchemaUnit>} units The units for this unit class.
   */
  constructor(name, description, booleanAttributes, valueAttributes, units) {
    super(name, description, booleanAttributes, valueAttributes)
    this._units = units
  }

  /**
   * Get the units for this unit class.
   * @returns {Map<string, SchemaUnit>}
   */
  get units() {
    return new Map(this._units)
  }

  /**
   * Determine if this schema unit class is equivalent to another schema unit class.
   *
   * The units are not compared: two declarations of a unit class may list different units, which are merged, and
   * the units themselves are compared one by one by the parser.
   *
   * @param {*} other A schema unit class to compare with this one.
   * @returns {boolean} Whether the other unit class is equivalent to this schema unit class.
   */
  equivalent(other) {
    return other instanceof SchemaUnitClass && super.equivalent(other)
  }

  /**
   * Get the default unit for this unit class.
   * @returns {SchemaUnit}
   */
  get defaultUnit() {
    const defaultUnits = this.getAttributeValue('defaultUnits')
    if (defaultUnits === undefined) {
      return undefined
    }
    // A listed unit wins; otherwise the unit that the default derives from (A for mA, Ohm for kOhm) is matched.
    return this._units.get(defaultUnits) ?? [...this._units.values()].find((unit) => unit.validateUnit(defaultUnits))
  }

  /**
   * Extracts the Unit class and remainder
   * @param {string} value The value part of a tag, possibly ending in a unit.
   * @param {boolean} listedOnly Whether to match only unit names as listed in the schema (no plurals or modifiers).
   * @returns {Array} [SchemaUnit, string, string] containing unit class, unit string, and value string
   */
  extractUnit(value, listedOnly = false) {
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
      if (!unit.isPrefixUnit && (listedOnly ? lastPart === unit.name : unit.validateUnit(lastPart))) {
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
export class SchemaUnitModifier extends SchemaEntryWithAttributes {
  /**
   * Constructor.
   *
   * @param {string} name The name of this unit modifier.
   * @param {string|undefined} description The description of this unit modifier.
   * @param {Set<SchemaAttribute>} booleanAttributes The boolean attributes for this unit modifier.
   * @param {Map<SchemaAttribute, *>} valueAttributes The value attributes for this unit modifier.
   */
  constructor(name, description, booleanAttributes, valueAttributes) {
    super(name, description, booleanAttributes, valueAttributes)
  }

  /**
   * Determine if this schema unit modifier is equivalent to another schema unit modifier.
   *
   * @param {*} other A schema unit modifier to compare with this one.
   * @returns {boolean} Whether the other unit modifier is equivalent to this schema unit modifier.
   */
  equivalent(other) {
    return other instanceof SchemaUnitModifier && super.equivalent(other)
  }
}

/**
 * SchemaValueClass class
 */
export class SchemaValueClass extends SchemaEntryWithAttributes {
  /**
   * The character class-based regular expression.
   * @type {RegExp}
   * @private
   */
  _charClassRegex
  /**
   * The "word form"-based regular expression.
   * @type {RegExp}
   * @private
   */
  _wordRegex

  /**
   * Constructor.
   *
   * @param {string} name The name of this value class.
   * @param {string|undefined} description The description of this value class.
   * @param {Set<SchemaAttribute>} booleanAttributes The boolean attributes for this value class.
   * @param {Map<SchemaAttribute, *>} valueAttributes The value attributes for this value class.
   * @param {RegExp} charClassRegex The character class-based regular expression for this value class.
   * @param {RegExp} wordRegex The "word form"-based regular expression for this value class.
   */
  constructor(name, description, booleanAttributes, valueAttributes, charClassRegex, wordRegex) {
    super(name, description, booleanAttributes, valueAttributes)
    this._charClassRegex = charClassRegex
    this._wordRegex = wordRegex
  }

  /**
   * Determine if this schema value class is equivalent to another schema value class.
   *
   * Value classes are equivalent if they have the same name, description, attributes, and regular expressions.
   *
   * @param {*} other A schema value class to compare with this one.
   * @returns {boolean} Whether the other value class is equivalent to this schema value class.
   */
  equivalent(other) {
    if (!(other instanceof SchemaValueClass) || !super.equivalent(other)) {
      return false
    }
    return (
      String(this._charClassRegex) === String(other._charClassRegex) &&
      String(this._wordRegex) === String(other._wordRegex)
    )
  }

  /**
   * Determine if a value is valid according to this value class.
   *
   * @param {string} value A HED value.
   * @returns {boolean} Whether the value conforms to this value class.
   */
  validateValue(value) {
    if (!this._wordRegex.test(value) || !this._charClassRegex.test(value)) {
      return false
    }
    if (this.name === 'dateTimeClass') {
      // The regular expression fixes the shape; the date must also exist in the Gregorian calendar.
      return isExistingGregorianDate(value.slice(0, 10))
    }
    return true
  }
}

/**
 * A tag in a HED schema.
 */
export class SchemaTag extends SchemaEntryWithAttributes {
  /**
   * This tag's parent tag.
   * @type {SchemaTag}
   * @private
   */
  _parent

  /**
   * This tag's unit classes.
   * @type {SchemaUnitClass[]}
   * @private
   */
  _unitClasses

  /**
   * This tag's value-classes
   * @type {SchemaValueClass[]}
   * @private
   */
  _valueClasses

  /**
   * This tag's value-taking child.
   * @type {SchemaValueTag}
   * @private
   */
  _valueTag

  /**
   * Constructor.
   *
   * @param {string} name The name of this tag.
   * @param {string|undefined} description The description of this tag.
   * @param {SchemaTag|undefined} parentTag This tag's parent tag.
   * @param {Set<SchemaAttribute>} booleanAttributes The boolean attributes for this tag.
   * @param {Map<SchemaAttribute, *>} valueAttributes The value attributes for this tag.
   * @param {SchemaUnitClass[]} unitClasses The unit classes for this tag.
   * @param {SchemaValueClass[]} valueClasses The value classes for this tag.
   */
  constructor(name, description, parentTag, booleanAttributes, valueAttributes, unitClasses, valueClasses) {
    super(name, description, booleanAttributes, valueAttributes)
    this._parent = parentTag
    this._unitClasses = unitClasses ?? []
    this._valueClasses = valueClasses ?? []
  }

  /**
   * This tag's unit classes.
   * @type {SchemaUnitClass[]}
   */
  get unitClasses() {
    return this._unitClasses.slice() // The slice prevents modification
  }

  /**
   * Whether this tag has any unit classes.
   * @returns {boolean}
   */
  get hasUnitClasses() {
    return this._unitClasses.length !== 0
  }

  /**
   * This tag's value classes.
   * @type {SchemaValueClass[]}
   */
  get valueClasses() {
    return this._valueClasses.slice()
  }

  /**
   * This tag's value-taking child tag.
   * @returns {SchemaValueTag}
   */
  get valueTag() {
    return this._valueTag
  }

  /**
   * Set the tag's value-taking child tag.
   *
   * A value tag registers itself here from its constructor. When several schemas of a merge group declare the same
   * tag, the first registered value tag is kept and a later equivalent one is ignored; a different one is an error.
   *
   * @param {SchemaValueTag} newValueTag The new value-taking child tag.
   * @throws {IssueError} If this tag already has a different value tag.
   */
  set valueTag(newValueTag) {
    if (this._valueTag === undefined) {
      this._valueTag = newValueTag
    } else if (!this._valueTag.equivalent(newValueTag)) {
      IssueError.generateAndThrowInternalError(
        `Attempted to set value tag for schema tag ${this.longName} when it already has one.`,
      )
    }
  }

  /**
   * This tag's parent tag.
   * @type {SchemaTag}
   */
  get parent() {
    return this._parent
  }

  /**
   * Determine if this schema tag is equivalent to another schema tag.
   *
   * Tags are equivalent if they have the same name, description, and attributes, equivalent parents (so the same
   * ancestor path), and either no value tag or equivalent value tags.
   *
   * @param {*} other A schema tag to compare with this one.
   * @param {boolean} [compareParents] Whether to compare the parents (false when this tag is reached from its parent).
   * @returns {boolean} Whether the other tag is equivalent to this schema tag.
   */
  equivalent(other, compareParents = true) {
    if (!(other instanceof SchemaTag) || !super.equivalent(other)) {
      return false
    }
    if (compareParents) {
      if ((this.parent === undefined) !== (other.parent === undefined)) {
        return false
      }
      if (this.parent !== undefined && this.parent !== other.parent && !this.parent.equivalent(other.parent)) {
        return false
      }
    }
    if ((this.valueTag === undefined) !== (other.valueTag === undefined)) {
      return false
    }
    return (
      this.valueTag === undefined || this.valueTag === other.valueTag || this.valueTag.equivalent(other.valueTag, false)
    )
  }

  /**
   * Return all of this tag's ancestors.
   * @returns {Array}
   */
  get ancestors() {
    return this._memoize('ancestors', () => {
      if (this.parent) {
        return [this.parent, ...this.parent.ancestors]
      }
      return []
    })
  }

  /**
   * This tag's long name.
   * @returns {string}
   */
  get longName() {
    const nameParts = this.ancestors.map((parentTag) => parentTag.name)
    nameParts.reverse().push(this.name)
    return nameParts.join('/')
  }

  /**
   * Extend this tag's short name.
   *
   * @param {string} extension The extension.
   * @returns {string} The extended short string.
   */
  extend(extension) {
    if (extension) {
      return this.name + '/' + extension
    } else {
      return this.name
    }
  }

  /**
   * Extend this tag's long name.
   *
   * @param {string} extension The extension.
   * @returns {string} The extended long string.
   */
  longExtend(extension) {
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
   * Constructor.
   *
   * The value tag registers itself as its parent's value tag.
   *
   * @param {string} name The name of this tag.
   * @param {string|undefined} description The description of this tag.
   * @param {SchemaTag} parentTag This tag's parent tag.
   * @param {Set<SchemaAttribute>} booleanAttributes The boolean attributes for this tag.
   * @param {Map<SchemaAttribute, *>} valueAttributes The value attributes for this tag.
   * @param {SchemaUnitClass[]} unitClasses The unit classes for this tag.
   * @param {SchemaValueClass[]} valueClasses The value classes for this tag.
   * @throws {IssueError} If the tag has no parent.
   */
  constructor(name, description, parentTag, booleanAttributes, valueAttributes, unitClasses, valueClasses) {
    super(name, description, parentTag, booleanAttributes, valueAttributes, unitClasses, valueClasses)
    if (parentTag === undefined) {
      IssueError.generateAndThrowInternalError(`Value tag "${name}" must have a parent.`)
    }
    parentTag.valueTag = this
  }

  /**
   * Determine if this schema value tag is equivalent to another schema value tag.
   *
   * Value tags also compare their unit classes and value classes (by name).
   *
   * @param {*} other A schema value tag to compare with this one.
   * @param {boolean} [compareParents] Whether to compare the parents (false when this tag is reached from its parent).
   * @returns {boolean} Whether the other value tag is equivalent to this schema value tag.
   */
  equivalent(other, compareParents = true) {
    if (!(other instanceof SchemaValueTag) || !super.equivalent(other, compareParents)) {
      return false
    }
    const names = (entries) =>
      entries
        .map((entry) => entry?.name ?? '')
        .sort((a, b) => a.localeCompare(b))
        .join('|')
    return (
      names(this._unitClasses) === names(other._unitClasses) && names(this._valueClasses) === names(other._valueClasses)
    )
  }

  /**
   * This tag's long name.
   * @returns {string}
   */
  get longName() {
    const nameParts = this.ancestors.map((parentTag) => parentTag.name)
    nameParts.reverse().push('#')
    return nameParts.join('/')
  }

  /**
   * Extend this tag's short name.
   *
   * @param {string} extension The extension.
   * @returns {string} The extended short string.
   */
  extend(extension) {
    return this.parent.extend(extension)
  }

  /**
   * Extend this tag's long name.
   *
   * @param {string} extension The extension.
   * @returns {string} The extended long string.
   */
  longExtend(extension) {
    return this.parent.longExtend(extension)
  }
}
