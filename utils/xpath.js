// Temporary XPath implementation until the xml2js-xpath package adds needed functionality.

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

  if (elementName === 'unitClass') {
    for (const unitClass of element.unitClasses[0].unitClass) {
      result.push(unitClass)
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
