const converter = require('./converter')
const schema = require('./schema')

module.exports = {
  buildMapping: schema.buildMapping,
  convertHedStringToShort: converter.convertHedStringToShort,
  convertHedStringToLong: converter.convertHedStringToLong,
}
