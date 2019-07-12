const assert = require('assert')
const validate = require('../index')

// Temporary test
describe('Remote HED schemas', function() {
  it('can be loaded from a central GitHub repository', async done => {
    const issues = []
    validate.schema.buildRemoteSchema('7.0.3', issues).then(hedSchema => {
      assert.deepStrictEqual(issues, [])

      const hedSchemaVersion = hedSchema.rootElement.attr('version').value()
      assert.strictEqual(hedSchemaVersion, '7.0.3')
      done()
    })
  })
})

describe('Local HED schemas', function() {
  it('can be loaded from a file', async done => {
    const issues = []
    validate.schema
      .buildLocalSchema('tests/data/HED7.0.3.xml', issues)
      .then(hedSchema => {
        assert.deepStrictEqual(issues, [])

        const hedSchemaVersion = hedSchema.rootElement.attr('version').value()
        assert.strictEqual(hedSchemaVersion, '7.0.3')
        done()
      })
  })
})

describe('HED schemas', function() {
  let hedSchemaPromise
  let issues

  beforeEach(() => {
    issues = []
  })

  beforeAll(() => {
    hedSchemaPromise = validate.schema.buildLocalSchema(
      'tests/data/HED7.0.3.xml',
      issues,
    )
  })

  it("should have a root element with the name 'HED'", async done => {
    hedSchemaPromise.then(hedSchema => {
      assert.deepStrictEqual(issues, [])

      const hedSchemaRootName = hedSchema.rootElement.name()
      assert.strictEqual(hedSchemaRootName, 'HED')
      done()
    })
  })

  it('should have tag dictionaries for all required attributes', async done => {
    const tagDictionaryKeys = [
      'default',
      'extensionAllowed',
      'isNumeric',
      'position',
      'predicateType',
      'recommended',
      'required',
      'requireChild',
      'tags',
      'takesValue',
      'unique',
      'unitClass',
    ]
    hedSchemaPromise.then(hedSchema => {
      assert.deepStrictEqual(issues, [])

      const dictionaries = hedSchema.dictionaries
      for (const dictionaryKey of tagDictionaryKeys) {
        assert(
          dictionaries[dictionaryKey] instanceof Object,
          dictionaryKey + ' not found.',
        )
      }
      done()
    })
  })

  it('contains all of the required tags', async done => {
    hedSchemaPromise.then(hedSchema => {
      assert.deepStrictEqual(issues, [])

      const requiredTags = [
        'event/category',
        'event/description',
        'event/label',
      ]
      const dictionariesRequiredTags = hedSchema.dictionaries['required']
      assert.strictEqual(
        Object.keys(dictionariesRequiredTags).length,
        requiredTags.length,
      )
      for (const requiredTag in dictionariesRequiredTags) {
        assert(requiredTags.includes(requiredTag), requiredTag + ' not found.')
      }
      done()
    })
  })

  it('contains all of the positioned tags', async done => {
    hedSchemaPromise.then(hedSchema => {
      assert.deepStrictEqual(issues, [])

      const positionedTags = [
        'event/category',
        'event/description',
        'event/label',
        'event/long name',
      ]
      const dictionariesPositionedTags = hedSchema.dictionaries['position']
      assert.strictEqual(
        Object.keys(dictionariesPositionedTags).length,
        positionedTags.length,
      )
      for (const positionedTag in dictionariesPositionedTags) {
        assert(
          positionedTags.includes(positionedTag),
          positionedTag + ' not found.',
        )
      }
      done()
    })
  })

  it('contains all of the unique tags', async done => {
    hedSchemaPromise.then(hedSchema => {
      assert.deepStrictEqual(issues, [])

      const uniqueTags = ['event/description', 'event/label', 'event/long name']
      const dictionariesUniqueTags = hedSchema.dictionaries['unique']
      assert.strictEqual(
        Object.keys(dictionariesUniqueTags).length,
        uniqueTags.length,
      )
      for (const uniqueTag in dictionariesUniqueTags) {
        assert(uniqueTags.includes(uniqueTag), uniqueTag + ' not found.')
      }
      done()
    })
  })

  it('contains all of the tags with default units', async done => {
    hedSchemaPromise.then(hedSchema => {
      assert.deepStrictEqual(issues, [])

      const defaultUnitTags = {
        'attribute/blink/time shut/#': 's',
        'attribute/blink/duration/#': 's',
        'attribute/blink/pavr/#': 'centiseconds',
        'attribute/blink/navr/#': 'centiseconds',
      }
      const dictionariesDefaultUnitTags = hedSchema.dictionaries['default']
      assert.deepStrictEqual(dictionariesDefaultUnitTags, defaultUnitTags)
      done()
    })
  })

  it('contains the correct (large) numbers of tags with certain attributes', async done => {
    hedSchemaPromise.then(hedSchema => {
      assert.deepStrictEqual(issues, [])

      const expectedTagCount = {
        // TODO: Add new test for extensionAllowed to reflect leaf tags.
        // extensionAllowed: 17,
        isNumeric: 80,
        predicateType: 20,
        recommended: 0,
        requireChild: 64,
        tags: 1113,
        takesValue: 119,
        unitClass: 63,
        // TODO: Add better unit class test
        default_units: 14,
        units: 14,
      }
      const dictionaries = hedSchema.dictionaries
      for (const attribute in expectedTagCount) {
        assert.strictEqual(
          Object.keys(dictionaries[attribute]).length,
          expectedTagCount[attribute],
          'Mismatch on attribute ' + attribute,
        )
      }
      done()
    })
  })

  // TODO: Add unit class tests
})
