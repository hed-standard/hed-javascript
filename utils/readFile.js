const fs = require('fs')

/**
 * Read
 *
 * A helper method for reading file contents.
 * Takes a file object and a callback and calls
 * the callback with the binary contents of the
 * file as the only argument.
 *
 * In the browser the file should be a file object.
 * In node the file should be a path to a file.
 *
 */
function readFile(file) {
  return new Promise(resolve => {
    fs.readFile(file, 'utf8', function(err, data) {
      process.nextTick(function() {
        return resolve(data)
      })
    })
  })
}

module.exports = readFile
