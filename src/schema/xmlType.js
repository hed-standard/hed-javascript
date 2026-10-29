/** This module holds the schema XML collection and the helpers for reading schema XML elements.
 * @module schema/xmlType
 */

/**
 * The parsed XML of every schema in one merge group (namespace), in parse order.
 *
 * The schemas are merged while they are parsed: every entry-type parser runs over the whole collection and writes
 * into one map, so the merged schema is built once and never copied.
 */
export class HedSchemaXMLCollection {
  /**
   * The XML data of the base schema: the standard schema when one is listed, else the first merged library.
   * @type {Object}
   */
  baseSchema

  /**
   * The XML data of the partnered library schemas distributed in merged form (the base excluded).
   * @type {Object[]}
   */
  mergedSchemas

  /**
   * The XML data of the partnered library schemas distributed in unmerged form.
   * @type {Object[]}
   */
  unmergedSchemas

  /**
   * The version of the standard schema the group is built on ('' for an unpartnered library).
   * @type {string}
   */
  standardVersion

  /**
   * Constructor.
   *
   * @param {Object} baseSchema The XML data of the base schema.
   * @param {string} [standardVersion] The standard schema version of the group.
   * @param {Object[]} [mergedSchemas] The XML data of the other merged schemas.
   * @param {Object[]} [unmergedSchemas] The XML data of the unmerged schemas.
   */
  constructor(baseSchema, standardVersion, mergedSchemas, unmergedSchemas) {
    this.baseSchema = baseSchema
    this.standardVersion = standardVersion ?? ''
    this.mergedSchemas = mergedSchemas ?? []
    this.unmergedSchemas = unmergedSchemas ?? []
  }

  /**
   * Iterate over the XML data of the schemas: the base first, then the merged, then the unmerged schemas.
   *
   * @returns {Generator<Object>}
   */
  *[Symbol.iterator]() {
    yield this.baseSchema
    yield* this.mergedSchemas
    yield* this.unmergedSchemas
  }
}

/**
 * The former name of {@link HedSchemaXMLCollection}.
 * @deprecated Use HedSchemaXMLCollection. Kept through 4.x.
 */
export const SchemaXmlCollection = HedSchemaXMLCollection

/**
 * Extract the name of an XML element.
 *
 * @param {Object} element An XML element.
 * @returns {string} The name of the element.
 */
export function getElementName(element) {
  return element.name._
}

/**
 * Extract the description of an XML element.
 *
 * @param {Object} element An XML element.
 * @returns {string|undefined} The description of the element.
 */
export function getElementDescription(element) {
  return element.description?._
}
