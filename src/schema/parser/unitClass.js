import { getElementName } from '../xmlType'
import { SchemaDefinitionEntryParser } from './schemaEntry'
import SchemaUnitClass from '../entries/unitClass'
import SchemaUnit from '../entries/unit'
import { IssueError } from '../../issues/issues'
export default class UnitClassParser extends SchemaDefinitionEntryParser {
  unitModifiers
  unitClassesUnits
  unitClassUnits
  constructor(xmlCollection, attributes, unitModifiers) {
    super(xmlCollection, attributes)
    this.unitModifiers = unitModifiers
  }
  _preprocessSchemas(schemaXml) {
    this.unitClassesUnits = new Map()
    for (const schema of schemaXml) {
      this.parseUnits(schema)
    }
  }
  _getDefinitions(schemaXml) {
    return schemaXml.HED.unitClassDefinitions.unitClassDefinition
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
  parseUnits(schemaXml) {
    const unitClassElements = schemaXml.HED.unitClassDefinitions.unitClassDefinition
    if (!unitClassElements) {
      return
    }
    for (const element of unitClassElements) {
      const elementName = getElementName(element)
      this.unitClassUnits = this.unitClassesUnits.get(elementName) ?? new Map()
      if (element.unit === undefined) {
        continue
      }
      const [unitBooleanAttributeDefinitions, unitValueAttributeDefinitions, unitValueDescriptions] =
        this._parseAttributeElements(element.unit, getElementName)
      for (const [name, valueAttributes] of unitValueAttributeDefinitions) {
        const booleanAttributes = unitBooleanAttributeDefinitions.get(name) ?? new Set()
        const description = unitValueDescriptions.get(name)
        this.addUnit(name, new SchemaUnit(name, description, booleanAttributes, valueAttributes, this.unitModifiers))
      }
      this.unitClassesUnits.set(elementName, this.unitClassUnits)
    }
  }
  /**
   * Add a new unit while checking for duplicates.
   *
   * @param newUnitName - The unit name.
   * @param newUnit - The new unit object to add.
   */
  addUnit(newUnitName, newUnit) {
    if (this.unitClassUnits.has(newUnitName)) {
      if (!newUnit.equivalent(this.unitClassUnits.get(newUnitName))) {
        IssueError.generateAndThrow('lazyPartneredSchemasShareEntry', { entryName: newUnitName })
      }
    } else {
      this.unitClassUnits.set(newUnitName, newUnit)
    }
  }
}
