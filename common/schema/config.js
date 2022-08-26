/** Path to the fallback HED schema. */

const testFlag = false
let localList
if (testFlag) {
  localList = new Map([
    ['HED8.0.0', 'data/HED8.0.0.xml'],
    ['HED_testlib_1.0.2', 'data/HED_testlib_1.0.2.xml'],
  ])
} else {
  localList = new Map([
    ['HED8.0.0', require('../../data/HED8.0.0.xml')],
    ['HED_testlib_1.0.2', require('../../data/HED_testlib_1.0.2.xml')],
  ])
}
// TODO: Delete in 4.0.0.
const fallbackFilePath = 'data/HED8.0.0.xml'
const fallbackSchemaDir = 'data'
const localSchemaList = localList

module.exports = {
  fallbackSchemaDir,
  fallbackFilePath,
  localSchemaList,
  testFlag,
}
