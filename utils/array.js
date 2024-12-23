/**
 * Get number of instances of an element in an array.
 *
 * @param {Array} array The array to search.
 * @param {*} elementToCount The element to search for.
 * @returns {number} The number of instances of the element in the array.
 */
export const getElementCount = function (array, elementToCount) {
  let count = 0
  for (let i = 0; i < array.length; i++) {
    if (array[i] === elementToCount) {
      count++
    }
  }
  return count
}

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

/**
 * Apply a function recursively to an array.
 *
 * @template T,U
 * @param {function(T, U[]): U} fn The function to apply.
 * @param {T[]} array The array to map.
 * @param {U[]}  [issues] An optional array to collect issues.
 * @returns {U[]} The mapped array.
 */
export function recursiveMapNew(fn, array, issues = []) {
  if (Array.isArray(array)) {
    return array.map((element) => recursiveMap(fn, element, issues))
  } else {
    return fn(array, issues)
  }
}
