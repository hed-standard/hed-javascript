const HED = require('./hed')
const schema = require('./schema')

module.exports = {
  buildSchema: schema.buildSchema,
  validateHedString: HED.validateHedString,
}
