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

/*function normalize(hedString) {
  return hedString.parsedTags.map(normalizeItem).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

function normalizeItem(item) {
  if (item instanceof ParsedHedTag) {
    return item.canonicalTag // Leaf items are strings
  } else if (item instanceof ParsedHedColumnSplice) {
    return item.originalTag
  } else if (item instanceof ParsedHedGroup) {
    return normalizeGroup(item.tags) // Recursively normalize the group
  } else {
    throw generateAndThrow('internal error', {message: `"${item}" was not parsed correctly in equivalence operation`})
  }
}

function normalizeGroup(group) {
  // Normalize each item in the group and sort to ensure order independence
  return group.map(normalizeItem).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))););
}

export function areHedStringsEquivalent(hedStringA, hedStringB) {
  const normalizedA = normalize(hedStringA)
  const normalizedB = normalize(hedStringB)
  return JSON.stringify(normalizedA) === JSON.stringify(normalizedB);
}

function _detectDuplicates(items) {
  const seen = new Set();
  const duplicates = [];

  for (const item of items) {
    const serialized = JSON.stringify(item);
    if (seen.has(serialized)) {
      duplicates.push(item);
    } else {
      seen.add(serialized);
    }
  }
  return duplicates;
}

function detectDuplicates(items) {

}*/
