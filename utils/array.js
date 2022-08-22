/**
 * Get number of instances of an element in an array.
 *
 * @param {Array} array The array to search.
 * @param {*} elementToCount The element to search for.
 * @returns {number} The number of instances of the element in the array.
 */
const getElementCount = function (array, elementToCount) {
  let count = 0
  for (let i = 0; i < array.length; i++) {
    if (array[i] === elementToCount) {
      count++
    }
  }
  return count
}

/**
 * Return a scalar as a singleton array and an array as-is.
 *
 * @template T
 * @param {T|T[]} array An array or scalar.
 * @return {T[]} The original array or a singleton array of the scalar.
 */
const asArray = function (array) {
  return Array.isArray(array) ? array : [array]
}

/**
 * Apply a function recursively to an array.
 *
 * @template T,U
 * @param {function(T): U} fn The function to apply.
 * @param {T[]} array The array to map.
 * @returns {U[]} The mapped array.
 */
function recursiveMap(fn, array) {
  if (Array.isArray(array)) {
    return array.map((element) => recursiveMap(fn, element))
  } else {
    return fn(array)
  }
}

module.exports = {
  getElementCount,
  asArray,
  recursiveMap,
}
