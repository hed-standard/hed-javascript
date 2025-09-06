import zip from 'lodash/zip'

import loadSchema from './loader'
import SchemaParser from './parser'
import PartneredSchemaMerger from './schemaMerger'
import { HedSchema, PrimarySchema, HedSchemas } from './containers'
import { IssueError } from '../issues/issues'
import { splitStringTrimAndRemoveBlanks } from '../utils/string'
import { SchemasSpec } from './specs'
import { HedSchemaXMLObject } from './xmlType'

/**
 * Build a schema collection object from a schema specification.
 *
 * @param schemaSpecs The description of which schemas to use.
 * @returns The schema container object and any issues found.
 */
export async function buildSchemas(schemaSpecs: SchemasSpec): Promise<HedSchemas> {
  const schemaPrefixes = Array.from(schemaSpecs.data.keys())
  /* Data format example:
   * [[xmlData, ...], [xmlData, xmlData, ...], ...] */
  const schemaXmlData = await Promise.all(
    schemaPrefixes.map((prefix) => {
      const specs = schemaSpecs.data.get(prefix)
      return Promise.all(specs.map((spec) => loadSchema(spec)))
    }),
  )
  const schemaObjects = schemaXmlData.map(buildSchemaObjects)
  const schemas = new Map(zip(schemaPrefixes, schemaObjects))
  return new HedSchemas(schemas)
}

/**
 * Build HED schemas from a version specification string.
 *
 * @param hedVersionString The HED version specification string (can contain comma-separated versions).
 * @returns A Promise that resolves to the built schemas.
 * @throws {IssueError} If the schema specification is invalid or schemas cannot be built.
 */
export async function buildSchemasFromVersion(hedVersionString?: string): Promise<HedSchemas> {
  hedVersionString ??= ''
  const hedVersionSpecStrings = splitStringTrimAndRemoveBlanks(hedVersionString, ',')
  const hedVersionSpecs = SchemasSpec.parseVersionSpecs(hedVersionSpecStrings)
  return buildSchemas(hedVersionSpecs)
}

/**
 * Build a single merged schema container object from one or more XML files.
 *
 * @param xmlData The schemas' XML data.
 * @returns The HED schema object.
 */
function buildSchemaObjects(xmlData: HedSchemaXMLObject[]): HedSchema {
  const schemas = xmlData.map((data) => buildSchemaObject(data))
  if (schemas.length === 1) {
    return schemas[0]
  }
  const partneredSchemaMerger = new PartneredSchemaMerger(schemas)
  return partneredSchemaMerger.mergeSchemas()
}

/**
 * Build a single schema container object from an XML file.
 *
 * @param xmlData The schema's XML data
 * @returns The HED schema object.
 */
function buildSchemaObject(xmlData: HedSchemaXMLObject): PrimarySchema {
  const schemaEntries = new SchemaParser(xmlData.HED).parse()
  return new PrimarySchema(xmlData, schemaEntries)
}
