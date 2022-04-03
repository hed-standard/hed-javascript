/**
 * A description of a HED schema's attributes.
 */
class SchemaAttributes {
  /**
   * Constructor.
   * @param {SchemaParser} schemaParser A constructed schema parser.
   */
  constructor(schemaParser) {
    /**
     * The list of all (formatted) tags.
     * @type {string[]}
     */
    this.tags = schemaParser.tags
    /**
     * The mapping from attributes to tags to values.
     * @type {object<string, object<string, boolean|string|string[]>>}
     */
    this.tagAttributes = schemaParser.tagAttributes
    /**
     * The mapping from tags to their unit classes.
     * @type {object<string, string[]>}
     */
    this.tagUnitClasses = schemaParser.tagUnitClasses
    /**
     * The mapping from unit classes to their units.
     * @type {object<string, string[]>}
     */
    this.unitClasses = schemaParser.unitClasses
    /**
     * The mapping from unit classes to their attributes.
     * @type {object<string, object<string, boolean|string|string[]>>}
     */
    this.unitClassAttributes = schemaParser.unitClassAttributes
    /**
     * The mapping from units to their attributes.
     * @type {object<string, object<string, boolean|string|string[]>>}
     */
    this.unitAttributes = schemaParser.unitAttributes
    /**
     * The mapping from unit modifier types to unit modifiers.
     * @type {object<string, string[]>}
     */
    this.unitModifiers = schemaParser.unitModifiers
    /**
     * Whether the schema has unit classes.
     * @type {boolean}
     */
    this.hasUnitClasses = schemaParser.hasUnitClasses
    /**
     * Whether the schema has unit modifiers.
     * @type {boolean}
     */
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

module.exports = {
  SchemaAttributes: SchemaAttributes,
}
