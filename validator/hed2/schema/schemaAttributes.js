/**
 * A description of a HED schema's attributes.
 */
export class SchemaAttributes {
  /**
   * The list of all (formatted) tags.
   * @type {string[]}
   */
  tags
  /**
   * The mapping from attributes to tags to values.
   * @type {Object<string, Object<string, boolean|string|string[]>>}
   */
  tagAttributes
  /**
   * The mapping from tags to their unit classes.
   * @type {Object<string, string[]>}
   */
  tagUnitClasses
  /**
   * The mapping from unit classes to their units.
   * @type {Object<string, string[]>}
   */
  unitClasses
  /**
   * The mapping from unit classes to their attributes.
   * @type {Object<string, Object<string, boolean|string|string[]>>}
   */
  unitClassAttributes
  /**
   * The mapping from units to their attributes.
   * @type {Object<string, Object<string, boolean|string|string[]>>}
   */
  unitAttributes
  /**
   * The mapping from unit modifier types to unit modifiers.
   * @type {Object<string, string[]>}
   */
  unitModifiers
  /**
   * Whether the schema has unit classes.
   * @type {boolean}
   */
  hasUnitClasses
  /**
   * Whether the schema has unit modifiers.
   * @type {boolean}
   */
  hasUnitModifiers

  /**
   * Constructor.
   * @param {Hed2SchemaParser} schemaParser A constructed schema parser.
   */
  constructor(schemaParser) {
    this.tags = schemaParser.tags
    this.tagAttributes = schemaParser.tagAttributes
    this.tagUnitClasses = schemaParser.tagUnitClasses
    this.unitClasses = schemaParser.unitClasses
    this.unitClassAttributes = schemaParser.unitClassAttributes
    this.unitAttributes = schemaParser.unitAttributes
    this.unitModifiers = schemaParser.unitModifiers
    this.hasUnitClasses = schemaParser.hasUnitClasses
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
