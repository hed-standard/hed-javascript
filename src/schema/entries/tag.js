import SchemaEntryWithAttributes from './schemaEntryWithAttributes'
import { IssueError } from '../../issues/issues'
/**
 * A tag in a HED schema.
 */
export default class SchemaTag extends SchemaEntryWithAttributes {
  /**
   * This tag's parent tag.
   */
  _parent
  /**
   * This tag's unit classes.
   */
  _unitClasses
  /**
   * This tag's value-classes
   */
  _valueClasses
  /**
   * This tag's value-taking child.
   */
  _valueTag
  /**
   * This tag's ancestor tags.
   */
  #ancestors
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
    super(name, booleanAttributes, valueAttributes)
    this._parent = parentTag
    this._unitClasses = unitClasses ?? []
    this._valueClasses = valueClasses ?? []
  }
  /**
   * This tag's unit classes.
   */
  get unitClasses() {
    return this._unitClasses.slice() // The slice prevents modification
  }
  /**
   * Whether this tag has any unit classes.
   */
  get hasUnitClasses() {
    return this._unitClasses.length !== 0
  }
  /**
   * This tag's value classes.
   */
  get valueClasses() {
    return this._valueClasses.slice()
  }
  /**
   * This tag's value-taking child tag.
   */
  get valueTag() {
    return this._valueTag?.deref()
  }
  /**
   * Set the tag's value-taking child tag.
   *
   * @param newValueTag - The new value-taking child tag.
   */
  set valueTag(newValueTag) {
    if (this._valueTag !== undefined && this._valueTag.deref()?.equivalent(newValueTag) === false) {
      IssueError.generateAndThrowInternalError(
        `Attempted to set value tag for schema tag ${this.longName} when it already has one.`,
      )
    }
    this._valueTag = new WeakRef(newValueTag)
  }
  /**
   * This tag's parent tag.
   */
  get parent() {
    return this._parent
  }
  /**
   * Return all of this tag's ancestors.
   */
  get ancestors() {
    if (this.#ancestors !== undefined) {
      return this.#ancestors
    }
    this.#ancestors = this.parent ? [this.parent, ...this.parent.ancestors] : []
    return this.#ancestors
  }
  /**
   * This tag's long name.
   */
  get longName() {
    const nameParts = this.ancestors.map((parentTag) => parentTag.name)
    nameParts.reverse()
    nameParts.push(this.name)
    return nameParts.join('/')
  }
  /**
   * Extend this tag's short name.
   *
   * @param extension - The extension.
   * @returns The extended short string.
   */
  extend(extension) {
    if (extension) {
      return this.name + '/' + extension
    } else {
      return this.name
    }
  }
  /**
   * Extend this tag's long name.
   *
   * @param extension - The extension.
   * @returns The extended long string.
   */
  longExtend(extension) {
    if (extension) {
      return this.longName + '/' + extension
    } else {
      return this.longName
    }
  }
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
  equivalent(other) {
    if (!(other instanceof SchemaTag)) {
      return false
    }
    if (!super.equivalent(other)) {
      return false
    }
    if (this.parent === undefined && other.parent !== undefined) {
      return false
    }
    if (this.parent && !this.parent.equivalent(other.parent)) {
      return false
    }
    if (this.valueTag === undefined && other.valueTag !== undefined) {
      return false
    }
    return !(this.valueTag && !this.valueTag.equivalent(other.valueTag))
  }
}
