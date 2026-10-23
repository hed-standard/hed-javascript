/**
 * This module holds the classes for converting a tag specification into a schema-based tag object.
 * @module parser/tagConverter
 */

import { ReservedChecker } from './reservedChecker'
import { IssueError } from '../issues/issues'
import { getTagSlashIndices } from '../utils/hedStrings'

/**
 * @typedef {import('../schema/entries/tag.js').default} SchemaTag
 * @typedef {import('../schema/containers.js').HedSchemas} Schemas
 * @typedef {import('./tokenizer.js').TagSpec} TagSpec
 */

/**
 * Converter from a tag specification to a schema-based tag object.
 */
export default class TagConverter {
  /**
   * A parsed tag token.
   * @type {TagSpec}
   * @private
   */
  tagSpec

  /**
   * The tag string to convert.
   * @type {string}
   * @private
   */
  tagString

  /**
   * The tag string split by slashes.
   * @type {string[]}
   * @private
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
   * @private
   */
  hedSchemas

  /**
   * The entry manager for the tags in the active schema.
   * @type {SchemaEntryManager<SchemaTag>|undefined}
   * @private
   */
  tagMapping

  /**
   * The converted tag in the schema.
   * @type {SchemaTag}
   * @private
   */
  schemaTag

  /**
   * The remainder (e.g. value, extension) of the tag string.
   * @type {string}
   * @private
   */
  remainder

  /**
   * The special tag checker.
   * @type {ReservedChecker}
   * @private
   */
  special

  /**
   * Constructor.
   *
   * @param {TagSpec} tagSpec - The tag specification to convert.
   * @param {Schemas} hedSchemas - The HED schema collection.
   */
  constructor(tagSpec, hedSchemas) {
    this.hedSchemas = hedSchemas
    this.tagMapping = hedSchemas.getSchema(tagSpec.library)?.entries.tags
    this.tagSpec = tagSpec
    this.tagString = tagSpec.tag
    this.tagLevels = this.tagString.split('/')
    this.tagSlashes = getTagSlashIndices(this.tagString)
    this.remainder = ''
    this.special = ReservedChecker.getInstance()
  }

  /**
   * Retrieve the {@link SchemaTag} object for a tag specification.
   *
   * @returns {Array} A tuple [SchemaTag, string] of the schema's corresponding tag object and the remainder of the tag string.
   * @throws {IssueError} If tag conversion fails.
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

  /**
   * Validate the schema tag at a level of the tag string against its parent.
   *
   * @param {SchemaTag|undefined} parentTag - The schema tag of the previous level.
   * @param {number} tagLevelIndex - The index of the level.
   * @returns {SchemaTag|undefined} The schema tag of this level, or undefined if it is an extension.
   * @throws {IssueError} If the level is not a valid child or extension.
   * @private
   */
  _validateChildTag(parentTag, tagLevelIndex) {
    const childTag = this._getSchemaTag(tagLevelIndex)
    if (childTag === undefined) {
      // This is an extended tag
      if (tagLevelIndex === 0) {
        // Top level tags can't be extensions
        IssueError.generateAndThrow('invalidTag', {
          tag: this.tagString,
          msg: 'Tag extensions must have a parent in the HED schema.',
        })
      }
      // A reserved tag that takes no value is not extended, even by "#" (TAG_EXTENSION_INVALID c); any other "#"
      // here stands where its parent has no placeholder child (PLACEHOLDER_INVALID d).
      if (parentTag !== undefined && this.special.noExtensionTags.has(parentTag.name)) {
        this._throwExtensionNotAllowed(parentTag, tagLevelIndex)
      }
      this._checkPlaceholder(tagLevelIndex)
      if (parentTag !== undefined && !parentTag.hasAttribute('extensionAllowed')) {
        this._throwExtensionNotAllowed(parentTag, tagLevelIndex)
      }
      this._checkExtensions(tagLevelIndex)
      return childTag
    }

    if (tagLevelIndex > 0 && (childTag.parent === undefined || childTag.parent !== parentTag)) {
      IssueError.generateAndThrow('invalidParentNode', {
        tag: this.tagLevels[tagLevelIndex],
        parentTag: this.tagLevels.slice(0, tagLevelIndex).join('/'),
        msg: `The parent tag "${parentTag?.name}" does not match the expected parent "${childTag.parent?.name}" in the schema.`,
      })
    }

    return childTag
  }

  /**
   * Report an extension of a tag that does not allow one.
   *
   * @param {SchemaTag} parentTag - The schema tag being extended.
   * @param {number} tagLevelIndex - The index of the extension level.
   * @throws {IssueError} Always.
   * @private
   */
  _throwExtensionNotAllowed(parentTag, tagLevelIndex) {
    IssueError.generateAndThrow('invalidExtension', {
      tag: this.tagLevels[tagLevelIndex],
      parentTag: this.tagLevels.slice(0, tagLevelIndex).join('/'),
      msg: `The tag "${this.tagLevels[tagLevelIndex]}" is an extension, but the parent tag "${parentTag.name}" does not allow extensions.`,
    })
  }

