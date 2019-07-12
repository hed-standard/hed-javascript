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

  it('contains all of the unit classes with their units and default units', async done => {
    hedSchemaPromise.then(hedSchema => {
      assert.deepStrictEqual(issues, [])

      const defaultUnits = {
        acceleration: 'cm-per-s2',
        currency: '$',
        angle: 'radians',
        frequency: 'Hz',
        intensity: 'dB',
        jerk: 'cm-per-s3',
        luminousIntensity: 'cd',
        memorySize: 'mb',
        physicalLength: 'cm',
        pixels: 'px',
        speed: 'cm-per-sec',
        time: 's',
        area: 'cm2',
        volume: 'cm3',
      }
      const allUnits = {
        acceleration: ['m-per-s2', 'cm-per-s2'],
        currency: ['dollars', '$', 'points', 'fraction'],
        angle: ['degrees', 'degree', 'radian', 'radians'],
        frequency: ['Hz', 'mHz', 'Hertz', 'kHz'],
        intensity: ['dB'],
        jerk: ['m-per-s3', 'cm-per-s3'],
        luminousIntensity: ['candela', 'cd'],
        memorySize: ['mb', 'kb', 'gb', 'tb'],
        physicalLength: [
          'm',
          'cm',
          'km',
          'mm',
          'feet',
          'foot',
          'meter',
          'meters',
          'mile',
          'miles',
        ],
        pixels: ['pixels', 'px', 'pixel'],
        speed: ['m-per-s', 'mph', 'kph', 'cm-per-s'],
        time: [
          's',
          'second',
          'seconds',
          'centiseconds',
          'centisecond',
          'cs',
          'hour:min',
          'day',
          'days',
          'ms',
          'milliseconds',
          'millisecond',
          'minute',
          'minutes',
          'hour',
          'hours',
        ],
        area: ['m2', 'cm2', 'km2', 'pixels2', 'px2', 'pixel2', 'mm2'],
        volume: ['m3', 'cm3', 'mm3', 'km3'],
      }

      const dictionariesDefaultUnits = hedSchema.dictionaries['default_units']
      const dictionariesAllUnits = hedSchema.dictionaries['units']
      assert.deepStrictEqual(dictionariesDefaultUnits, defaultUnits)
      assert.deepStrictEqual(dictionariesAllUnits, allUnits)
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
})
