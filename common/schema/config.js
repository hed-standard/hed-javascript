/** Path to the fallback HED schema. */

export const localSchemaList = new Map([
  ['HED8.0.0', require('../../data/HED8.0.0.xml')],
  ['HED8.1.0', require('../../data/HED8.1.0.xml')],
  ['HED_testlib_1.0.2', require('../../data/HED_testlib_1.0.2.xml')],
])

// TODO: Delete in 4.0.0.
export const fallbackFilePath = 'data/HED8.0.0.xml'
