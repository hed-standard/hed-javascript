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
   * @param {Schema} baseSchema The base HED schema.
   */
  constructor(baseSchema) {
    /**
     * The base HED schema.
     * @type {Schema}
     */
    this.baseSchema = baseSchema
    /**
     * The imported library HED schemas.
     * @type {Map<string, Schema>}
     */
    this.librarySchemas = new Map()
  }

  /**
   * The HED generation of this schema.
   *
   * If baseSchema is null, generation is set to 0.
   * @type {Number}
   */
  get generation() {
    if (this.baseSchema === null) {
      return 0
    } else {
      return this.baseSchema.generation
    }
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

module.exports = {
  Schema: Schema,
  Hed2Schema: Hed2Schema,
  Hed3Schema: Hed3Schema,
  Schemas: Schemas,
}
