const HED = require('./hed')
const schema = require('./schema')
const stringParser = require('./stringParser')

const validate = function(hedString, schemaData, checkForWarnings = false) {
  let schemaPromise
  if (schemaData.path) {
    schemaPromise = schema.buildLocalSchema(schemaData.path)
  } else if (schemaData.version) {
    schemaPromise = schema.buildRemoteSchema(schemaData.version)
  } else {
    schemaPromise = schema.buildRemoteSchema()
  }
  schemaPromise.then(hedSchema => {
    return HED.validateHedString(hedString, hedSchema, checkForWarnings)
  })
}

module.exports = {
  HED: HED,
  schema: schema,
  stringParser: stringParser,
  validate: validate,
}
