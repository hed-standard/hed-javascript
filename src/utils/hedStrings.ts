/**
 * HED string-related utility functions.
 * @module
 */

/**
 * Get the indices of all slashes in a HED tag.
 */
export function getTagSlashIndices(tag: string): number[] {
  const indices = []
  let i = -1
  while ((i = tag.indexOf('/', i + 1)) >= 0) {
    indices.push(i)
  }
  return indices
}
