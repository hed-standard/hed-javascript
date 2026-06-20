import SchemaTag from './tag'
import SchemaUnitClass from './unitClass'
import SchemaValueClass from './valueClass'
import type SchemaAttribute from './attribute'
/**
 * A value-taking tag in a HED schema.
 */
export default class SchemaValueTag extends SchemaTag {
  /**
   * Constructor.
   *
   * @param name - The name of this tag.
   * @param parentTag - This tag's parent tag.
   * @param booleanAttributes - The boolean attributes for this tag.
   * @param valueAttributes - The value attributes for this tag.
   * @param unitClasses - The unit classes for this tag.
   * @param valueClasses - The value classes for this tag.
   */
  constructor(
    name: string,
    parentTag: SchemaTag | undefined,
    booleanAttributes: Set<SchemaAttribute>,
    valueAttributes: Map<SchemaAttribute, string[]>,
    unitClasses: SchemaUnitClass[],
    valueClasses: SchemaValueClass[],
  )
  /**
   * This tag's long name.
   */
  get longName(): string
  /**
   * Extend this tag's short name.
   *
   * @param extension - The extension.
   * @returns The extended short string.
   */
  extend(extension: string): string
  /**
   * Extend this tag's long name.
   *
   * @param extension - The extension.
   * @returns The extended long string.
   */
  longExtend(extension: string): string
  /**
   * This tag's parent tag.
   */
  get parent(): SchemaTag
  /**
   * Determine if this schema tag is equivalent to another schema tag.
   *
   * @remarks
   *
   * Schema tags are deemed equivalent if they have the same name and equivalent attributes, unit and value classes, and parents.
   *
   * @param other - A schema tag to compare with this one.
   * @returns Whether the other tag is equivalent to this schema tag.
   */
  equivalent(other: unknown): boolean
}
