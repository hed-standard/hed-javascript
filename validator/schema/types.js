import pluralize from 'pluralize'
pluralize.addUncountableRule('hertz')

// Old-style types

import { Memoizer } from '../../utils/types'

/**
 * A description of a HED schema's attributes.
 */
export class SchemaAttributes {
  /**
   * The list of all (formatted) tags.
   * @type {string[]}
   */
  tags
  /**
   * The mapping from attributes to tags to values.
   * @type {Object<string, Object<string, boolean|string|string[]>>}
   */
  tagAttributes
  /**
   * The mapping from tags to their unit classes.
   * @type {Object<string, string[]>}
   */
  tagUnitClasses
  /**
   * The mapping from unit classes to their units.
   * @type {Object<string, string[]>}
   */
  unitClasses
  /**
   * The mapping from unit classes to their attributes.
   * @type {Object<string, Object<string, boolean|string|string[]>>}
   */
  unitClassAttributes
  /**
   * The mapping from units to their attributes.
   * @type {Object<string, Object<string, boolean|string|string[]>>}
   */
  unitAttributes
  /**
   * The mapping from unit modifier types to unit modifiers.
   * @type {Object<string, string[]>}
   */
  unitModifiers
  /**
   * Whether the schema has unit classes.
   * @type {boolean}
   */
  hasUnitClasses
  /**
   * Whether the schema has unit modifiers.
   * @type {boolean}
   */
  hasUnitModifiers

  /**
   * Constructor.
   * @param {Hed2SchemaParser} schemaParser A constructed schema parser.
   */
  constructor(schemaParser) {
    this.tags = schemaParser.tags
    this.tagAttributes = schemaParser.tagAttributes
    this.tagUnitClasses = schemaParser.tagUnitClasses
    this.unitClasses = schemaParser.unitClasses
    this.unitClassAttributes = schemaParser.unitClassAttributes
    this.unitAttributes = schemaParser.unitAttributes
    this.unitModifiers = schemaParser.unitModifiers
    this.hasUnitClasses = schemaParser.hasUnitClasses
    this.hasUnitModifiers = schemaParser.hasUnitModifiers
  }

  /**
   * Determine if a HED tag has a particular attribute in this schema.
   *
   * @param {string} tag The HED tag to check.
   * @param {string} tagAttribute The attribute to check for.
   * @return {boolean|null} Whether this tag has this attribute, or null if the attribute doesn't exist.
   */
  tagHasAttribute(tag, tagAttribute) {
    if (!(tagAttribute in this.tagAttributes)) {
      return null
    }
    return tag.toLowerCase() in this.tagAttributes[tagAttribute]
  }
}

export class SchemaEntries extends Memoizer {
  /**
   * The schema's properties.
   * @type {SchemaEntryManager}
   */
  properties
  /**
   * The schema's attributes.
   * @type {SchemaEntryManager}
   */
  attributes
  /**
   * The schema's definitions.
   * @type {Map<string, SchemaEntryManager>}
   */
  definitions

  /**
   * Constructor.
   * @param {Hed3SchemaParser} schemaParser A constructed schema parser.
   */
  constructor(schemaParser) {
    super()
    this.properties = new SchemaEntryManager(schemaParser.properties)
    this.attributes = new SchemaEntryManager(schemaParser.attributes)
    this.definitions = schemaParser.definitions
  }

  /**
   * Get the schema's unit classes.
   * @return {SchemaEntryManager}
   */
  get unitClassMap() {
    return this.definitions.get('unitClasses')
  }

  /**
   * Get a map of all of this schema's units.
   */
  get allUnits() {
    return this._memoize('allUnits', () => {
      const units = []
      for (const unitClass of this.unitClassMap.values()) {
        const unitClassUnits = unitClass.units
        units.push(...unitClassUnits)
      }
      return new Map(units)
    })
  }

  /**
   * Get the schema's SI unit modifiers.
   * @return {Map<string, SchemaUnitModifier>}
   */
  get SIUnitModifiers() {
    const unitModifiers = this.definitions.get('unitModifiers')
    return unitModifiers.getEntriesWithBooleanAttribute('SIUnitModifier')
  }

  /**
   * Get the schema's SI unit symbol modifiers.
   * @return {Map<string, SchemaUnitModifier>}
   */
  get SIUnitSymbolModifiers() {
    const unitModifiers = this.definitions.get('unitModifiers')
    return unitModifiers.getEntriesWithBooleanAttribute('SIUnitSymbolModifier')
  }

  /**
   * Determine if a HED tag has a particular attribute in this schema.
   *
   * @param {string} tag The HED tag to check.
   * @param {string} tagAttribute The attribute to check for.
   * @return {boolean} Whether this tag has this attribute.
   */
  tagHasAttribute(tag, tagAttribute) {
    if (!this.definitions.get('tags').hasEntry(tag)) {
      return false
    }
    return this.definitions.get('tags').getEntry(tag).hasAttributeName(tagAttribute)
  }
}

