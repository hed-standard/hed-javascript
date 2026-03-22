/** This module holds the classes for merging partnered schemas.
 * @module schema/schemaMerger
 */
import { IssueError } from '../issues/issues'
import { SchemaTag, SchemaValueTag } from './entries'
import { PartneredSchema } from './containers'

export default class PartneredSchemaMerger {
  /**
   * The sources of data to be merged.
   * @type {Schema[]}
   */
  sourceSchemas

  /**
   * The current source of data to be merged.
   * @type {Schema}
   */
  currentSource

  /**
   * The destination of data to be merged.
   * @type {PartneredSchema}
   */
  destination

  /**
   * Constructor.
   *
   * @param {Schema[]} sourceSchemas The sources of data to be merged.
   */
  constructor(sourceSchemas) {
    this.sourceSchemas = sourceSchemas
    this.destination = new PartneredSchema(sourceSchemas)
    this._validate()
  }

  /**
   * Pre-validate the partnered schemas.
   * @private
   */
  _validate() {
    for (const schema of this.sourceSchemas.slice(1)) {
      if (schema.withStandard !== this.destination.withStandard) {
        IssueError.generateAndThrow('differentWithStandard', {
          first: schema.withStandard,
          second: this.destination.withStandard,
        })
      }
    }
  }

  /**
   * Merge the lazy partnered schemas.
   *
   * @returns {PartneredSchema} The merged partnered schema.
   */
  mergeSchemas() {
    for (const additionalSchema of this.sourceSchemas.slice(1)) {
      this.currentSource = additionalSchema
      this._mergeData()
    }
    return this.destination
  }

  /**
   * The source schema's tag collection.
   *
   * @return {SchemaEntryManager<SchemaTag>}
   */
  get sourceTags() {
    return this.currentSource.entries.tags
  }

  /**
   * The destination schema's tag collection.
   *
   * @returns {SchemaEntryManager<SchemaTag>}
   */
  get destinationTags() {
    return this.destination.entries.tags
  }

  /**
   * Merge two lazy partnered schemas.
   * @private
   */
  _mergeData() {
    this._mergeTags()
  }

  /**
   * Merge the tags from two lazy partnered schemas.
   * @private
   */
  _mergeTags() {
    for (const tag of this.sourceTags.values()) {
      this._mergeTag(tag)
    }
  }

  /**
   * Merge a tag from one schema to another.
   *
   * @param {SchemaTag} tag The tag to copy.
   * @private
   */
  _mergeTag(tag) {
    if (!tag.getAttributeValue('inLibrary')) {
      return
    }

    const shortName = tag.name
    if (this.destinationTags.hasEntry(shortName.toLowerCase())) {
      IssueError.generateAndThrow('lazyPartneredSchemasShareTag', { tag: shortName })
    }

    const rootedTagShortName = tag.getAttributeValue('rooted')
    if (rootedTagShortName) {
      const parentTag = tag.parent
      if (parentTag?.name?.toLowerCase() !== rootedTagShortName?.toLowerCase()) {
        IssueError.generateAndThrowInternalError(`Node ${shortName} is improperly rooted.`)
      }
    }

    this._copyTagToSchema(tag)
  }

  /**
   * Copy a tag from one schema to another.
   *
   * @param {SchemaTag} tag The tag to copy.
   * @private
   */
  _copyTagToSchema(tag) {
    const booleanAttributes = new Set()
    const valueAttributes = new Map()

    for (const attribute of tag.booleanAttributes) {
      booleanAttributes.add(this.destination.entries.attributes.getEntry(attribute.name) ?? attribute)
    }
    for (const [key, value] of tag.valueAttributes) {
      valueAttributes.set(this.destination.entries.attributes.getEntry(key.name) ?? key, value)
    }

    /**
     * @type {SchemaUnitClass[]}
     */
    const unitClasses = tag.unitClasses.map(
      (unitClass) => this.destination.entries.unitClasses.getEntry(unitClass.name) ?? unitClass,
    )

    let newTag
    if (tag instanceof SchemaValueTag) {
      newTag = new SchemaValueTag(tag.name, booleanAttributes, valueAttributes, unitClasses)
    } else {
      newTag = new SchemaTag(tag.name, booleanAttributes, valueAttributes, unitClasses)
    }
    const destinationParentTag = this.destinationTags.getEntry(tag.parent?.name?.toLowerCase())
    if (destinationParentTag) {
      newTag.parent = destinationParentTag
      if (newTag instanceof SchemaValueTag) {
        newTag.parent.valueTag = newTag
      }
    }

    this.destinationTags._definitions.set(newTag.name.toLowerCase(), newTag)
  }
}

