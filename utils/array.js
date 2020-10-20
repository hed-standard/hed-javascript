/**
 * Get number of instances of an element in an array.
 *
 * @param {Array} array The array to search.
 * @param {*} elementToCount The element to search for.
 * @returns {number} The number of instances of the element in the array.
 */
const getElementCount = function(array, elementToCount) {
  let count = 0
  for (let i = 0; i < array.length; i++) {
    if (array[i] === elementToCount) {
      count++
    }
  }
  return count
}

/**
 * Recursively flatten an array.
 *
 * @param {Array[]} array The array to flatten.
 * @return {Array} The flattened array.
 */
function flattenDeep(array) {
  return array.reduce(
    (accumulator, value) =>
      Array.isArray(value)
        ? accumulator.concat(flattenDeep(value))
        : accumulator.concat(value),
    [],
  )
}

module.exports = {
  getElementCount: getElementCount,
  flattenDeep: flattenDeep,
}
