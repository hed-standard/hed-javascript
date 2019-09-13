const libxmljs = require('libxmljs')
const files = require('../utils/files')
const arrayUtil = require('../utils/array')

const defaultUnitAttribute = 'default'
const defaultUnitsForTypeAttribute = 'default_units'
const extensionAllowedAttribute = 'extensionAllowed'
const tagDictionaryKeys = [
  'default',
  'extensionAllowed',
  'isNumeric',
  'leaf',
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
const leafTagsDictionaryKey = 'leaf'
const tagsDictionaryKey = 'tags'
const tagUnitClassAttribute = 'unitClass'
const unitClassElement = 'unitClass'
const unitClassUnitsElement = 'units'
const unitsElement = 'units'

const SchemaDictionaries = {
  populateDictionaries: function() {
    this.dictionaries = {}
    this.populateTagDictionaries()
    this.populateUnitClassDictionaries()
    return this.dictionaries
  },

  populateTagDictionaries: function() {
    for (const dictionaryKey of tagDictionaryKeys) {
      const [tags, tagElements] = this.getTagsByAttribute(dictionaryKey)
      if (dictionaryKey === extensionAllowedAttribute) {
        const tagDictionary = this.stringListToLowercaseDictionary(tags)
        const childTagElements = arrayUtil.flattenDeep(
          tagElements.map(tagElement => {
            return this.getAllChildTags(tagElement)
          }),
        )
        const childTags = childTagElements.map(tagElement => {
          return this.getTagPathFromTagElement(tagElement)
        })
        const childDictionary = this.stringListToLowercaseDictionary(childTags)
        this.dictionaries[extensionAllowedAttribute] = Object.assign(
          {},
          tagDictionary,
          childDictionary,
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
      } else if (dictionaryKey === leafTagsDictionaryKey) {
        const leafTags = this.getAllLeafTags()
        this.dictionaries[
          leafTagsDictionaryKey
        ] = this.stringListToLowercaseDictionary(leafTags)
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
    for (const unitClassElement of unitClassElements) {
      const elementName = this.getElementTagValue(unitClassElement)
      const elementUnits = this.getElementTagValue(
        unitClassElement,
        unitClassUnitsElement,
      )
      this.dictionaries[unitsElement][elementName] = elementUnits.split(',')
    }
  },

  populateUnitClassDefaultUnitDictionary: function(unitClassElements) {
    this.dictionaries[defaultUnitsForTypeAttribute] = {}
    for (const unitClassElement of unitClassElements) {
      const elementName = this.getElementTagValue(unitClassElement)
      this.dictionaries[defaultUnitsForTypeAttribute][
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
    for (const stringElement of stringList) {
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
    return element.find(tagName)[0].text()
  },

  getParentTagName: function(tagElement) {
    const parentTagElement = tagElement.parent()
    if (parentTagElement && parentTagElement !== this.rootElement) {
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
    for (const attributeTagElement of tagElements) {
      const tag = this.getTagPathFromTagElement(attributeTagElement)
      tags.push(tag)
    }
    return [tags, tagElements]
  },

  getAllTags: function(tagElementName = 'node') {
    const tags = []
    const tagElements = this.rootElement.find('.//' + tagElementName)
    for (const tagElement of tagElements) {
      const tag = this.getTagPathFromTagElement(tagElement)
      tags.push(tag)
    }
    return [tags, tagElements]
  },

  getElementsByName: function(elementName = 'node', parentElement = undefined) {
    if (!parentElement) {
      return this.rootElement.find('.//' + elementName)
    } else {
      return parentElement.find('.//' + elementName)
    }
  },

  getAllChildTags: function(
    parentElement,
    elementName = 'node',
    excludeTakeValueTags = true,
  ) {
    const tagElementChildren = this.getElementsByName(
      elementName,
      parentElement,
    )
    const childTags = arrayUtil.flattenDeep(
      tagElementChildren.map(child => {
        return this.getAllChildTags(child, elementName, excludeTakeValueTags)
      }),
    )
    childTags.push(parentElement)
    return childTags
  },

  getAllLeafTags: function(elementName = 'node', excludeTakeValueTags = true) {
    const leafTags = []
    const tagElements = this.getElementsByName(elementName)
    for (const tagElement of tagElements) {
      const tagElementChildren = this.getElementsByName(elementName, tagElement)
      if (tagElementChildren.length === 0) {
        const tag = this.getTagPathFromTagElement(tagElement)
        if (excludeTakeValueTags && tag.endsWith('#')) {
          continue
        }
        leafTags.push(tag)
      }
    }
    return leafTags
  },
}

/**
 * Determine if a HED tag has a particular attribute in this schema.
 *
 * @param tag The HED tag to check.
 * @param tagAttribute The attribute to check for.
 * @return {boolean} Whether this tag has this attribute.
 */
const tagHasAttribute = function(tag, tagAttribute) {
  return tag.toLowerCase() in this.dictionaries[tagAttribute]
}

const Schema = function(rootElement, dictionaries) {
  this.rootElement = rootElement
  this.dictionaries = dictionaries
  this.version = rootElement.attr('version').value()
  this.tagHasAttribute = tagHasAttribute
}

const loadRemoteSchema = function(version) {
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
      throw new Error(
        'Could not load HED schema version "' +
          version +
          '" from remote repository - "' +
          error +
          '".',
      )
    })
}

const loadLocalSchema = function(path) {
  return files
    .readFile(path)
    .then(data => {
      return libxmljs.parseXmlString(data)
    })
    .catch(error => {
      throw new Error(
        'Could not load HED schema from path "' + path + '" - "' + error + '".',
      )
    })
}

const buildRemoteSchema = function(version = 'Latest') {
  return loadRemoteSchema(version).then(xmlData => {
    return buildSchemaObject(xmlData)
  })
}

const buildLocalSchema = function(path) {
  return loadLocalSchema(path).then(xmlData => {
    return buildSchemaObject(xmlData)
  })
}

const buildSchemaObject = function(xmlData) {
  const schemaDictionaries = Object.create(SchemaDictionaries)
  const rootElement = xmlData.root()
  schemaDictionaries.rootElement = rootElement
  const dictionaries = schemaDictionaries.populateDictionaries()
  return new Schema(rootElement, dictionaries)
}

const buildSchema = function(schemaDef) {
  if (schemaDef === undefined) {
    return buildRemoteSchema()
  } else if (schemaDef.path) {
    return buildLocalSchema(schemaDef.path)
  } else if (schemaDef.version) {
    return buildRemoteSchema(schemaDef.version)
  } else {
    return Promise.reject('Invalid input.')
  }
}

module.exports = {
  buildSchema: buildSchema,
  Schema: Schema,
}
