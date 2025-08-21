export type NamedElement = { name: { _: string } }
type AttributeElement = NamedElement & { value?: { _: any }[] }
export type DefinitionElement = NamedElement & { attribute?: AttributeElement[] }
export type NodeElement = DefinitionElement & { node?: NodeElement[]; $parent?: NodeElement | null }
type UnitElement = DefinitionElement
type UnitClassElement = DefinitionElement & { unit: UnitElement[] }
type UnitModifierElement = DefinitionElement
type ValueClassElement = DefinitionElement
type SchemaAttributeElement = NamedElement & { property: AttributeElement[] }
type PropertyElement = NamedElement

export type HedSchemaRootElement = {
  $: { version: string; library?: string; withStandard?: string }
  schema: { node: NodeElement[] }
  unitClassDefinitions: {
    unitClassDefinition: UnitClassElement[]
  }
  unitModifierDefinitions: {
    unitModifierDefinition: UnitModifierElement[]
  }
  valueClassDefinitions: {
    valueClassDefinition: ValueClassElement[]
  }
  schemaAttributeDefinitions: {
    schemaAttributeDefinition: SchemaAttributeElement[]
  }
  propertyDefinitions: {
    propertyDefinition: PropertyElement[]
  }
}

export type HedSchemaXMLObject = {
  HED: HedSchemaRootElement
}
