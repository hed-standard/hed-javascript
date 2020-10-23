const assert = require('chai').assert
const schema = require('../validator/schema')

const localHedSchemaFile = 'tests/data/HED7.1.1.xml'
const localHedSchemaVersion = '7.1.1'

describe('Remote HED schemas', function() {
  it('can be loaded from a central GitHub repository', () => {
    const remoteHedSchemaVersion = '7.1.1'
    return schema
      .buildSchema({ version: remoteHedSchemaVersion })
      .then(hedSchema => {
        const hedSchemaVersion = hedSchema.version
        assert.strictEqual(hedSchemaVersion, remoteHedSchemaVersion)
      })
  })
})

describe('Local HED schemas', function() {
  it('can be loaded from a file', () => {
    return schema.buildSchema({ path: localHedSchemaFile }).then(hedSchema => {
      const hedSchemaVersion = hedSchema.version
      assert.strictEqual(hedSchemaVersion, localHedSchemaVersion)
    })
  })
})

describe('HED schemas', function() {
  let hedSchemaPromise

  beforeAll(() => {
    hedSchemaPromise = schema.buildSchema({
      path: localHedSchemaFile,
    })
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
      const dictionaries = hedSchema.attributes.dictionaries
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
      const dictionariesRequiredTags =
        hedSchema.attributes.dictionaries['required']
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
      const dictionariesPositionedTags =
        hedSchema.attributes.dictionaries['position']
      assert.sameMembers(
        Object.keys(dictionariesPositionedTags),
        positionedTags,
      )
    })
  })

  it('should contain all of the unique tags', () => {
    return hedSchemaPromise.then(hedSchema => {
      const uniqueTags = ['event/description', 'event/label', 'event/long name']
      const dictionariesUniqueTags = hedSchema.attributes.dictionaries['unique']
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
      const dictionariesDefaultUnitTags =
        hedSchema.attributes.dictionaries['default']
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
        physicalLength: 'm',
        pixels: 'px',
        speed: 'm-per-s',
        time: 's',
        clockTime: 'hour:min',
        dateTime: 'YYYY-MM-DDThh:mm:ss',
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
        time: ['second', 's', 'day', 'minute', 'hour'],
        clockTime: ['hour:min', 'hour:min:sec'],
        dateTime: ['YYYY-MM-DDThh:mm:ss'],
        area: ['m^2', 'px^2', 'pixel^2'],
        volume: ['m^3'],
      }

      const dictionariesDefaultUnits =
        hedSchema.attributes.dictionaries['defaultUnits']
      const dictionariesAllUnits = hedSchema.attributes.dictionaries['units']
      assert.deepStrictEqual(dictionariesDefaultUnits, defaultUnits)
      assert.deepStrictEqual(dictionariesAllUnits, allUnits)
    })
  })

  it('should contain the correct (large) numbers of tags with certain attributes', () => {
    return hedSchemaPromise.then(hedSchema => {
      const expectedTagCount = {
        isNumeric: 80,
        predicateType: 20,
        recommended: 0,
        requireChild: 64,
        tags: 1116,
        takesValue: 119,
        unitClass: 63,
      }

      const dictionaries = hedSchema.attributes.dictionaries
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
        valueParent:
          'Attribute/Location/Reference frame/Relative to participant/Azimuth',
        extensionAllowed: 'Item/Object/Road sign',
      }
      const expectedResults = {
        value: {
          default: false,
          extensionAllowed: false,
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
        valueParent: {
          default: false,
          extensionAllowed: true,
          isNumeric: false,
          position: false,
          predicateType: false,
          recommended: false,
          required: false,
          requireChild: true,
          tags: true,
          takesValue: false,
          unique: false,
          unitClass: false,
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
            hedSchema.attributes.tagHasAttribute(testString, expectedKey),
            expected[expectedKey],
            `Test string: ${testString}. Attribute: ${expectedKey}.`,
          )
        }
      }
    })
  })
})
