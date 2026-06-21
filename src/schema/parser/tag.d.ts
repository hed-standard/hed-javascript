import { type HedSchemaXMLCollection, type HedSchemaXMLObject } from '../xmlType'
import { SchemaEntryWithAttributesParser } from './schemaEntry'
import type SchemaEntryManager from '../entries/schemaEntryManager'
import type SchemaUnitClass from '../entries/unitClass'
import type SchemaValueClass from '../entries/valueClass'
import type SchemaAttribute from '../entries/attribute'
import SchemaTag from '../entries/tag'
export default class TagParser extends SchemaEntryWithAttributesParser<SchemaTag> {
  private readonly unitClasses
  private readonly valueClasses
  private schemaTags
  constructor(
    xmlCollection: HedSchemaXMLCollection,
    attributes: SchemaEntryManager<SchemaAttribute>,
    unitClasses: SchemaEntryManager<SchemaUnitClass>,
    valueClasses: SchemaEntryManager<SchemaValueClass>,
  )
  /**
   * Parse the schema's tags.
   */
  protected _parseSchema(schemaXml: HedSchemaXMLObject): void
  /**
   * Retrieve all the tags in the schema.
   *
   * @returns The tag names and XML elements.
   */
  private getAllTags
  private getAllChildTags
  /**
   * Generate the map from tag elements to shortened tag names.
   *
   * @param tags - The map from tag elements to tag strings.
   * @returns The map from tag elements to shortened tag names.
   */
  private getShortTags
  private static getParentTagName
  /**
   * Generate a map from each tag name to its parent tag name.
   *
   * @param shortTags - The map from tag elements to shortened tag names.
   * @returns A map from each tag name to its parent tag name.
   */
  private generateParentMap
  private processRootedElements
  /**
   * Process unit classes in tags.
   *
   * @param shortTags - The map from tag elements to shortened tag names.
   * @param valueAttributeDefinitions - The map from shortened tag names to their value schema attributes.
   * @returns The map from shortened tag names to their unit classes.
   */
  private processTagUnitClasses
  /**
   * Process value classes in tags.
   *
   * @param shortTags - The map from tag elements to shortened tag names.
   * @param valueAttributeDefinitions - The map from shortened tag names to their value schema attributes.
   * @returns The map from shortened tag names to their value classes.
   */
  private processTagValueClasses
  /**
   * Process recursive schema attributes.
   *
   * @param shortTags - The map from tag elements to shortened tag names.
   * @param booleanAttributeDefinitions - The map from shortened tag names to their boolean schema attributes. Passed by reference.
   */
  private processRecursiveAttributes
  /**
   * Generate a map from tags to their recursive attributes.
   *
   * @param shortTags - The map from tag elements to shortened tag names.
   * @param booleanAttributeDefinitions - The map from shortened tag names to their boolean schema attributes. Passed by reference.
   */
  private generateRecursiveAttributeMap
  /**
   * Create the {@link SchemaTag} objects.
   *
   * @param booleanAttributeDefinitions - The map from shortened tag names to their boolean schema attributes.
   * @param valueAttributeDefinitions - The map from shortened tag names to their value schema attributes.
   * @param tagUnitClassDefinitions - The map from shortened tag names to their unit classes.
   * @param tagValueClassDefinitions - The map from shortened tag names to their value classes.
   * @param parentMap - The map from each tag name to its parent tag name.
   * @returns The map from lowercase shortened tag names to their tag objects.
   */
  private createSchemaTags
  /**
   * Merge the per-schema tag map into the main tag map.
   */
  private mergeSchemaEntries
  /**
   * Add a new tag while checking for duplicates.
   *
   * Override of {@link SchemaEntryParser.addEntry} to change the issue message.
   *
   * @param shortTagName - The short tag name.
   * @param newTag - The new tag object to add.
   */
  protected addEntry(shortTagName: string, newTag: SchemaTag): void
}