// New-style types

export class SchemaEntryManager extends Memoizer {
  /**
   * The definitions managed by this entry manager.
   * @type {Map<string, SchemaEntry>}
   */
  #definitions

  /**
   * Constructor.
   *
   * @param {Map<string, SchemaEntry>} definitions A map of schema entry definitions.
   */
  constructor(definitions) {
    super()
    this.#definitions = definitions
  }

  [Symbol.iterator]() {
    return this.#definitions.entries()
  }

  values() {
    return this.#definitions.values()
  }

  hasEntry(name) {
    return this.#definitions.has(name)
  }

  getEntry(name) {
    return this.#definitions.get(name)
  }

  getEntriesWithBooleanAttribute(booleanPropertyName) {
    return this._memoize(booleanPropertyName, () => {
      return this.filter(([_, v]) => {
        return v.hasAttributeName(booleanPropertyName)
      })
    })
  }

  filter(fn) {
    const pairArray = Array.from(this.#definitions.entries())
    return new Map(pairArray.filter((entry) => fn(entry)))
  }

  get length() {
    return this.#definitions.size
  }
}

export class SchemaEntry {
  /**
   * The name of this schema entry.
   * @type {string}
   */
  #name
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

  constructor(name, booleanAttributes, valueAttributes) {
    this.#name = name
    this.booleanAttributes = booleanAttributes
    this.valueAttributes = valueAttributes

    // String-mapped versions of the above objects.
    this.booleanAttributeNames = new Set()
    for (const attribute of booleanAttributes) {
      this.booleanAttributeNames.add(attribute.name)
    }
    this.valueAttributeNames = new Map()
    for (const [attributeName, value] of valueAttributes) {
      this.valueAttributeNames.set(attributeName.name, value)
    }
  }

  /**
   * The name of this schema entry.
   * @return {string}
   */
  get name() {
    return this.#name
  }

  /**
   * Whether this schema entry has this attribute.
   * @param {SchemaAttribute} attribute The attribute to check for.
   * @return {boolean} Whether this schema entry has this attribute.
   */
  hasAttribute(attribute) {
    return this.booleanAttributes.has(attribute)
  }

  /**
   * Retrieve the value of an attribute on this schema entry.
   * @param {SchemaAttribute} attribute The attribute whose value should be returned.
   * @param {boolean} alwaysReturnArray Whether to return a singleton array instead of a scalar value.
   * @return {*} The value of the attribute.
   */
  getAttributeValue(attribute, alwaysReturnArray = false) {
    return SchemaEntry.#getMapArrayValue(this.valueAttributes, attribute, alwaysReturnArray)
  }

  /**
   * Whether this schema entry has this attribute (by name).
   * @param {string} attributeName The attribute to check for.
   * @return {boolean} Whether this schema entry has this attribute.
   */
  hasAttributeName(attributeName) {
    return this.booleanAttributeNames.has(attributeName)
  }

  /**
   * Retrieve the value of an attribute (by name) on this schema entry.
   * @param {string} attributeName The attribute whose value should be returned.
   * @param {boolean} alwaysReturnArray Whether to return a singleton array instead of a scalar value.
   * @return {*} The value of the attribute.
   */
  getNamedAttributeValue(attributeName, alwaysReturnArray = false) {
    return SchemaEntry.#getMapArrayValue(this.valueAttributeNames, attributeName, alwaysReturnArray)
  }

  /**
   * Return a map value, with a scalar being returned in lieu of a singleton array if alwaysReturnArray is false.
   *
   * @template K,V
   * @param {Map<K,V>} map The map to search.
   * @param {K} key A key in the map.
   * @param {boolean} alwaysReturnArray Whether to return a singleton array instead of a scalar value.
   * @return {V|V[]} The value for the key in the passed map.
   * @private
   */
  static #getMapArrayValue(map, key, alwaysReturnArray) {
    const value = map.get(key)
    if (!alwaysReturnArray && Array.isArray(value) && value.length === 1) {
      return value[0]
    } else {
      return value
    }
  }
}

// TODO: Switch back to class constant once upstream bug is fixed.
const categoryProperty = 'categoryProperty'
const typeProperty = 'typeProperty'

export class SchemaProperty extends SchemaEntry {
  /**
   * The type of the property.
   * @type {string}
   */
  #propertyType

  constructor(name, propertyType) {
    super(name, new Set(), new Map())
    this.#propertyType = propertyType
  }

  /**
   * Whether this property describes a schema category.
   * @return {boolean}
   */
  get isCategoryProperty() {
    return this.#propertyType === categoryProperty
  }

  /**
   * Whether this property describes a data type.
   * @return {boolean}
   */
  get isTypeProperty() {
    return this.#propertyType === typeProperty
  }
}

