const libxmljs = require('libxmljs')
const files = require('../utils/files')

const defaultUnitAttribute = 'default'
const extensionAllowedAttribute = 'extensionAllowed'
const tagDictionaryKeys = [
  'default',
  'extensionAllowed',
  'isNumeric',
  'position',
  'predicateType',
  'recommended',
  'required',
  'requireChild',
  'tags',
  'takesValue',
  'unique',
  'unitClass',
]
const tagsDictionaryKey = 'tags'
const tagUnitClassAttribute = 'unitClass'
const unitClassElement = 'unitClass'
const unitClassUnitsElement = 'units'
const unitsElement = 'units'

const Schema = {
  populateDictionaries: function() {
    this.dictionaries = {}
    this.populateTagDictionaries()
    this.populateUnitClassDictionaries()
  },

  populateTagDictionaries: function() {
    for (let dictionaryKey of tagDictionaryKeys) {
      const [tags, tagElements] = this.getTagsByAttribute(dictionaryKey)
      if (dictionaryKey === extensionAllowedAttribute) {
        const leafTags = this.getAllLeafTags()
        const leafTagsDictionary = this.stringListToLowercaseDictionary(
          leafTags,
        )
        const tagDictionary = this.stringListToLowercaseDictionary(tags)
        this.dictionaries[extensionAllowedAttribute] = Object.assign(
          {},
          leafTagsDictionary,
          tagDictionary,
        )
      } else if (
        dictionaryKey === defaultUnitAttribute ||
        dictionaryKey === tagUnitClassAttribute
      ) {
        this.populateTagToAttributeDictionary(tags, tagElements, dictionaryKey)
      } else if (dictionaryKey === tagsDictionaryKey) {
        const tags = this.getAllTags()[0]
        this.dictionaries[
          tagsDictionaryKey
        ] = this.stringListToLowercaseDictionary(tags)
      } else {
        this.dictionaries[dictionaryKey] = this.stringListToLowercaseDictionary(
          tags,
        )
      }
    }
  },

  populateUnitClassDictionaries: function() {
    const unitClassElements = this.getElementsByName(unitClassElement)
    this.populateUnitClassUnitsDictionary(unitClassElements)
    this.populateUnitClassDefaultUnitDictionary(unitClassElements)
  },

  populateUnitClassUnitsDictionary: function(unitClassElements) {
    this.dictionaries[unitsElement] = {}
    for (let unitClassElement of unitClassElements) {
      const elementName = this.getElementTagValue(unitClassElement)
      const elementUnits = this.getElementTagValue(
        unitClassElement,
        unitClassUnitsElement,
      )
      this.dictionaries[unitsElement][elementName] = elementUnits.split(',')
    }
  },

  populateUnitClassDefaultUnitDictionary: function(unitClassElements) {
    this.dictionaries[defaultUnitAttribute] = {}
    for (let unitClassElement of unitClassElements) {
      const elementName = this.getElementTagValue(unitClassElement)
      this.dictionaries[defaultUnitAttribute][
        elementName
      ] = unitClassElement.attr(defaultUnitAttribute).value()
    }
  },

  populateTagToAttributeDictionary: function(
    tagList,
    tagElementList,
    attributeName,
  ) {
    this.dictionaries[attributeName] = {}
    for (let i = 0; i < tagList.length; i++) {
      const tag = tagList[i]
      this.dictionaries[attributeName][tag.toLowerCase()] = tagElementList[i]
        .attr(attributeName)
        .value()
    }
  },

  stringListToLowercaseDictionary: function(stringList) {
    const lowercaseDictionary = {}
    for (let stringElement of stringList) {
      lowercaseDictionary[stringElement.toLowerCase()] = stringElement
    }
    return lowercaseDictionary
  },

  getAncestorTagNames: function(tagElement) {
    const ancestorTags = []
    let parentTagName = this.getParentTagName(tagElement)
    let parentElement = tagElement.parent()
    while (parentTagName) {
      ancestorTags.push(parentTagName)
      parentTagName = this.getParentTagName(parentElement)
      parentElement = parentElement.parent()
    }
    return ancestorTags
  },

  getElementTagValue: function(element, tagName = 'name') {
    return element.find('//' + tagName)[0].text()
  },

  getParentTagName: function(tagElement) {
    const parentTagElement = tagElement.parent()
    if (parentTagElement !== this.rootElement) {
      return parentTagElement.find('name')[0].text()
    } else {
      return ''
    }
  },

  getTagPathFromTagElement: function(tagElement) {
    const ancestorTagNames = this.getAncestorTagNames(tagElement)
    ancestorTagNames.unshift(this.getElementTagValue(tagElement))
    ancestorTagNames.reverse()
    return ancestorTagNames.join('/')
  },

  getTagsByAttribute: function(attributeName) {
    const tags = []
    const tagElements = this.rootElement.find('.//node[@' + attributeName + ']')
    for (let attributeTagElement of tagElements) {
      const tag = this.getTagPathFromTagElement(attributeTagElement)
      tags.push(tag)
    }
    return [tags, tagElements]
  },

  getAllTags: function(tagElementName) {
    const tags = []
    const tagElements = this.rootElement.find('.//' + tagElementName)
    for (let tagElement of tagElements) {
      const tag = this.getTagPathFromTagElement(tagElement)
      tags.push(tag)
    }
    return [tags, tagElements]
  },

  getElementsByAttribute: function(attributeName, elementName = 'node') {
    return this.rootElement.find(
      './/' + elementName + '[@' + attributeName + ']',
    )
  },

  getElementsByName: function(elementName = 'node', parentElement) {
    if (!parentElement) {
      return this.rootElement.find('.//' + elementName)
    } else {
      return parentElement.find('.//' + elementName)
    }
  },

  getAllLeafTags: function(elementName = 'node', excludeTakeValueTags = true) {
    const leafTags = []
    const tagElements = this.getElementsByName(elementName)
    for (let tagElement of tagElements) {
      const tagElementChildren = this.getElementsByName(elementName, tagElement)
      if (tagElementChildren.length === 0) {
        const tag = this.getTagPathFromTagElement(tagElement)
        if (excludeTakeValueTags && tag[-1] === '#') {
          continue
        }
        leafTags.push(tag)
      }
    }
    return leafTags
  },

  tagHasAttribute: function(tag, tagAttribute) {
    return tag.toLowerCase() in this.dictionaries[tagAttribute]
  },
}

