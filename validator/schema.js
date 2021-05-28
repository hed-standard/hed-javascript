// TODO: Switch require once upstream bugs are fixed.
// const xpath = require('xml2js-xpath')
// Temporary
const xpath = require('../utils/xpath')

const arrayUtils = require('../utils/array')
const schemaUtils = require('../utils/schema')

const buildMappingObject = require('../converter/schema').buildMappingObject

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

const lc = (str) => {
  return str.toLowerCase()
}

const V2SchemaDictionaries = {
  populateDictionaries: function () {
    this.tagAttributes = {}
    this.unitModifiers = {}
    this.populateUnitClassDictionaries()
    this.populateUnitModifierDictionaries()
    this.populateTagDictionaries()
  },

  populateTagDictionaries: function () {
    for (const dictionaryKey of tagDictionaryKeys) {
      const [tags, tagElements] = this.getTagsByAttribute(dictionaryKey)
      if (dictionaryKey === extensionAllowedAttribute) {
        const tagDictionary = this.stringListToLowercaseTrueDictionary(tags)
        const childTagElements = arrayUtils.flattenDeep(
          tagElements.map((tagElement) => {
            return this.getAllChildTags(tagElement)
          }),
        )
        const childTags = childTagElements.map((tagElement) => {
          return this.getTagPathFromTagElement(tagElement)
        })
        const childDictionary = this.stringListToLowercaseTrueDictionary(childTags)
        this.tagAttributes[extensionAllowedAttribute] = Object.assign(
          {},
          tagDictionary,
          childDictionary,
        )
      } else if (dictionaryKey === defaultUnitForTagAttribute) {
        this.populateTagToAttributeDictionary(tags, tagElements, dictionaryKey)
      } else if (dictionaryKey === tagUnitClassAttribute) {
        this.populateTagUnitClassDictionary(tags, tagElements)
      } else if (dictionaryKey === tagsDictionaryKey) {
        const tags = this.getAllTags()[0]
        this.tags = tags.map(lc)
      } else {
        this.tagAttributes[dictionaryKey] = this.stringListToLowercaseTrueDictionary(tags)
      }
    }
  },

  populateUnitClassDictionaries: function () {
    const unitClassElements = this.getElementsByName(unitClassElement)
    if (unitClassElements.length === 0) {
      this.hasUnitClasses = false
      return
    }
    this.hasUnitClasses = true
    this.populateUnitClassUnitsDictionary(unitClassElements)
    this.populateUnitClassDefaultUnitDictionary(unitClassElements)
  },

  populateUnitClassUnitsDictionary: function (unitClassElements) {
    this.unitClasses = {}
    this.unitClassAttributes = {}
    this.unitAttributes = {}
    for (const unitClassKey of unitClassDictionaryKeys) {
      this.unitAttributes[unitClassKey] = {}
    }
    for (const unitClassElement of unitClassElements) {
      const unitClassName = this.getElementTagValue(unitClassElement)
      this.unitClassAttributes[unitClassName] = {}
      const units =
        unitClassElement[unitClassUnitsElement][0][unitClassUnitElement]
      if (units === undefined) {
        const elementUnits = this.getElementTagValue(
          unitClassElement,
          unitClassUnitsElement,
        )
        const units = elementUnits.split(',')
        this.unitClasses[unitClassName] = units.map((unit) => {
          return unit.toLowerCase()
        })
        continue
      }
      const unitNames = units.map((element) => {
        return element._
      })
      this.unitClasses[unitClassName] = unitNames
      for (const unit of units) {
        if (unit.$) {
          const unitName = unit._
          for (const unitClassKey of unitClassDictionaryKeys) {
            this.unitAttributes[unitClassKey][unitName] = unit.$[unitClassKey]
          }
        }
      }
    }
  },

  populateUnitClassDefaultUnitDictionary: function (unitClassElements) {
    for (const unitClassElement of unitClassElements) {
      const elementName = this.getElementTagValue(unitClassElement)
      const defaultUnit = unitClassElement.$[defaultUnitForUnitClassAttribute]
      if (defaultUnit === undefined) {
        this.unitClassAttributes[elementName][defaultUnitForUnitClassAttribute] =
          unitClassElement.$[defaultUnitForOldUnitClassAttribute]
      } else {
        this.unitClassAttributes[elementName][defaultUnitForUnitClassAttribute] = defaultUnit
      }
    }
  },

  populateUnitModifierDictionaries: function () {
    const unitModifierElements = this.getElementsByName(unitModifierElement)
    if (unitModifierElements.length === 0) {
      this.hasUnitModifiers = false
      return
    }
    this.hasUnitModifiers = true
    for (const unitModifierKey of unitModifierDictionaryKeys) {
      this.unitModifiers[unitModifierKey] = {}
    }
    for (const unitModifierElement of unitModifierElements) {
      const unitModifierName = this.getElementTagValue(unitModifierElement)
      if (unitModifierElement.$) {
        for (const unitModifierKey of unitModifierDictionaryKeys) {
          if (unitModifierElement.$[unitModifierKey] !== undefined) {
            this.unitModifiers[unitModifierKey][unitModifierName] =
              unitModifierElement.$[unitModifierKey]
          }
        }
      }
    }
  },

  populateTagToAttributeDictionary: function (
    tagList,
    tagElementList,
    attributeName,
  ) {
    this.tagAttributes[attributeName] = {}
    for (let i = 0; i < tagList.length; i++) {
      const tag = tagList[i]
      this.tagAttributes[attributeName][tag.toLowerCase()] =
        tagElementList[i].$[attributeName]
    }
  },

  populateTagUnitClassDictionary: function (
    tagList,
    tagElementList,
  ) {
    this.tagUnitClasses = {}
    for (let i = 0; i < tagList.length; i++) {
      const tag = tagList[i]
      const unitClassString = tagElementList[i].$[tagUnitClassAttribute]
      if (unitClassString) {
        this.tagUnitClasses[tag.toLowerCase()] = unitClassString.split(',')
      }
    }
  },

  stringListToLowercaseTrueDictionary: function (stringList) {
    const lowercaseDictionary = {}
    for (const stringElement of stringList) {
      lowercaseDictionary[stringElement.toLowerCase()] = true
    }
    return lowercaseDictionary
  },

  getAncestorTagNames: function (tagElement) {
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

  getElementTagValue: function (element, tagName = 'name') {
    return element[tagName][0]._
  },

  getParentTagName: function (tagElement) {
    const parentTagElement = tagElement.$parent
    if (parentTagElement && parentTagElement !== this.rootElement) {
      return parentTagElement.name[0]._
    } else {
      return ''
    }
  },

  getTagPathFromTagElement: function (tagElement) {
    const ancestorTagNames = this.getAncestorTagNames(tagElement)
    ancestorTagNames.unshift(this.getElementTagValue(tagElement))
    ancestorTagNames.reverse()
    return ancestorTagNames.join('/')
  },

  getTagsByAttribute: function (attributeName) {
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

  getAllTags: function (tagElementName = 'node', excludeTakeValueTags = true) {
    const tags = []
    const tagElements = xpath.find(this.rootElement, '//' + tagElementName)
    for (const tagElement of tagElements) {
      if (excludeTakeValueTags && this.getElementTagValue(tagElement) === '#') {
        continue
      }
      const tag = this.getTagPathFromTagElement(tagElement)
      tags.push(tag)
    }
    return [tags, tagElements]
  },

  getElementsByName: function (
    elementName = 'node',
    parentElement = undefined,
  ) {
    if (!parentElement) {
      return xpath.find(this.rootElement, '//' + elementName)
    } else {
      return xpath.find(parentElement, '//' + elementName)
    }
  },

  getAllChildTags: function (
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
      tagElementChildren.map((child) => {
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
const tagHasAttribute = function (tag, tagAttribute) {
  return tag.toLowerCase() in this.tagAttributes[tagAttribute]
}

/**
 * A description of a HED schema's attributes.
 *
 * @param {V2SchemaDictionaries} schemaDictionaries A constructed schema dictionary collection.
 * @constructor
 */
const SchemaAttributes = function (schemaDictionaries) {
  /**
   * The list of all (formatted) tags.
   * @type {string[]}
   */
  this.tags = schemaDictionaries.tags
  /**
   * The mapping from attributes to tags to values.
   * @type {object<string, object<string, boolean|string|string[]>>}
   */
  this.tagAttributes = schemaDictionaries.tagAttributes
  /**
   * The mapping from tags to their unit classes.
   * @type {object<string, string[]>}
   */
  this.tagUnitClasses = schemaDictionaries.tagUnitClasses
  /**
   * The mapping from unit classes to their units.
   * @type {object<string, string[]>}
   */
  this.unitClasses = schemaDictionaries.unitClasses
  /**
   * The mapping from unit classes to their attributes.
   * @type {object<string, object<string, boolean|string|string[]>>}
   */
  this.unitClassAttributes = schemaDictionaries.unitClassAttributes
  /**
   * The mapping from units to their attributes.
   * @type {object<string, object<string, boolean|string|string[]>>}
   */
  this.unitAttributes = schemaDictionaries.unitAttributes
  /**
   * The mapping from unit modifier types to unit modifiers.
   * @type {object<string, string[]>}
   */
  this.unitModifiers = schemaDictionaries.unitModifiers
  /**
   * Whether the schema has unit classes.
   * @type {boolean}
   */
  this.hasUnitClasses = schemaDictionaries.hasUnitClasses
  /**
   * Whether the schema has unit modifiers.
   * @type {boolean}
   */
  this.hasUnitModifiers = schemaDictionaries.hasUnitModifiers
  /**
   * Determine if a HED tag has a particular attribute in this schema.
   * @param {string} tag The HED tag to check.
   * @param {string} tagAttribute The attribute to check for.
   * @return {boolean} Whether this tag has this attribute.
   */
  this.tagHasAttribute = tagHasAttribute
}

/**
 * Build a schema attributes object from schema XML data.
 *
 * @param {object} xmlData The schema XML data.
 * @return {SchemaAttributes} The schema attributes object.
 */
const buildSchemaAttributesObject = function (xmlData) {
  const schemaDictionaries = Object.create(V2SchemaDictionaries)
  const rootElement = xmlData.HED
  schemaUtils.setParent(rootElement, xmlData)
  schemaDictionaries.rootElement = rootElement
  schemaDictionaries.populateDictionaries()

  return new SchemaAttributes(schemaDictionaries)
}

/**
 * Build a schema container object from a base schema version or path description.
 *
 * @param {{path: string?, version: string?}} schemaDef The description of which base schema to use.
 * @return {Promise<never>|Promise<Schemas>} The schema container object or an error.
 */
const buildSchema = function (schemaDef = {}) {
  return schemaUtils.loadSchema(schemaDef).then((xmlData) => {
    const schemaAttributes = buildSchemaAttributesObject(xmlData)
    const mapping = buildMappingObject(xmlData)
    const baseSchema = new schemaUtils.Schema(
      xmlData,
      schemaAttributes,
      mapping,
    )
    return new schemaUtils.Schemas(baseSchema)
  })
}

module.exports = {
  buildSchema: buildSchema,
  buildSchemaAttributesObject: buildSchemaAttributesObject,
  SchemaAttributes: SchemaAttributes,
}
