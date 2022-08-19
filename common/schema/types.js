/** HED schema classes */

const { getGenerationForSchemaVersion } = require('../../utils/hed')

/**
 * An imported HED schema object.
 */
class Schema {
  /**
   * Constructor.
   * @param {object} xmlData The schema XML data.
   * @param {SchemaAttributes} attributes A description of tag attributes.
   * @param {Mapping} mapping A mapping between short and long tags.
   */
  constructor(xmlData, attributes, mapping) {
    /**
     * The schema XML data.
     * @type {Object}
     */
    this.xmlData = xmlData
    const rootElement = xmlData.HED
    /**
     * The HED schema version.
     * @type {string}
     */
    this.version = rootElement.$.version
    /**
     * The HED library schema name.
     * @type {string|undefined}
     */
    this.library = rootElement.$.library
    /**
     * The description of tag attributes.
     * @type {SchemaAttributes}
     */
    this.attributes = attributes
    /**
     * The mapping between short and long tags.
     * @type {Mapping}
     */
    this.mapping = mapping
    /**
     * The HED generation of this schema.
     * @type {Number}
     */
    if (this.library !== undefined) {
      this.generation = 3
    } else {
      this.generation = getGenerationForSchemaVersion(this.version)
    }
  }

  /**
   * Whether this schema is a HED 2 schema.
   * @return {boolean}
   */
  get isHed2() {
    return this.generation === 2
  }

  /**
   * Whether this schema is a HED 3 schema.
   * @return {boolean}
   */
  get isHed3() {
    return this.generation === 3
  }

  /**
   * Determine if a HED tag has a particular attribute in this schema.
   *
   * @param {string} tag The HED tag to check.
   * @param {string} tagAttribute The attribute to check for.
   * @return {boolean} Whether this tag has this attribute.
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  tagHasAttribute(tag, tagAttribute) {}
}

class Hed2Schema extends Schema {
  /**
   * Determine if a HED tag has a particular attribute in this schema.
   *
   * @param {string} tag The HED tag to check.
   * @param {string} tagAttribute The attribute to check for.
   * @return {boolean} Whether this tag has this attribute.
   */
  tagHasAttribute(tag, tagAttribute) {
    return this.attributes.tagHasAttribute(tag, tagAttribute)
  }
}

class Hed3Schema extends Schema {
  constructor(xmlData, entries, mapping) {
    super(xmlData, null, mapping)
    /**
     * The collection of schema entries.
     * @type {SchemaEntries}
     */
    this.entries = entries
  }

  /**
   * Determine if a HED tag has a particular attribute in this schema.
   *
   * @param {string} tag The HED tag to check.
   * @param {string} tagAttribute The attribute to check for.
   * @return {boolean} Whether this tag has this attribute.
   */
  tagHasAttribute(tag, tagAttribute) {
    return this.entries.tagHasAttribute(tag, tagAttribute)
  }
}

/**
 * The collection of active HED schemas.
 */
class Schemas {
  /**
   * Constructor.
   * @param {Schema|Map<string, Schema>} schemas The imported HED schemas.
   */
  constructor(schemas) {
    if (schemas === null || schemas instanceof Map) {
      /**
       * The imported HED schemas.
       *
       * The empty string key ("") corresponds to the schema with no nickname,
       * while other keys correspond to the respective nicknames.
       *
       * This field is null for syntax-only validation.
       *
       * @type {Map<string, Schema>|null}
       */
      this.schemas = schemas
    } else if (schemas instanceof Schema) {
      this.schemas = new Map([['', schemas]])
    } else {
      throw new Error('Invalid type passed to Schemas constructor')
    }
  }

  /**
   * Return the schema with the given nickname.
   *
   * @param {string} schemaName A nickname in the schema set.
   * @returns {Schema|null} The schema object corresponding to that nickname, or null if no schemas are defined.
   */
  getSchema(schemaName) {
    if (this.schemas !== null) {
      return this.schemas.get(schemaName)
    } else {
      return null
    }
  }

  /**
   * The base schema, i.e. the schema with no nickname, if one is defined.
   *
   * @returns {Schema|null}
   */
  get baseSchema() {
    if (this.schemas !== null) {
      return this.schemas.get('')
    } else {
      return null
    }
  }

  /**
   * The library schemas, i.e. the schema with nicknames, if any are defined.
   *
   * @returns {Map<string, Schema>|null}
   */
  get librarySchemas() {
    if (this.schemas !== null) {
      const schemasCopy = new Map(this.schemas)
      schemasCopy.delete('')
      return schemasCopy
    } else {
      return null
    }
  }

  /**
   * The HED generation of this schema.
   *
   * If baseSchema is null, generation is set to 0.
   * @type {Number}
   */
  get generation() {
    if (this.schemas === null) {
      return 0
    } else if (this.baseSchema !== undefined) {
      return this.baseSchema.generation
    } else {
      // Only library schemas are defined, so this must be HED 3.
      return 3
    }
  }

  /**
   * Whether this schema collection is for syntactic validation only.
   * @return {boolean}
   */
  get isSyntaxOnly() {
    return this.generation === 0
  }

  /**
   * Whether this schema collection comprises HED 2 schemas.
   * @return {boolean}
   */
  get isHed2() {
    return this.generation === 2
  }

  /**
   * Whether this schema collection comprises HED 3 schemas.
   * @return {boolean}
   */
  get isHed3() {
    return this.generation === 3
  }
}

class SchemaSpec {
  static createSpecForRemoteStandardSchema(version) {
    const spec = new SchemaSpec()
    spec.version = version
    return spec
  }

  static createSchemaSpec(nickname, version, library, localPath) {
    const spec = new SchemaSpec()
    spec.nickname = nickname
    spec.version = version
    if (library.length > 0) {
      spec.library = library
    }
    if (localPath.length > 0) {
      spec.path = localPath
    }
    return spec
  }

  static createSpecForRemoteLibrarySchema(library, version) {
    const spec = new SchemaSpec()
    spec.library = library
    spec.version = version
    return spec
  }

  static createSpecForLocalSchema(path) {
    const spec = new SchemaSpec()
    spec.path = path
    return spec
  }

  get isFallbackEligible() {
    return this.library === undefined
  }
}

class SchemasSpec {
  constructor() {
    this.data = new Map()
  }

  isDuplicate(spec) {
    return this.data.has(spec.nickname)
  }

  addSchemaSpec(spec) {
    this.data.set(spec.nickname, spec)
    return this
  }

  addRemoteStandardBaseSchema(version) {
    return this.addRemoteStandardSchema('', version)
  }

  addLocalBaseSchema(path) {
    return this.addLocalSchema('', path)
  }

  addRemoteStandardSchema(name, version) {
    const spec = new SchemaSpec()
    spec.version = version
    this.data.set(name, spec)
    return this
  }

  addRemoteLibrarySchema(name, library, version) {
    const spec = new SchemaSpec()
    spec.library = library
    spec.version = version
    this.data.set(name, spec)
    return this
  }

  addLocalSchema(name, path) {
    const spec = new SchemaSpec()
    spec.path = path
    this.data.set(name, spec)
    return this
  }
}

module.exports = {
  Schema: Schema,
  Hed2Schema: Hed2Schema,
  Hed3Schema: Hed3Schema,
  Schemas: Schemas,
  SchemaSpec: SchemaSpec,
  SchemasSpec: SchemasSpec,
}