const loadRemoteSchema = function(version = 'Latest', issues) {
  const fileName = 'HED' + version + '.xml'
  const basePath =
    'https://raw.githubusercontent.com/hed-standard/hed-specification/master/hedxml/'
  const url = basePath + fileName
  return files
    .readHTTPSFile(url)
    .then(data => {
      return libxmljs.parseXmlString(data)
    })
    .catch(error => {
      issues.push(
        'Could not load HED schema version "' + version + '" - "' + error + '"',
      )
    })
}

const loadLocalSchema = function(path, issues) {
  return files
    .readFile(path)
    .then(data => {
      return libxmljs.parseXmlString(data)
    })
    .catch(error => {
      issues.push(
        'Could not load HED schema from path "' + path + '" - "' + error + '"',
      )
    })
}

const buildRemoteSchema = function(version = 'Latest', issues) {
  return loadRemoteSchema(version, issues).then(xmlData => {
    return buildSchema(xmlData)
  })
}

const buildLocalSchema = function(path, issues) {
  return loadLocalSchema(path, issues).then(xmlData => {
    return buildSchema(xmlData)
  })
}

const buildSchema = function(xmlData) {
  const schema = Object.create(Schema)
  schema.rootElement = xmlData.root()
  schema.populateDictionaries()
  return schema
}

module.exports = {
  buildRemoteSchema: buildRemoteSchema,
  buildLocalSchema: buildLocalSchema,
}
