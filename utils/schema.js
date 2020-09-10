const xml2js = require('xml2js')

const files = require('../utils/files')

/**
 * Load schema data from the HED specification GitHub repository.
 *
 * @param version The schema version to load.
 * @return {Promise<Object>} The schema data.
 */
const loadRemoteSchema = function(version) {
  const fileName = 'HED' + version + '.xml'
  const basePath =
    'https://raw.githubusercontent.com/hed-standard/hed-specification/master/hedxml/'
  const url = basePath + fileName
  return files
    .readHTTPSFile(url)
    .then(data => {
      return xml2js.parseStringPromise(data, { explicitCharkey: true })
    })
    .catch(error => {
      throw new Error(
        'Could not load HED schema version "' +
          version +
          '" from remote repository - "' +
          error +
          '".',
      )
    })
}

/**
 * Load schema data from a local file.
 *
 * @param path The path to the schema data.
 * @return {Promise<Object>} The schema data.
 */
const loadLocalSchema = function(path) {
  return files
    .readFile(path)
    .then(data => {
      return xml2js.parseStringPromise(data, { explicitCharkey: true })
    })
    .catch(error => {
      throw new Error(
        'Could not load HED schema from path "' + path + '" - "' + error + '".',
      )
    })
}

module.exports = {
  loadRemoteSchema: loadRemoteSchema,
  loadLocalSchema: loadLocalSchema,
}
