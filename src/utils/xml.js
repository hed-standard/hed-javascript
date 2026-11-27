/**
 * XML parsing utilities.
 * @module
 */

import { XMLParser, XMLValidator } from 'fast-xml-parser'

import { IssueError } from '../issues/issues'

/**
 * The section elements every schema file has, empty or not (HED specification A.3.1). The sources, prefixes and
 * external annotations sections may be missing.
 * @type {string[]}
 */
const requiredSections = [
  'schema',
  'unitClassDefinitions',
  'unitModifierDefinitions',
  'valueClassDefinitions',
  'schemaAttributeDefinitions',
  'propertyDefinitions',
]

/**
 * Parse the schema XML data.
 *
 * @param {string} data The XML data.
 * @returns {Object} The schema XML data.
 * @throws {IssueError} If the data is not well-formed XML or lacks a required section.
 */
export default function parseSchemaXML(data) {
  const validation = XMLValidator.validate(data)
  if (validation !== true) {
    IssueError.generateAndThrow('schemaXmlNotWellFormed', {
      error: validation.err.msg,
      line: String(validation.err.line),
    })
  }
  const alwaysArray = new Set([
    'node',
    'property',
    'attribute',
    'value',
    'unit',
    'propertyDefinition',
    'schemaAttributeDefinition',
    'valueClassDefinition',
    'unitModifierDefinition',
    'unitClassDefinition',
  ])
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    alwaysCreateTextNode: true,
    textNodeName: '_',
    ignoreDeclaration: true,
    ignorePiTags: true,
    attributesGroupName: '$',
    // Header flags such as unmerged are written "True" by the schema tools; accept any case.
    attributeValueProcessor: (_, attrValue) => {
      if (attrValue.toLowerCase() === 'true') {
        return true
      }
      if (attrValue.toLowerCase() === 'false') {
        return false
      }
      return attrValue
    },
    isArray: (name) => {
      return alwaysArray.has(name)
    },
  })

  const xmlData = parser.parse(data)
  checkSections(xmlData)
  setParent(xmlData.HED)
  return xmlData
}

/**
 * Check that the root element is HED and has every required section.
 *
 * @param {Object} xmlData The parsed XML data.
 * @throws {IssueError} If the HED element or a required section is missing.
 */
function checkSections(xmlData) {
  const root = xmlData?.HED
  if (root === undefined) {
    IssueError.generateAndThrow('missingSchemaSection', { section: 'HED' })
  }
  for (const section of requiredSections) {
    if (typeof root !== 'object' || root === null || !(section in root)) {
      IssueError.generateAndThrow('missingSchemaSection', { section })
    }
  }
}

/**
 * Handle top level of parent-setting recursion before passing to setNodeParent.
 *
 * @param {Object} rootElement The root element of the XML tree.
 */
function setParent(rootElement) {
  const childNodes = rootElement.schema.node ?? []
  for (const child of childNodes) {
    setNodeParent(child, null)
  }
}

/**
 * Recursively set a field on each node of the tree pointing to the node's parent.
 *
 * @param {Object} node The child node.
 * @param {Object|null} parent The parent node.
 */
function setNodeParent(node, parent) {
  // Assume that we've already run this function if so.
  if ('$parent' in node) {
    return
  }
  node.$parent = parent
  const childNodes = node.node ?? []
  for (const child of childNodes) {
    setNodeParent(child, node)
  }
}
