/**
 * Container for schema entries.
 */
export default class SchemaEntries {
  /**
   * The schema's properties.
   */
  properties
  /**
   * The schema's attributes.
   */
  attributes
  /**
   * The schema's value classes.
   */
  valueClasses
  /**
   * The schema's unit classes.
   */
  unitClasses
  /**
   * The schema's unit modifiers.
   */
  unitModifiers
  /**
   * The schema's tags.
   */
  tags
  /**
   * Constructor.
   *
   * @param schemaParser - A constructed schema parser.
   */
  constructor(schemaParser) {
    this.properties = schemaParser.properties
    this.attributes = schemaParser.attributes
    this.valueClasses = schemaParser.valueClasses
    this.unitClasses = schemaParser.unitClasses
    this.unitModifiers = schemaParser.unitModifiers
    this.tags = schemaParser.tags
  }
}
