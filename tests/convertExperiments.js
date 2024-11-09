const { SchemaSpec, SchemasSpec } = require('../schema/specs')
const { TagSpec } = require('../parser/tokenizer')
const path = require('path')
const { buildSchemas } = require('../schema/init')
// const { SchemaTag } = require('../schema/entries');
const TagConverter = require('../parser/tagConverter')

async function getSchema() {
  const spec3 = new SchemaSpec('', '8.3.0', '', path.join(__dirname, '../tests/data/HED8.3.0.xml'))
  const specs3 = new SchemasSpec().addSchemaSpec(spec3)
  const schemas3 = await buildSchemas(specs3)
  return schemas3
}

async function runConversion() {
  const hedSchema = await getSchema() // Wait for schema to be ready
  const spec = new TagSpec('Item/object', 1, 12, '')

  const myCon = new TagConverter(spec, hedSchema)

  const [tag, remainder] = myCon.convert()
  console.log(tag, remainder)
}

runConversion()
