export class HedSchemaXMLCollection {
  baseSchema
  mergedSchemas
  unmergedSchemas
  standardVersion
  constructor(baseSchema, standardVersion, mergedSchemas, unmergedSchemas) {
    this.baseSchema = baseSchema
    this.standardVersion = standardVersion ?? ''
    this.mergedSchemas = mergedSchemas ?? []
    this.unmergedSchemas = unmergedSchemas ?? []
  }
}
/**
 * Extract the name of an XML element.
 *
 * @param element - An XML element.
 * @returns The name of the element.
 */
export function getElementTagName(element) {
  return element.name._
}
