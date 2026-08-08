import type SchemaEntry from '../entries/schemaEntry'
import SchemaEntryManager from '../entries/schemaEntryManager'
import type SchemaEntryWithAttributes from '../entries/schemaEntryWithAttributes'
import type SchemaAttribute from '../entries/attribute'
import {
  type DefinitionElement,
  type NamedElement,
  type HedSchemaXMLCollection,
  type HedSchemaXMLObject,
} from '../xmlType'
/**
 * A parser for a specific {@link SchemaEntry} subtype.
 *
 * @typeParam T - The subclass of {@link SchemaEntry} the implementation parses.
 */
export declare abstract class SchemaEntryParser<T extends SchemaEntry> {
  /**
   * The collection of XML data for a given prefix.
   */
  protected readonly xmlCollection: HedSchemaXMLCollection
  /**
   * The map of names to entry objects for this entry type.
   */
  protected readonly entryTypeMap: Map<string, T>
  /**
   * Constructor.
   *
   * @param xmlCollection - A collection of XML data for a given prefix.
   */
  protected constructor(xmlCollection: HedSchemaXMLCollection)
  /**
   * Parse this entry type across all schemas in the collection.
   *
   * @returns An entry manager for this entry type.
   * @internal
   */
  parse(): SchemaEntryManager<T>
  /**
   * Add a new entry while checking for duplicates.
   *
   * @param newEntryName - The entry name.
   * @param newEntry - The new entry object to add.
   */
  protected addEntry(newEntryName: string, newEntry: T): void
  /**
   * Parse this entry type for a specific schema.
   *
   * @param schemaXml - The XML for a specific schema.
   */
  protected abstract _parseSchema(schemaXml: HedSchemaXMLObject): void
  /**
   * Add any custom entries required by the platform to support old versions.
   */
  protected _addCustomEntries(): void
}
export declare abstract class SchemaEntryWithAttributesParser<
  T extends SchemaEntryWithAttributes,
> extends SchemaEntryParser<T> {
  protected readonly attributes: SchemaEntryManager<SchemaAttribute>
  protected constructor(xmlCollection: HedSchemaXMLCollection, attributes: SchemaEntryManager<SchemaAttribute>)
  protected _parseDefinitions(
    definitionElements: Iterable<DefinitionElement>,
  ): [Map<string, Set<SchemaAttribute>>, Map<string, Map<SchemaAttribute, string[]>>]
  protected _parseAttributeElements(
    elements: Iterable<DefinitionElement>,
    namer: (element: NamedElement) => string,
  ): [Map<string, Set<SchemaAttribute>>, Map<string, Map<SchemaAttribute, string[]>>]
  private _parseAttributeElement
}
export declare abstract class SchemaDefinitionEntryParser<
  T extends SchemaEntryWithAttributes,
> extends SchemaEntryWithAttributesParser<T> {
  protected _parseSchema(schemaXml: HedSchemaXMLObject): void
  protected _preprocessSchema(schemaXml: HedSchemaXMLObject): void
  protected abstract _getDefinitions(schemaXml: HedSchemaXMLObject): Iterable<DefinitionElement> | undefined
  protected abstract _buildEntry(
    name: string,
    booleanAttributes: Set<SchemaAttribute>,
    valueAttributes: Map<SchemaAttribute, string[]>,
  ): T
}
