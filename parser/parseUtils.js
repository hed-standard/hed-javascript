/**
 * Extract the items of a specified type from a list of mixed types
 * @param items
 * @param ClassType
 * @returns {*|*[]}
 */

export function filterByClass(items, ClassType) {
  return items && items.length ? items.filter((item) => item instanceof ClassType) : []
}
