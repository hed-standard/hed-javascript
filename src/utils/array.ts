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

/**
 * Generate an iterator over the pairwise combinations of an array.
 *
 * @param array The array to combine.
 * @returns A generator which iterates over the list of combinations as tuples.
 */
export function* iteratePairwiseCombinations<T>(array: T[]): Generator<[T, T]> {
  const pairs = array.flatMap((first, index) => array.slice(index + 1).map((second): [T, T] => [first, second]))
  yield* pairs
}
