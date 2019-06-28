const libxmljs = require('libxmljs')
const files = require('../utils/files')

const loadSchema = function(version = 'Latest', issues) {
  const fileName = 'HED' + version + '.xml'
  const basePath =
    'https://raw.githubusercontent.com/hed-standard/hed-specification/master/hedxml/'
  const url = basePath + fileName
  return files
    .readHTTPSFile(url)
    .then(data => {
      return libxmljs.parseXmlString(data)
    })
    .catch(error => {
      issues.push(
        'Could not load HED schema version "' + version + '" - "' + error + '"',
      )
    })
}

module.exports = {
  loadSchema: loadSchema,
}
