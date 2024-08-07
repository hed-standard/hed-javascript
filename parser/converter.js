import { generateIssue, IssueError } from '../common/issues/issues'
import { getTagSlashIndices } from '../utils/hedStrings'
import { SchemaValueTag } from '../validator/schema/types'

/**
 * Converter from a tas specification to a schema-based tag object.
 */
export default class TagConverter {
  /**
   * A parsed tag token.
   * @type {TagSpec}
   */
  tagSpec
  /**
   * The tag string to convert.
   * @type {string}
   */
  tagString
  /**
   * The tag string split by slashes.
   * @type {string[]}
   */
  tagLevels
  /**
   * The indices of the tag string's slashes.
   * @type {number[]}
   */
  tagSlashes
  /**
   * A HED schema collection.
   * @type {Schemas}
   */
  hedSchemas
  /**
   * The entry manager for the tags in the active schema.
   * @type {SchemaTagManager}
   */
  tagMapping
  /**
   * The converted tag in the schema.
   * @type {SchemaTag}
   */
  schemaTag
  /**
   * The remainder of the tag string.
   * @type {string}
   */
  remainder

  /**
   * Constructor.
   *
   * @param {TagSpec} tagSpec The tag specification to convert.
   * @param {Schemas} hedSchemas The HED schema collection.
   */
  constructor(tagSpec, hedSchemas) {
    this.hedSchemas = hedSchemas
    this.tagMapping = hedSchemas.getSchema(tagSpec.library).entries.tags
    this.tagSpec = tagSpec
    this.tagString = tagSpec.tag
    this.tagLevels = this.tagString.split('/')
    this.tagSlashes = getTagSlashIndices(this.tagString)
  }

  /**
   * Retrieve the {@link SchemaTag} object for a tag specification.
   *
   * @returns {[SchemaTag, string]} The schema's corresponding tag object and the remainder of the tag string.
   */
  convert() {
    const firstLevel = this._checkFirstLevel()
    if (firstLevel) {
      return [firstLevel, '']
    }

    return this._checkLowerLevels()
  }

  _checkFirstLevel() {
    const firstLevel = this.tagLevels[0].toLowerCase().trimStart()
    const schemaTag = this.tagMapping.getEntry(firstLevel)
    if (!schemaTag || firstLevel === '' || firstLevel !== firstLevel.trim()) {
      throw new IssueError(generateIssue('invalidTag', { tag: this.tagString }))
    }
    if (this.tagLevels.length === 1) {
      return schemaTag
    } else {
      return undefined
    }
  }

  _checkLowerLevels() {
    let parentTag = this._getSchemaTag(0)
    for (let i = 1; i < this.tagLevels.length; i++) {
      if (parentTag?.valueTag) {
        this._setSchemaTag(parentTag.valueTag, i)
        break
      }
      const childTag = this._validateChildTag(parentTag, i)
      if (childTag === undefined) {
        this._setSchemaTag(parentTag, i)
      }
      parentTag = childTag
    }
    this._setSchemaTag(parentTag, this.tagLevels.length + 1)
    return [this.schemaTag, this.remainder]
  }

  _validateChildTag(parentTag, i) {
    const childTag = this._getSchemaTag(i)
    if (this.schemaTag instanceof SchemaValueTag) {
      throw new IssueError(
        generateIssue('internalConsistencyError', {
          message: 'Child tag is a value tag which should have been handled earlier.',
        }),
      )
    }
    if (childTag === undefined && parentTag && !parentTag.hasAttributeName('extensionAllowed')) {
      throw new IssueError(
        generateIssue('invalidExtension', {
          tag: this.tagLevels[i],
          parentTag: parentTag.longName,
        }),
      )
    }
    if (childTag !== undefined && (childTag.parent === undefined || childTag.parent !== parentTag)) {
      throw new IssueError(
        generateIssue('invalidParentNode', {
          tag: this.tagLevels[i],
          parentTag: childTag.longName,
        }),
      )
    }
    return childTag
  }

  _getSchemaTag(i) {
    const tagLevel = this.tagLevels[i].toLowerCase()
    if (tagLevel === '' || tagLevel !== tagLevel.trim()) {
      throw new IssueError(generateIssue('invalidTag', { tag: this.tagString }))
    }
    return this.tagMapping.getEntry(tagLevel)
  }

  _setSchemaTag(schemaTag, i) {
    if (this.schemaTag === undefined) {
      this.schemaTag = schemaTag
      this.remainder = this.tagLevels.slice(i).join('/')
    }
  }
}
