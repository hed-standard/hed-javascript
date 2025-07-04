/** Bundled HED schema configuration. */

// This list defines the base names of HED XML schema files
// that are considered "bundled" with the library.
// The actual loading mechanism is handled by the schema loader,
// which may use an application-provided loader for browser environments
// or a Node.js fs-based loader for server-side/test environments.
export const localSchemaNames = [
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
