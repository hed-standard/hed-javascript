import { IssueError } from '../common/issues/issues'
import { getTagSlashIndices } from '../utils/hedStrings'
import { SchemaValueTag } from '../validator/schema/types'

/**
 * Converter from a tag specification to a schema-based tag object.
 */
export default class TagConverter {
  /**
   * Constructor.
   *
   * @param {TagSpec} tagSpec - The tag specification to convert.
   * @param {Schemas} hedSchemas - The HED schema collection.
   */
  constructor(tagSpec, hedSchemas) {
    this.tagSpec = tagSpec
    this.tagString = tagSpec.tag
    this.tagLevels = this.tagString.split('/')
    this.tagSlashes = getTagSlashIndices(this.tagString)
    this.hedSchemas = hedSchemas
    this.tagMapping = hedSchemas.getSchema(tagSpec.library).entries.tags
    this.schemaTag = undefined
    this.remainder = ''
  }

  /**
   * Retrieve the SchemaTag object for a tag specification.
   *
   * @returns {[SchemaTag, string]} The schema's corresponding tag object and the remainder of the tag string.
   */
  convert() {
    let parentTag = undefined

    for (let i = 0; i < this.tagLevels.length; i++) {
      if (parentTag?.valueTag) return this._finalizeSchemaTag(parentTag.valueTag, i)

      const childTag = this._validateAndGetChildTag(parentTag, i)
      if (!childTag) return this._finalizeSchemaTag(parentTag, i)

      parentTag = childTag
    }

    return this._finalizeSchemaTag(parentTag, this.tagLevels.length)
  }

  /**
   * Validates the child tag against schema rules and retrieves the corresponding schema entry.
   *
   * @param {SchemaTag} parentTag - The parent schema tag.
   * @param {number} levelIndex - The index level of the tag.
   * @returns {SchemaTag} The child schema tag, if valid.
   */
  _validateAndGetChildTag(parentTag, levelIndex) {
    const childTag = this._getSchemaTag(levelIndex)

    if (this.schemaTag instanceof SchemaValueTag) {
      this._throwIssue('internalConsistencyError', 'Child tag is a value tag which should have been handled earlier.')
    }

    if (!childTag) {
      if (levelIndex === 0) this._throwIssue('invalidTag', { tag: this.tagString })
      if (parentTag && !parentTag.hasAttributeName('extensionAllowed')) {
        this._throwIssue('invalidExtension', { tag: this.tagLevels[levelIndex], parentTag: parentTag.longName })
      }
      return undefined
    }

    if (parentTag && (!childTag.parent || childTag.parent !== parentTag)) {
      this._throwIssue('invalidParentNode', { tag: this.tagLevels[levelIndex], parentTag: childTag.longName })
    }

    return childTag
  }

  /**
   * Retrieves a schema tag from the tag mapping.
   *
   * @param {number} levelIndex - The index of the tag level.
   * @param {boolean} [trimLeft=false] - Whether to trim the left side of the string.
   * @returns {SchemaTag|undefined} The corresponding schema tag, if found.
   */
  _getSchemaTag(levelIndex, trimLeft = false) {
    let tagLevel = this.tagLevels[levelIndex].toLowerCase()
    if (trimLeft) tagLevel = tagLevel.trimLeft()

    if (!tagLevel || tagLevel !== tagLevel.trim()) {
      this._throwIssue('invalidTag', { tag: this.tagString })
    }

    return this.tagMapping.getEntry(tagLevel)
  }

  /**
   * Sets the final schema tag and calculates the remainder string.
   *
   * @param {SchemaTag} schemaTag - The schema tag to set.
   * @param {number} splitIndex - The index to split the remainder.
   * @returns {[SchemaTag, string]} The schema tag and remainder.
   */
  _finalizeSchemaTag(schemaTag, splitIndex) {
    if (this.schemaTag) return [this.schemaTag, this.remainder]

    this.schemaTag = schemaTag
    this.remainder = this.tagLevels.slice(splitIndex).join('/')
    if (schemaTag?.hasAttributeName('requireChild') && !this.remainder) {
      this._throwIssue('childRequired', { tag: this.tagString })
    }

    return [this.schemaTag, this.remainder]
  }

  /**
   * Generates and throws an issue error.
   *
   * @param {string} errorType - The type of error.
   * @param {object} details - Additional details for the error.
   */
  _throwIssue(errorType, details) {
    IssueError.generateAndThrow(errorType, details)
  }
}
