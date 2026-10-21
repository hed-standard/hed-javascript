/**
 * General utility types.
 * @module utils/types
 */

/**
 * Determine whether an object is an instance of a given constructor.
 *
 * @param {*} object - An object.
 * @param {Function} constructor - A constructor.
 * @returns {boolean} Whether the object is an instance of the constructor.
 */
export function instanceOfConstructor(object, constructor) {
  return object instanceof constructor
}

/**
 * Type guard for an ordered pair of numbers (e.g. bounds).
 *
 * @param {*} value - A possible ordered pair of numbers.
 * @returns {boolean} Whether the value is an ordered pair of number.
 */
export function isNumberPair(value) {
  return Array.isArray(value) && value.length === 2 && value.every((bound) => typeof bound === 'number')
}
