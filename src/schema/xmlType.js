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
  *[Symbol.iterator]() {
    yield this.baseSchema
    yield* this.mergedSchemas
    yield* this.unmergedSchemas
  }
}
/**
 * Extract the name of an XML element.
 *
 * @param element - An XML element.
 * @returns The name of the element.
 */
export function getElementName(element) {
  return element.name._
}
/**
 * Extract the description of an XML element.
 *
 * @param element - An XML element.
 * @returns The description of the element.
 */
export function getElementDescription(element) {
  return element.description?._
}
