import { getElementTagName } from '../xmlType'
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
  _preprocessSchema(schemaXml) {
    this.parseUnits(schemaXml)
  }
  _getDefinitions(schemaXml) {
    return schemaXml.HED.unitClassDefinitions.unitClassDefinition
  }
  _buildEntry(name, booleanAttributes, valueAttributes) {
    return new SchemaUnitClass(name, booleanAttributes, valueAttributes, this.unitClassesUnits.get(name) ?? new Map())
  }
  parseUnits(schemaXml) {
    this.unitClassesUnits = new Map()
    const unitClassElements = schemaXml.HED.unitClassDefinitions.unitClassDefinition
    if (!unitClassElements) {
      return
    }
    for (const element of unitClassElements) {
      const elementName = getElementTagName(element)
      this.unitClassUnits = this.entryTypeMap.get(elementName)?.units ?? new Map()
      if (element.unit === undefined) {
        continue
      }
      const [unitBooleanAttributeDefinitions, unitValueAttributeDefinitions] = this._parseAttributeElements(
        element.unit,
        getElementTagName,
      )
      for (const [name, valueAttributes] of unitValueAttributeDefinitions) {
        const booleanAttributes = unitBooleanAttributeDefinitions.get(name) ?? new Set()
        this.addUnit(name, new SchemaUnit(name, booleanAttributes, valueAttributes, this.unitModifiers))
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
