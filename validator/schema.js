// TODO: Switch require once upstream bugs are fixed.
// const xpath = require('xml2js-xpath')
// Temporary
const xpath = require('../utils/xpath')

const arrayUtils = require('../utils/array')
const schemaUtils = require('../utils/schema')

const defaultUnitForTagAttribute = 'default'
const defaultUnitForUnitClassAttribute = 'defaultUnits'
const defaultUnitForOldUnitClassAttribute = 'default'
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
const unitClassDictionaryKeys = ['SIUnit', 'unitSymbol']
const unitModifierDictionaryKeys = ['SIUnitModifier', 'SIUnitSymbolModifier']
const tagsDictionaryKey = 'tags'
const tagUnitClassAttribute = 'unitClass'
const unitClassElement = 'unitClass'
const unitClassUnitElement = 'unit'
const unitClassUnitsElement = 'units'
const unitsElement = 'units'
const unitModifierElement = 'unitModifier'

const SchemaDictionaries = {
  populateDictionaries: function() {
    this.dictionaries = {}
    this.populateUnitClassDictionaries()
    this.populateUnitModifierDictionaries()
    this.populateTagDictionaries()
    return this.dictionaries
  },

  populateTagDictionaries: function() {
    for (const dictionaryKey of tagDictionaryKeys) {
      const [tags, tagElements] = this.getTagsByAttribute(dictionaryKey)
      if (dictionaryKey === extensionAllowedAttribute) {
        const tagDictionary = this.stringListToLowercaseDictionary(tags)
        const childTagElements = arrayUtils.flattenDeep(
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
        dictionaryKey === defaultUnitForTagAttribute ||
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
    if (unitClassElements.length === 0) {
      this.hasUnitClasses = false
      return
    }
    this.hasUnitClasses = true
    this.populateUnitClassUnitsDictionary(unitClassElements)
    this.populateUnitClassDefaultUnitDictionary(unitClassElements)
  },

  populateUnitClassUnitsDictionary: function(unitClassElements) {
    this.dictionaries[unitsElement] = {}
    for (const unitClassKey of unitClassDictionaryKeys) {
      this.dictionaries[unitClassKey] = {}
    }
    for (const unitClassElement of unitClassElements) {
      const unitClassName = this.getElementTagValue(unitClassElement)
      const units =
        unitClassElement[unitClassUnitsElement][0][unitClassUnitElement]
      if (units === undefined) {
        const elementUnits = this.getElementTagValue(
          unitClassElement,
          unitClassUnitsElement,
        )
        const units = elementUnits.split(',')
        this.dictionaries[unitsElement][unitClassName] = units.map(unit => {
          return unit.toLowerCase()
        })
        continue
      }
      const unitNames = units.map(element => {
        return element._
      })
      this.dictionaries[unitsElement][unitClassName] = unitNames
      for (const unit of units) {
        if (unit.$) {
          const unitName = unit._
          for (const unitClassKey of unitClassDictionaryKeys) {
            this.dictionaries[unitClassKey][unitName] = unit.$[unitClassKey]
          }
        }
      }
    }
  },

  populateUnitClassDefaultUnitDictionary: function(unitClassElements) {
    this.dictionaries[defaultUnitForUnitClassAttribute] = {}
    for (const unitClassElement of unitClassElements) {
      const elementName = this.getElementTagValue(unitClassElement)
      const defaultUnit = unitClassElement.$[defaultUnitForUnitClassAttribute]
      if (defaultUnit === undefined) {
        this.dictionaries[defaultUnitForUnitClassAttribute][elementName] =
          unitClassElement.$[defaultUnitForOldUnitClassAttribute]
      } else {
        this.dictionaries[defaultUnitForUnitClassAttribute][
          elementName
        ] = defaultUnit
      }
    }
  },

  populateUnitModifierDictionaries: function() {
    const unitModifierElements = this.getElementsByName(unitModifierElement)
    if (unitModifierElements.length === 0) {
      this.hasUnitModifiers = false
      return
    }
    this.hasUnitModifiers = true
    for (const unitModifierKey of unitModifierDictionaryKeys) {
      this.dictionaries[unitModifierKey] = {}
    }
    for (const unitModifierElement of unitModifierElements) {
      const unitModifierName = this.getElementTagValue(unitModifierElement)
      if (unitModifierElement.$) {
        for (const unitModifierKey of unitModifierDictionaryKeys) {
          if (unitModifierElement.$[unitModifierKey] !== undefined) {
            this.dictionaries[unitModifierKey][unitModifierName] =
              unitModifierElement.$[unitModifierKey]
          }
        }
      }
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
      this.dictionaries[attributeName][tag.toLowerCase()] =
        tagElementList[i].$[attributeName]
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
    let parentElement = tagElement.$parent
    while (parentTagName) {
      ancestorTags.push(parentTagName)
      parentTagName = this.getParentTagName(parentElement)
      parentElement = parentElement.$parent
    }
    return ancestorTags
  },

  getElementTagValue: function(element, tagName = 'name') {
    return element[tagName][0]._
  },

  getParentTagName: function(tagElement) {
    const parentTagElement = tagElement.$parent
    if (parentTagElement && parentTagElement !== this.rootElement) {
      return parentTagElement.name[0]._
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
    const tagElements = xpath.find(
      this.rootElement,
      '//node[@' + attributeName + ']',
    )
    for (const attributeTagElement of tagElements) {
      const tag = this.getTagPathFromTagElement(attributeTagElement)
      tags.push(tag)
    }
    return [tags, tagElements]
  },

  getAllTags: function(tagElementName = 'node') {
    const tags = []
    const tagElements = xpath.find(this.rootElement, '//' + tagElementName)
    for (const tagElement of tagElements) {
      const tag = this.getTagPathFromTagElement(tagElement)
      tags.push(tag)
    }
    return [tags, tagElements]
  },

  getElementsByName: function(elementName = 'node', parentElement = undefined) {
    if (!parentElement) {
      return xpath.find(this.rootElement, '//' + elementName)
    } else {
      return xpath.find(parentElement, '//' + elementName)
    }
  },

  getAllChildTags: function(
    parentElement,
    elementName = 'node',
    excludeTakeValueTags = true,
  ) {
    if (
      excludeTakeValueTags &&
      this.getElementTagValue(parentElement) === '#'
    ) {
      return []
    }
    const tagElementChildren = this.getElementsByName(
      elementName,
      parentElement,
    )
    const childTags = arrayUtils.flattenDeep(
      tagElementChildren.map(child => {
        return this.getAllChildTags(child, elementName, excludeTakeValueTags)
      }),
    )
    childTags.push(parentElement)
    return childTags
  },
}

/**
 * Determine if a HED tag has a particular attribute in this schema.
 *
 * @param {string} tag The HED tag to check.
 * @param {string} tagAttribute The attribute to check for.
 * @return {boolean} Whether this tag has this attribute.
 */
const tagHasAttribute = function(tag, tagAttribute) {
  return tag.toLowerCase() in this.dictionaries[tagAttribute]
}

const SchemaAttributes = function(
  rootElement,
  dictionaries,
  hasUnitClasses,
  hasUnitModifiers,
) {
  this.dictionaries = dictionaries
  this.hasUnitClasses = hasUnitClasses
  this.hasUnitModifiers = hasUnitModifiers
  this.version = rootElement.$.version
  this.tagHasAttribute = tagHasAttribute
}

/**
 * Build a schema object from schema XML data.
 *
 * @param {object} xmlData The schema XML data.
 * @return {SchemaAttributes} The schema object.
 */
const buildSchemaAttributesObject = function(xmlData) {
  const schemaDictionaries = Object.create(SchemaDictionaries)
  const rootElement = xmlData.HED
  schemaUtils.setParent(rootElement, xmlData)
  schemaDictionaries.rootElement = rootElement
  const dictionaries = schemaDictionaries.populateDictionaries()
  return new SchemaAttributes(
    rootElement,
    dictionaries,
    schemaDictionaries.hasUnitClasses,
    schemaDictionaries.hasUnitModifiers,
  )
}

/**
 * Build a schema attributes object from a schema version or path description.
 *
 * @param {{path: string?, version: string?}} schemaDef The description of which schema to use.
 * @return {Promise<never>|Promise<SchemaAttributes>} The schema attributes object or an error.
 */
const buildSchemaAttributes = function(schemaDef = {}) {
  return schemaUtils.loadSchema(schemaDef).then(xmlData => {
    return buildSchemaAttributesObject(xmlData)
  })
}

module.exports = {
  buildSchemaAttributes: buildSchemaAttributes,
  buildSchemaAttributesObject: buildSchemaAttributesObject,
  SchemaAttributes: SchemaAttributes,
}
