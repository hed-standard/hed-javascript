import type SchemaEntryManager from './schemaEntryManager'
import type SchemaProperty from './property'
import type SchemaAttribute from './attribute'
import type SchemaValueClass from './valueClass'
import type SchemaUnitClass from './unitClass'
import type SchemaUnitModifier from './unitModifier'
import type SchemaTag from './tag'
import type SchemaParser from '../parser/schemaParser'
/**
 * Container for schema entries.
 */
export default class SchemaEntries {
  /**
   * The schema's properties.
   */
  readonly properties: SchemaEntryManager<SchemaProperty>
  /**
   * The schema's attributes.
   */
  readonly attributes: SchemaEntryManager<SchemaAttribute>
  /**
   * The schema's value classes.
   */
  readonly valueClasses: SchemaEntryManager<SchemaValueClass>
  /**
   * The schema's unit classes.
   */
  readonly unitClasses: SchemaEntryManager<SchemaUnitClass>
  /**
   * The schema's unit modifiers.
   */
  readonly unitModifiers: SchemaEntryManager<SchemaUnitModifier>
  /**
   * The schema's tags.
   */
  readonly tags: SchemaEntryManager<SchemaTag>
  /**
   * Constructor.
   *
   * @param schemaParser - A constructed schema parser.
   */
  constructor(schemaParser: SchemaParser)
}
