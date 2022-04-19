const pluralize = require('pluralize')
pluralize.addUncountableRule('hertz')

// Old-style types

const { Memoizer } = require('../../utils/types')

/**
 * A description of a HED schema's attributes.
 */
class SchemaAttributes {
  /**
   * Constructor.
   * @param {SchemaParser} schemaParser A constructed schema parser.
   */
  constructor(schemaParser) {
    /**
     * The list of all (formatted) tags.
     * @type {string[]}
     */
    this.tags = schemaParser.tags
    /**
     * The mapping from attributes to tags to values.
     * @type {object<string, object<string, boolean|string|string[]>>}
     */
    this.tagAttributes = schemaParser.tagAttributes
    /**
     * The mapping from tags to their unit classes.
     * @type {object<string, string[]>}
     */
    this.tagUnitClasses = schemaParser.tagUnitClasses
    /**
     * The mapping from unit classes to their units.
     * @type {object<string, string[]>}
     */
    this.unitClasses = schemaParser.unitClasses
    /**
     * The mapping from unit classes to their attributes.
     * @type {object<string, object<string, boolean|string|string[]>>}
     */
    this.unitClassAttributes = schemaParser.unitClassAttributes
    /**
     * The mapping from units to their attributes.
     * @type {object<string, object<string, boolean|string|string[]>>}
     */
    this.unitAttributes = schemaParser.unitAttributes
    /**
     * The mapping from unit modifier types to unit modifiers.
     * @type {object<string, string[]>}
     */
    this.unitModifiers = schemaParser.unitModifiers
    /**
     * Whether the schema has unit classes.
     * @type {boolean}
     */
    this.hasUnitClasses = schemaParser.hasUnitClasses
    /**
     * Whether the schema has unit modifiers.
     * @type {boolean}
     */
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

class SchemaEntries extends Memoizer {
  constructor(schemaParser) {
    super(schemaParser)
    /**
     * @type {SchemaEntryManager}
     */
    this.properties = new SchemaEntryManager(schemaParser.properties)
    /**
     * @type {SchemaEntryManager}
     */
    this.attributes = new SchemaEntryManager(schemaParser.attributes)
    /**
     * @type {Map<string, SchemaEntryManager>}
     */
    this.definitions = schemaParser.definitions
  }

  /**
   * Get the schema's unit classes.
   * @return {Map<string, SchemaUnitClass>}
   */
  get unitClassMap() {
    return this.definitions.get('unitClasses').definitions
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

class SchemaEntryManager extends Memoizer {
  /**
   * Constructor.
   *
   * @param {Map<string, SchemaEntry>} definitions A map of schema entry definitions.
   */
  constructor(definitions) {
    super()
    this.definitions = definitions
  }

  [Symbol.iterator]() {
    return this.definitions.entries()
  }

  hasEntry(name) {
    return this.definitions.has(name)
  }

  getEntry(name) {
    return this.definitions.get(name)
  }

  getEntriesWithBooleanAttribute(booleanPropertyName) {
    return this._memoize(booleanPropertyName, () => {
      const pairArray = Array.from(this.definitions.entries())
      return new Map(pairArray.filter(([k, v]) => v.hasAttributeName(booleanPropertyName)))
    })
  }
}

class SchemaEntry {
  constructor(name, booleanAttributes, valueAttributes) {
    /**
     * The name of this schema entry.
     * @type {string}
     * @private
     */
    this._name = name
    /**
     * The set of boolean attributes this schema entry has.
     * @type {Set<SchemaAttribute>}
     * @private
     */
    this._booleanAttributes = booleanAttributes
    /**
     * The collection of value attributes this schema entry has.
     * @type {Map<SchemaAttribute, *>}
     * @private
     */
    this._valueAttributes = valueAttributes

    // String-mapped versions of the above objects.
    this._booleanAttributeNames = new Set()
    for (const attribute of booleanAttributes) {
      this._booleanAttributeNames.add(attribute.name)
    }
    this._valueAttributeNames = new Map()
    for (const [attributeName, value] of valueAttributes) {
      this._valueAttributeNames.set(attributeName.name, value)
    }
  }

  /**
   * The name of this schema entry.
   * @return {string}
   */
  get name() {
    return this._name
  }

  /**
   * Whether this schema entry has this attribute.
   * @param {SchemaAttribute} attribute The attribute to check for.
   * @return {boolean} Whether this schema entry has this attribute.
   */
  hasAttribute(attribute) {
    return this._booleanAttributes.has(attribute)
  }

  /**
   * Retrieve the value of an attribute on this schema entry.
   * @param {SchemaAttribute} attribute The attribute whose value should be returned.
   * @param {boolean} alwaysReturnArray Whether to return a singleton array instead of a scalar value.
   * @return {*} The value of the attribute.
   */
  getAttributeValue(attribute, alwaysReturnArray = false) {
    const value = this._valueAttributes.get(attribute)
    if (!alwaysReturnArray && Array.isArray(value) && value.length === 1) {
      return value[0]
    } else {
      return value
    }
  }

  /**
   * Whether this schema entry has this attribute (by name).
   * @param {string} attributeName The attribute to check for.
   * @return {boolean} Whether this schema entry has this attribute.
   */
  hasAttributeName(attributeName) {
    return this._booleanAttributeNames.has(attributeName)
  }

  /**
   * Retrieve the value of an attribute (by name) on this schema entry.
   * @param {string} attributeName The attribute whose value should be returned.
   * @param {boolean} alwaysReturnArray Whether to return a singleton array instead of a scalar value.
   * @return {*} The value of the attribute.
   */
  getNamedAttributeValue(attributeName, alwaysReturnArray = false) {
    const value = this._valueAttributeNames.get(attributeName)
    if (!alwaysReturnArray && Array.isArray(value) && value.length === 1) {
      return value[0]
    } else {
      return value
    }
  }
}

class SchemaProperty extends SchemaEntry {
  static CATEGORY_PROPERTY = 'categoryProperty'
  static TYPE_PROPERTY = 'typeProperty'

  constructor(name, propertyType) {
    super(name, new Set(), new Map())
    this._propertyType = propertyType
  }

  /**
   * Whether this property describes a schema category.
   * @return {boolean}
   */
  get isCategoryProperty() {
    return this._propertyType === SchemaProperty.CATEGORY_PROPERTY
  }

  /**
   * Whether this property describes a data type.
   * @return {boolean}
   */
  get isTypeProperty() {
    return this._propertyType === SchemaProperty.TYPE_PROPERTY
  }
}

// Pseudo-properties

const nodeProperty = new SchemaProperty('nodeProperty', SchemaProperty.CATEGORY_PROPERTY)
const attributeProperty = new SchemaProperty('attributeProperty', SchemaProperty.CATEGORY_PROPERTY)
const stringProperty = new SchemaProperty('stringProperty', SchemaProperty.TYPE_PROPERTY)

class SchemaAttribute extends SchemaEntry {
  constructor(name, properties) {
    super(name, new Set(), new Map())

    // Parse properties
    const categoryProperties = properties.filter((property) => property.isCategoryProperty)
    if (categoryProperties.length === 0) {
      this._categoryProperty = nodeProperty
    } else {
      this._categoryProperty = categoryProperties[0]
    }
    const typeProperties = properties.filter((property) => property.isTypeProperty)
    if (typeProperties.length === 0) {
      this._typeProperty = stringProperty
    } else {
      this._typeProperty = typeProperties[0]
    }
  }

  get categoryProperty() {
    return this._categoryProperty
  }

  get typeProperty() {
    return this._typeProperty
  }
}

class SchemaUnit extends SchemaEntry {
  constructor(name, booleanAttributes, valueAttributes, unitModifiers) {
    super(name, booleanAttributes, valueAttributes)

    this._derivativeUnits = [name]
    if (!this.isSIUnit) {
      return
    }
    for (const [unitModifierName, unitModifier] of unitModifiers) {
      if (this.isUnitSymbol === unitModifier.isSIUnitSymbolModifier) {
        this._derivativeUnits.push(unitModifierName + name)
      }
    }
    if (!this.isUnitSymbol) {
      const pluralUnit = pluralize.plural(name)
      this._derivativeUnits.push(pluralUnit)
      for (const [unitModifierName, unitModifier] of unitModifiers) {
        if (unitModifier.isSIUnitModifier) {
          this._derivativeUnits.push(unitModifierName + pluralUnit)
        }
      }
    }
  }

  *derivativeUnits() {
    for (const unit of this._derivativeUnits) {
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

class SchemaUnitClass extends SchemaEntry {
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
    this._units = units
  }

  /**
   * Get the units for this unit class.
   * @return {Map<string, SchemaUnit>}
   */
  get units() {
    return this._units
  }
}

class SchemaUnitModifier extends SchemaEntry {
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

class SchemaValueClass extends SchemaEntry {
  constructor(name, booleanAttributes, valueAttributes) {
    super(name, booleanAttributes, valueAttributes)
  }
}

class SchemaTag extends SchemaEntry {
  constructor(name, booleanAttributes, valueAttributes, unitClasses) {
    super(name, booleanAttributes, valueAttributes)
    this._unitClasses = unitClasses || []
  }

  get unitClasses() {
    return this._unitClasses
  }

  get hasUnitClasses() {
    return this._unitClasses.length !== 0
  }
}

module.exports = {
  nodeProperty: nodeProperty,
  attributeProperty: attributeProperty,
  SchemaAttributes: SchemaAttributes,
  SchemaEntries: SchemaEntries,
  SchemaEntryManager: SchemaEntryManager,
  SchemaProperty: SchemaProperty,
  SchemaAttribute: SchemaAttribute,
  SchemaTag: SchemaTag,
  SchemaUnit: SchemaUnit,
  SchemaUnitClass: SchemaUnitClass,
  SchemaUnitModifier: SchemaUnitModifier,
  SchemaValueClass: SchemaValueClass,
}
