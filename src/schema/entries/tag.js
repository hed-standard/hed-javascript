import SchemaEntryWithAttributes from './schemaEntryWithAttributes'

import { IssueError } from '../../issues/issues'

/**
 * A tag in a HED schema.
 */
export default class SchemaTag extends SchemaEntryWithAttributes {
  /**
   * This tag's parent tag.
   * @type {SchemaTag|undefined}
   */
  _parent

  /**
   * This tag's unit classes.
   * @type {SchemaUnitClass[]}
   */
  _unitClasses

  /**
   * This tag's value-classes
   * @type {SchemaValueClass[]}
   */
  _valueClasses

  /**
   * This tag's value-taking child.
   * @type {SchemaValueTag|undefined}
   */
  _valueTag

  /**
   * This tag's ancestor tags.
   * @type {SchemaTag[]}
   */
  #ancestors

  /**
   * Constructor.
   *
   * @param {string} name The name of this tag.
   * @param {string|undefined} description The description of this tag.
   * @param {SchemaTag|undefined} parentTag This tag's parent tag.
   * @param {Set<SchemaAttribute>} booleanAttributes The boolean attributes for this tag.
   * @param {Map<SchemaAttribute, string[]>} valueAttributes The value attributes for this tag.
   * @param {SchemaUnitClass[]} unitClasses The unit classes for this tag.
   * @param {SchemaValueClass[]} valueClasses The value classes for this tag.
   */
  constructor(name, description, parentTag, booleanAttributes, valueAttributes, unitClasses, valueClasses) {
    super(name, description, booleanAttributes, valueAttributes)
    this._parent = parentTag
    this._unitClasses = unitClasses ?? []
    this._valueClasses = valueClasses ?? []
  }

  /**
   * This tag's unit classes.
   * @returns {SchemaUnitClass[]}
   */
  get unitClasses() {
    return this._unitClasses.slice() // The slice prevents modification
  }

  /**
   * Whether this tag has any unit classes.
   * @returns {boolean}
   */
  get hasUnitClasses() {
    return this._unitClasses.length !== 0
  }

  /**
   * This tag's value classes.
   * @returns {SchemaValueClass[]}
   */
  get valueClasses() {
    return this._valueClasses.slice()
  }

  /**
   * This tag's value-taking child tag.
   * @returns {SchemaValueTag|undefined}
   */
  get valueTag() {
    return this._valueTag
  }

  /**
   * Set the tag's value-taking child tag.
   *
   * A value tag registers itself here from its constructor. When several schemas of a merge group declare the same
   * tag, the first registered value tag is kept and a later equivalent one is ignored; a different one is an error.
   *
   * @param {SchemaValueTag} newValueTag The new value-taking child tag.
   * @throws {IssueError} If this tag already has a different value tag.
   */
  set valueTag(newValueTag) {
    if (this._valueTag === undefined) {
      this._valueTag = newValueTag
    } else if (!this._valueTag.equivalent(newValueTag)) {
      IssueError.generateAndThrowInternalError(
        `Attempted to set value tag for schema tag ${this.longName} when it already has one.`,
      )
    }
  }

  /**
   * This tag's parent tag.
   * @returns {SchemaTag|undefined}
   */
  get parent() {
    return this._parent
  }

  /**
   * Return all of this tag's ancestors.
   * @returns {SchemaTag[]}
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
   * @returns {string}
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
   * @param {string} extension The extension.
   * @returns {string} The extended short string.
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
   * @param {string} extension The extension.
   * @returns {string} The extended long string.
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
   * Schema tags are equivalent if they have the same name, description, and attributes, equivalent parent tags (so
   * the same ancestor path), and either no value tag or equivalent value tags.
   *
   * @param {*} other A schema tag to compare with this one.
   * @returns {boolean} Whether the other tag is equivalent to this schema tag.
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
