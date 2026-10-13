/** This module holds the collection of schema XML data for one merge group.
 * @module schema/xmlCollection
 */

/**
 * The parsed XML of every schema in one merge group (namespace), in parse order.
 *
 * The schemas are merged while they are parsed: every entry-type parser runs over the whole collection and writes
 * into one map, so the merged schema is built once and never copied.
 */
export class SchemaXmlCollection {
  /**
   * The XML data of the base schema: the standard schema when one is listed, else the first merged library.
   * @type {Object}
   */
  baseSchema

  /**
   * The version of the standard schema the group is built on ('' for an unpartnered library).
   * @type {string}
   */
  standardVersion

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
   * Constructor.
   *
   * @param {Object} baseSchema The XML data of the base schema.
   * @param {string} [standardVersion] The standard schema version of the group.
   * @param {Object[]} [mergedSchemas] The XML data of the other merged schemas.
   * @param {Object[]} [unmergedSchemas] The XML data of the unmerged schemas.
   */
  constructor(baseSchema, standardVersion = '', mergedSchemas = [], unmergedSchemas = []) {
    this.baseSchema = baseSchema
    this.standardVersion = standardVersion
    this.mergedSchemas = mergedSchemas
    this.unmergedSchemas = unmergedSchemas
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
