/** Path to the fallback HED schema. */

const localSchemaList = new Map([
  ['HED8.0.0', require('../../data/HED8.0.0.xml')],
  ['HED_testlib_1.0.2', require('../../data/HED_testlib_1.0.2.xml')],
])

// TODO: Delete in 4.0.0.
const fallbackFilePath = 'data/HED8.0.0.xml'

module.exports = {
  fallbackFilePath,
  localSchemaList,
}
