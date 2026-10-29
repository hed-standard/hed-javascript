/**
 * Bundled HED schema configuration.
 * @module schema/config
 */

// Dynamic imports of bundled HED schema XML files, one per schema, so a schema is read only when it is first used.
// They are resolved at build time by esbuild (loader: { '.xml': 'text' }) for the published bundles, and at test
// time by xml-transformer.js (Jest transform). The ESM build writes each schema to its own chunk
// (dist/esm/schemas/), loaded from the installed package; the CommonJS build inlines them. Either way the
// "local cache" of standard schemas is available offline in every environment.
//
// To add a new bundled schema: drop the XML file in src/data/schemas/ and add the matching entry below.

const bundledSchemas = {
  'HED8.0.0': () => import('../data/schemas/HED8.0.0.xml'),
  'HED8.1.0': () => import('../data/schemas/HED8.1.0.xml'),
  'HED8.2.0': () => import('../data/schemas/HED8.2.0.xml'),
  'HED8.3.0': () => import('../data/schemas/HED8.3.0.xml'),
  'HED8.4.0': () => import('../data/schemas/HED8.4.0.xml'),
  'HED8.5.0': () => import('../data/schemas/HED8.5.0.xml'),
  'HED_lang_1.0.0': () => import('../data/schemas/HED_lang_1.0.0.xml'),
  'HED_lang_1.1.0': () => import('../data/schemas/HED_lang_1.1.0.xml'),
  'HED_lang_1.2.0': () => import('../data/schemas/HED_lang_1.2.0.xml'),
  'HED_mouse_1.0.0': () => import('../data/schemas/HED_mouse_1.0.0.xml'),
  'HED_score_1.2.0': () => import('../data/schemas/HED_score_1.2.0.xml'),
  'HED_score_2.0.0': () => import('../data/schemas/HED_score_2.0.0.xml'),
  'HED_score_2.1.0': () => import('../data/schemas/HED_score_2.1.0.xml'),
  'HED_score_2.2.0': () => import('../data/schemas/HED_score_2.2.0.xml'),
}

/**
 * This list defines the base names of HED XML schema files that are considered "bundled" with the library.
 * The actual loading mechanism is handled by the schema loader.
 */
export const localSchemaNames = Object.freeze(Object.keys(bundledSchemas))

/**
 * Retrieve the XML data of a bundled schema, loading it on first use.
 *
 * @param {string} name The base name of the bundled schema file, such as "HED8.4.0".
 * @returns {Promise<string>} The raw schema XML data.
 */
export async function getBundledSchema(name) {
  const schemaModule = await bundledSchemas[name]()
  return schemaModule.default
}

/**
 * Return a copy of the bundled schema names without the "HED" prefix.
 *
 * @returns {string[]} The list of unprefixed bundled schema names.
 */
export function getLocalSchemaVersions() {
  // Return a copy of the local schema names to avoid external modifications
  return localSchemaNames.map((name) => name.replace(/^HED_?/, ''))
}
