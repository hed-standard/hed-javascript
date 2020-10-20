// TODO: Switch require once upstream bugs are fixed.
// const xpath = require('xml2js-xpath')
// Temporary
const xpath = require('../utils/xpath')

const schemaUtils = require('../utils/schema')

const types = require('./types')
const TagEntry = types.TagEntry
const Mapping = types.Mapping

/**
 * Build a short-long mapping object from schema XML data.
 *
 * @param {object} xmlData The schema XML data.
 * @return {Mapping} The mapping object.
 */
const buildMappingObject = function(xmlData) {
  const nodeData = {}
  let hasNoDuplicates = true
  const rootElement = xmlData.HED
  setParent(rootElement, null)
  const tagElements = xpath.find(rootElement, '//node')
  for (const tagElement of tagElements) {
    if (getElementTagValue(tagElement) === '#') {
      continue
    }
    const tagPath = getTagPathFromTagElement(tagElement)
    const shortPath = tagPath[0]
    const cleanedShortPath = shortPath.toLowerCase()
    tagPath.reverse()
    const longPath = tagPath.join('/')
    const tagObject = new TagEntry(shortPath, longPath)
    if (!(cleanedShortPath in nodeData)) {
      nodeData[cleanedShortPath] = tagObject
    } else {
      hasNoDuplicates = false
      if (!Array.isArray(nodeData[cleanedShortPath])) {
        nodeData[cleanedShortPath] = [nodeData[cleanedShortPath]]
      }
      nodeData[cleanedShortPath].push(tagObject)
    }
  }
  return new Mapping(nodeData, hasNoDuplicates)
}

const setParent = function(node, parent) {
  node.$parent = parent
  if (node.node) {
    for (const child of node.node) {
      setParent(child, node)
    }
  }
}

const getTagPathFromTagElement = function(tagElement) {
  const ancestorTags = [getElementTagValue(tagElement)]
  let parentTagName = getParentTagName(tagElement)
  let parentElement = tagElement.$parent
  while (parentTagName) {
    ancestorTags.push(parentTagName)
    parentTagName = getParentTagName(parentElement)
    parentElement = parentElement.$parent
  }
  return ancestorTags
}

const getElementTagValue = function(element, tagName = 'name') {
  return element[tagName][0]._
}

const getParentTagName = function(tagElement) {
  const parentTagElement = tagElement.$parent
  if (parentTagElement && 'name' in parentTagElement) {
    return parentTagElement.name[0]._
  } else {
    return ''
  }
}

/**
 * Build a short-long mapping from a remote schema.
 *
 * @param {string} version The schema version to use. Leave empty for the latest version.
 * @return {Promise<Mapping>} The mapping object.
 */
const buildRemoteMapping = function(version = 'Latest') {
  return schemaUtils.loadRemoteSchema(version).then(xmlData => {
    return buildMappingObject(xmlData)
  })
}

/**
 * Build a short-long mapping from a local file.
 *
 * @param {string} path The path to the schema data.
 * @return {Promise<Mapping>} The mapping object.
 */
const buildLocalMapping = function(path) {
  return schemaUtils.loadLocalSchema(path).then(xmlData => {
    return buildMappingObject(xmlData)
  })
}

/**
 * Build a short-long mapping from a schema version or path description.
 *
 * @param {{path: string?, version: string?}} schemaDef The description of which schema to use.
 * @return {Promise<never>|Promise<Mapping>} The mapping object or an error.
 */
const buildMapping = function(schemaDef = {}) {
  if (Object.entries(schemaDef).length === 0) {
    return buildRemoteMapping()
  } else if (schemaDef.path) {
    return buildLocalMapping(schemaDef.path)
  } else if (schemaDef.version) {
    return buildRemoteMapping(schemaDef.version)
  } else {
    return Promise.reject('Invalid input.')
  }
}

module.exports = {
  buildMapping: buildMapping,
  buildMappingObject: buildMappingObject,
}
