/**
 * XML parsing utilities.
 * @module
 */
import { XMLParser } from 'fast-xml-parser'

/**
 * Recursively set a field on each node of the tree pointing to the node's parent.
 *
 * @param {Object} node The child node.
 * @param {Object} parent The parent node.
 */
const setNodeParent = function (node, parent) {
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

/**
 * Handle top level of parent-setting recursion before passing to setNodeParent.
 *
 * @param {Object} node The child node.
 * @param {Object} parent The parent node.
 */
export const setParent = function (node, parent) {
  if (node.schema) {
    node.$parent = null
    setNodeParent(node.schema, null)
  } else {
    setNodeParent(node, parent)
  }
}

/**
 * Parse the schema XML data.
 *
 * @param {string} data The XML data.
 * @returns {Promise<object>} The schema XML data.
 */
export async function parseSchemaXML(data) {
  const alwaysArray = new Set(['node', 'property', 'attribute', 'value', 'unit'])
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    alwaysCreateTextNode: true,
    textNodeName: '_',
    ignoreDeclaration: true,
    ignorePiTags: true,
    attributesGroupName: '$',
    isArray: (name) => {
      return alwaysArray.has(name)
    },
  })
  return parser.parse(data)
}
