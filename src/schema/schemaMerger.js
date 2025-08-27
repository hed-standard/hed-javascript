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
