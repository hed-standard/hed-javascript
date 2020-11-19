const hedString = require('./hedString')
const schema = require('./schema')

module.exports = {
  buildSchema: schema.buildSchema,
  validateHedString: hedString.validateHedString,
}
