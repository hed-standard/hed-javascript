/** Path to the fallback HED schema. */

const path = require('path')

// TODO: Delete in 4.0.0.
const fallbackFilePath = 'data/HED8.0.0.xml'
const fallbackDirectory = path.resolve(require.resolve('.'), '..', '..', 'data')
const localSchemaList = new Set(['HED8.0.0', 'HED_testlib_1.0.2'])

module.exports = {
  fallbackFilePath,
  fallbackDirectory,
  localSchemaList,
}
