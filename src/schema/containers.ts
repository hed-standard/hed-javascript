import lt from 'semver/functions/lt'

import { IssueError } from '../issues/issues'
import { SchemaEntries } from './entries'
import { HedSchemaXMLObject } from './xmlType'

export class HedSchema {
  /**
   * The collection of schema entries.
   */
  readonly entries: SchemaEntries

  /**
   * The standard HED schema version this schema is linked to.
   */
  readonly withStandard: string

  /**
   * This schema's prefix in the active schema set.
   */
  prefix: string

  /**
   * Constructor.
   *
   * @param entries A collection of schema entries.
   * @param withStandard The standard HED schema version this schema is linked to.
   */
  constructor(entries: SchemaEntries, withStandard: string) {
    this.entries = entries
    this.withStandard = withStandard
  }
}

/**
 * An imported HED 3 schema.
 */
export class PrimarySchema extends HedSchema {
  /**
   * The HED schema version.
   */
  readonly version: string

  /**
   * The HED library schema name.
   */
  readonly library: string

  /**
   * Constructor.
   *
   * @param xmlData The schema XML data.
   * @param entries A collection of schema entries.
   */
  constructor(xmlData: HedSchemaXMLObject, entries: SchemaEntries) {
    let withStandard
    const rootElement = xmlData.HED
    const library = rootElement.$.library ?? ''
    const version = rootElement.$.version

    if (!library) {
      withStandard = version
    } else {
      withStandard = xmlData.HED.$.withStandard
    }

    super(entries, withStandard)

    if (!library && version && lt(version, '8.0.0')) {
      IssueError.generateAndThrow('deprecatedStandardSchemaVersion', {
        version,
      })
    }

    this.library = library
    this.version = version
  }
}

/**
 * An imported lazy partnered HED 3 schema.
 */
export class PartneredSchema extends HedSchema {
  /**
   * The actual HED 3 schemas underlying this partnered schema.
   */
  readonly actualSchemas: HedSchema[]

  /**
   * Constructor.
   *
   * @param actualSchemas The actual HED 3 schemas underlying this partnered schema.
   */
  constructor(actualSchemas: HedSchema[]) {
    if (actualSchemas.length === 0) {
      IssueError.generateAndThrowInternalError('A partnered schema set must contain at least one schema.')
    }
    super(actualSchemas[0].entries, actualSchemas[0].withStandard)
    this.actualSchemas = actualSchemas
  }
}

/**
 * The collection of active HED schemas.
 */
export class HedSchemas {
  /**
   * The imported HED schemas.
   *
   * The empty string key ("") corresponds to the schema with no prefix,
   * while other keys correspond to the respective prefixes.
   */
  readonly schemas: Map<string, HedSchema>

  /**
   * Constructor.
   * @param schemas The imported HED schemas.
   */
  constructor(schemas: Map<string, HedSchema> | HedSchema) {
    if (schemas instanceof Map) {
      this.schemas = schemas
    } else {
      this.schemas = new Map([['', schemas]])
    }
    this.#addPrefixesToSchemas()
  }

  #addPrefixesToSchemas(): void {
    for (const [prefix, schema] of this.schemas) {
      schema.prefix = prefix
    }
  }

  /**
   * Return the schema with the given prefix.
   *
   * @param schemaName A prefix in the schema set.
   * @returns The schema object corresponding to that prefix.
   */
  public getSchema(schemaName: string): HedSchema | undefined {
    return this.schemas?.get(schemaName)
  }

  /**
   * The base schema, i.e. the schema with no prefix, if one is defined.
   */
  public get baseSchema(): HedSchema | undefined {
    return this.getSchema('')
  }
}
