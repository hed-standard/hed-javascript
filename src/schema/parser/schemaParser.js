import AttributeParser from './attribute'
import PropertyParser from './property'
import TagParser from './tag'
import UnitClassParser from './unitClass'
import UnitModifierParser from './unitModifier'
import ValueClassParser from './valueClass'

import SchemaEntries from '../entries/schemaEntries'

/**
 * The parser of a merge group: builds the merged {@link SchemaEntries} from the group's XML data.
 */
export default class SchemaParser {
  /**
   * The schema XML collection.
   * @type {HedSchemaXMLCollection}
   */
  xmlCollection

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
   * @param {HedSchemaXMLCollection} xmlCollection The schema XML collection.
   */
  constructor(xmlCollection) {
    this.xmlCollection = xmlCollection
  }

  /**
   * Parse the merge group.
   *
   * @returns {SchemaEntries} The merged schema entries.
   * @throws {IssueError} If two schemas of the group declare an element incompatibly.
   */
  parse() {
    this.populateDictionaries()
    return new SchemaEntries(this)
  }

  /**
   * Parse each entry type in dependency order.
   * @private
   */
  populateDictionaries() {
    this.properties = new PropertyParser(this.xmlCollection).parse()
    this.attributes = new AttributeParser(this.xmlCollection, this.properties).parse()
    this.unitModifiers = new UnitModifierParser(this.xmlCollection, this.attributes).parse()
    this.unitClasses = new UnitClassParser(this.xmlCollection, this.attributes, this.unitModifiers).parse()
    this.valueClasses = new ValueClassParser(this.xmlCollection, this.attributes).parse()
    this.tags = new TagParser(this.xmlCollection, this.attributes, this.unitClasses, this.valueClasses).parse()
  }
}
