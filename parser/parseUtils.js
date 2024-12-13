import ParsedHedTag from './parsedHedTag'
import ParsedHedColumnSplice from './parsedHedColumnSplice'
import ParsedHedGroup from './parsedHedGroup'
import { generateIssue, generateAndThrow } from '../common/issues/issues'

/**
 * Extract the items of a specified subtype from a list of ParsedHedSubstring
 * @param {ParsedHedSubstring[]} items - to be filtered by class type
 * @param {Class} classType - class type to filter by
 * @returns {*|*[]}
 */

export function filterByClass(items, classType) {
  return items && items.length ? items.filter((item) => item instanceof classType) : []
}

/**
 * Extract the ParsedHedTag tags with a specified tag name
 * @param {ParsedHedTag[]} tags - to be filtered by class type
 * @param {string} tagName - name of the tag to filter by
 * @returns {*|*[]}
 */

export function filterByTagName(tags, tagName) {
  if (!tags) {
    return []
  }
  return tags.filter((tag) => tag instanceof ParsedHedTag && tag.schemaTag?.name === tagName)
}

/**
 * Return a string of original tag names for error messages.
 * @param {ParsedHedTag} tagList - The HED tags whose string representations should be put in a comma-separated list.
 * @returns {string} A comma separated list of original tag names for tags in tagList.
 */
export function getTagListString(tagList) {
  return tagList.map((tag) => tag.toString()).join(', ')
}

/**
 * Create a map of the ParsedHedTags by type
 * @param { ParsedHedTag[] } tagList
 * @param {Set} tagNames
 * @returns {Map<string, ParsedHedTag[]>}
 */
export function categorizeTagsByName(tagList, tagNames = null) {
  // Initialize the map with keys from tagNames and an "other" key
  const resultMap = new Map()

  // Iterate through A and categorize
  tagList.forEach((tag) => {
    if (!tagNames || tagNames.has(tag.schemaTag.name)) {
      const tagList = resultMap.get(tag.schemaTag.name) || []
      tagList.push(tag)
      resultMap.set(tag.schemaTag.name, tagList) // Add to matching key list
    }
  })
  return resultMap
}

/**
 * Return a list of duplicate strings
 * @param { string[] } itemList - A list of strings to look for duplicates in
 * @returns {string []} - a list of unique duplicate strings (multiple copies not repeated
 */
export function getDuplicates(itemList) {
  const checkSet = new Set()
  const dupSet = new Set()
  for (const item of itemList) {
    if (!checkSet.has(item)) {
      checkSet.add(item)
    } else {
      dupSet.add(item)
    }
  }
  return [...dupSet]
}
