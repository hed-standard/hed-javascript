const semver = require('semver')
const xml2js = require('xml2js')

const files = require('../utils/files')

/**
 * Load schema XML data from a schema version or path description.
 *
 * @param {{path: string?, library: string?, version: string?}} schemaDef The description of which schema to use.
 * @return {Promise<never>|Promise<object>} The schema XML data or an error.
 */
const loadSchema = function (schemaDef = {}) {
  if (Object.entries(schemaDef).length === 0) {
    return loadRemoteSchema()
  } else if (schemaDef.path) {
    return loadLocalSchema(schemaDef.path)
  } /* else if (schemaDef.library) {
    return loadRemoteSchema(schemaDef.version, schemaDef.library)
  } */ else if (schemaDef.version) {
    return loadRemoteSchema(schemaDef.version)
  } else {
    return Promise.reject('Invalid input.')
  }
}

/**
 * Load schema XML data from the HED specification GitHub repository.
 *
 * @param {string} version The schema version to load.
 * @param {string?} library The library schema to load.
 * @return {Promise<object>} The schema XML data.
 */
const loadRemoteSchema = function (version = 'Latest', library) {
  let fileName
  let basePath
  if (library) {
    fileName = 'HED_' + library + '_' + version + '.xml'
    basePath =
      'https://raw.githubusercontent.com/hed-standard/hed-schema-library/master/hedxml/'
  } else {
    fileName = 'HED' + version + '.xml'
    basePath =
      'https://raw.githubusercontent.com/hed-standard/hed-specification/master/hedxml/'
  }
  const url = basePath + fileName
  return files
    .readHTTPSFile(url)
    .then((data) => {
      return xml2js.parseStringPromise(data, { explicitCharkey: true })
    })
    .catch((error) => {
      throw new Error(
        'Could not load HED schema version "' +
          version +
          '" from remote repository - "' +
          error +
          '".',
      )
    })
}

/**
 * Load schema XML data from a local file.
 *
 * @param {string} path The path to the schema XML data.
 * @return {Promise<object>} The schema XML data.
 */
const loadLocalSchema = function (path) {
  return files
    .readFile(path)
    .then((data) => {
      return xml2js.parseStringPromise(data, { explicitCharkey: true })
    })
    .catch((error) => {
      throw new Error(
        'Could not load HED schema from path "' + path + '" - "' + error + '".',
      )
    })
}

/**
 * Recursively set a field on each node of the tree pointing to the node's parent.
 *
 * @param {object} node The child node.
 * @param {object} parent The parent node.
 */
const setNodeParent = function (node, parent) {
  // Assume that we've already run this function if so.
  if ('$parent' in node) {
    return
  }
  node.$parent = parent
  const childNodes = node.node || []
  for (const child of childNodes) {
    setNodeParent(child, node)
  }
}

/**
 * Handle top level of parent-setting recursion before passing to setNodeParent.
 *
 * @param {object} node The child node.
 * @param {object} parent The parent node.
 */
const setParent = function (node, parent) {
  if (node.schema) {
    node.$parent = null
    setNodeParent(node.schema[0], null)
  } else {
    setNodeParent(node, parent)
  }
}

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
     * Whether this is a HED 3 schema.
     * @type {boolean}
     */
    this.isHed3 =
      this.library !== undefined || semver.gte(this.version, '8.0.0-alpha')
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
     * @type {Object<string, Schema>}
     */
    this.librarySchemas = {}
    /**
     * Whether this is a HED 3 schema collection.
     * @type {boolean}
     */
    this.isHed3 = baseSchema && baseSchema.isHed3
  }
}

module.exports = {
  loadSchema: loadSchema,
  setParent: setParent,
  Schema: Schema,
  Schemas: Schemas,
}
