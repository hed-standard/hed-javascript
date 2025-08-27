/** This module holds the sidecar validator class.
 * @module
 */

/**
 * Apply a function recursively to an array.
 *
 * @template T,U
 * @param {function(T): U} fn The function to apply.
 * @param {T[]} array The array to map.
 * @returns {U[]} The mapped array.
 */
export function recursiveMap(fn, array) {
  if (Array.isArray(array)) {
    return array.map((element) => recursiveMap(fn, element))
  } else {
    return fn(array)
  }
}