  /**
   * Check the levels of an extension.
   *
   * @param {number} tagLevelIndex - The index of the first extension level.
   * @throws {IssueError} If a level is a schema tag, a placeholder, not in the name class, or has no letter.
   * @private
   */
  _checkExtensions(tagLevelIndex) {
    // A non-tag has been detected --- from here on must be non-tags.
    this._checkNameClass(tagLevelIndex) // This is an extension
    for (let index = tagLevelIndex + 1; index < this.tagLevels.length; index++) {
      const child = this._getSchemaTag(index)
      if (child !== undefined) {
        // A schema tag showed up after a non-schema tag
        IssueError.generateAndThrow('invalidParentNode', {
          tag: child.name,
          parentTag: this.tagLevels.slice(0, index).join('/'),
          msg: `The tag "${child.name}" is a schema tag, but it appears after an extension tag "${this.tagLevels[tagLevelIndex]}".`,
        })
      }
      this._checkPlaceholder(index)
      this._checkNameClass(index)
    }
  }

  /**
   * Check that a level of an extension is not a "#" placeholder.
   *
   * A "#" after an extension term (Item/Blech/#) or in place of one (Item/#) has no placeholder child to stand for,
   * so it is PLACEHOLDER_INVALID in every context (specification 3.2.5 rule 5).
   *
   * @param {number} index - The index of the level.
   * @throws {IssueError} If the level is a placeholder.
   * @private
   */
  _checkPlaceholder(index) {
    if (this.tagLevels[index] === '#') {
      IssueError.generateAndThrow('invalidPlaceholder', { tag: this.tagString })
    }
  }

  /**
   * Get the schema tag for a level of the tag string.
   *
   * @param {number} tagLevelIndex - The index of the level.
   * @returns {SchemaTag|undefined} The schema tag, if any.
   * @private
   */
  _getSchemaTag(tagLevelIndex) {
    const tagLevel = this.tagLevels[tagLevelIndex].toLowerCase()
    return this.tagMapping?.getEntry(tagLevel)
  }

  /**
   * Set the converted schema tag and the remainder, if not already set.
   *
   * @param {SchemaTag|undefined} schemaTag - The schema tag.
   * @param {number} remainderStartLevelIndex - The index of the first level of the remainder.
   * @throws {IssueError} If the tag requires a child or a value and has none.
   * @private
   */
  _setSchemaTag(schemaTag, remainderStartLevelIndex) {
    if (this.schemaTag !== undefined || schemaTag === undefined) {
      return
    }
    this.schemaTag = schemaTag
    this.remainder = this.tagLevels.slice(remainderStartLevelIndex).join('/')
    if (this.schemaTag?.hasAttribute('requireChild') && !this.remainder) {
      IssueError.generateAndThrow('childRequired', {
        tag: this.tagString,
        msg: `The tag "${this.schemaTag?.name}" requires a child tag, but none was provided.`,
      })
    }
    // Delay and Duration lack requireChild before HED 8.3.0; the reserved-tag file requires their value.
    if (this.special.requireValueTags.has(this.schemaTag?.name) && !this.remainder) {
      IssueError.generateAndThrow('valueRequired', { tag: this.tagString })
    }
  }

  /**
   * Check that a level of the tag string is in the name class and contains a letter.
   *
   * A letter is A-Z or a-z, or any Unicode letter when the schema's name class allows non-ASCII characters
   * (standard schema 8.3.0 and later). A term without one (3, 1-2, an Arabic-Indic digit) reads as a value
   * (specification 3.2.5 rule 6). The letter test is the Unicode one for every schema: a name class without
   * non-ASCII characters has already rejected them, so only ASCII letters can count there.
   *
   * @param {number} index - The index of the level.
   * @throws {IssueError} If the level is not in the name class or has no letter.
   * @private
   */
  _checkNameClass(index) {
    // Check whether the tagLevel is a valid name class
    const tagLevel = this.tagLevels[index]
    const valueClasses = this.hedSchemas.getSchema(this.tagSpec.library)?.entries.valueClasses
    const nameClass = valueClasses?.getEntry('nameClass')
    if (!nameClass?.validateValue(tagLevel)) {
      IssueError.generateAndThrow('invalidExtension', {
        tag: tagLevel,
        parentTag: this.tagLevels.slice(0, index).join('/'),
        msg: `The tag extension "${tagLevel}" is not in the HED name class, so it cannot be used as a tag extension.`,
      })
    }
    if (!/\p{L}/u.test(tagLevel)) {
      IssueError.generateAndThrow('invalidExtension', {
        tag: tagLevel,
        parentTag: this.tagLevels.slice(0, index).join('/'),
        msg: `The tag extension "${tagLevel}" contains no letter, so it reads as a value and cannot be used as a tag extension.`,
      })
    }
  }
}
