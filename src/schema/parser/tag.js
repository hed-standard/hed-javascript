import flattenDeep from 'lodash/flattenDeep'
import zip from 'lodash/zip'
import { getElementName } from '../xmlType'
import { SchemaEntryWithAttributesParser } from './schemaEntry'
import SchemaTag from '../entries/tag'
import SchemaValueTag from '../entries/valueTag'
import { IssueError } from '../../issues/issues'
const lc = (str) => str.toLowerCase()
export default class TagParser extends SchemaEntryWithAttributesParser {
  unitClasses
  valueClasses
  schemaTags
  constructor(xmlCollection, attributes, unitClasses, valueClasses) {
    super(xmlCollection, attributes)
    this.unitClasses = unitClasses
    this.valueClasses = valueClasses
  }
  /**
   * Parse the schema's tags.
   */
  _parseSchema(schemaXml) {
    const tags = this.getAllTags(schemaXml)
    const shortTags = this.getShortTags(tags)
    const parentMap = this.generateParentMap(shortTags)
    const [booleanAttributeDefinitions, valueAttributeDefinitions, descriptions] = this._parseAttributeElements(
      tags.keys(),
      (element) => shortTags.get(element) ?? '',
    )
    this.processRootedElements(parentMap, valueAttributeDefinitions)
    const tagUnitClassDefinitions = this.processTagUnitClasses(shortTags, valueAttributeDefinitions)
    const tagValueClassDefinitions = this.processTagValueClasses(shortTags, valueAttributeDefinitions)
    this.processRecursiveAttributes(shortTags, booleanAttributeDefinitions)
    this.createSchemaTags(
      booleanAttributeDefinitions,
      valueAttributeDefinitions,
      descriptions,
      tagUnitClassDefinitions,
      tagValueClassDefinitions,
      parentMap,
    )
    this.mergeSchemaEntries()
  }
  /**
   * Retrieve all the tags in the schema.
   *
   * @returns The tag names and XML elements.
   */
  getAllTags(schemaXml) {
    const nodeRoot = schemaXml.HED.schema
    const tagElements = []
    const tagElementChildren = nodeRoot.node
    tagElements.push(...flattenDeep(tagElementChildren.map((child) => this.getAllChildTags(child, false))))
    const tags = tagElements.map((element) => getElementName(element))
    return new Map(zip(tagElements, tags))
  }
  getAllChildTags(parentElement, excludeTakeValueTags = true) {
    if (excludeTakeValueTags && getElementName(parentElement) === '#') {
      return []
    }
    const childTags = [parentElement]
    const tagElementChildren = parentElement.node ?? []
    return childTags.concat(
      flattenDeep(tagElementChildren.map((child) => this.getAllChildTags(child, excludeTakeValueTags))),
    )
  }
  /**
   * Generate the map from tag elements to shortened tag names.
   *
   * @param tags - The map from tag elements to tag strings.
   * @returns The map from tag elements to shortened tag names.
   */
  getShortTags(tags) {
    const shortTags = new Map()
    for (const tagElement of tags.keys()) {
      const shortKey =
        getElementName(tagElement) === '#' ? TagParser.getParentTagName(tagElement) + '-#' : getElementName(tagElement)
      shortTags.set(tagElement, shortKey)
    }
    return shortTags
  }
  static getParentTagName(tagElement) {
    const parentTagElement = tagElement.$parent
    if (parentTagElement) {
      return getElementName(parentTagElement)
    } else {
      return ''
    }
  }
  /**
   * Generate a map from each tag name to its parent tag name.
   *
   * @param shortTags - The map from tag elements to shortened tag names.
   * @returns A map from each tag name to its parent tag name.
   */
  generateParentMap(shortTags) {
    const parentMap = new Map()
    for (const tagElement of shortTags.keys()) {
      if (!tagElement.$parent) {
        continue
      }
      const tagName = lc(shortTags.get(tagElement) ?? '')
      const parentTagName = lc(shortTags.get(tagElement.$parent) ?? '')
      parentMap.set(tagName, parentTagName)
    }
    return parentMap
  }
  processRootedElements(parentMap, valueAttributeDefinitions) {
    const rootedAttribute = this.attributes.getEntry('rooted')
    if (!rootedAttribute) {
      return
    }
    for (const [shortName, valueAttributes] of valueAttributeDefinitions) {
      const root = valueAttributes.get(rootedAttribute)
      if (root) {
        if (root.length !== 1) {
          IssueError.generateAndThrow('invalidSchema', {
            error: `Tag "${shortName}" has rooted attribute but incorrect attribute value count`,
          })
        }
        parentMap.set(lc(shortName), lc(root[0]))
        valueAttributes.delete(rootedAttribute)
      }
    }
  }
  /**
   * Process unit classes in tags.
   *
   * @param shortTags - The map from tag elements to shortened tag names.
   * @param valueAttributeDefinitions - The map from shortened tag names to their value schema attributes.
   * @returns The map from shortened tag names to their unit classes.
   */
  processTagUnitClasses(shortTags, valueAttributeDefinitions) {
    const tagUnitClassAttribute = this.attributes.getEntry('unitClass')
    const tagUnitClassDefinitions = new Map()
    if (!tagUnitClassAttribute) {
      return tagUnitClassDefinitions
    }
    for (const tagName of shortTags.values()) {
      const valueAttributes = valueAttributeDefinitions.get(tagName)
      if (valueAttributes?.has(tagUnitClassAttribute)) {
        const tagUnitClasses =
          valueAttributes
            ?.get(tagUnitClassAttribute)
            ?.map((unitClassName) => {
              return this.unitClasses.getEntry(unitClassName)
            })
            .filter((unitClass) => unitClass !== undefined) ?? []
        tagUnitClassDefinitions.set(tagName, tagUnitClasses)
        valueAttributes.delete(tagUnitClassAttribute)
      }
    }
    return tagUnitClassDefinitions
  }
  /**
   * Process value classes in tags.
   *
   * @param shortTags - The map from tag elements to shortened tag names.
   * @param valueAttributeDefinitions - The map from shortened tag names to their value schema attributes.
   * @returns The map from shortened tag names to their value classes.
   */
  processTagValueClasses(shortTags, valueAttributeDefinitions) {
    const tagValueClassAttribute = this.attributes.getEntry('valueClass')
    const tagValueClassDefinitions = new Map()
    if (!tagValueClassAttribute) {
      return tagValueClassDefinitions
    }
    for (const tagName of shortTags.values()) {
      const valueAttributes = valueAttributeDefinitions.get(tagName)
      if (valueAttributes?.has(tagValueClassAttribute)) {
        const tagValueClasses =
          valueAttributes
            ?.get(tagValueClassAttribute)
            ?.map((valueClassName) => {
              return this.valueClasses.getEntry(valueClassName)
            })
            .filter((valueClass) => valueClass !== undefined) ?? []
        tagValueClassDefinitions.set(tagName, tagValueClasses)
        // TODO: Uncomment once value validation uses value classes.
        // valueAttributes.delete(tagValueClassAttribute)
      }
    }
    return tagValueClassDefinitions
  }
  /**
   * Process recursive schema attributes.
   *
   * @param shortTags - The map from tag elements to shortened tag names.
   * @param booleanAttributeDefinitions - The map from shortened tag names to their boolean schema attributes. Passed by reference.
   */
  processRecursiveAttributes(shortTags, booleanAttributeDefinitions) {
    const recursiveAttributeMap = this.generateRecursiveAttributeMap(shortTags, booleanAttributeDefinitions)
    for (const [tagElement, recursiveAttributes] of recursiveAttributeMap) {
      for (const childTag of this.getAllChildTags(tagElement)) {
        const childTagName = getElementName(childTag)
        const newBooleanAttributes =
          booleanAttributeDefinitions.get(childTagName)?.union(recursiveAttributes) ?? new Set(recursiveAttributes)
        booleanAttributeDefinitions.set(childTagName, newBooleanAttributes)
      }
    }
  }
  /**
   * Generate a map from tags to their recursive attributes.
   *
   * @param shortTags - The map from tag elements to shortened tag names.
   * @param booleanAttributeDefinitions - The map from shortened tag names to their boolean schema attributes. Passed by reference.
   */
  generateRecursiveAttributeMap(shortTags, booleanAttributeDefinitions) {
    const recursiveAttributes = new Set(this.attributes.filter(([, attribute]) => attribute.recursive).values())
    const recursiveAttributeMap = new Map()
    for (const [tagElement, tagName] of shortTags) {
      recursiveAttributeMap.set(
        tagElement,
        booleanAttributeDefinitions.get(tagName)?.intersection(recursiveAttributes) ?? new Set(),
      )
    }
    return recursiveAttributeMap
  }
  /**
   * Create the {@link SchemaTag} objects.
   *
   * @param booleanAttributeDefinitions - The map from shortened tag names to their boolean schema attributes.
   * @param valueAttributeDefinitions - The map from shortened tag names to their value schema attributes.
   * @param descriptions - The map from shortened tag names to their descriptions.
   * @param tagUnitClassDefinitions - The map from shortened tag names to their unit classes.
   * @param tagValueClassDefinitions - The map from shortened tag names to their value classes.
   * @param parentMap - The map from each tag name to its parent tag name.
   * @returns The map from lowercase shortened tag names to their tag objects.
   */
  createSchemaTags(
    booleanAttributeDefinitions,
    valueAttributeDefinitions,
    descriptions,
    tagUnitClassDefinitions,
    tagValueClassDefinitions,
    parentMap,
  ) {
    this.schemaTags = new Map()
    for (const [name, valueAttributes] of valueAttributeDefinitions) {
      const booleanAttributes = booleanAttributeDefinitions.get(name) ?? new Set()
      const description = descriptions.get(name)
      const unitClasses = tagUnitClassDefinitions.get(name) ?? []
      const valueClasses = tagValueClassDefinitions.get(name) ?? []
      const parentTagName = parentMap.get(lc(name))
      const parentTag = parentTagName
        ? (this.schemaTags.get(parentTagName) ?? this.entryTypeMap.get(parentTagName))
        : undefined
      if (name.endsWith('-#')) {
        if (this.entryTypeMap.has(parentTagName) && !this.entryTypeMap.has(lc(name))) {
          IssueError.generateAndThrow('lazyPartneredSchemasShareTag', { tag: name.replace('-#', '/#') })
        }
        this.schemaTags.set(
          lc(name),
          new SchemaValueTag(
            name,
            description,
            parentTag,
            booleanAttributes,
            valueAttributes,
            unitClasses,
            valueClasses,
          ),
        )
      } else {
        this.schemaTags.set(
          lc(name),
          new SchemaTag(name, description, parentTag, booleanAttributes, valueAttributes, unitClasses, valueClasses),
        )
      }
    }
  }
  /**
   * Merge the per-schema tag map into the main tag map.
   */
  mergeSchemaEntries() {
    for (const [shortTagName, newTag] of this.schemaTags) {
      this.addEntry(shortTagName, newTag)
    }
  }
  /**
   * Add a new tag while checking for duplicates.
   *
   * Override of {@link SchemaEntryParser.addEntry} to change the issue message.
   *
   * @param shortTagName - The short tag name.
   * @param newTag - The new tag object to add.
   */
  addEntry(shortTagName, newTag) {
    const lowercaseName = lc(shortTagName)
    if (this.entryTypeMap.has(lowercaseName)) {
      const existingTag = this.entryTypeMap.get(lowercaseName)
      if (newTag.hasAttribute('inLibrary') && !existingTag.hasAttribute('inLibrary')) {
        IssueError.generateAndThrow('lazyPartneredSchemaOverloadsStandardTag', { tag: newTag.name.replace('-#', '/#') })
      }
      if (!newTag.equivalent(existingTag)) {
        IssueError.generateAndThrow('lazyPartneredSchemasShareTag', { tag: newTag.name.replace('-#', '/#') })
      }
    } else {
      this.entryTypeMap.set(lowercaseName, newTag)
    }
  }
}