// Pseudo-properties

// TODO: Switch back to class constant once upstream bug is fixed.
export const nodeProperty = new SchemaProperty('nodeProperty', categoryProperty)
export const attributeProperty = new SchemaProperty('attributeProperty', categoryProperty)
const stringProperty = new SchemaProperty('stringProperty', typeProperty)

export class SchemaAttribute extends SchemaEntry {
  /**
   * The category of elements this schema attribute applies to.
   * @type {SchemaProperty}
   */
  #categoryProperty
  /**
   * The data type of this schema attribute.
   * @type {SchemaProperty}
   */
  #typeProperty

  constructor(name, properties) {
    super(name, new Set(), new Map())

    // Parse properties
    const categoryProperties = properties.filter((property) => property.isCategoryProperty)
    this.#categoryProperty = categoryProperties.length === 0 ? nodeProperty : categoryProperties[0]
    const typeProperties = properties.filter((property) => property.isTypeProperty)
    this.#typeProperty = typeProperties.length === 0 ? stringProperty : typeProperties[0]
  }

  get categoryProperty() {
    return this.#categoryProperty
  }

  get typeProperty() {
    return this.#typeProperty
  }
}

export class SchemaUnit extends SchemaEntry {
  /**
   * The legal derivatives of this unit.
   * @type {string[]}
   */
  #derivativeUnits

  constructor(name, booleanAttributes, valueAttributes, unitModifiers) {
    super(name, booleanAttributes, valueAttributes)

    this.#derivativeUnits = [name]
    if (!this.isSIUnit) {
      return
    }
    const matchingModifiers = unitModifiers.filter(([_, unitModifier]) => {
      return this.isUnitSymbol === unitModifier.isSIUnitSymbolModifier
    })
    for (const modifierName of matchingModifiers.keys()) {
      this.#derivativeUnits.push(modifierName + name)
    }
    if (!this.isUnitSymbol) {
      const pluralUnit = pluralize.plural(name)
      this.#derivativeUnits.push(pluralUnit)
      const SIUnitModifiers = unitModifiers.getEntriesWithBooleanAttribute('SIUnitModifier')
      for (const modifierName of SIUnitModifiers.keys()) {
        this.#derivativeUnits.push(modifierName + pluralUnit)
      }
    }
  }

  *derivativeUnits() {
    for (const unit of this.#derivativeUnits) {
      yield unit
    }
  }

  get isPrefixUnit() {
    return this.hasAttributeName('unitPrefix')
  }

  get isSIUnit() {
    return this.hasAttributeName('SIUnit')
  }

  get isUnitSymbol() {
    return this.hasAttributeName('unitSymbol')
  }
}

export class SchemaUnitClass extends SchemaEntry {
  /**
   * The units for this unit class.
   * @type {Map<string, SchemaUnit>}
   */
  #units

  /**
   * Constructor.
   *
   * @param {string} name The name of this unit class.
   * @param {Set<SchemaAttribute>} booleanAttributes The boolean attributes for this unit class.
   * @param {Map<SchemaAttribute, *>} valueAttributes The value attributes for this unit class.
   * @param {Map<string, SchemaUnit>} units The units for this unit class.
   * @constructor
   */
  constructor(name, booleanAttributes, valueAttributes, units) {
    super(name, booleanAttributes, valueAttributes)
    this.#units = units
  }

  /**
   * Get the units for this unit class.
   * @return {Map<string, SchemaUnit>}
   */
  get units() {
    return new Map(this.#units)
  }

  /**
   * Get the default unit for this unit class.
   * @returns {SchemaUnit}
   */
  get defaultUnit() {
    return this.#units.get(this.getNamedAttributeValue('defaultUnits'))
  }
}

export class SchemaUnitModifier extends SchemaEntry {
  constructor(name, booleanAttributes, valueAttributes) {
    super(name, booleanAttributes, valueAttributes)
  }

  get isSIUnitModifier() {
    return this.hasAttributeName('SIUnitModifier')
  }

  get isSIUnitSymbolModifier() {
    return this.hasAttributeName('SIUnitSymbolModifier')
  }
}

export class SchemaValueClass extends SchemaEntry {
  constructor(name, booleanAttributes, valueAttributes) {
    super(name, booleanAttributes, valueAttributes)
  }
}

export class SchemaTag extends SchemaEntry {
  /**
   * This tag's unit classes.
   * @type {SchemaUnitClass[]}
   */
  #unitClasses

  constructor(name, booleanAttributes, valueAttributes, unitClasses) {
    super(name, booleanAttributes, valueAttributes)
    this.#unitClasses = unitClasses ?? []
  }

  get unitClasses() {
    return this.#unitClasses
  }

  get hasUnitClasses() {
    return this.#unitClasses.length !== 0
  }
}
