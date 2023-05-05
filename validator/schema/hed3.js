// TODO: Switch require once upstream bugs are fixed.
// import xpath from 'xml2js-xpath'
// Temporary
import * as xpath from '../../utils/xpath'

import { SchemaParser } from './parser'
import {
  SchemaEntries,
  SchemaEntryManager,
  SchemaAttribute,
  SchemaProperty,
  SchemaTag,
  SchemaUnit,
  SchemaUnitClass,
  SchemaUnitModifier,
  SchemaValueClass,
  nodeProperty,
  schemaAttributeProperty,
} from './types'

const lc = (str) => str.toLowerCase()

export class Hed3SchemaParser extends SchemaParser {
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
    this.parseTags()
  }

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

  getAllTags(tagElementName = 'node') {
    const tagElements = xpath.find(this.rootElement, '//' + tagElementName)
    const tags = tagElements.map((element) => this.getTagPathFromTagElement(element))
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
          // TODO: Switch back to class constant once upstream bug is fixed.
          new SchemaProperty(propertyName, 'categoryProperty'),
        )
      } else if (this._versionDefinitions.typeProperties && this._versionDefinitions.typeProperties.has(propertyName)) {
        this.properties.set(
          propertyName,
          // TODO: Switch back to class constant once upstream bug is fixed.
          new SchemaProperty(propertyName, 'typeProperty'),
        )
      } else if (this._versionDefinitions.roleProperties && this._versionDefinitions.roleProperties.has(propertyName)) {
        this.properties.set(
          propertyName,
          // TODO: Switch back to class constant once upstream bug is fixed.
          new SchemaProperty(propertyName, 'roleProperty'),
        )
      }
    }
  }

  parseAttributes() {
    const attributeDefinitions = this.getElementsByName('schemaAttributeDefinition')
    this.attributes = new Map()
    for (const definition of attributeDefinitions) {
      const attributeName = this.getElementTagName(definition)
      const propertyElements = definition.property
      let properties
      if (propertyElements === undefined) {
        properties = []
      } else {
        properties = propertyElements.map((element) => this.properties.get(element.name[0]._))
      }
      this.attributes.set(attributeName, new SchemaAttribute(attributeName, properties))
    }
    if (this._addAttributes) {
      this._addAttributes()
    }
  }

  parseValueClasses() {
    const valueClasses = new Map()
    const [booleanAttributeDefinitions, valueAttributeDefinitions] = this._parseDefinitions('valueClass')
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name)
      valueClasses.set(name, new SchemaValueClass(name, booleanAttributes, valueAttributes))
    }
    this.definitions.set('valueClasses', new SchemaEntryManager(valueClasses))
  }

  parseUnitModifiers() {
    const unitModifiers = new Map()
    const [booleanAttributeDefinitions, valueAttributeDefinitions] = this._parseDefinitions('unitModifier')
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name)
      unitModifiers.set(name, new SchemaUnitModifier(name, booleanAttributes, valueAttributes))
    }
    this.definitions.set('unitModifiers', new SchemaEntryManager(unitModifiers))
  }

  parseUnitClasses() {
    const unitClasses = new Map()
    const [booleanAttributeDefinitions, valueAttributeDefinitions] = this._parseDefinitions('unitClass')
    const unitClassUnits = this.parseUnits()

    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name)
      unitClasses.set(name, new SchemaUnitClass(name, booleanAttributes, valueAttributes, unitClassUnits.get(name)))
    }
    this.definitions.set('unitClasses', new SchemaEntryManager(unitClasses))
  }

  parseUnits() {
    const unitClassUnits = new Map()
    const unitClassElements = this.getElementsByName('unitClassDefinition')
    const unitModifiers = this.definitions.get('unitModifiers')
    for (const element of unitClassElements) {
      const elementName = this.getElementTagName(element)
      const units = new Map()
      unitClassUnits.set(elementName, units)
      if (element.unit === undefined) {
        continue
      }
      const [unitBooleanAttributeDefinitions, unitValueAttributeDefinitions] = this._parseAttributeElements(
        element.unit,
        this.getElementTagName,
      )
      for (const [name, valueAttributes] of unitValueAttributeDefinitions) {
        const booleanAttributes = unitBooleanAttributeDefinitions.get(name)
        units.set(name, new SchemaUnit(name, booleanAttributes, valueAttributes, unitModifiers))
      }
    }
    return unitClassUnits
  }

  parseTags() {
    const [tags, tagElements] = this.getAllTags()
    const lowercaseTags = tags.map(lc)
    this.tags = new Set(lowercaseTags)
    const [booleanAttributeDefinitions, valueAttributeDefinitions] = this._parseAttributeElements(
      tagElements,
      (element) => this.getTagPathFromTagElement(element),
    )

    const recursiveAttributes = Array.from(this.attributes.values()).filter((attribute) =>
      attribute.roleProperties.has(this.properties.get('recursiveProperty')),
    )
    const unitClasses = this.definitions.get('unitClasses')
    const tagUnitClassAttribute = this.attributes.get('unitClass')

    const tagUnitClassDefinitions = new Map()
    const recursiveChildren = new Map()
    tags.forEach((tagName, index) => {
      const tagElement = tagElements[index]
      const valueAttributes = valueAttributeDefinitions.get(tagName)
      if (valueAttributes.has(tagUnitClassAttribute)) {
        tagUnitClassDefinitions.set(
          tagName,
          valueAttributes.get(tagUnitClassAttribute).map((unitClassName) => {
            return unitClasses.getEntry(unitClassName)
          }),
        )
        valueAttributes.delete(tagUnitClassAttribute)
      }
      for (const attribute of recursiveAttributes) {
        const children = recursiveChildren.get(attribute) ?? []
        if (booleanAttributeDefinitions.get(tagName).has(attribute)) {
          children.push(...this.getAllChildTags(tagElement))
        }
        recursiveChildren.set(attribute, children)
      }
    })

    for (const [attribute, childTagElements] of recursiveChildren) {
      for (const tagElement of childTagElements) {
        const tagName = this.getTagPathFromTagElement(tagElement)
        booleanAttributeDefinitions.get(tagName).add(attribute)
      }
    }

    const tagEntries = new Map()
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name)
      const unitClasses = tagUnitClassDefinitions.get(name)
      tagEntries.set(lc(name), new SchemaTag(name, booleanAttributes, valueAttributes, unitClasses))
    }

    for (const tagElement of tagElements) {
      const tagName = this.getTagPathFromTagElement(tagElement)
      const parentTagName = this.getParentTagPath(tagElement)
      if (parentTagName) {
        tagEntries.get(lc(tagName))._parent = tagEntries.get(lc(parentTagName))
      }
    }

    this.definitions.set('tags', new SchemaEntryManager(tagEntries))
  }

  _parseDefinitions(category) {
    const categoryTagName = category + 'Definition'
    const definitionElements = this.getElementsByName(categoryTagName)

    return this._parseAttributeElements(definitionElements, this.getElementTagName)
  }

  _parseAttributeElements(elements, namer) {
    const booleanAttributeDefinitions = new Map()
    const valueAttributeDefinitions = new Map()

    for (const element of elements) {
      const [booleanAttributes, valueAttributes] = this._parseAttributeElement(element)

      const elementName = namer(element)
      booleanAttributeDefinitions.set(elementName, booleanAttributes)
      valueAttributeDefinitions.set(elementName, valueAttributes)
    }

    return [booleanAttributeDefinitions, valueAttributeDefinitions]
  }

  _parseAttributeElement(element) {
    const booleanAttributes = new Set()
    const valueAttributes = new Map()

    const tagAttributes = element.attribute ?? []

    for (const tagAttribute of tagAttributes) {
      const attributeName = this.getElementTagName(tagAttribute)
      if (tagAttribute.value === undefined) {
        booleanAttributes.add(this.attributes.get(attributeName))
        continue
      }
      const values = tagAttribute.value.map((value) => value._)
      valueAttributes.set(this.attributes.get(attributeName), values)
    }

    return [booleanAttributes, valueAttributes]
  }
}

export class HedV8SchemaParser extends Hed3SchemaParser {
  constructor(rootElement) {
    super(rootElement)
    this._versionDefinitions = {
      typeProperties: new Set(['boolProperty']),
      categoryProperties: new Set([
        'elementProperty',
        'nodeProperty',
        'schemaAttributeProperty',
        'unitProperty',
        'unitClassProperty',
        'unitModifierProperty',
        'valueClassProperty',
      ]),
      roleProperties: new Set(['recursiveProperty', 'isInherited', 'isInheritedProperty']),
    }
  }

  _addAttributes() {
    const recursiveProperty = new SchemaProperty('recursiveProperty', 'roleProperty')
    this.properties.set('recursiveProperty', recursiveProperty)
    const extensionAllowedAttribute = this.attributes.get('extensionAllowed')
    extensionAllowedAttribute._roleProperties.add(recursiveProperty)
  }
}
