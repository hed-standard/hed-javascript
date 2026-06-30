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

import HED8_0_0 from '../data/schemas/HED8.0.0.xml'
import HED8_1_0 from '../data/schemas/HED8.1.0.xml'
import HED8_2_0 from '../data/schemas/HED8.2.0.xml'
import HED8_3_0 from '../data/schemas/HED8.3.0.xml'
import HED8_4_0 from '../data/schemas/HED8.4.0.xml'
import HED_lang_1_0_0 from '../data/schemas/HED_lang_1.0.0.xml'
import HED_lang_1_1_0 from '../data/schemas/HED_lang_1.1.0.xml'
import HED_score_1_2_0 from '../data/schemas/HED_score_1.2.0.xml'
import HED_score_2_0_0 from '../data/schemas/HED_score_2.0.0.xml'
import HED_score_2_1_0 from '../data/schemas/HED_score_2.1.0.xml'

const bundledSchemas = [
  ['HED8.0.0', HED8_0_0],
  ['HED8.1.0', HED8_1_0],
  ['HED8.2.0', HED8_2_0],
  ['HED8.3.0', HED8_3_0],
  ['HED8.4.0', HED8_4_0],
  ['HED_lang_1.0.0', HED_lang_1_0_0],
  ['HED_lang_1.1.0', HED_lang_1_1_0],
  ['HED_score_1.2.0', HED_score_1_2_0],
  ['HED_score_2.0.0', HED_score_2_0_0],
  ['HED_score_2.1.0', HED_score_2_1_0],
]

export const localSchemaNames = bundledSchemas.map(([name]) => name)

export const localSchemaMap = new Map(bundledSchemas)

export const getLocalSchemaVersions = function () {
  // Return a copy of the local schema names to avoid external modifications
  return localSchemaNames.map((name) => name.replace(/^HED_?/, ''))
}
