const flattenDeep = require('lodash/flattenDeep')

// TODO: Switch require once upstream bugs are fixed.
// const xpath = require('xml2js-xpath')
// Temporary
const xpath = require('../../utils/xpath')

class SchemaParser {
  constructor(rootElement) {
    this.rootElement = rootElement
  }

  populateDictionaries() {
    this.populateUnitClassDictionaries()
    this.populateUnitModifierDictionaries()
    this.populateTagDictionaries()
  }

  // Stubs to be overridden.
  populateTagDictionaries() {}
  populateUnitClassDictionaries() {}
  populateUnitModifierDictionaries() {}

  getAllChildTags(parentElement, elementName = 'node', excludeTakeValueTags = true) {
    if (excludeTakeValueTags && this.getElementTagName(parentElement) === '#') {
      return []
    }
    const tagElementChildren = this.getElementsByName(elementName, parentElement)
    const childTags = flattenDeep(
      tagElementChildren.map((child) => this.getAllChildTags(child, elementName, excludeTakeValueTags)),
    )
    childTags.push(parentElement)
    return childTags
  }

  getElementsByName(elementName = 'node', parentElement = this.rootElement) {
    return xpath.find(parentElement, '//' + elementName)
  }

  getTagPathFromTagElement(tagElement) {
    const ancestorTagNames = this.getAncestorTagNames(tagElement)
    ancestorTagNames.unshift(this.getElementTagName(tagElement))
    ancestorTagNames.reverse()
    return ancestorTagNames.join('/')
  }

  getAncestorTagNames(tagElement) {
    const ancestorTags = []
    let parentTagName = this.getParentTagName(tagElement)
    let parentElement = tagElement.$parent
    while (parentTagName) {
      ancestorTags.push(parentTagName)
      parentTagName = this.getParentTagName(parentElement)
      parentElement = parentElement.$parent
    }
    return ancestorTags
  }

  getParentTagName(tagElement) {
    const parentTagElement = tagElement.$parent
    if (parentTagElement && parentTagElement.$parent) {
      return this.getElementTagName(parentTagElement)
    } else {
      return ''
    }
  }

  getElementTagName(element) {
    return element.name[0]._
  }

  getElementTagValue(element, tagName) {
    return element[tagName][0]._
  }

  stringListToLowercaseTrueDictionary(stringList) {
    const lowercaseDictionary = {}
    for (const stringElement of stringList) {
      lowercaseDictionary[stringElement.toLowerCase()] = true
    }
    return lowercaseDictionary
  }
}

module.exports = {
  SchemaParser,
}
