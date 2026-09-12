import SchemaEntry from './schemaEntry'
import type SchemaProperty from './property'
/**
 * A schema attribute.
 */
export default class SchemaAttribute extends SchemaEntry {
  /**
   * The set of all attribute names which are always recursive.
   */
  static readonly ALWAYS_RECURSIVE: Set<string>
  /**
   * The properties assigned to this schema attribute.
   */
  readonly _properties: Set<SchemaProperty>
  /**
   * Whether this attribute is recursive.
   */
  readonly _recursive: boolean
  /**
   * Constructor.
   *
   * @param name - The name of the schema attribute.
   * @param properties - The properties assigned to this schema attribute.
   * @param recursive - Whether this attribute is recursive.
   */
  constructor(name: string, properties: Set<SchemaProperty>, recursive: boolean)
  /**
   * The collection of properties for this schema attribute.
   */
  get properties(): Set<SchemaProperty>
  /**
   * Whether this attribute is recursive.
   */
  get recursive(): boolean
  /**
   * Determine if this schema attribute is equivalent to another schema attribute.
   *
   * @remarks
   *
   * Schema attributes are deemed equivalent if they have the same name and properties.
   *
   * @param other - A schema attribute to compare with this one.
   * @returns Whether the other attribute is equivalent to this schema attribute.
   */
  equivalent(other: unknown): boolean
}
