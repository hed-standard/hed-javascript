const assert = require('chai').assert
const validate = require('../validators')

const localHedSchemaFile = 'tests/data/HED7.1.0.xml'
const localHedSchemaVersion = '7.1.0'

describe('Remote HED schemas', function() {
  it('can be loaded from a central GitHub repository', () => {
    const remoteHedSchemaVersion = '7.1.0'
    return validate.schema
      .buildSchema({ version: remoteHedSchemaVersion })
      .then(hedSchema => {
        const hedSchemaVersion = hedSchema.version
        assert.strictEqual(hedSchemaVersion, remoteHedSchemaVersion)
      })
  })
})

describe('Local HED schemas', function() {
  it('can be loaded from a file', () => {
    return validate.schema
      .buildSchema({ path: localHedSchemaFile })
      .then(hedSchema => {
        const hedSchemaVersion = hedSchema.version
        assert.strictEqual(hedSchemaVersion, localHedSchemaVersion)
      })
  })
})

describe('HED schemas', function() {
  let hedSchemaPromise

  beforeAll(() => {
    hedSchemaPromise = validate.schema.buildSchema({ path: localHedSchemaFile })
  })

  it('should have tag dictionaries for all required attributes', () => {
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
    return hedSchemaPromise.then(hedSchema => {
      const dictionaries = hedSchema.dictionaries
      for (const dictionaryKey of tagDictionaryKeys) {
        assert(
          dictionaries[dictionaryKey] instanceof Object,
          dictionaryKey + ' not found.',
        )
      }
    })
  })

  it('should contain all of the required tags', () => {
    return hedSchemaPromise.then(hedSchema => {
      const requiredTags = [
        'event/category',
        'event/description',
        'event/label',
      ]
      const dictionariesRequiredTags = hedSchema.dictionaries['required']
      assert.sameMembers(Object.keys(dictionariesRequiredTags), requiredTags)
    })
  })

  it('should contain all of the positioned tags', () => {
    return hedSchemaPromise.then(hedSchema => {
      const positionedTags = [
        'event/category',
        'event/description',
        'event/label',
        'event/long name',
      ]
      const dictionariesPositionedTags = hedSchema.dictionaries['position']
      assert.sameMembers(
        Object.keys(dictionariesPositionedTags),
        positionedTags,
      )
    })
  })

  it('should contain all of the unique tags', () => {
    return hedSchemaPromise.then(hedSchema => {
      const uniqueTags = ['event/description', 'event/label', 'event/long name']
      const dictionariesUniqueTags = hedSchema.dictionaries['unique']
      assert.sameMembers(Object.keys(dictionariesUniqueTags), uniqueTags)
    })
  })

  it('should contain all of the tags with default units', () => {
    return hedSchemaPromise.then(hedSchema => {
      const defaultUnitTags = {
        'attribute/blink/time shut/#': 's',
        'attribute/blink/duration/#': 's',
        'attribute/blink/pavr/#': 'centiseconds',
        'attribute/blink/navr/#': 'centiseconds',
      }
      const dictionariesDefaultUnitTags = hedSchema.dictionaries['default']
      assert.deepStrictEqual(dictionariesDefaultUnitTags, defaultUnitTags)
    })
  })

  it('should contain all of the unit classes with their units and default units', () => {
    return hedSchemaPromise.then(hedSchema => {
      const defaultUnits = {
        acceleration: 'm-per-s^2',
        currency: '$',
        angle: 'radian',
        frequency: 'Hz',
        intensity: 'dB',
        jerk: 'm-per-s^3',
        luminousIntensity: 'cd',
        memorySize: 'B',
        physicalLength: 'cm',
        pixels: 'px',
        speed: 'cm-per-s',
        time: 's',
        area: 'm^2',
        volume: 'm^3',
      }
      const allUnits = {
        acceleration: ['m-per-s^2'],
        currency: ['dollar', '$', 'point', 'fraction'],
        angle: ['radian', 'rad', 'degree'],
        frequency: ['hertz', 'Hz'],
        intensity: ['dB'],
        jerk: ['m-per-s^3'],
        luminousIntensity: ['candela', 'cd'],
        memorySize: ['byte', 'B'],
        physicalLength: ['metre', 'm', 'foot', 'mile'],
        pixels: ['pixel', 'px'],
        speed: ['m-per-s', 'mph', 'kph'],
        time: ['second', 's', 'hour:min', 'day', 'minute', 'hour'],
        area: ['m^2', 'px^2', 'pixel^2'],
        volume: ['m^3'],
      }

      const dictionariesDefaultUnits = hedSchema.dictionaries['defaultUnits']
      const dictionariesAllUnits = hedSchema.dictionaries['units']
      assert.deepStrictEqual(dictionariesDefaultUnits, defaultUnits)
      assert.deepStrictEqual(dictionariesAllUnits, allUnits)
    })
  })

  it('should contain the correct (large) numbers of tags with certain attributes', () => {
    return hedSchemaPromise.then(hedSchema => {
      const expectedTagCount = {
        isNumeric: 79,
        predicateType: 8,
        recommended: 0,
        requireChild: 59,
        tags: 1093,
        takesValue: 98,
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
    })
  })

  it('should identify if a tag has a certain attribute', () => {
    return hedSchemaPromise.then(hedSchema => {
      const testStrings = {
        value:
          'Attribute/Location/Reference frame/Relative to participant/Azimuth/#',
        extensionAllowed: 'Item/Object/Road sign',
      }
      const expectedResults = {
        value: {
          default: false,
          extensionAllowed: true,
          isNumeric: true,
          position: false,
          predicateType: false,
          recommended: false,
          required: false,
          requireChild: false,
          tags: true,
          takesValue: true,
          unique: false,
          unitClass: true,
        },
        extensionAllowed: {
          default: false,
          extensionAllowed: true,
          isNumeric: false,
          position: false,
          predicateType: false,
          recommended: false,
          required: false,
          requireChild: false,
          tags: true,
          takesValue: false,
          unique: false,
          unitClass: false,
        },
      }

      for (const testStringKey in testStrings) {
        const testString = testStrings[testStringKey]
        const expected = expectedResults[testStringKey]
        for (const expectedKey in expected) {
          assert.strictEqual(
            hedSchema.tagHasAttribute(testString, expectedKey),
            expected[expectedKey],
            `Test string: ${testString}. Attribute: ${expectedKey}.`,
          )
        }
      }
    })
  })
})
