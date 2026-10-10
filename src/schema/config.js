/**
 * Bundled HED schema configuration.
 * @module schema/config
 */
// Static imports of bundled HED schema XML files. These are resolved at build
// time by esbuild (loader: { '.xml': 'text' }) for the published bundles, and
// at test time by xml-transformer.js (Jest transform). The XML strings are
// inlined into the resulting bundle in both Node and browser builds, so the
// "local cache" of standard schemas is available offline in every environment.
//
// To add a new bundled schema: drop the XML file in src/data/schemas/ and add
// the matching import + map entry below.
import HED_standard from '../data/schemas/HED8.4.0.xml'
import HED_lang from '../data/schemas/HED_lang_1.1.0.xml'
import HED_score from '../data/schemas/HED_score_2.1.0.xml'
const bundledSchemas = [
  ['HED8.4.0', HED_standard],
  ['HED_lang_1.1.0', HED_lang],
  ['HED_score_2.1.0', HED_score],
]
const _localSchemaNames = bundledSchemas.map(([name]) => name)
/**
 * This list defines the base names of HED XML schema files that are considered "bundled" with the library.
 * The actual loading mechanism is handled by the schema loader, which may use an application-provided loader
 * for browser environments or a Node.js fs-based loader for server-side/test environments.
 */
export const localSchemaNames = Object.freeze(_localSchemaNames)
const _localSchemaMap = new Map(bundledSchemas)
/**
 * A mapping from the bundled schema names to their XML data (as strings).
 */
export const localSchemaMap = Object.freeze(_localSchemaMap)
/**
 * Return a copy of the bundled schema names without the "HED" prefix.
 *
 * @returns The list of unprefixed bundled schema names.
 */
export function getLocalSchemaVersions() {
  // Return a copy of the local schema names to avoid external modifications
  return localSchemaNames.map((name) => name.replace(/^HED_?/, ''))
}
