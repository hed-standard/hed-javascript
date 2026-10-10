/**
 * General utility types.
 * @module utils/types
 */
import isPlainObject from 'lodash/isPlainObject'
/**
 * Determine whether an object is an instance of a given constructor.
 *
 * @param object - An object.
 * @param constructor - A constructor.
 * @returns Whether the object is an instance of the constructor.
 */
export function instanceOfConstructor(object, constructor) {
  return object instanceof constructor
}
/**
 * Type guard for an ordered pair of numbers (e.g. bounds).
 *
 * @param value - A possible ordered pair of numbers.
 * @returns Whether the value is an ordered pair of number.
 */
export function isNumberPair(value) {
  return Array.isArray(value) && value.length === 2 && value.every((bound) => typeof bound === 'number')
}
/**
 * Type guard for a plain object (presumably parsed from a JSON string).
 *
 * @param value - A possible plain object.
 * @returns Whether the value is a plain JSON object.
 */
export function isJsonObject(value) {
  return isPlainObject(value) && Object.getOwnPropertySymbols(value).length === 0
}
/**
 * Type guard for a plain string record.
 *
 * @param value - A possible plain object.
 * @returns Whether the value is a plain string record.
 */
export function isStringRecord(value) {
  return isJsonObject(value) && Object.values(value).every((objectValue) => typeof objectValue === 'string')
}
