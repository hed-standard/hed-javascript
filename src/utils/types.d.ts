/**
 * General utility types.
 * @module utils/types
 */
import type { Issue } from '../issues/issues'
/**
 * A generic constructor type.
 */
export type Constructor<Type> = {
  new (...args: unknown[]): Type
}
/**
 * Determine whether an object is an instance of a given constructor.
 *
 * @param object - An object.
 * @param constructor - A constructor.
 * @returns Whether the object is an instance of the constructor.
 */
export declare function instanceOfConstructor<Type>(object: unknown, constructor: Constructor<Type>): object is Type
/**
 * A generic recursive array type.
 */
export type RecursiveArray<Type> = Array<Type | RecursiveArray<Type>>
/**
 * A value returned alongside an Issue array.
 */
export type ReturnTupleWithIssues<Type> = [Type | null, Issue[]]
/**
 * A value returned alongside Issue arrays representing separated errors and warnings.
 */
export type ReturnTupleWithErrorsAndWarnings<Type> = [Type | null, Issue[], Issue[]]
/**
 * A pair of numbers used as substring bounds.
 */
export type Bounds = [number, number]
/**
 * Type guard for an ordered pair of numbers (e.g. bounds).
 *
 * @param value - A possible ordered pair of numbers.
 * @returns Whether the value is an ordered pair of number.
 */
export declare function isNumberPair(value: unknown): value is Bounds
/**
 * An arbitrary object parsed from JSON.
 */
export type JsonObject = Record<string, unknown>
/**
 * Type guard for a plain object (presumably parsed from a JSON string).
 *
 * @param value - A possible plain object.
 * @returns Whether the value is a plain JSON object.
 */
export declare function isJsonObject(value: unknown): value is JsonObject
/**
 * Type guard for a plain string record.
 *
 * @param value - A possible plain object.
 * @returns Whether the value is a plain string record.
 */
export declare function isStringRecord(value: unknown): value is Record<string, string>
/**
 * Exception with an errno field.
 *
 * Borrowed from {@link https://www.npmjs.com/package/@types/node \@types/node} for compatibility reasons.
 */
export interface ErrnoException extends Error {
  errno?: number
  code?: string
  path?: string
  syscall?: string
}
