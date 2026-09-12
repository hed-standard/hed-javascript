export type NamedElement = {
  name: {
    _: string
  }
}
export type AttributeValue = string | number
export type AttributeElement = NamedElement & {
  value?: {
    _: AttributeValue
  }[]
}
export type DefinitionElement = NamedElement & {
  attribute?: AttributeElement[]
}
export type NodeElement = DefinitionElement & {
  node?: NodeElement[]
  $parent?: NodeElement | null
}
type UnitClassElement = DefinitionElement & {
  unit: DefinitionElement[]
}
type SchemaAttributeElement = NamedElement & {
  property: AttributeElement[]
}
export type HedSchemaRootElement = {
  $: {
    version: string
    library?: string
    unmerged?: boolean
    withStandard?: string
  }
  schema: {
    node: NodeElement[]
  }
  unitClassDefinitions: {
    unitClassDefinition?: UnitClassElement[]
  }
  unitModifierDefinitions: {
    unitModifierDefinition?: DefinitionElement[]
  }
  valueClassDefinitions: {
    valueClassDefinition?: DefinitionElement[]
  }
  schemaAttributeDefinitions: {
    schemaAttributeDefinition?: SchemaAttributeElement[]
  }
  propertyDefinitions: {
    propertyDefinition?: NamedElement[]
  }
}
export type HedSchemaXMLObject = {
  HED: HedSchemaRootElement
}
export declare class HedSchemaXMLCollection {
  readonly baseSchema: HedSchemaXMLObject
  readonly mergedSchemas: HedSchemaXMLObject[]
  readonly unmergedSchemas: HedSchemaXMLObject[]
  readonly standardVersion: string
  constructor(
    baseSchema: HedSchemaXMLObject,
    standardVersion?: string,
    mergedSchemas?: HedSchemaXMLObject[],
    unmergedSchemas?: HedSchemaXMLObject[],
  )
}
/**
 * Extract the name of an XML element.
 *
 * @param element - An XML element.
 * @returns The name of the element.
 */
export declare function getElementTagName(this: void, element: NamedElement): string
export {}
