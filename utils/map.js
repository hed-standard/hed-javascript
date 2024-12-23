import identity from 'lodash/identity'
import isEqual from 'lodash/isEqual'

/**
 * Filter non-equal duplicates from a key-value list,
 *
 * @template K,V
 * @param {[K,V][]} list A list of key-value pairs.
 * @param {function(V, V): boolean} equalityFunction An equality function for the value data.
 * @returns {[Map<K, V>, [K,V][]]} A map and any non-equal duplicate keys found.
 */
export const filterNonEqualDuplicates = function (list, equalityFunction = isEqual) {
  const map = new Map()
  const duplicateKeySet = new Set()
  const duplicates = []
  for (const [key, value] of list) {
    if (!map.has(key)) {
      map.set(key, value)
    } else if (!equalityFunction(map.get(key), value)) {
      duplicates.push([key, value])
      duplicateKeySet.add(key)
    }
  }
  for (const key of duplicateKeySet) {
    const value = map.get(key)
    map.delete(key)
    duplicates.push([key, value])
  }
  return [map, duplicates]
}

/**
 * Group a list by a given grouping function.
 *
 * @template T, U
 * @param {T[]} list The list to group.
 * @param {function (T): U} groupingFunction A function mapping a list value to the key it is to be grouped under.
 * @returns {Map<U, T[]>} The grouped map.
 */
export const groupBy = function (list, groupingFunction = identity) {
  const groupingMap = new Map()
  for (const listEntry of list) {
    const groupingValue = groupingFunction(listEntry)
    if (groupingMap.has(groupingValue)) {
      groupingMap.get(groupingValue).push(listEntry)
    } else {
      groupingMap.set(groupingValue, [listEntry])
    }
  }
  return groupingMap
}
