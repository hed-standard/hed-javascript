const assert = require('assert')
const validate = require('../validators')

const localHedSchemaFile = 'tests/data/HEDTest.xml'
const localHedSchemaVersion = '7.0.4'

describe('Remote HED schemas', function() {
  it('can be loaded from a central GitHub repository', async done => {
    const remoteHedSchemaVersion = '7.0.4'
    validate.schema
      .buildSchema({ version: remoteHedSchemaVersion })
      .then(hedSchema => {
        const hedSchemaVersion = hedSchema.version
        assert.strictEqual(hedSchemaVersion, remoteHedSchemaVersion)
        done()
      })
  })
})

describe('Local HED schemas', function() {
  it('can be loaded from a file', async done => {
    validate.schema
      .buildSchema({ path: localHedSchemaFile })
      .then(hedSchema => {
        const hedSchemaVersion = hedSchema.version
        assert.strictEqual(hedSchemaVersion, localHedSchemaVersion)
        done()
      })
  })
})

describe('HED schemas', function() {
  let hedSchemaPromise

  beforeAll(() => {
    hedSchemaPromise = validate.schema.buildSchema({ path: localHedSchemaFile })
  })

  it("should have a root element with the name 'HED'", async done => {
    hedSchemaPromise.then(hedSchema => {
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
      'leaf',
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

  it('should contain all of the required tags', async done => {
    hedSchemaPromise.then(hedSchema => {
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

  it('should contain all of the positioned tags', async done => {
    hedSchemaPromise.then(hedSchema => {
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

  it('should contain all of the unique tags', async done => {
    hedSchemaPromise.then(hedSchema => {
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

  it('should contain all of the tags with default units', async done => {
    hedSchemaPromise.then(hedSchema => {
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

  it('should contain all of the unit classes with their units and default units', async done => {
    hedSchemaPromise.then(hedSchema => {
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
        speed: 'cm-per-s',
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

  it('should contain the correct (large) numbers of tags with certain attributes', async done => {
    hedSchemaPromise.then(hedSchema => {
      const expectedTagCount = {
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

  it('should identify if a tag has a certain attribute', async done => {
    hedSchemaPromise.then(hedSchema => {
      const testTag1 =
        'Attribute/Location/Reference frame/Relative to participant/Azimuth/#'
      assert.strictEqual(hedSchema.tagHasAttribute(testTag1, 'default'), false)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag1, 'extensionAllowed'),
        true,
      )
      assert.strictEqual(hedSchema.tagHasAttribute(testTag1, 'isNumeric'), true)
      assert.strictEqual(hedSchema.tagHasAttribute(testTag1, 'leaf'), false)
      assert.strictEqual(hedSchema.tagHasAttribute(testTag1, 'position'), false)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag1, 'predicateType'),
        false,
      )
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag1, 'recommended'),
        false,
      )
      assert.strictEqual(hedSchema.tagHasAttribute(testTag1, 'required'), false)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag1, 'requireChild'),
        false,
      )
      assert.strictEqual(hedSchema.tagHasAttribute(testTag1, 'tags'), true)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag1, 'takesValue'),
        true,
      )
      assert.strictEqual(hedSchema.tagHasAttribute(testTag1, 'unique'), false)
      assert.strictEqual(hedSchema.tagHasAttribute(testTag1, 'unitClass'), true)

      const testTag2 = 'Item/Object/Road sign'
      assert.strictEqual(hedSchema.tagHasAttribute(testTag2, 'default'), false)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag2, 'extensionAllowed'),
        true,
      )
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag2, 'isNumeric'),
        false,
      )
      assert.strictEqual(hedSchema.tagHasAttribute(testTag2, 'leaf'), true)
      assert.strictEqual(hedSchema.tagHasAttribute(testTag2, 'position'), false)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag2, 'predicateType'),
        false,
      )
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag2, 'recommended'),
        false,
      )
      assert.strictEqual(hedSchema.tagHasAttribute(testTag2, 'required'), false)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag2, 'requireChild'),
        false,
      )
      assert.strictEqual(hedSchema.tagHasAttribute(testTag2, 'tags'), true)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag2, 'takesValue'),
        false,
      )
      assert.strictEqual(hedSchema.tagHasAttribute(testTag2, 'unique'), false)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag2, 'unitClass'),
        false,
      )

      const testTag3 = 'Item/Object/Food'
      assert.strictEqual(hedSchema.tagHasAttribute(testTag3, 'default'), false)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag3, 'extensionAllowed'),
        true,
      )
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag3, 'isNumeric'),
        false,
      )
      assert.strictEqual(hedSchema.tagHasAttribute(testTag3, 'leaf'), false)
      assert.strictEqual(hedSchema.tagHasAttribute(testTag3, 'position'), false)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag3, 'predicateType'),
        false,
      )
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag3, 'recommended'),
        false,
      )
      assert.strictEqual(hedSchema.tagHasAttribute(testTag3, 'required'), false)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag3, 'requireChild'),
        false,
      )
      assert.strictEqual(hedSchema.tagHasAttribute(testTag3, 'tags'), true)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag3, 'takesValue'),
        false,
      )
      assert.strictEqual(hedSchema.tagHasAttribute(testTag3, 'unique'), false)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag3, 'unitClass'),
        false,
      )

      const testTag4 = 'Action/Involuntary/Cough'
      assert.strictEqual(hedSchema.tagHasAttribute(testTag4, 'default'), false)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag4, 'extensionAllowed'),
        false,
      )
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag4, 'isNumeric'),
        false,
      )
      assert.strictEqual(hedSchema.tagHasAttribute(testTag4, 'leaf'), true)
      assert.strictEqual(hedSchema.tagHasAttribute(testTag4, 'position'), false)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag4, 'predicateType'),
        false,
      )
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag4, 'recommended'),
        false,
      )
      assert.strictEqual(hedSchema.tagHasAttribute(testTag4, 'required'), false)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag4, 'requireChild'),
        false,
      )
      assert.strictEqual(hedSchema.tagHasAttribute(testTag4, 'tags'), true)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag4, 'takesValue'),
        false,
      )
      assert.strictEqual(hedSchema.tagHasAttribute(testTag4, 'unique'), false)
      assert.strictEqual(
        hedSchema.tagHasAttribute(testTag4, 'unitClass'),
        false,
      )
      done()
    })
  })
})
