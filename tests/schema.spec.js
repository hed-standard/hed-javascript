import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import { generateIssue } from '../common/issues/issues'
import { PartneredSchema, SchemaSpec, SchemasSpec } from '../common/schema/types'
import { parseSchemaSpec, parseSchemasSpec } from '../bids/schema'
import { buildSchemas } from '../validator/schema/init'

describe('HED schemas', () => {
  describe('Schema loading', () => {
    describe('Bundled HED schemas', () => {
      it('a standard schema can be loaded from locally stored schema', async () => {
        const spec1 = new SchemaSpec('', '8.0.0', '', '')
        const specs = new SchemasSpec().addSchemaSpec(spec1)

        const hedSchemas = await buildSchemas(specs)

        assert.strictEqual(hedSchemas.baseSchema.version, spec1.version, 'Schema has wrong version number')
        assert.strictEqual(hedSchemas.generation, 3, 'Schema collection has wrong generation')
      })

      it('a library schema can be loaded from locally stored schema', async () => {
        const spec1 = new SchemaSpec('', '2.0.0', 'testlib', '')
        const specs = new SchemasSpec().addSchemaSpec(spec1)

        const hedSchemas = await buildSchemas(specs)

        assert.strictEqual(hedSchemas.baseSchema.version, spec1.version, 'Schema has wrong version number')
        assert.strictEqual(hedSchemas.baseSchema.library, spec1.library, 'Schema has wrong library name')
        assert.strictEqual(hedSchemas.generation, 3, 'Schema collection has wrong generation')
      })

      it('a base schema with a nickname can be loaded from locally stored schema', async () => {
        const spec1 = new SchemaSpec('nk', '8.0.0', '', '')
        const specs = new SchemasSpec().addSchemaSpec(spec1)

        const hedSchemas = await buildSchemas(specs)
        const schema1 = hedSchemas.getSchema(spec1.nickname)

        assert.strictEqual(schema1.version, spec1.version, 'Schema has wrong version number')
        assert.strictEqual(schema1.library, spec1.library, 'Schema has wrong library name')
        assert.strictEqual(hedSchemas.generation, 3, 'Schema collection has wrong generation')
      })

      it('multiple local schemas can be loaded', async () => {
        const spec1 = new SchemaSpec('nk', '8.0.0', '', '')
        const spec2 = new SchemaSpec('ts', '2.0.0', 'testlib', '')
        const spec3 = new SchemaSpec('', '2.0.0', 'testlib', '')
        const specs = new SchemasSpec().addSchemaSpec(spec1).addSchemaSpec(spec2).addSchemaSpec(spec3)

        const hedSchemas = await buildSchemas(specs)
        const schema1 = hedSchemas.getSchema(spec1.nickname)
        const schema2 = hedSchemas.getSchema(spec2.nickname)
        const schema3 = hedSchemas.getSchema(spec3.nickname)

        assert.strictEqual(schema1.version, spec1.version, 'Schema 1 has wrong version number')
        assert.strictEqual(schema1.library, spec1.library, 'Schema 1 has wrong library name')
        assert.strictEqual(schema2.version, spec2.version, 'Schema 2 has wrong version number')
        assert.strictEqual(schema2.library, spec2.library, 'Schema 2 has wrong library name')
        assert.strictEqual(schema3.version, spec3.version, 'Schema 3 has wrong version number')
        assert.strictEqual(schema3.library, spec3.library, 'Schema 3 has wrong library name')

        const schema4 = hedSchemas.getSchema('baloney')
        assert.isUndefined(schema4, 'baloney schema exists')
        assert.strictEqual(hedSchemas.generation, 3, 'Schema collection has wrong generation')
      })
    })

    describe('Remote HED schemas', () => {
      it('a HED 3 schema can be loaded remotely', async () => {
        const spec1 = new SchemaSpec('', '2.1.0', 'testlib', '')
        const specs = new SchemasSpec().addSchemaSpec(spec1)

        const hedSchemas = await buildSchemas(specs)
        const schema1 = hedSchemas.getSchema(spec1.nickname)

        assert.strictEqual(schema1.version, spec1.version, 'Schema has wrong version number')
        assert.strictEqual(schema1.library, spec1.library, 'Schema has wrong library name')
        assert.strictEqual(hedSchemas.generation, 3, 'Schema collection has wrong generation')
      })
    })

    describe('Local HED schemas', () => {
      it('a standard schema can be loaded from a path', async () => {
        const localHedSchemaFile = 'tests/data/HED7.1.1.xml'
        const localHedSchemaVersion = '7.1.1'
        const schemaSpec = new SchemaSpec('', '', '', localHedSchemaFile)
        const schemasSpec = new SchemasSpec().addSchemaSpec(schemaSpec)

        const hedSchemas = await buildSchemas(schemasSpec)

        assert.strictEqual(hedSchemas.generation, 2, 'Schema collection has wrong generation')
        const hedSchemaVersion = hedSchemas.baseSchema.version
        assert.strictEqual(hedSchemaVersion, localHedSchemaVersion, 'Schema has wrong version number')
      })

      it('a library schema can be loaded from a path', async () => {
        const localHedLibrarySchemaName = 'testlib'
        const localHedLibrarySchemaVersion = '2.0.0'
        const localHedLibrarySchemaFile = 'tests/data/HED_testlib_2.0.0.xml'
        const schemaSpec = new SchemaSpec(localHedLibrarySchemaName, '', '', localHedLibrarySchemaFile)
        const schemasSpec = new SchemasSpec().addSchemaSpec(schemaSpec)

        const hedSchemas = await buildSchemas(schemasSpec)

        assert.strictEqual(hedSchemas.generation, 3, 'Schema collection has wrong generation')

        const hedSchema = hedSchemas.getSchema(localHedLibrarySchemaName)
        assert.strictEqual(hedSchema.generation, 3, 'Schema has wrong generation')
        assert.strictEqual(hedSchema.library, localHedLibrarySchemaName, 'Schema has wrong library name')
        assert.strictEqual(hedSchema.version, localHedLibrarySchemaVersion, 'Schema has wrong version number')
      })
    })
  })

  describe('HED-2G schemas', () => {
    const localHedSchemaFile = 'tests/data/HED7.1.1.xml'
    let hedSchemas

    beforeAll(async () => {
      const spec1 = new SchemaSpec('', '7.1.1', '', localHedSchemaFile)
      const specs = new SchemasSpec().addSchemaSpec(spec1)
      hedSchemas = await buildSchemas(specs)
    })

    it('should have tag dictionaries for all required tag attributes', () => {
      const tagDictionaryKeys = [
        'default',
        'extensionAllowed',
        'isNumeric',
        'position',
        'predicateType',
        'recommended',
        'required',
        'requireChild',
        'takesValue',
        'unique',
      ]
      const dictionaries = hedSchemas.baseSchema.attributes.tagAttributes
      assert.hasAllKeys(dictionaries, tagDictionaryKeys)
    })

    it('should have unit dictionaries for all required unit attributes', () => {
      const unitDictionaryKeys = ['SIUnit', 'unitSymbol']
      const dictionaries = hedSchemas.baseSchema.attributes.unitAttributes
      assert.hasAllKeys(dictionaries, unitDictionaryKeys)
    })

    it('should contain all of the required tags', () => {
      const requiredTags = ['event/category', 'event/description', 'event/label']
      const dictionariesRequiredTags = hedSchemas.baseSchema.attributes.tagAttributes['required']
      assert.hasAllKeys(dictionariesRequiredTags, requiredTags)
    })

    it('should contain all of the positioned tags', () => {
      const positionedTags = ['event/category', 'event/description', 'event/label', 'event/long name']
      const dictionariesPositionedTags = hedSchemas.baseSchema.attributes.tagAttributes['position']
      assert.hasAllKeys(dictionariesPositionedTags, positionedTags)
    })

    it('should contain all of the unique tags', () => {
      const uniqueTags = ['event/description', 'event/label', 'event/long name']
      const dictionariesUniqueTags = hedSchemas.baseSchema.attributes.tagAttributes['unique']
      assert.hasAllKeys(dictionariesUniqueTags, uniqueTags)
    })

    it('should contain all of the tags with default units', () => {
      const defaultUnitTags = {
        'attribute/blink/time shut/#': 's',
        'attribute/blink/duration/#': 's',
        'attribute/blink/pavr/#': 'centiseconds',
        'attribute/blink/navr/#': 'centiseconds',
      }
      const dictionariesDefaultUnitTags = hedSchemas.baseSchema.attributes.tagAttributes['default']
      assert.deepStrictEqual(dictionariesDefaultUnitTags, defaultUnitTags)
    })

    it('should contain all of the unit classes with their units and default units', () => {
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

      const dictionariesUnitAttributes = hedSchemas.baseSchema.attributes.unitClassAttributes
      const dictionariesAllUnits = hedSchemas.baseSchema.attributes.unitClasses
      for (const [unitClass, unitClassAttributes] of Object.entries(dictionariesUnitAttributes)) {
        const defaultUnit = unitClassAttributes.defaultUnits
        assert.deepStrictEqual(defaultUnit[0], defaultUnits[unitClass], `Default unit for unit class ${unitClass}`)
      }
      assert.deepStrictEqual(dictionariesAllUnits, allUnits, 'All units')
    })

    it('should contain the correct (large) numbers of tags with certain attributes', () => {
      const expectedAttributeTagCount = {
        isNumeric: 80,
        predicateType: 20,
        recommended: 0,
        requireChild: 64,
        takesValue: 119,
      }

      const dictionaries = hedSchemas.baseSchema.attributes.tagAttributes
      for (const [attribute, count] of Object.entries(expectedAttributeTagCount)) {
        assert.lengthOf(Object.keys(dictionaries[attribute]), count, 'Mismatch on attribute ' + attribute)
      }

      const expectedTagCount = 1116 - 119 + 2
      const expectedUnitClassCount = 63
      assert.lengthOf(
        Object.keys(hedSchemas.baseSchema.attributes.tags),
        expectedTagCount,
        'Mismatch on overall tag count',
      )
      assert.lengthOf(
        Object.keys(hedSchemas.baseSchema.attributes.tagUnitClasses),
        expectedUnitClassCount,
        'Mismatch on unit class tag count',
      )
    })

    it('should identify if a tag has a certain attribute', () => {
      const testStrings = {
        value: 'Attribute/Location/Reference frame/Relative to participant/Azimuth/#',
        valueParent: 'Attribute/Location/Reference frame/Relative to participant/Azimuth',
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
          tags: false,
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

      for (const [testStringKey, testString] of Object.entries(testStrings)) {
        const testStringLowercase = testString.toLowerCase()
        const expected = expectedResults[testStringKey]
        for (const [expectedKey, expectedResult] of Object.entries(expected)) {
          if (expectedKey === 'tags') {
            assert.strictEqual(
              hedSchemas.baseSchema.attributes.tags.includes(testStringLowercase),
              expectedResult,
              `Test string: ${testString}. Attribute: ${expectedKey}`,
            )
          } else if (expectedKey === 'unitClass') {
            assert.strictEqual(
              testStringLowercase in hedSchemas.baseSchema.attributes.tagUnitClasses,
              expectedResult,
              `Test string: ${testString}. Attribute: ${expectedKey}`,
            )
          } else {
            assert.strictEqual(
              hedSchemas.baseSchema.attributes.tagHasAttribute(testStringLowercase, expectedKey),
              expectedResult,
              `Test string: ${testString}. Attribute: ${expectedKey}.`,
            )
          }
        }
      }
    })
  })

  describe('HED-3G schemas', () => {
    const localHedSchemaFile = 'tests/data/HED8.0.0.xml'
    let hedSchemas

    beforeAll(async () => {
      const spec2 = new SchemaSpec('', '8.0.0', '', localHedSchemaFile)
      const specs = new SchemasSpec().addSchemaSpec(spec2)
      hedSchemas = await buildSchemas(specs)
    })

    it('should contain all of the tag group tags', () => {
      const tagGroupTags = ['def-expand']
      const schemaTagGroupTags = hedSchemas.baseSchema.entries.tags.getEntriesWithBooleanAttribute('tagGroup')
      assert.hasAllKeys(schemaTagGroupTags, tagGroupTags)
    })

    it('should contain all of the top-level tag group tags', () => {
      const tagGroupTags = ['definition', 'event-context', 'onset', 'offset']
      const schemaTagGroupTags = hedSchemas.baseSchema.entries.tags.getEntriesWithBooleanAttribute('topLevelTagGroup')
      assert.hasAllKeys(schemaTagGroupTags, tagGroupTags)
    })

    it('should contain all of the unit classes with their units and default units', () => {
      const defaultUnits = {
        accelerationUnits: 'm-per-s^2',
        angleUnits: 'radian',
        areaUnits: 'm^2',
        currencyUnits: '$',
        frequencyUnits: 'Hz',
        intensityUnits: 'dB',
        jerkUnits: 'm-per-s^3',
        memorySizeUnits: 'B',
        physicalLengthUnits: 'm',
        speedUnits: 'm-per-s',
        timeUnits: 's',
        volumeUnits: 'm^3',
        weightUnits: 'g',
      }
      const allUnits = {
        accelerationUnits: ['m-per-s^2'],
        angleUnits: ['radian', 'rad', 'degree'],
        areaUnits: ['m^2'],
        currencyUnits: ['dollar', '$', 'point'],
        frequencyUnits: ['hertz', 'Hz'],
        intensityUnits: ['dB', 'candela', 'cd'],
        jerkUnits: ['m-per-s^3'],
        memorySizeUnits: ['byte', 'B'],
        physicalLengthUnits: ['metre', 'm', 'inch', 'foot', 'mile'],
        speedUnits: ['m-per-s', 'mph', 'kph'],
        timeUnits: ['second', 's', 'day', 'minute', 'hour'],
        volumeUnits: ['m^3'],
        weightUnits: ['g', 'gram', 'pound', 'lb'],
      }

      const schemaUnitClasses = hedSchemas.baseSchema.entries.unitClasses
      for (const [unitClassName, unitClass] of schemaUnitClasses) {
        const defaultUnit = unitClass.defaultUnit
        assert.strictEqual(
          defaultUnit.name,
          defaultUnits[unitClassName],
          `Default unit for unit class '${unitClassName}'`,
        )
        assert.sameDeepMembers(
          Array.from(unitClass.units.values()).map((unit) => unit.name),
          allUnits[unitClassName],
          `All units for unit class '${unitClassName}'`,
        )
      }
    })

    it('should contain the correct (large) numbers of tags with certain attributes', () => {
      const expectedAttributeTagCount = {
        requireChild: 7,
        takesValue: 88,
      }

      const schemaTags = hedSchemas.baseSchema.entries.tags
      for (const [attribute, count] of Object.entries(expectedAttributeTagCount)) {
        assert.lengthOf(
          schemaTags.getEntriesWithBooleanAttribute(attribute),
          count,
          'Mismatch on attribute ' + attribute,
        )
      }

      const expectedTagCount = 1110
      assert.lengthOf(schemaTags, expectedTagCount, 'Mismatch on overall tag count')

      const expectedUnitClassCount = 27
      const schemaTagsWithUnitClasses = schemaTags.filter(([, tag]) => tag.hasUnitClasses)
      assert.lengthOf(schemaTagsWithUnitClasses, expectedUnitClassCount, 'Mismatch on unit class tag count')
    })
  })

  /**
   * Check tests with issues.
   *
   * This base function uses the generic {@link HedValidator} validator class.
   *
   * @param {Object<string, string>} testStrings A mapping of test strings.
   * @param {Object<string, *>} expectedResults The expected results for each test string.
   * @param {Object<string, Issue[]>} expectedIssues The expected issues for each test string.
   * @param {function(string): void} testFunction A test-specific function that executes the required validation check.
   */
  const checkWithIssues = function (testStrings, expectedResults, expectedIssues, testFunction) {
    for (const [testStringKey, testString] of Object.entries(testStrings)) {
      assert.property(expectedResults, testStringKey, testStringKey + ' is not in expectedResults')
      assert.property(expectedIssues, testStringKey, testStringKey + ' is not in expectedIssues')
      try {
        const testResult = testFunction(testString)
        assert.deepStrictEqual(testResult, expectedResults[testStringKey], testString)
      } catch (issueError) {
        const testIssues = [issueError.issue]
        assert.sameDeepMembers(testIssues, expectedIssues[testStringKey], testString)
      }
    }
  }

  describe('HED 3 SchemaSpec tests', () => {
    it('should return a SchemaSpec and no issues when valid', () => {
      const tests = {
        just_version: '8.1.0',
        just_library: 'score_1.0.0',
        base_with_nick: 'bt:8.1.0',
      }
      const expectedResults = {
        just_version: new SchemaSpec('', '8.1.0'),
        just_library: new SchemaSpec('', '1.0.0', 'score'),
        base_with_nick: new SchemaSpec('bt', '8.1.0'),
      }
      const expectedIssues = {
        just_version: [],
        just_library: [],
        base_with_nick: [],
      }

      return checkWithIssues(tests, expectedResults, expectedIssues, parseSchemaSpec)
    }, 10000)

    it('should return issues when invalid', () => {
      const tests = {
        bad_version: '3.1.a',
      }
      const expectedResults = {
        bad_version: null,
      }
      const expectedIssues = {
        bad_version: [generateIssue('invalidSchemaSpecification', { spec: '3.1.a' })],
      }

      return checkWithIssues(tests, expectedResults, expectedIssues, parseSchemaSpec)
    }, 10000)
  })

  describe('HED 3 SchemasSpec tests', () => {
    it('should return a SchemasSpec and no issues when valid', () => {
      const schemas1 = new SchemasSpec()
      schemas1.addSchemaSpec(new SchemaSpec('', '8.1.0', '', ''))

      const tests = {
        just_version: '8.1.0',
      }
      const expectedResults = {
        just_version: schemas1,
      }
      const expectedIssues = {
        just_version: [],
      }

      return checkWithIssues(tests, expectedResults, expectedIssues, parseSchemasSpec)
    }, 10000)

    it('should return issues when invalid', () => {
      const tests = {
        bad_version: '3.1.a',
      }
      const expectedResults = {
        bad_version: new SchemasSpec(),
      }
      const expectedIssues = {
        bad_version: [generateIssue('invalidSchemaSpecification', { spec: '3.1.a' })],
      }

      return checkWithIssues(tests, expectedResults, expectedIssues, parseSchemasSpec)
    }, 10000)
  })

  describe('HED 3 partnered schemas', () => {
    const testLib200SchemaFile = 'tests/data/HED_testlib_2.0.0.xml'
    const testLib210SchemaFile = 'tests/data/HED_testlib_2.1.0.xml'
    const testLib300SchemaFile = 'tests/data/HED_testlib_3.0.0.xml'
    let specs1, specs2, specs3

    beforeAll(() => {
      const spec200 = new SchemaSpec('testlib', '2.0.0', 'testlib', testLib200SchemaFile)
      const spec210 = new SchemaSpec('testlib', '2.1.0', 'testlib', testLib210SchemaFile)
      const spec300 = new SchemaSpec('testlib', '3.0.0', 'testlib', testLib300SchemaFile)
      specs1 = new SchemasSpec().addSchemaSpec(spec200).addSchemaSpec(spec210)
      specs2 = new SchemasSpec().addSchemaSpec(spec200).addSchemaSpec(spec300)
      specs3 = new SchemasSpec().addSchemaSpec(spec210).addSchemaSpec(spec300)
    })

    it('should fail when trying to merge incompatible schemas', () => {
      return Promise.all([
        buildSchemas(specs1).then(
          () => {
            assert.fail('Incompatible schemas testlib_2.0.0 and testlib_2.1.0 were incorrectly merged without an error')
          },
          (issueError) => {
            const issue = issueError.issue
            assert.deepStrictEqual(issue, generateIssue('lazyPartneredSchemasShareTag', { tag: 'A-nonextension' }))
          },
        ),
        buildSchemas(specs3).then(
          () => {
            assert.fail('Incompatible schemas testlib_2.1.0 and testlib_3.0.0 were incorrectly merged without an error')
          },
          (issueError) => {
            const issue = issueError.issue
            assert.deepStrictEqual(issue, generateIssue('lazyPartneredSchemasShareTag', { tag: 'Piano-sound' }))
          },
        ),
        buildSchemas(specs2).then((schemas) => {
          assert.instanceOf(
            schemas.getSchema('testlib'),
            PartneredSchema,
            'Parsed testlib schema (combined 2.0.0 and 3.0.0) is not an instance of PartneredSchema',
          )
        }),
      ])
    })
  })
})
