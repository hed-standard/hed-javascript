import { IssueError } from '../issues/issues'
import { SchemaAttribute, SchemaEntryManager, SchemaTag, SchemaValueTag } from './entries'
import { HedSchema, PartneredSchema } from './containers'

export default class PartneredSchemaMerger {
  /**
   * The sources of data to be merged.
   */
  sourceSchemas: HedSchema[]

  /**
   * The current source of data to be merged.
   */
  currentSource: HedSchema

  /**
   * The destination of data to be merged.
   */
  destination: PartneredSchema

  /**
   * Constructor.
   *
   * @param sourceSchemas The sources of data to be merged.
   */
  constructor(sourceSchemas: HedSchema[]) {
    this.sourceSchemas = sourceSchemas
    this.destination = new PartneredSchema(sourceSchemas)
    this._validate()
  }

  /**
   * Pre-validate the partnered schemas.
   */
  private _validate(): void {
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
   * @returns The merged partnered schema.
   */
  public mergeSchemas(): PartneredSchema {
    for (const additionalSchema of this.sourceSchemas.slice(1)) {
      this.currentSource = additionalSchema
      this._mergeData()
    }
    return this.destination
  }

  /**
   * The source schema's tag collection.
   */
  get sourceTags(): SchemaEntryManager<SchemaTag> {
    return this.currentSource.entries.tags
  }

  /**
   * The destination schema's tag collection.
   */
  get destinationTags(): SchemaEntryManager<SchemaTag> {
    return this.destination.entries.tags
  }

  /**
   * Merge two lazy partnered schemas.
   */
  private _mergeData(): void {
    this._mergeTags()
  }

  /**
   * Merge the tags from two lazy partnered schemas.
   */
  private _mergeTags(): void {
    for (const tag of this.sourceTags.values()) {
      this._mergeTag(tag)
    }
  }

  /**
   * Merge a tag from one schema to another.
   *
   * @param tag The tag to copy.
   */
  private _mergeTag(tag: SchemaTag): void {
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
   * @param tag The tag to copy.
   */
  private _copyTagToSchema(tag: SchemaTag): void {
    const booleanAttributes = new Set<SchemaAttribute>()
    const valueAttributes = new Map<SchemaAttribute, any>()

    for (const attribute of tag.booleanAttributes) {
      booleanAttributes.add(this.destination.entries.attributes.getEntry(attribute.name) ?? attribute)
    }
    for (const [key, value] of tag.valueAttributes) {
      valueAttributes.set(this.destination.entries.attributes.getEntry(key.name) ?? key, value)
    }

    const unitClasses = tag.unitClasses.map(
      (unitClass) => this.destination.entries.unitClasses.getEntry(unitClass.name) ?? unitClass,
    )
    const valueClasses = tag.valueClasses.map(
      (valueClass) => this.destination.entries.valueClasses.getEntry(valueClass.name) ?? valueClass,
    )

    let newTag
    if (tag instanceof SchemaValueTag) {
      newTag = new SchemaValueTag(tag.name, booleanAttributes, valueAttributes, unitClasses, valueClasses)
    } else {
      newTag = new SchemaTag(tag.name, booleanAttributes, valueAttributes, unitClasses, valueClasses)
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
