const converter = require('./converter')
const validator = require('./validator')
const path = require('path')
//const modulePath = require.resolve(path.resolve(require.resolve('.'))
//const modulePath = 3 //require.resolve(path.resolve('.'))

//const modulePath = require.resolve.paths('common')
const fallbackDirectoryBase = path.resolve('data')
module.exports = {
  fallbackDirectoryBase,
  converter,
  validator,
}
