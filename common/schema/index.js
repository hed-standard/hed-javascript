const config = require('./config')
const loadSchema = require('./loader')
const { Schema, Schemas } = require('./types')

module.exports = {
  loadSchema,
  Schema,
  Schemas,
  config,
}
