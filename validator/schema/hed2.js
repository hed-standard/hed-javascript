import flattenDeep from 'lodash/flattenDeep'

// TODO: Switch require once upstream bugs are fixed.
// import xpath from 'xml2js-xpath'
// Temporary
import * as xpath from '../../utils/xpath'

import { SchemaParser } from './parser'
import { SchemaAttributes } from './types'

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

const unitModifierElement = 'unitModifier'

const lc = (str) => str.toLowerCase()

export class Hed2SchemaParser extends SchemaParser {
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
        const childTagElements = flattenDeep(tagElements.map((tagElement) => this.getAllChildTags(tagElement)))
        const childTags = childTagElements.map((tagElement) => {
          return this.getTagPathFromTagElement(tagElement)
        })
        const childDictionary = this.stringListToLowercaseTrueDictionary(childTags)
        this.tagAttributes[extensionAllowedAttribute] = Object.assign({}, tagDictionary, childDictionary)
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
      const units = unitClassElement[unitClassUnitsElement][0][unitClassUnitElement]
      if (units === undefined) {
        const elementUnits = this.getElementTagValue(unitClassElement, unitClassUnitsElement)
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
        this.unitClassAttributes[elementName][defaultUnitForUnitClassAttribute] = [
          unitClassElement.$[defaultUnitForOldUnitClassAttribute],
        ]
      } else {
        this.unitClassAttributes[elementName][defaultUnitForUnitClassAttribute] = [defaultUnit]
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
            this.unitModifiers[unitModifierKey][unitModifierName] = unitModifierElement.$[unitModifierKey]
          }
        }
      }
    }
  }

  populateTagToAttributeDictionary(tagList, tagElementList, attributeName) {
    this.tagAttributes[attributeName] = {}
    for (let i = 0; i < tagList.length; i++) {
      const tag = tagList[i]
      this.tagAttributes[attributeName][tag.toLowerCase()] = tagElementList[i].$[attributeName]
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
    const tagElements = xpath.find(this.rootElement, '//node[@' + attributeName + ']')
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
