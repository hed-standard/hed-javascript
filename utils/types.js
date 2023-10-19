/** Utility classes. **/

/**
 * Mix-in/superclass for property memoization until we can get away with private fields.
 */
export const MemoizerMixin = (Base) => {
  return class extends Base {
    constructor(...args) {
      super(...args)
      this._memoizedProperties = new Map()
    }

    /**
     * Memoize the property.
     *
     * @template T
     * @param {string} propertyName The property name
     * @param {function() : T} valueComputer A function to compute the value.
     * @returns {T} The computed value.
     * @protected
     */
    _memoize(propertyName, valueComputer) {
      if (!propertyName) {
        throw new Error('Invalid property name in Memoizer subclass.')
      }
      if (this._memoizedProperties.has(propertyName)) {
        return this._memoizedProperties.get(propertyName)
      }
      const value = valueComputer()
      this._memoizedProperties.set(propertyName, value)
      return value
    }
  }
}

/**
 * Memoizer class
 */
export class Memoizer extends MemoizerMixin(Object) {}
