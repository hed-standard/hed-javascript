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
    if (!this.tagLevels[0]) {
      this.tagLevels.shift()
      this.tagSlashes.shift()
    }
    if (!this.tagLevels[this.tagLevels.length - 1]) {
      this.tagLevels.pop()
      this.tagSlashes.pop()
    }
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
    const firstLevel = this.tagLevels[0].trim().toLowerCase()
    const schemaTag = this.tagMapping.getEntry(firstLevel)
    if (!schemaTag) {
      throw new IssueError(generateIssue('invalidTag', { tag: this.tagString, bounds: this.tagSpec.bounds }))
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
      }
      const childTag = this._validateChildTag(parentTag, i)
      if (childTag === undefined) {
        this._setSchemaTag(parentTag, i)
      }
      parentTag = this._getSchemaTag(i)
    }
    this._setSchemaTag(parentTag, this.tagLevels.length + 1)
    return [this.schemaTag, this.remainder]
  }

  _validateChildTag(parentTag, i) {
    const childTag = this._getSchemaTag(i)
    if (
      childTag === undefined &&
      parentTag &&
      !parentTag.hasAttributeName('extensionAllowed') &&
      !(this.schemaTag instanceof SchemaValueTag)
    ) {
      throw new IssueError(generateIssue('invalidExtension', { tag: this.tagLevels[i], parentTag: parentTag.longName }))
    }
    if (childTag !== undefined && childTag.parent !== parentTag) {
      throw new IssueError(
        generateIssue('invalidParentNode', {
          tag: this.tagLevels[i],
          parentTag: childTag.longName,
          bounds: [
            this.tagSpec.bounds[0] + this.tagSlashes[i - 1] + 1,
            this.tagSpec.bounds[0] + (this.tagSlashes[i] ?? this.tagString.length),
          ],
        }),
      )
    }
    return childTag
  }

  _getSchemaTag(i) {
    const tagLevel = this.tagLevels[i].trim().toLowerCase()
    if (tagLevel === '') {
      throw new IssueError(generateIssue('invalidTag', { tag: this.tagString, bounds: this.tagSpec.bounds }))
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
