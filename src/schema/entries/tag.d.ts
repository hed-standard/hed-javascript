import SchemaEntryWithAttributes from './schemaEntryWithAttributes'
import type SchemaAttribute from './attribute'
import type SchemaUnitClass from './unitClass'
import type SchemaValueClass from './valueClass'
import type SchemaValueTag from './valueTag'
/**
 * A tag in a HED schema.
 */
export default class SchemaTag extends SchemaEntryWithAttributes {
  #private
  /**
   * This tag's parent tag.
   */
  protected readonly _parent: SchemaTag | undefined
  /**
   * This tag's unit classes.
   */
  private readonly _unitClasses
  /**
   * This tag's value-classes
   */
  private readonly _valueClasses
  /**
   * This tag's value-taking child.
   */
  private _valueTag
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
   * This tag's unit classes.
   */
  get unitClasses(): SchemaUnitClass[]
  /**
   * Whether this tag has any unit classes.
   */
  get hasUnitClasses(): boolean
  /**
   * This tag's value classes.
   */
  get valueClasses(): SchemaValueClass[]
  /**
   * This tag's value-taking child tag.
   */
  get valueTag(): SchemaValueTag | undefined
  /**
   * Set the tag's value-taking child tag.
   *
   * @param newValueTag - The new value-taking child tag.
   */
  set valueTag(newValueTag: SchemaValueTag)
  /**
   * This tag's parent tag.
   */
  get parent(): SchemaTag | undefined
  /**
   * Return all of this tag's ancestors.
   */
  get ancestors(): SchemaTag[]
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
