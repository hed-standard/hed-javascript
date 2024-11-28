import { IssueError } from '../common/issues/issues'
import { getTagSlashIndices } from '../utils/hedStrings'

/**
 * Converter from a tag specification to a schema-based tag object.
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
   * The remainder (e.g. value, extension) of the tag string.
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
    this.remainder = undefined
  }

  /**
   * Retrieve the {@link SchemaTag} object for a tag specification.
   *
   * @returns {[SchemaTag, string]} The schema's corresponding tag object and the remainder of the tag string.
   * @throws {IssueError} If tag conversion.
   */
  convert() {
    let parentTag = undefined
    for (let tagLevelIndex = 0; tagLevelIndex < this.tagLevels.length; tagLevelIndex++) {
      if (parentTag?.valueTag) {
        // It is a value tag
        this._setSchemaTag(parentTag.valueTag, tagLevelIndex)
        return [this.schemaTag, this.remainder]
      }
      const childTag = this._validateChildTag(parentTag, tagLevelIndex)
      if (childTag === undefined) {
        // It is an extended tag and the rest is undefined
        this._setSchemaTag(parentTag, tagLevelIndex)
      }
      parentTag = childTag
    }
    this._setSchemaTag(parentTag, this.tagLevels.length + 1) // Fix the ending
    return [this.schemaTag, this.remainder]
  }

  _validateChildTag(parentTag, tagLevelIndex) {
    const childTag = this._getSchemaTag(tagLevelIndex)
    if (childTag === undefined) {
      // This is an extended tag
      if (tagLevelIndex === 0) {
        // Top level tags can't be extensions
        IssueError.generateAndThrow('invalidTag', { tag: this.tagString })
      }
      if (parentTag !== undefined && !parentTag.hasAttributeName('extensionAllowed')) {
        IssueError.generateAndThrow('invalidExtension', {
          // The parent doesn't allow extension
          tag: this.tagLevels[tagLevelIndex],
          parentTag: this.tagLevels.slice(0, tagLevelIndex).join('/'),
        })
      }
      this._checkExtensions(tagLevelIndex)
      return childTag
    }

    if (tagLevelIndex > 0 && (childTag.parent === undefined || childTag.parent !== parentTag)) {
      IssueError.generateAndThrow('invalidParentNode', {
        tag: this.tagLevels[tagLevelIndex],
        parentTag: this.tagLevels.slice(0, tagLevelIndex).join('/'),
      })
    }

    return childTag
  }

  _checkExtensions(tagLevelIndex) {
    // A non-tag has been detected --- from here on must be non-tags.
    this._checkNameClass(tagLevelIndex) // This is an extension
    for (let index = tagLevelIndex + 1; index < this.tagLevels.length; index++) {
      const child = this._getSchemaTag(index)
      if (child !== undefined) {
        // A schema tag showed up after a non-schema tag
        IssueError.generateAndThrow('invalidParentNode', {
          tag: this.tagLevels[index],
          parentTag: this.tagLevels.slice(0, index).join('/'),
        })
      }
      this._checkNameClass(index)
    }
  }

  _getSchemaTag(tagLevelIndex) {
    const tagLevel = this.tagLevels[tagLevelIndex].toLowerCase()
    return this.tagMapping.getEntry(tagLevel)
  }

  _setSchemaTag(schemaTag, remainderStartLevelIndex) {
    if (this.schemaTag !== undefined) {
      return
    }
    this.schemaTag = schemaTag
    this.remainder = this.tagLevels.slice(remainderStartLevelIndex).join('/')
    if (this.schemaTag?.hasAttributeName('requireChild') && !this.remainder) {
      IssueError.generateAndThrow('childRequired', { tag: this.tagString })
    }
  }

  _checkNameClass(index) {
    // Check whether the tagLevel is a valid name class
    const valueClasses = this.hedSchemas.getSchema(this.tagSpec.library).entries.valueClasses
    if (!valueClasses._definitions.get('nameClass').validateValue(this.tagLevels[index])) {
      IssueError.generateAndThrow('invalidExtension', {
        tag: this.tagLevels[index],
        parentTag: this.tagLevels.slice(0, index).join('/'),
      })
    }
  }
}
