const event = require('./event')
const schema = require('./schema')

module.exports = {
  buildSchema: schema.buildSchema,
  validateHedString: event.validateHedString,
}
