/** Bundled HED schema configuration.
 * @module schema/config
 * */

// This list defines the base names of HED XML schema files
// that are considered "bundled" with the library.
// The actual loading mechanism is handled by the schema loader,
// which may use an application-provided loader for browser environments
// or a Node.js fs-based loader for server-side/test environments.
const _localSchemaNames = [
  'HED8.0.0',
  'HED8.1.0',
  'HED8.2.0',
  'HED8.3.0',
  'HED8.4.0',
  'HED_lang_1.0.0',
  'HED_lang_1.1.0',
  'HED_score_1.2.0',
  'HED_score_2.0.0',
  'HED_score_2.1.0',
  // Add other bundled schema base names here if needed
]
/**
 * This list defines the base names of HED XML schema files that are considered "bundled" with the library.
 * The actual loading mechanism is handled by the schema loader, which may use an application-provided loader
 * for browser environments or a Node.js fs-based loader for server-side/test environments.
 */
export const localSchemaNames = Object.freeze(_localSchemaNames)

let _localSchemaMap

// @ts-ignore __VITE_ENV__ is defined by Vite in browser builds
if (typeof __VITE_ENV__ !== 'undefined' && __VITE_ENV__) {
  // In the browser, this map is not used. The loader uses import.meta.glob.
  _localSchemaMap = new Map()
} else {
  // For Node.js, pre-load the schemas.
  _localSchemaMap = new Map(
    localSchemaNames.map((localSchema) => [localSchema, require(`../data/schemas/${localSchema}.xml`)]),
  )
}

/**
 * A mapping from the bundled schema names to their XML data (as strings).
 */
export const localSchemaMap = Object.freeze(_localSchemaMap)

/**
 * Return a copy of the bundled schema names without the "HED" prefix.
 *
 * @returns The list of unprefixed bundled schema names.
 */
export function getLocalSchemaVersions(): string[] {
  return localSchemaNames.map((name) => name.replace(/^HED_?/, ''))
}
