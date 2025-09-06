/**
 * Array utility functions.
 * @module
 */

type NestedArray<T> = T | NestedArray<T>[]

/**
 * Apply a function recursively to an array.
 *
 * @param array The array to map.
 * @param fn The function to apply.
 * @returns The mapped array.
 */
export function recursiveMap<T, U>(array: NestedArray<T>, fn: (element: T) => U): NestedArray<U> {
  if (Array.isArray(array)) {
    return array.map((element) => recursiveMap(element, fn))
  } else {
    return fn(array)
  }
}
