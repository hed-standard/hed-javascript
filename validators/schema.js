const libxmljs = require('libxmljs')
const readFile = require('../utils/readFile')

const loadSchema = function(version = 'Latest') {
  const fileName = 'HED' + version + '.xml'
  return readFile(fileName).then(data => {
    return libxmljs.parseXmlString(data)
  })
}

module.exports = {
  loadSchema: loadSchema,
}