/**
 * Merger for schemas that include one or more unmerged library schemas.
 *
 * An unmerged library schema (one with {@code unmerged="True"} in its XML header) does not mark
 * its tags with the {@code inLibrary} attribute.  Instead every tag in the library XML is a
 * library-specific tag, and root-level library tags carry a {@code rooted} attribute that names
 * the standard-schema tag under which they should be attached.
 *
 * This class extends {@link PartneredSchemaMerger} and overrides the per-tag merge logic:
 *
 * - Tags that carry {@code inLibrary} (i.e. from a merged library in the same set) are handled
 *   exactly as {@link PartneredSchemaMerger} handles them.
 * - Tags that do NOT carry {@code inLibrary} and are not already in the destination are treated
 *   as unmerged library tags: all such tags are merged, with root-level tags having their
 *   parent set via the {@code rooted} attribute.
 * - Tags that do NOT carry {@code inLibrary} and ARE already in the destination are standard
 *   schema tags that appeared inside a merged library XML; they are silently skipped.
 */
export class UnmergedLibrarySchemaMerger extends PartneredSchemaMerger {
  /**
   * Merge a single tag from a source schema into the destination.
   *
   * @param {SchemaTag} tag The tag to merge.
   * @override
   * @private
   */
  _mergeTag(tag) {
    const shortName = tag.name
    const hasInLibrary = !!tag.getAttributeValue('inLibrary')

    if (hasInLibrary) {
      // Merged-library tag: use the existing PartneredSchemaMerger behaviour.
      if (this.destinationTags.hasEntry(shortName.toLowerCase())) {
        IssueError.generateAndThrow('lazyPartneredSchemasShareTag', { tag: shortName })
      }
      const rootedTagShortName = tag.getAttributeValue('rooted')
      if (rootedTagShortName) {
        const parentTag = tag.parent
        if (parentTag?.name?.toLowerCase() !== rootedTagShortName?.toLowerCase()) {
          IssueError.generateAndThrowInternalError(`Node ${shortName} is improperly rooted.`)
        }
      }
      this._copyTagToSchema(tag)
      return
    }

    if (this.destinationTags.hasEntry(shortName.toLowerCase())) {
      // Standard-schema tag that was also embedded in a merged library XML — skip it.
      return
    }

    // Unmerged library tag: all such tags are new; merge with rooted-parent handling.
    this._copyUnmergedTagToSchema(tag)
  }

  /**
   * Copy an unmerged-library tag into the destination schema.
   *
   * For root-level library tags (those with no parent in the library XML), the destination
   * parent is located via the tag's {@code rooted} attribute.  For non-root library tags the
   * destination parent is looked up by name (the parent tag must have been added first).
   *
   * @param {SchemaTag} tag The unmerged library tag to copy.
   * @private
   */
  _copyUnmergedTagToSchema(tag) {
    const booleanAttributes = new Set()
    const valueAttributes = new Map()

    for (const attribute of tag.booleanAttributes) {
      booleanAttributes.add(this.destination.entries.attributes.getEntry(attribute.name) ?? attribute)
    }
    for (const [key, value] of tag.valueAttributes) {
      valueAttributes.set(this.destination.entries.attributes.getEntry(key.name) ?? key, value)
    }

    const unitClasses = tag.unitClasses.map(
      (unitClass) => this.destination.entries.unitClasses.getEntry(unitClass.name) ?? unitClass,
    )

    let newTag
    if (tag instanceof SchemaValueTag) {
      newTag = new SchemaValueTag(tag.name, booleanAttributes, valueAttributes, unitClasses)
    } else {
      newTag = new SchemaTag(tag.name, booleanAttributes, valueAttributes, unitClasses)
    }

    // Determine the destination parent.
    //   • Root-level library tags have no parent in the unmerged XML; use 'rooted' attribute.
    //   • Child library tags reference a parent that was already added to the destination.
    let parentName
    if (tag.parent) {
      parentName = tag.parent.name.toLowerCase()
    } else {
      const rootedTagShortName = tag.getAttributeValue('rooted')
      if (rootedTagShortName) {
        parentName = rootedTagShortName.toLowerCase()
      }
    }

    const destinationParentTag = parentName ? this.destinationTags.getEntry(parentName) : undefined
    if (destinationParentTag) {
      newTag.parent = destinationParentTag
      if (newTag instanceof SchemaValueTag) {
        newTag.parent.valueTag = newTag
      }
    }

    this.destinationTags._definitions.set(newTag.name.toLowerCase(), newTag)
  }
}
