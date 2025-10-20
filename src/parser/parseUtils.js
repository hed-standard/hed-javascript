/** This module holds utilities for parsing HED strings.
 * @module parser/parseUtils
 */
import ParsedHedTag from './parsedHedTag'

/**
 * Extract the items of a specified subtype from a list of ParsedHedSubstring
 * @param {ParsedHedSubstring[]} items - Objects to be filtered by class type.
 * @param {Class} classType - The class type to filter by.
 * @returns {ParsedHedSubstring[]} - A list of objects of the specified subclass of ParsedHedSubstring
 */
export function filterByClass(items, classType) {
  return items && items.length ? items.filter((item) => item instanceof classType) : []
}

/**
 * Extract the ParsedHedTag tags with a specified tag name
 * @param {ParsedHedTag[]} tags - to be filtered by name
 * @param {string} tagName - name of the tag to filter by
 * @returns {ParsedHedTag[]}
 */
export function filterByTagName(tags, tagName) {
  if (!tags) {
    return []
  }
  return tags.filter((tag) => tag instanceof ParsedHedTag && tag.schemaTag?.name === tagName)
}

/**
 * Extract the ParsedHedTag tags with a specified tag name.
 * @param {Map<string, ParsedHedTag[]>} tagMap - The Map of parsed HED tags for extraction (must be defined).
 * @param {string[]} tagNames - The names to use as keys for the filter.
 * @returns {ParsedHedTag[]} - A list of temporal tags.
 */
export function filterTagMapByNames(tagMap, tagNames) {
  if (!tagNames || tagMap.size === 0) {
    return []
  }

  const keys = [...tagNames].filter((name) => tagMap.has(name))
  if (keys.length === 0) {
    return []
  }

  return keys.flatMap((key) => tagMap.get(key))
}

/**
 * Convert a list of ParsedHedTag objects into a comma-separated string of their string representations.
 * @param {ParsedHedTag[]} tagList - The HED tags whose string representations should be put in a comma-separated list.
 * @returns {string} A comma separated list of original tag names for tags in tagList.
 */
export function getTagListString(tagList) {
  return tagList.map((tag) => tag.toString()).join(', ')
}

/**
 * Create a map of the ParsedHedTags by type.
 * @param {ParsedHedTag[]} tagList - The HED tags to be categorized.
 * @param {Set} tagNames - The tag names to use as categories.
 * @returns {Map} - A map (string --> ParsedHedTag) of tag name to a list of tags with that name.
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
 * Return a list of duplicate strings.
 * @param { string[] } itemList - A list of strings to look for duplicates in.
 * @returns {string[]} - A list of unique duplicate strings (multiple copies not repeated).
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

/**
 * lean up a string and remove redundant commas and parentheses.
 * @param {string} stringIn - The input string to be cleaned up.
 * @return {string} - The cleaned-up string with redundant commas and parentheses removed.
 *
 */
export function cleanupEmpties(stringIn) {
  const leadingCommaRegEx = /^\s*,+/g // Remove leading commas
  const trailingCommaRegEx = /,\s*$/g // Remove trailing commas
  const innerCommaRegEx = /,\s*,+/g // Collapse multiple commas inside
  const emptyParensRegEx = /\(\s*\)/g // Remove completely empty parentheses
  const redundantParensRegEx = /\(\s*([,\s]*)\s*\)/g // Remove redundant empty-like parens
  const trailingInnerCommaRegEx = /[\s,]+\)/g // Remove trailing commas and spaces inside parentheses

  let result = stringIn
  let previousResult

  do {
    previousResult = result

    // Step 1: Remove empty parentheses
    result = result.replace(emptyParensRegEx, '')

    // Step 2: Remove redundant parentheses containing only commas/spaces
    result = result.replace(redundantParensRegEx, (match, group1) => {
      return /^[,\s()]*$/.test(group1) ? '' : `(${group1.replace(/^\s*,|,\s*$/g, '').trim()})`
    })

    // Step 3: Remove leading and trailing commas
    result = result.replace(leadingCommaRegEx, '')
    result = result.replace(trailingCommaRegEx, '')

    // Step 4: Collapse multiple commas inside
    result = result.replace(innerCommaRegEx, ',')

    // Step 5: Remove trailing commas inside parentheses
    result = result.replace(trailingInnerCommaRegEx, ')')
  } while (result !== previousResult) // Keep looping until no more changes
  result = result.replace(/\(\s*,+/g, '(')
  return result.trim()
}
