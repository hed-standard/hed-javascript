import flattenDeep from 'lodash/flattenDeep'

// TODO: Switch require once upstream bugs are fixed.
// import xpath from 'xml2js-xpath'
// Temporary
import * as xpath from '../../utils/xpath'

export class SchemaParser {
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

  /**
   * Extract the name of an XML element.
   *
   * NOTE: This method cannot be merged into {@link getElementTagValue} because it is used as a first-class object.
   *
   * @param {object} element An XML element.
   * @returns {string} The name of the element.
   */
  getElementTagName(element) {
    return element.name[0]._
  }

  /**
   * Extract a value from an XML element.
   *
   * @param {object} element An XML element.
   * @param {string} tagName The tag value to extract.
   * @returns {string} The value of the tag in the element.
   */
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
