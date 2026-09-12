import { isEqualWith } from 'lodash'
import SchemaTag from './tag'
import SchemaUnitClass from './unitClass'
import SchemaValueClass from './valueClass'
import SchemaEntryWithAttributes from './schemaEntryWithAttributes'
import SchemaEntry from './schemaEntry'
import { IssueError } from '../../issues/issues'
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
  constructor(name, parentTag, booleanAttributes, valueAttributes, unitClasses, valueClasses) {
    super(name, parentTag, booleanAttributes, valueAttributes, unitClasses, valueClasses)
    if (parentTag === undefined) {
      IssueError.generateAndThrowInternalError('Value tag must have parent')
    }
    parentTag.valueTag = this
  }
  /**
   * This tag's long name.
   */
  get longName() {
    const nameParts = this.ancestors.map((parentTag) => parentTag.name)
    nameParts.reverse()
    nameParts.push('#')
    return nameParts.join('/')
  }
  /**
   * Extend this tag's short name.
   *
   * @param extension - The extension.
   * @returns The extended short string.
   */
  extend(extension) {
    return this.parent.extend(extension)
  }
  /**
   * Extend this tag's long name.
   *
   * @param extension - The extension.
   * @returns The extended long string.
   */
  longExtend(extension) {
    return this.parent.longExtend(extension)
  }
  /**
   * This tag's parent tag.
   */
  get parent() {
    return this._parent
  }
  /**
   * Determine if this schema value tag is equivalent to another schema value tag.
   *
   * @remarks
   *
   * Schema value tags are deemed equivalent if they have the same name and equivalent attributes, equivalent unit and
   * value classes, and parent tags equivalent based on their names and attributes *only*.
   *
   * @param other - A schema value tag to compare with this one.
   * @returns Whether the other value tag is equivalent to this schema value tag.
   */
  equivalent(other) {
    if (!(other instanceof SchemaValueTag)) {
      return false
    }
    if (!SchemaEntryWithAttributes.prototype.equivalent.call(this, other)) {
      return false
    }
    if (!SchemaEntryWithAttributes.prototype.equivalent.call(this.parent, other.parent)) {
      return false
    }
    if (
      !isEqualWith(
        this.unitClasses.toSorted(SchemaEntry.sortByName),
        other.unitClasses.toSorted(SchemaEntry.sortByName),
        (a, b) => (a instanceof SchemaUnitClass ? a.equivalent(b) : undefined),
      )
    ) {
      return false
    }
    return isEqualWith(
      this.valueClasses.toSorted(SchemaEntry.sortByName),
      other.valueClasses.toSorted(SchemaEntry.sortByName),
      (a, b) => (a instanceof SchemaValueClass ? a.equivalent(b) : undefined),
    )
  }
}
