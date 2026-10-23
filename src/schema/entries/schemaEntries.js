/**
 * Container for schema entries.
 */
export default class SchemaEntries {
  /**
   * The schema's properties.
   * @type {SchemaEntryManager<SchemaProperty>}
   */
  properties

  /**
   * The schema's attributes.
   * @type {SchemaEntryManager<SchemaAttribute>}
   */
  attributes

  /**
   * The schema's value classes.
   * @type {SchemaEntryManager<SchemaValueClass>}
   */
  valueClasses

  /**
   * The schema's unit classes.
   * @type {SchemaEntryManager<SchemaUnitClass>}
   */
  unitClasses

  /**
   * The schema's unit modifiers.
   * @type {SchemaEntryManager<SchemaUnitModifier>}
   */
  unitModifiers

  /**
   * The schema's tags.
   * @type {SchemaEntryManager<SchemaTag>}
   */
  tags

  /**
   * Constructor.
   *
   * @param {SchemaParser} schemaParser A constructed schema parser.
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
