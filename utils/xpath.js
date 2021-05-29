// Temporary XPath implementation until the xml2js-xpath package adds needed functionality.

const childToParent = {
  unitClass: 'unitClasses',
  unitModifier: 'unitModifiers',
  unitClassDefinition: 'unitClassDefinitions',
  unitModifierDefinition: 'unitModifierDefinitions',
  schemaAttributeDefinition: 'schemaAttributeDefinitions',
}

/**
 * Execute an XPath query on an xml2js object.
 *
 * @param {object} element An xml2js element.
 * @param {string} query An XPath query.
 * @return {object[]} An array of xml2js elements matching the query.
 */
const find = function(element, query) {
  const nodeQuery = /^\/\/(\w+)$/
  const attributeQuery = /^\/\/(\w+)\[@(\w+)]$/

  let elementName, attributeName

  const attributeMatch = query.match(attributeQuery)
  if (attributeMatch) {
    ;[, elementName, attributeName] = attributeMatch
  } else {
    const nodeMatch = query.match(nodeQuery)
    if (nodeMatch) {
      ;[, elementName] = nodeMatch
    } else {
      return []
    }
  }

  const result = []
  const search = function(element) {
    if (
      attributeName === undefined ||
      ('$' in element && attributeName in element.$)
    ) {
      result.push(element)
    }
    if (elementName in element) {
      for (const child of element[elementName]) {
        search(child)
      }
    }
  }

  if (elementName in childToParent) {
    const parentList = element[childToParent[elementName]]
    if (parentList === undefined) {
      return []
    }
    for (const child of parentList[0][elementName]) {
      result.push(child)
    }
  } else if (elementName === 'node') {
    if (elementName in element) {
      for (const child of element[elementName]) {
        search(child)
      }
    } else {
      return []
    }
  }

  return result
}

module.exports = {
  find: find,
}
