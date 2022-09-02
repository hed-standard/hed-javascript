import isEqual from 'lodash/isEqual'

/**
 * Filter non-equal duplicates from a key-value list,
 *
 * @template K,V
 * @param {[K,V][]} list A list of key-value pairs.
 * @param {function(V, V): boolean} equalityFunction An equality function for the value data.
 * @return {[Map<K, V>, [K,V][]]} A map and any non-equal duplicate keys found.
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
