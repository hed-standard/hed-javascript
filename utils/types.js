/** Utility classes. **/

/**
 * Mix-in/superclass for property memoization until we can get away with private fields.
 */
class Memoizer {
  constructor() {
    this._memoizedProperties = new Map()
  }

  /**
   * Memoize the property.
   *
   * @template T
   * @param {string} propertyName The property name
   * @param {function() : T} valueComputer A function to compute the value.
   * @return {T} The computed value.
   * @protected
   */
  _memoize(propertyName, valueComputer) {
    if (this._memoizedProperties.has(propertyName)) {
      return this._memoizedProperties.get(propertyName)
    }
    const value = valueComputer()
    this._memoizedProperties.set(propertyName, value)
    return value
  }
}

module.exports = {
  Memoizer: Memoizer,
}
