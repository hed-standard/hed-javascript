import { getDefinitionElements, SchemaDefinitionEntryParser } from './schemaEntry'
import SchemaUnitClass from '../entries/unitClass'
import SchemaUnit from '../entries/unit'
import { getElementName } from '../xmlType'

import { IssueError } from '../../issues/issues'

/**
 * A parser for unit classes and their units.
 *
 * The units of every schema are collected before the unit classes are built, so a unit class declared by several
 * schemas is built once with the units of all of them, and every unit is built against the merged unit modifiers.
 */
export default class UnitClassParser extends SchemaDefinitionEntryParser {
  /**
   * The unit modifiers.
   * @type {SchemaEntryManager<SchemaUnitModifier>}
   */
  unitModifiers

  /**
   * The units of each unit class, keyed by unit class name and then by unit name.
   * @type {Map<string, Map<string, SchemaUnit>>}
   */
  unitClassesUnits

  /**
   * Constructor.
   *
   * @param {HedSchemaXMLCollection} xmlCollection A collection of XML data for a given prefix.
   * @param {SchemaEntryManager<SchemaAttribute>} attributes The parsed schema attributes.
   * @param {SchemaEntryManager<SchemaUnitModifier>} unitModifiers The parsed unit modifiers.
   */
  constructor(xmlCollection, attributes, unitModifiers) {
    super(xmlCollection, attributes)
    this.unitModifiers = unitModifiers
  }

  _preprocessSchemas(schemaXml) {
    this.unitClassesUnits = new Map()
    for (const schema of schemaXml) {
      this._parseUnits(schema)
    }
  }

  _getDefinitions(schemaXml) {
    return getDefinitionElements(schemaXml.HED, 'unitClass')
  }

  _buildEntry(name, description, booleanAttributes, valueAttributes) {
    return new SchemaUnitClass(
      name,
      description,
      booleanAttributes,
      valueAttributes,
      this.unitClassesUnits.get(name) ?? new Map(),
    )
  }

  /**
   * Parse the units of one schema.
   *
   * @param {Object} schemaXml The XML for a specific schema.
   * @private
   */
  _parseUnits(schemaXml) {
    for (const element of this._getDefinitions(schemaXml)) {
      const elementName = getElementName(element)
      const unitClassUnits = this.unitClassesUnits.get(elementName) ?? new Map()
      this.unitClassesUnits.set(elementName, unitClassUnits)
      const [unitBooleanAttributeDefinitions, unitValueAttributeDefinitions, unitDescriptions] =
        this._parseAttributeElements(element.unit ?? [], getElementName)
      this._addInLibrary(schemaXml, unitValueAttributeDefinitions, (name) => unitClassUnits.has(name))
      for (const [name, valueAttributes] of unitValueAttributeDefinitions) {
        const booleanAttributes = unitBooleanAttributeDefinitions.get(name) ?? new Set()
        const description = unitDescriptions.get(name)
        const unit = new SchemaUnit(name, description, booleanAttributes, valueAttributes, this.unitModifiers)
        this._addUnit(unitClassUnits, name, unit)
      }
    }
  }

  /**
   * Add a new unit while checking for duplicates.
   *
   * @param {Map<string, SchemaUnit>} unitClassUnits The units of the unit class.
   * @param {string} newUnitName The unit name.
   * @param {SchemaUnit} newUnit The new unit object to add.
   * @throws {IssueError} If a unit of that name exists and is not equivalent.
   * @private
   */
  _addUnit(unitClassUnits, newUnitName, newUnit) {
    if (unitClassUnits.has(newUnitName)) {
      if (!newUnit.equivalent(unitClassUnits.get(newUnitName))) {
        IssueError.generateAndThrow('lazyPartneredSchemasShareEntry', { entryName: newUnitName })
      }
    } else {
      unitClassUnits.set(newUnitName, newUnit)
    }
  }
}
