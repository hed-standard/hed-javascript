const arrayUtils = require('../../utils/array')

// TODO: Switch require once upstream bugs are fixed.
// const xpath = require('xml2js-xpath')
// Temporary
const xpath = require('../../utils/xpath')

const {
  SchemaAttributes,
  SchemaEntries,
  SchemaAttribute,
  SchemaProperty,
  SchemaUnit,
  SchemaUnitClass,
  SchemaUnitModifier,
  SchemaValueClass,
  nodeProperty,
} = require('./types')

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
const schemaAttributeDefinitionElement = 'schemaAttributeDefinition'
const unitClassDefinitionElement = 'unitClassDefinition'
const unitModifierDefinitionElement = 'unitModifierDefinition'

const lc = (str) => str.toLowerCase()

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

  getAllChildTags(
    parentElement,
    elementName = 'node',
    excludeTakeValueTags = true,
  ) {
    if (excludeTakeValueTags && this.getElementTagName(parentElement) === '#') {
      return []
    }
    const tagElementChildren = this.getElementsByName(
      elementName,
      parentElement,
    )
    const childTags = arrayUtils.flattenDeep(
      tagElementChildren.map((child) =>
        this.getAllChildTags(child, elementName, excludeTakeValueTags),
      ),
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

class Hed2SchemaParser extends SchemaParser {
  parse() {
    this.populateDictionaries()
    return new SchemaAttributes(this)
  }

  populateTagDictionaries() {
    this.tagAttributes = {}
    for (const dictionaryKey of tagDictionaryKeys) {
      const [tags, tagElements] = this.getTagsByAttribute(dictionaryKey)
      if (dictionaryKey === extensionAllowedAttribute) {
        const tagDictionary = this.stringListToLowercaseTrueDictionary(tags)
        const childTagElements = arrayUtils.flattenDeep(
          tagElements.map((tagElement) => this.getAllChildTags(tagElement)),
        )
        const childTags = childTagElements.map((tagElement) => {
          return this.getTagPathFromTagElement(tagElement)
        })
        const childDictionary =
          this.stringListToLowercaseTrueDictionary(childTags)
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
        this.tagAttributes[dictionaryKey] =
          this.stringListToLowercaseTrueDictionary(tags)
      }
    }
  }

  populateUnitClassDictionaries() {
    const unitClassElements = this.getElementsByName(unitClassElement)
    if (unitClassElements.length === 0) {
      this.hasUnitClasses = false
      return
    }
    this.hasUnitClasses = true
    this.populateUnitClassUnitsDictionary(unitClassElements)
    this.populateUnitClassDefaultUnitDictionary(unitClassElements)
  }

  populateUnitClassUnitsDictionary(unitClassElements) {
    this.unitClasses = {}
    this.unitClassAttributes = {}
    this.unitAttributes = {}
    for (const unitClassKey of unitClassDictionaryKeys) {
      this.unitAttributes[unitClassKey] = {}
    }
    for (const unitClassElement of unitClassElements) {
      const unitClassName = this.getElementTagName(unitClassElement)
      this.unitClassAttributes[unitClassName] = {}
      const units =
        unitClassElement[unitClassUnitsElement][0][unitClassUnitElement]
      if (units === undefined) {
        const elementUnits = this.getElementTagValue(
          unitClassElement,
          unitClassUnitsElement,
        )
        const units = elementUnits.split(',')
        this.unitClasses[unitClassName] = units.map(lc)
        continue
      }
      this.unitClasses[unitClassName] = units.map((element) => element._)
      for (const unit of units) {
        if (unit.$) {
          const unitName = unit._
          for (const unitClassKey of unitClassDictionaryKeys) {
            this.unitAttributes[unitClassKey][unitName] = unit.$[unitClassKey]
          }
        }
      }
    }
  }

  populateUnitClassDefaultUnitDictionary(unitClassElements) {
    for (const unitClassElement of unitClassElements) {
      const elementName = this.getElementTagName(unitClassElement)
      const defaultUnit = unitClassElement.$[defaultUnitForUnitClassAttribute]
      if (defaultUnit === undefined) {
        this.unitClassAttributes[elementName][
          defaultUnitForUnitClassAttribute
        ] = [unitClassElement.$[defaultUnitForOldUnitClassAttribute]]
      } else {
        this.unitClassAttributes[elementName][
          defaultUnitForUnitClassAttribute
        ] = [defaultUnit]
      }
    }
  }

  populateUnitModifierDictionaries() {
    this.unitModifiers = {}
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
      const unitModifierName = this.getElementTagName(unitModifierElement)
      if (unitModifierElement.$) {
        for (const unitModifierKey of unitModifierDictionaryKeys) {
          if (unitModifierElement.$[unitModifierKey] !== undefined) {
            this.unitModifiers[unitModifierKey][unitModifierName] =
              unitModifierElement.$[unitModifierKey]
          }
        }
      }
    }
  }

  populateTagToAttributeDictionary(tagList, tagElementList, attributeName) {
    this.tagAttributes[attributeName] = {}
    for (let i = 0; i < tagList.length; i++) {
      const tag = tagList[i]
      this.tagAttributes[attributeName][tag.toLowerCase()] =
        tagElementList[i].$[attributeName]
    }
  }

  populateTagUnitClassDictionary(tagList, tagElementList) {
    this.tagUnitClasses = {}
    for (let i = 0; i < tagList.length; i++) {
      const tag = tagList[i]
      const unitClassString = tagElementList[i].$[tagUnitClassAttribute]
      if (unitClassString) {
        this.tagUnitClasses[tag.toLowerCase()] = unitClassString.split(',')
      }
    }
  }

  getTagsByAttribute(attributeName) {
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
  }

  getAllTags(tagElementName = 'node', excludeTakeValueTags = true) {
    const tags = []
    const tagElements = xpath.find(this.rootElement, '//' + tagElementName)
    for (const tagElement of tagElements) {
      if (excludeTakeValueTags && this.getElementTagName(tagElement) === '#') {
        continue
      }
      const tag = this.getTagPathFromTagElement(tagElement)
      tags.push(tag)
    }
    return [tags, tagElements]
  }
}

class Hed3SchemaParser extends SchemaParser {
  constructor(rootElement) {
    super(rootElement)
    this._versionDefinitions = {}
  }

  parse() {
    this.populateDictionaries()
    return new SchemaEntries(this)
  }

  populateDictionaries() {
    this.parseProperties()
    this.parseAttributes()
    this.definitions = new Map()
    this.parseUnitModifiers()
    this.parseUnitClasses()
    this.populateTagDictionaries()
  }

  populateTagDictionaries() {
    this.tagAttributes = {}
    this.tagUnitClasses = {}

    const tagSchemaAttributes = Array.from(this.attributes.values()).filter(
      (attribute) => attribute.categoryProperty === nodeProperty,
    )
    const tagAttributes = tagSchemaAttributes.map((attribute) => attribute.name)
    for (const attribute of tagAttributes) {
      if (attribute === 'unitClass') {
        continue
      }
      this.tagAttributes[attribute] = {}
    }
    const [tags, tagElements] = this.getAllTags()
    const lowercaseTags = tags.map(lc)
    this.tags = lowercaseTags
    lowercaseTags.forEach((tag, index) => {
      const tagElement = tagElements[index]
      for (const attribute of tagAttributes) {
        const elementAttributeValue = this.elementAttributeValue(
          tagElement,
          attribute,
        )
        if (elementAttributeValue !== null) {
          if (attribute === extensionAllowedAttribute) {
            const tagDictionary = this.stringListToLowercaseTrueDictionary([
              tag,
            ])
            const childTagElements = this.getAllChildTags(tagElement)
            const childTags = childTagElements.map((element) => {
              return this.getTagPathFromTagElement(element)
            })
            const childDictionary =
              this.stringListToLowercaseTrueDictionary(childTags)
            Object.assign(
              this.tagAttributes[extensionAllowedAttribute],
              tagDictionary,
              childDictionary,
            )
          } else if (attribute === tagUnitClassAttribute) {
            this.tagUnitClasses[tag] = elementAttributeValue
          } else {
            this.tagAttributes[attribute][tag] = elementAttributeValue
          }
        }
      }
    })
  }

  /*
  populateUnitClassDictionaries() {
    const unitClassElements = this.getElementsByName(unitClassDefinitionElement)
    if (unitClassElements.length === 0) {
      this.hasUnitClasses = false
      return
    }
    this.hasUnitClasses = true
    this.unitClasses = {}
    this.unitClassAttributes = {}
    this.unitAttributes = {}

    const unitClassProperty = this.properties.get('unitClassProperty')
    const unitClassSchemaAttributes = Array.from(
      this.attributes.values(),
    ).filter((attribute) => attribute.categoryProperty === unitClassProperty)
    const unitClassAttributes = unitClassSchemaAttributes.map(
      (attribute) => attribute.name,
    )
    const unitProperty = this.properties.get('unitProperty')
    const unitSchemaAttributes = Array.from(this.attributes.values()).filter(
      (attribute) => attribute.categoryProperty === unitProperty,
    )
    const unitAttributes = unitSchemaAttributes.map(
      (attribute) => attribute.name,
    )
    for (const attribute of unitAttributes) {
      this.unitAttributes[attribute] = {}
    }

    for (const unitClassElement of unitClassElements) {
      const unitClassName = this.getElementTagName(unitClassElement)
      this.unitClassAttributes[unitClassName] = {}
      let units = unitClassElement[unitClassUnitElement]
      if (units === undefined) {
        units = []
      }
      for (const attribute of unitClassAttributes) {
        const elementAttributeValue = this.elementAttributeValue(
          unitClassElement,
          attribute,
          true,
        )
        if (elementAttributeValue !== null) {
          this.unitClassAttributes[unitClassName][attribute] =
            elementAttributeValue
        }
      }
      const unitNames = units.map(this.getElementTagName)
      this.unitClasses[unitClassName] = unitNames
      units.forEach((unit, index) => {
        const unitName = unitNames[index]
        for (const attribute of unitAttributes) {
          const elementAttributeValue = this.elementAttributeValue(
            unit,
            attribute,
          )
          if (elementAttributeValue !== null) {
            this.unitAttributes[attribute][unitName] = elementAttributeValue
          }
        }
      })
    }
  }

  populateUnitModifierDictionaries() {
    this.unitModifiers = {}
    const unitModifierElements = this.getElementsByName(
      unitModifierDefinitionElement,
    )
    if (unitModifierElements.length === 0) {
      this.hasUnitModifiers = false
      return
    }
    this.hasUnitModifiers = true

    const unitModifierProperty = this.properties.get('unitModifierProperty')
    const unitModifierSchemaAttributes = Array.from(
      this.attributes.values(),
    ).filter((attribute) => attribute.categoryProperty === unitModifierProperty)
    const unitModifierAttributes = unitModifierSchemaAttributes.map(
      (attribute) => attribute.name,
    )
    for (const attribute of unitModifierAttributes) {
      this.unitModifiers[attribute] = {}
    }

    for (const unitModifierElement of unitModifierElements) {
      const unitModifierName = this.getElementTagName(unitModifierElement)
      for (const attribute of unitModifierAttributes) {
        const elementAttributeValue = this.elementAttributeValue(
          unitModifierElement,
          attribute,
        )
        if (elementAttributeValue !== null) {
          this.unitModifiers[attribute][unitModifierName] =
            elementAttributeValue
        }
      }
    }
  }
   */

  static attributeFilter(propertyName) {
    return (element) => {
      const validProperty = propertyName
      if (!element.property) {
        return false
      }
      for (const property of element.property) {
        if (property.name[0]._ === validProperty) {
          return true
        }
      }
      return false
    }
  }

  elementAttributeValue(tagElement, attributeName) {
    if (!tagElement.attribute) {
      return null
    }
    for (const tagAttribute of tagElement.attribute) {
      if (tagAttribute.name[0]._ === attributeName) {
        if (tagAttribute.value === undefined) {
          return true
        }
        const values = []
        for (const value of tagAttribute.value) {
          values.push(value._)
        }
        return values
      }
    }
    return null
  }

  getAllTags(tagElementName = 'node') {
    const tags = []
    const tagElements = xpath.find(this.rootElement, '//' + tagElementName)
    for (const tagElement of tagElements) {
      const tag = this.getTagPathFromTagElement(tagElement)
      tags.push(tag)
    }
    return [tags, tagElements]
  }

  // Rewrite starts here.

  parseProperties() {
    const propertyDefinitions = this.getElementsByName('propertyDefinition')
    this.properties = new Map()
    for (const definition of propertyDefinitions) {
      const propertyName = this.getElementTagName(definition)
      if (
        this._versionDefinitions.categoryProperties &&
        this._versionDefinitions.categoryProperties.has(propertyName)
      ) {
        this.properties.set(
          propertyName,
          new SchemaProperty(propertyName, SchemaProperty.CATEGORY_PROPERTY),
        )
      } else if (
        this._versionDefinitions.typeProperties &&
        this._versionDefinitions.typeProperties.has(propertyName)
      ) {
        this.properties.set(
          propertyName,
          new SchemaProperty(propertyName, SchemaProperty.TYPE_PROPERTY),
        )
      }
    }
  }

  parseAttributes() {
    const attributeDefinitions = this.getElementsByName(
      'schemaAttributeDefinition',
    )
    this.attributes = new Map()
    for (const definition of attributeDefinitions) {
      const attributeName = this.getElementTagName(definition)
      const propertyElements = definition.property
      let properties
      if (propertyElements === undefined) {
        properties = []
      } else {
        properties = propertyElements.map((element) =>
          this.properties.get(element.name[0]._),
        )
      }
      this.attributes.set(
        attributeName,
        new SchemaAttribute(attributeName, properties),
      )
    }
  }

  parseUnitClasses() {
    const unitClasses = new Map()
    const [booleanAttributeDefinitions, valueAttributeDefinitions] =
      this._parseDefinitions('unitClass')

    // Parse units
    const unitModifiers = this.definitions.get('unitModifiers')
    const unitClassUnits = new Map()
    const unitClassElements = this.getElementsByName('unitClassDefinition')
    for (const element of unitClassElements) {
      const elementName = this.getElementTagName(element)
      const units = new Map()
      if (element.unit) {
        const [unitBooleanAttributeDefinitions, unitValueAttributeDefinitions] =
          this._parseAttributeElements(element.unit)
        for (const [name, valueAttributes] of unitValueAttributeDefinitions) {
          const booleanAttributes = unitBooleanAttributeDefinitions.get(name)
          units.set(
            name,
            new SchemaUnit(
              name,
              booleanAttributes,
              valueAttributes,
              unitModifiers,
            ),
          )
        }
      }
      unitClassUnits.set(elementName, units)
    }
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name)
      unitClasses.set(
        name,
        new SchemaUnitClass(
          name,
          booleanAttributes,
          valueAttributes,
          unitClassUnits.get(name),
        ),
      )
    }
    this.definitions.set('unitClasses', unitClasses)
  }

  parseUnitModifiers() {
    const unitModifiers = new Map()
    const [booleanAttributeDefinitions, valueAttributeDefinitions] =
      this._parseDefinitions('unitModifier')
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name)
      unitModifiers.set(
        name,
        new SchemaUnitModifier(name, booleanAttributes, valueAttributes),
      )
    }
    this.definitions.set('unitModifiers', unitModifiers)
  }

  parseValueClasses() {
    const valueClasses = new Map()
    const [booleanAttributeDefinitions, valueAttributeDefinitions] =
      this._parseDefinitions('valueClass')
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name)
      valueClasses.set(
        name,
        new SchemaValueClass(name, booleanAttributes, valueAttributes),
      )
    }
    this.definitions.set('valueClasses', valueClasses)
  }

  _parseDefinitions(category) {
    const categoryTagName = category + 'Definition'
    const definitionElements = this.getElementsByName(categoryTagName)

    return this._parseAttributeElements(definitionElements)
  }

  _parseAttributeElements(elements) {
    const booleanAttributeDefinitions = new Map()
    const valueAttributeDefinitions = new Map()

    for (const element of elements) {
      const elementName = this.getElementTagName(element)
      const booleanAttributes = new Set()
      const valueAttributes = new Map()

      if (element.attribute) {
        for (const tagAttribute of element.attribute) {
          const attributeName = tagAttribute.name[0]._
          if (tagAttribute.value === undefined) {
            booleanAttributes.add(this.attributes.get(attributeName))
            continue
          }
          const values = tagAttribute.value.map((value) => value._)
          valueAttributes.set(this.attributes.get(attributeName), values)
        }
      }

      booleanAttributeDefinitions.set(elementName, booleanAttributes)
      valueAttributeDefinitions.set(elementName, valueAttributes)
    }

    return [booleanAttributeDefinitions, valueAttributeDefinitions]
  }
}

class HedV8SchemaParser extends Hed3SchemaParser {
  constructor(rootElement) {
    super(rootElement)
    this._versionDefinitions = {
      typeProperties: new Set(['boolProperty']),
      categoryProperties: new Set([
        'unitProperty',
        'unitClassProperty',
        'unitModifierProperty',
        'valueClassProperty',
      ]),
    }
  }
}

module.exports = {
  Hed2SchemaParser: Hed2SchemaParser,
  Hed3SchemaParser: Hed3SchemaParser,
  HedV8SchemaParser: HedV8SchemaParser,
}
