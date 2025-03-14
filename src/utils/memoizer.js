/** Memoizer class. **/

import { IssueError } from '../issues/issues'

/**
 * Superclass for property memoization until we can get away with private fields.
 */
export default class Memoizer {
  /**
   * Map containing memoized properties (string --> any).
   *
   * @type {Map}
   * @private
   */
  _memoizedProperties

  /**
   * Constructor.
   */
  constructor() {
    this._memoizedProperties = new Map()
  }

  /**
   * Memoize a property.
   *
   * @template T
   * @param {string} propertyName The property name.
   * @param {function() : T} valueComputer A function to compute the property's value.
   * @returns {T} The computed value.
   * @protected
   */
  _memoize(propertyName, valueComputer) {
    if (!propertyName) {
      IssueError.generateAndThrowInternalError('Invalid property name in Memoizer subclass.')
    }
    if (this._memoizedProperties.has(propertyName)) {
      return this._memoizedProperties.get(propertyName)
    }
    const value = valueComputer()
    this._memoizedProperties.set(propertyName, value)
    return value
  }
}
