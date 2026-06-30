/**
 * This module holds the abstract superclass for a schema loader.
 * @module schema/abstractLoader
 */
import partition from 'lodash/partition'
import zip from 'lodash/zip'
import { Schema, Schemas } from './containers'
import SchemaParser from './parser/schemaParser'
import { SchemaSpec, SchemasSpec } from './specs'
import { HedSchemaXMLCollection } from './xmlType'
import { IssueError } from '../issues/issues'
import * as files from '../utils/files'
import { splitStringTrimAndRemoveBlanks } from '../utils/string'
import { parseSchemaXML } from '../utils/xml'
export default class AbstractHedSchemaLoader {
  /**
   * Build a schema collection object from a schema specification.
   *
   * @param schemaSpecs - The description of which schemas to use.
   * @returns The schema container object and any issues found.
   * @throws {IssueError} If the schema specification is invalid or schemas cannot be built.
   */
  async buildSchemas(schemaSpecs) {
    const schemaPrefixes = Array.from(schemaSpecs.data.keys())
    /* Data format example:
     * [[xmlData, ...], [xmlData, xmlData, ...], ...] */
    const schemaXmlData = await Promise.all(
      schemaPrefixes.map((prefix) => {
        const specs = schemaSpecs.data.get(prefix) ?? []
        return Promise.all(specs.map((spec) => this.loadSchema(spec)))
      }),
    )
    const schemaObjects = await Promise.all(
      schemaXmlData.map((schemaXmls, index) => this.buildSchemaObjects(schemaPrefixes[index], schemaXmls)),
    )
    const schemas = new Map(zip(schemaPrefixes, schemaObjects))
    return new Schemas(schemas)
  }
  /**
   * Build HED schemas from a version specification string.
   *
   * @param hedVersionString - The HED version specification string (can contain comma-separated versions).
   * @returns A Promise that resolves to the built schemas.
   * @throws {IssueError} If the schema specification is invalid or schemas cannot be built.
   */
  async buildSchemasFromVersion(hedVersionString) {
    hedVersionString ??= ''
    const hedVersionSpecStrings = splitStringTrimAndRemoveBlanks(hedVersionString, ',')
    const hedVersionSpecs = SchemasSpec.parseVersionSpecs(hedVersionSpecStrings)
    return this.buildSchemas(hedVersionSpecs)
  }
  /**
   * Build a single merged schema container object from one or more XML files.
   *
   * @param prefix - The prefix whose schema object is being created.
   * @param xmlData - The schemas' XML data.
   * @returns The HED schema object.
   */
  async buildSchemaObjects(prefix, xmlData) {
    const [standardSchemas, librarySchemas] = partition(xmlData, (xml) => xml.HED.$.library === undefined)
    const [partneredLibrarySchemas, nonPartneredLibrarySchemas] = partition(
      librarySchemas,
      (xml) => xml.HED.$.withStandard !== undefined,
    )
    const [mergedLibrarySchemas, unmergedLibrarySchemas] = partition(
      partneredLibrarySchemas,
      (xml) => xml.HED.$.unmerged === undefined,
    )
    const isNonPartneredSchema = nonPartneredLibrarySchemas.length > 0
    if (isNonPartneredSchema) {
      if (xmlData.length > 1) {
        IssueError.generateAndThrow('nonPartneredSchemaWithAnotherSchema', { prefix })
      }
      const schemaEntries = new SchemaParser(new HedSchemaXMLCollection(xmlData[0])).parse()
      return new Schema(xmlData[0], schemaEntries, prefix)
    }
    const standardVersions = new Set([
      ...standardSchemas.map((xml) => xml.HED.$.version),
      ...partneredLibrarySchemas.map((xml) => xml.HED.$.withStandard),
    ])
    if (standardVersions.size !== 1) {
      IssueError.generateAndThrow('differentWithStandard', {
        versions: JSON.stringify(Array.from(standardVersions).toSorted((a, b) => a.localeCompare(b))),
      })
    }
    const standardVersion = Array.from(standardVersions)[0]
    const standardSchema = standardSchemas?.[0]
    let baseSchemaXml = standardSchema ?? mergedLibrarySchemas.shift()
    if (baseSchemaXml === undefined) {
      baseSchemaXml = await this.loadSchema(new SchemaSpec(prefix, standardVersion))
    }
    const schemaXmls = new HedSchemaXMLCollection(
      baseSchemaXml,
      standardVersion,
      mergedLibrarySchemas,
      unmergedLibrarySchemas,
    )
    const schemaEntries = new SchemaParser(schemaXmls).parse()
    return new Schema(baseSchemaXml, schemaEntries, prefix)
  }
  /**
   * Load schema XML data from a schema version or path description.
   *
   * @param schemaDef - The description of which schema to use.
   * @returns The schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   * @internal
   */
  async loadSchema(schemaDef) {
    const xmlData = await this.loadPromise(schemaDef)
    if (xmlData === null) {
      IssueError.generateAndThrow('invalidSchemaSpecification', { spec: JSON.stringify(schemaDef) })
    }
    return xmlData
  }
  /**
   * Choose the schema Promise from a schema version or path description.
   *
   * @param schemaDef - The description of which schema to use.
   * @returns The schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   */
  async loadPromise(schemaDef) {
    if (schemaDef.localPath) {
      return this.loadLocalSchema(schemaDef.localPath)
    } else if (this.hasBundledSchema(schemaDef)) {
      return this.loadBundledSchema(schemaDef)
    } else {
      return this.loadRemoteSchema(schemaDef)
    }
  }
  /**
   * Load schema XML data from a bundled file.
   *
   * @param schemaDef - The description of which schema to use.
   * @returns The schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   */
  async loadBundledSchema(schemaDef) {
    try {
      const bundledSchemaData = await this.getBundledSchema(schemaDef)
      return parseSchemaXML(bundledSchemaData)
    } catch (error) {
      IssueError.generateAndRethrow(
        error,
        (error) => ['bundledSchemaLoadFailed', { spec: JSON.stringify(schemaDef), error: error.message }],
        'Illegal error type when loading bundled schema',
      )
    }
  }
  /**
   * Load schema XML data from the HED GitHub repository.
   *
   * @param schemaDef - The standard schema version to load.
   * @returns The schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   */
  async loadRemoteSchema(schemaDef) {
    let url
    if (schemaDef.library) {
      url = `https://raw.githubusercontent.com/hed-standard/hed-schemas/refs/heads/main/library_schemas/${schemaDef.library}/hedxml/HED_${schemaDef.library}_${schemaDef.version}.xml`
    } else {
      url = `https://raw.githubusercontent.com/hed-standard/hed-schemas/refs/heads/main/standard_schema/hedxml/HED${schemaDef.version}.xml`
    }
    return this.loadSchemaFile(files.readHTTPSFile(url), 'remoteSchemaLoadFailed', { spec: JSON.stringify(schemaDef) })
  }
  /**
   * Actually load the schema XML file.
   *
   * @param xmlDataPromise - The Promise containing the unparsed XML data.
   * @param issueCode - The issue code.
   * @param issueArgs - The issue arguments passed from the calling function.
   * @returns The parsed schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   */
  async loadSchemaFile(xmlDataPromise, issueCode, issueArgs) {
    try {
      const data = await xmlDataPromise
      return parseSchemaXML(data)
    } catch (error) {
      IssueError.generateAndRethrow(
        error,
        (error) => [issueCode, { ...issueArgs, error: error.message }],
        'Illegal error type when loading schema file',
      )
    }
  }
}
