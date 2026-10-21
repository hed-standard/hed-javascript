/**
 * Array utility functions.
 * @module
 */

/**
 * Apply a function recursively to an array.
 *
 * @template T,U
 * @param {Array} array - The array to map.
 * @param {function(T): U} fn - The function to apply.
 * @returns {Array} The mapped array.
 */
export function recursiveMap(array, fn) {
  const mappedArray = []
  for (const element of array) {
    if (Array.isArray(element)) {
      mappedArray.push(recursiveMap(element, fn))
    } else {
      mappedArray.push(fn(element))
    }
  }
  return mappedArray
}

/**
 * Generate an iterator over the pairwise combinations of an array.
 *
 * @template T
 * @param {T[]} array - The array to combine.
 * @yields {T[]} The list of combinations as tuples.
 */
export function* iteratePairwiseCombinations(array) {
  const pairs = array.flatMap((first, index) => array.slice(index + 1).map((second) => [first, second]))
  yield* pairs
}
