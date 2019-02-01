/**
 * Get number of instances of an element in an array.
 *
 * @param array The array to search.
 * @param elementToCount The element to search for.
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

module.exports = {
  getElementCount: getElementCount,
}
