const config = require('./config')
const loadSchema = require('./loader')
const { Schema, Schemas } = require('./types')

module.exports = {
  loadSchema: loadSchema,
  Schema: Schema,
  Schemas: Schemas,
  config: config,
}
