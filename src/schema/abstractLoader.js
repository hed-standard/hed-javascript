/**
 * This module holds the abstract superclass for a schema loader.
 * @module schema/abstractLoader
 */

import partition from 'lodash/partition'
import zip from 'lodash/zip'

import { HedSchema, HedSchemas } from './containers'
import SchemaParser from './parser/schemaParser'
import { SchemaSpec, SchemasSpec } from './specs'
import { HedSchemaXMLCollection } from './xmlType'
import { IssueError } from '../issues/issues'
import { splitStringTrimAndRemoveBlanks } from '../utils/string'
import parseSchemaXML from '../utils/xml'

/**
 * Read a remote file using HTTPS.
 *
 * @param {string} url The remote URL.
 * @returns {Promise<string>} A promise with the file contents.
 * @throws {IssueError} If the network read failed.
 */
async function readHTTPSFile(url) {
  const response = await fetch(url)
  if (!response.ok) {
    IssueError.generateAndThrow('networkReadError', {
      url: url,
      statusCode: response.status,
      statusText: response.statusText,
    })
  }
  return response.text()
}

/**
 * The abstract superclass for a schema loader.
 *
 * A subclass supplies the bundled schemas ({@link hasBundledSchema}, {@link getBundledSchema}) and the local file
 * access ({@link loadLocalSchema}) of its environment.
 *
 * @abstract
 */
export default class AbstractHedSchemaLoader {
  /**
   * Build a schema collection object from a schema specification.
   *
   * @param {SchemasSpec} schemaSpecs The description of which schemas to use.
   * @returns {Promise<HedSchemas>} The schema container object and any issues found.
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
    return new HedSchemas(schemas)
  }

  /**
   * Build HED schemas from a version specification string.
   *
   * @param {string} [hedVersionString] The HED version specification string (can contain comma-separated versions).
   * @returns {Promise<HedSchemas>} A Promise that resolves to the built schemas.
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
   * A schema name listed twice in the group is rejected earlier, when the version specification is parsed
   * ({@link SchemasSpec#addSchemaSpec}).
   *
   * @param {string} prefix The prefix whose schema object is being created.
   * @param {Object[]} xmlData The schemas' XML data.
   * @returns {Promise<HedSchema>} The HED schema object.
   * @throws {IssueError} If the group breaks a merge group rule or two of its schemas conflict.
   * @private
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
      return new HedSchema(xmlData[0], schemaEntries, prefix)
    }

    // Every partnered library must have the same standard partner, and a listed standard schema must be that partner.
    const standardVersions = new Set([
      ...standardSchemas.map((xml) => xml.HED.$.version),
      ...partneredLibrarySchemas.map((xml) => xml.HED.$.withStandard),
    ])
    if (standardVersions.size !== 1) {
      IssueError.generateAndThrow('differentWithStandard', {
        versions: Array.from(standardVersions)
          .toSorted((a, b) => a.localeCompare(b))
          .join(', '),
      })
    }
    const standardVersion = Array.from(standardVersions)[0]

    const standardSchema = standardSchemas?.[0]

    // The base is the listed standard schema, else the first merged library (a merged file contains its partner).
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
    // The group is named after the listed standard schema, else its first library, merged or unmerged: an unmerged
    // library is parsed into its loaded partner but keeps its own name and version, as its merged file would.
    const identitySchemaXml = standardSchema ?? librarySchemas[0]
    return new HedSchema(identitySchemaXml, schemaEntries, prefix)
  }

  /**
   * Load schema XML data from a schema version or path description.
   *
   * @param {SchemaSpec} schemaDef The description of which schema to use.
   * @returns {Promise<Object>} The schema XML data.
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
   * @param {SchemaSpec} schemaDef The description of which schema to use.
   * @returns {Promise<Object|null>} The schema XML data, or null if there is no description.
   * @throws {IssueError} If the schema could not be loaded.
   * @private
   */
  async loadPromise(schemaDef) {
    if (schemaDef === null) {
      return null
    } else if (schemaDef.localPath) {
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
   * @param {SchemaSpec} schemaDef The description of which schema to use.
   * @returns {Promise<Object>} The schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   * @private
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
   * Determine whether this validator bundles a particular schema.
   *
   * @abstract
   * @param {SchemaSpec} schemaDef The description of which schema to use.
   * @returns {boolean} Whether this validator bundles a particular schema.
   * @protected
   */
  // eslint-disable-next-line no-unused-vars
  hasBundledSchema(schemaDef) {
    IssueError.generateAndThrowInternalError('AbstractHedSchemaLoader.hasBundledSchema must be overridden.')
  }

  /**
   * Retrieve the contents of a bundled schema.
   *
   * @abstract
   * @param {SchemaSpec} schemaDef The description of which schema to use.
   * @returns {Promise<string>} The raw schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   * @protected
   */
  // eslint-disable-next-line no-unused-vars
  async getBundledSchema(schemaDef) {
    IssueError.generateAndThrowInternalError('AbstractHedSchemaLoader.getBundledSchema must be overridden.')
  }

  /**
   * Load schema XML data from the HED GitHub repository.
   *
   * @param {SchemaSpec} schemaDef The standard schema version to load.
   * @returns {Promise<Object>} The schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   * @private
   */
  async loadRemoteSchema(schemaDef) {
    let url
    if (schemaDef.library) {
      url = `https://raw.githubusercontent.com/hed-standard/hed-schemas/refs/heads/main/library_schemas/${schemaDef.library}/hedxml/HED_${schemaDef.library}_${schemaDef.version}.xml`
    } else {
      url = `https://raw.githubusercontent.com/hed-standard/hed-schemas/refs/heads/main/standard_schema/hedxml/HED${schemaDef.version}.xml`
    }
    return this.loadSchemaFile(readHTTPSFile(url), 'remoteSchemaLoadFailed', { spec: JSON.stringify(schemaDef) })
  }

  /**
   * Load schema XML data from a local file.
   *
   * @abstract
   * @param {string} path The path to the schema XML data.
   * @returns {Promise<Object>} The schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   * @protected
   */
  // eslint-disable-next-line no-unused-vars
  async loadLocalSchema(path) {
    IssueError.generateAndThrowInternalError('AbstractHedSchemaLoader.loadLocalSchema must be overridden.')
  }

  /**
   * Actually load the schema XML file.
   *
   * @param {Promise<string>} xmlDataPromise The Promise containing the unparsed XML data.
   * @param {string} issueCode The issue code.
   * @param {Object<string, string>} issueArgs The issue arguments passed from the calling function.
   * @returns {Promise<Object>} The parsed schema XML data.
   * @throws {IssueError} If the schema could not be loaded.
   * @protected
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
