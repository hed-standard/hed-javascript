import AttributeParser from './attribute'
import PropertyParser from './property'
import TagParser from './tag'
import UnitClassParser from './unitClass'
import UnitModifierParser from './unitModifier'
import ValueClassParser from './valueClass'
import SchemaEntries from '../entries/schemaEntries'
export default class SchemaParser {
  /**
   * The schema XML collection.
   */
  xmlCollection
  properties
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
   * @param xmlCollection - The schema XML collection.
   */
  constructor(xmlCollection) {
    this.xmlCollection = xmlCollection
  }
  parse() {
    this.populateDictionaries()
    return new SchemaEntries(this)
  }
  populateDictionaries() {
    this.properties = new PropertyParser(this.xmlCollection).parse()
    this.attributes = new AttributeParser(this.xmlCollection, this.properties).parse()
    this.unitModifiers = new UnitModifierParser(this.xmlCollection, this.attributes).parse()
    this.unitClasses = new UnitClassParser(this.xmlCollection, this.attributes, this.unitModifiers).parse()
    this.valueClasses = new ValueClassParser(this.xmlCollection, this.attributes).parse()
    this.tags = new TagParser(this.xmlCollection, this.attributes, this.unitClasses, this.valueClasses).parse()
  }
}
