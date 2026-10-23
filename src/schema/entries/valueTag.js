import SchemaTag from './tag'
import SchemaEntryWithAttributes from './schemaEntryWithAttributes'

import { IssueError } from '../../issues/issues'

/**
 * A value-taking tag in a HED schema.
 */
export default class SchemaValueTag extends SchemaTag {
  /**
   * Constructor.
   *
   * The value tag registers itself as its parent's value tag.
   *
   * @param {string} name The name of this tag.
   * @param {string|undefined} description The description of this tag.
   * @param {SchemaTag} parentTag This tag's parent tag.
   * @param {Set<SchemaAttribute>} booleanAttributes The boolean attributes for this tag.
   * @param {Map<SchemaAttribute, string[]>} valueAttributes The value attributes for this tag.
   * @param {SchemaUnitClass[]} unitClasses The unit classes for this tag.
   * @param {SchemaValueClass[]} valueClasses The value classes for this tag.
   * @throws {IssueError} If the tag has no parent.
   */
  constructor(name, description, parentTag, booleanAttributes, valueAttributes, unitClasses, valueClasses) {
    super(name, description, parentTag, booleanAttributes, valueAttributes, unitClasses, valueClasses)
    if (parentTag === undefined) {
      IssueError.generateAndThrowInternalError(`Value tag "${name}" must have a parent.`)
    }
    parentTag.valueTag = this
  }

  /**
   * This tag's long name.
   * @returns {string}
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
   * @param {string} extension The extension.
   * @returns {string} The extended short string.
   */
  extend(extension) {
    return this.parent.extend(extension)
  }

  /**
   * Extend this tag's long name.
   *
   * @param {string} extension The extension.
   * @returns {string} The extended long string.
   */
  longExtend(extension) {
    return this.parent.longExtend(extension)
  }

  /**
   * Determine if this schema value tag is equivalent to another schema value tag.
   *
   * Schema value tags are equivalent if they have the same name, description, and attributes, the same unit and
   * value classes (by name, in any order), and parent tags equivalent based on their names and attributes *only*.
   * The parents' ancestry is compared where the parents themselves are merged.
   *
   * @param {*} other A schema value tag to compare with this one.
   * @returns {boolean} Whether the other value tag is equivalent to this schema value tag.
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
    // A class without an entry (anyUnits before HED 8.5.0) is compared as ''.
    const names = (entries) =>
      entries
        .map((entry) => entry?.name ?? '')
        .sort((a, b) => a.localeCompare(b))
        .join('|')
    return (
      names(this.unitClasses) === names(other.unitClasses) && names(this.valueClasses) === names(other.valueClasses)
    )
  }
}
