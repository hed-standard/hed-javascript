/**
 * This module holds the abstract superclass for a schema loader.
 * @module schema/abstractLoader
 */
import { Schemas } from './containers'
import { SchemaSpec, SchemasSpec } from './specs'
import { type HedSchemaXMLObject } from './xmlType'
import { type IssueParameters } from '../issues/issues'
export default abstract class AbstractHedSchemaLoader {
  /**
   * Build a schema collection object from a schema specification.
   *
   * @param schemaSpecs - The description of which schemas to use.
   * @returns The schema container object and any issues found.
   * @throws {IssueError} If the schema specification is invalid or schemas cannot be built.
   */
  buildSchemas(schemaSpecs: SchemasSpec): Promise<Schemas>
  /**
   * Build HED schemas from a version specification string.
   *
   * @param hedVersionString - The HED version specification string (can contain comma-separated versions).
   * @returns A Promise that resolves to the built schemas.
   * @throws {IssueError} If the schema specification is invalid or schemas cannot be built.
   */
  buildSchemasFromVersion(hedVersionString?: string): Promise<Schemas>
  /**
   * Build a single merged schema container object from one or more XML files.
   *
   * @param prefix - The prefix whose schema object is being created.
   * @param xmlData - The schemas' XML data.
   * @returns The HED schema object.
   */
  private buildSchemaObjects
  /**
   * Load schema XML data from a schema version or path description.
   *
   * @param schemaDef - The description of which schema to use.
   * @returns The schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   * @internal
   */
  loadSchema(schemaDef: SchemaSpec): Promise<HedSchemaXMLObject>
  /**
   * Choose the schema Promise from a schema version or path description.
   *
   * @param schemaDef - The description of which schema to use.
   * @returns The schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   */
  private loadPromise
  /**
   * Load schema XML data from a bundled file.
   *
   * @param schemaDef - The description of which schema to use.
   * @returns The schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   */
  private loadBundledSchema
  /**
   * Determine whether this validator bundles a particular schema.
   *
   * @param schemaDef - The description of which schema to use.
   * @returns Whether this validator bundles a particular schema.
   * @throws {IssueError} If the schema could not be loaded.
   */
  protected abstract hasBundledSchema(schemaDef: SchemaSpec): boolean
  /**
   * Retrieve the contents of a bundled schema.
   *
   * @param schemaDef - The description of which schema to use.
   * @returns The raw schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   */
  protected abstract getBundledSchema(schemaDef: SchemaSpec): Promise<string>
  /**
   * Load schema XML data from the HED GitHub repository.
   *
   * @param schemaDef - The standard schema version to load.
   * @returns The schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   */
  private loadRemoteSchema
  /**
   * Load schema XML data from a local file.
   *
   * @param path - The path to the schema XML data.
   * @returns The schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   */
  protected abstract loadLocalSchema(path: string): Promise<HedSchemaXMLObject>
  /**
   * Actually load the schema XML file.
   *
   * @param xmlDataPromise - The Promise containing the unparsed XML data.
   * @param issueCode - The issue code.
   * @param issueArgs - The issue arguments passed from the calling function.
   * @returns The parsed schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   */
  protected loadSchemaFile(
    xmlDataPromise: Promise<string>,
    issueCode: string,
    issueArgs: IssueParameters,
  ): Promise<HedSchemaXMLObject>
}
