/** Path to the fallback HED schema. */
//
// const path = require('path')
//
// // TODO: Delete in 4.0.0.
// const fallbackFilePath = 'data/HED8.0.0.xml'
// const fallbackDirectory = path.resolve('..', '..', '..', 'data')
// const localSchemaList = new Set(['HED8.0.0', 'HED_testlib_1.0.2'])
//
// module.exports = {
//   fallbackFilePath,
//   fallbackDirectory,
//   localSchemaList,
// }
const schemaFile = require('../../data/HED8.0.0.txt')
console.dir(schemaFile)
// const localSchemaList = new Map([
//   ['HED8.0.0', require('../../data/HED8.0.0.xml')],
//   ['HED_testlib_1.0.2', require('../../data/HED_testlib_1.0.2.xml')],
// ])

const localSchemaList = [schemaFile]

// TODO: Delete in 4.0.0.
const fallbackFilePath = 'data/HED8.0.0.xml'

module.exports = {
  fallbackFilePath,
  localSchemaList,
}
