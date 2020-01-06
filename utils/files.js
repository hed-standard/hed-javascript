const fs = require('fs')
const request = require('then-request')

function readFile(fileName) {
  return new Promise(resolve => {
    fs.readFile(fileName, 'utf8', function(err, data) {
      process.nextTick(function() {
        return resolve(data)
      })
    })
  })
}

function readHTTPSFile(url) {
  return request('GET', url).then(res => {
    return res.getBody()
  })
}

module.exports = {
  readFile: readFile,
  readHTTPSFile: readHTTPSFile,
}
