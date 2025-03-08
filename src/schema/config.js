/** Bundled HED schema configuration. */

const localSchemas = [
  'HED8.0.0',
  'HED8.1.0',
  'HED8.2.0',
  'HED8.3.0',
  'HED_lang_1.0.0',
  'HED_score_1.2.0',
  'HED_score_2.0.0',
  'HED_testlib_1.0.2',
  'HED_testlib_2.0.0',
]

export const localSchemaList = new Map(
  localSchemas.map((localSchema) => [localSchema, require(`../data/schemas/${localSchema}.xml`)]),
)
