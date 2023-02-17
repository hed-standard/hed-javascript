import chai from 'chai'
const assert = chai.assert
import { generateIssue } from '../common/issues/issues'
import { SchemaSpec, SchemasSpec } from '../common/schema/types'
import { parseSchemaSpec, parseSchemasSpec } from '../validator/bids/schema'
import { buildSchemas } from '../validator/schema/init'

describe('HED schemas', () => {
  describe('Schema loading', () => {
    describe('Bundled HED schemas', () => {
      it('a standard schema can be loaded from locally stored schema', () => {
        const spec1 = new SchemaSpec('', '8.0.0', '', '')
        const specs = new SchemasSpec().addSchemaSpec(spec1)
        return buildSchemas(specs).then(([hedSchemas, issues]) => {
          assert.isEmpty(issues, 'Schema loading issues occurred')
          assert.strictEqual(hedSchemas.baseSchema.version, spec1.version)
          assert.strictEqual(hedSchemas.generation, 3)
        })
      })

      it('a library schema can be loaded from locally stored schema', () => {
        const spec1 = new SchemaSpec('', '1.0.2', 'testlib', '')
        const specs = new SchemasSpec().addSchemaSpec(spec1)
        return buildSchemas(specs).then(([hedSchemas, issues]) => {
          assert.isEmpty(issues, 'Schema loading issues occurred')
          assert.strictEqual(hedSchemas.baseSchema.version, spec1.version)
          assert.strictEqual(hedSchemas.baseSchema.library, spec1.library)
          assert.strictEqual(hedSchemas.generation, 3)
        })
      })

      it('a base schema with a nickname can be loaded from locally stored schema', () => {
        const spec1 = new SchemaSpec('nk', '8.0.0', '', '')
        const specs = new SchemasSpec().addSchemaSpec(spec1)
        return buildSchemas(specs).then(([hedSchemas, issues]) => {
          assert.isEmpty(issues, 'Schema loading issues occurred')
          const schema1 = hedSchemas.getSchema(spec1.nickname)
          assert.strictEqual(schema1.version, spec1.version)
          assert.strictEqual(schema1.library, spec1.library)
          assert.strictEqual(hedSchemas.generation, 3)
        })
      })

      it('multiple local schemas can be loaded', () => {
        const spec1 = new SchemaSpec('nk', '8.0.0', '', '')
        const spec2 = new SchemaSpec('ts', '1.0.2', 'testlib', '')
        const spec3 = new SchemaSpec('', '1.0.2', 'testlib', '')
        const specs = new SchemasSpec().addSchemaSpec(spec1).addSchemaSpec(spec2).addSchemaSpec(spec3)
        return buildSchemas(specs).then(([hedSchemas, issues]) => {
          assert.isEmpty(issues, 'Schema loading issues occurred')
          const schema1 = hedSchemas.getSchema(spec1.nickname)
          const schema2 = hedSchemas.getSchema(spec2.nickname)
          const schema3 = hedSchemas.getSchema(spec3.nickname)
          assert.strictEqual(schema1.version, spec1.version)
          assert.strictEqual(schema1.library, spec1.library)
          assert.strictEqual(schema2.version, spec2.version)
          assert.strictEqual(schema2.library, spec2.library)
          assert.strictEqual(schema3.version, spec3.version)
          assert.strictEqual(schema3.library, spec3.library)
          const schema4 = hedSchemas.getSchema('baloney')
          assert.isUndefined(schema4, 'baloney schema exists')
        })
      })
    })

    describe('Remote HED schemas', () => {
      it('a HED 2 schema can be loaded remotely', () => {
        const spec1 = new SchemaSpec('', '7.2.0', '', '')
        const specs = new SchemasSpec().addSchemaSpec(spec1)
        return buildSchemas(specs).then(([hedSchemas, issues]) => {
          assert.isEmpty(issues, 'Schema loading issues occurred')
          const schema1 = hedSchemas.getSchema(spec1.nickname)
          assert.strictEqual(schema1.version, spec1.version)
          assert.strictEqual(schema1.library, spec1.library)
          assert.strictEqual(hedSchemas.generation, 2)
        })
      })
    })

    describe('Local HED schemas', () => {
      it('a standard schema can be loaded from a path', () => {
        const localHedSchemaFile = 'tests/data/HED7.1.1.xml'
        const localHedSchemaVersion = '7.1.1'
        const schemaSpec = new SchemaSpec('', '', '', localHedSchemaFile)
        const schemasSpec = new SchemasSpec().addSchemaSpec(schemaSpec)
        return buildSchemas(schemasSpec).then(([hedSchemas, issues]) => {
          assert.isEmpty(issues, 'Schema loading issues occurred')
          assert.strictEqual(hedSchemas.generation, 2)
          const hedSchemaVersion = hedSchemas.baseSchema.version
          assert.strictEqual(hedSchemaVersion, localHedSchemaVersion)
        })
      })

      it('a library schema can be loaded from a path', () => {
        const localHedLibrarySchemaName = 'testlib'
        const localHedLibrarySchemaVersion = '1.0.2'
        const localHedLibrarySchemaFile = 'tests/data/HED_testlib_1.0.2.xml'
        const schemaSpec = new SchemaSpec(localHedLibrarySchemaName, '', '', localHedLibrarySchemaFile)
        const schemasSpec = new SchemasSpec().addSchemaSpec(schemaSpec)
        return buildSchemas(schemasSpec).then(([hedSchemas, issues]) => {
          assert.isEmpty(issues, 'Schema loading issues occurred')
          assert.strictEqual(hedSchemas.generation, 3)
          const hedSchema = hedSchemas.getSchema(localHedLibrarySchemaName)
          assert.strictEqual(hedSchema.generation, 3)
          assert.strictEqual(hedSchema.library, localHedLibrarySchemaName)
          assert.strictEqual(hedSchema.version, localHedLibrarySchemaVersion)
        })
      })
    })
  })

  describe('HED-2G schemas', () => {
    const localHedSchemaFile = 'tests/data/HED7.1.1.xml'
    let hedSchemaPromise

    beforeAll(() => {
      const spec1 = new SchemaSpec('', '7.1.1', '', localHedSchemaFile)
      const specs = new SchemasSpec().addSchemaSpec(spec1)
      hedSchemaPromise = buildSchemas(specs)
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
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
        const dictionaries = hedSchemas.baseSchema.attributes.tagAttributes
        assert.hasAllKeys(dictionaries, tagDictionaryKeys)
      })
    })

    it('should have unit dictionaries for all required unit attributes', () => {
      const unitDictionaryKeys = ['SIUnit', 'unitSymbol']
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
        const dictionaries = hedSchemas.baseSchema.attributes.unitAttributes
        assert.hasAllKeys(dictionaries, unitDictionaryKeys)
      })
    })

    it('should contain all of the required tags', () => {
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
        const requiredTags = ['event/category', 'event/description', 'event/label']
        const dictionariesRequiredTags = hedSchemas.baseSchema.attributes.tagAttributes['required']
        assert.hasAllKeys(dictionariesRequiredTags, requiredTags)
      })
    })

    it('should contain all of the positioned tags', () => {
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
        const positionedTags = ['event/category', 'event/description', 'event/label', 'event/long name']
        const dictionariesPositionedTags = hedSchemas.baseSchema.attributes.tagAttributes['position']
        assert.hasAllKeys(dictionariesPositionedTags, positionedTags)
      })
    })

    it('should contain all of the unique tags', () => {
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
        const uniqueTags = ['event/description', 'event/label', 'event/long name']
        const dictionariesUniqueTags = hedSchemas.baseSchema.attributes.tagAttributes['unique']
        assert.hasAllKeys(dictionariesUniqueTags, uniqueTags)
      })
    })

    it('should contain all of the tags with default units', () => {
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
        const defaultUnitTags = {
          'attribute/blink/time shut/#': 's',
          'attribute/blink/duration/#': 's',
          'attribute/blink/pavr/#': 'centiseconds',
          'attribute/blink/navr/#': 'centiseconds',
        }
        const dictionariesDefaultUnitTags = hedSchemas.baseSchema.attributes.tagAttributes['default']
        assert.deepStrictEqual(dictionariesDefaultUnitTags, defaultUnitTags)
      })
    })

    it('should contain all of the unit classes with their units and default units', () => {
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
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
    })

    it('should contain the correct (large) numbers of tags with certain attributes', () => {
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
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
    })

    it('should identify if a tag has a certain attribute', () => {
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
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
  })

  describe('HED-3G schemas', () => {
    const localHedSchemaFile = 'tests/data/HED8.0.0.xml'
    let hedSchemaPromise

    beforeAll(() => {
      const spec2 = new SchemaSpec('', '8.0.0', '', localHedSchemaFile)
      const specs = new SchemasSpec().addSchemaSpec(spec2)
      hedSchemaPromise = buildSchemas(specs)
    })

    it('should contain all of the tag group tags', () => {
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
        const tagGroupTags = ['property/organizational-property/def-expand']
        const schemaTagGroupTags = hedSchemas.baseSchema.entries.definitions
          .get('tags')
          .getEntriesWithBooleanAttribute('tagGroup')
        assert.hasAllKeys(schemaTagGroupTags, tagGroupTags)
      })
    })

    it('should contain all of the top-level tag group tags', () => {
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
        const tagGroupTags = [
          'property/organizational-property/definition',
          'property/organizational-property/event-context',
          'property/data-property/data-marker/temporal-marker/onset',
          'property/data-property/data-marker/temporal-marker/offset',
        ]
        const schemaTagGroupTags = hedSchemas.baseSchema.entries.definitions
          .get('tags')
          .getEntriesWithBooleanAttribute('topLevelTagGroup')
        assert.hasAllKeys(schemaTagGroupTags, tagGroupTags)
      })
    })

    it('should contain all of the unit classes with their units and default units', () => {
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
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

        const schemaUnitClasses = hedSchemas.baseSchema.entries.definitions.get('unitClasses')
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
    })

    it('should contain the correct (large) numbers of tags with certain attributes', () => {
      return hedSchemaPromise.then(([hedSchemas, issues]) => {
        assert.isEmpty(issues, 'Schema loading issues occurred')
        const expectedAttributeTagCount = {
          requireChild: 7,
          takesValue: 88,
        }

        const schemaTags = hedSchemas.baseSchema.entries.definitions.get('tags')
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
  })

  const checkWithIssues = function (testStrings, expectedResults, expectedIssues, testFunction) {
    for (const [testStringKey, testString] of Object.entries(testStrings)) {
      assert.property(expectedResults, testStringKey, testStringKey + ' is not in expectedResults')
      assert.property(expectedIssues, testStringKey, testStringKey + ' is not in expectedIssues')
      const [testResult, testIssues] = testFunction(testString)
      assert.deepStrictEqual(testResult, expectedResults[testStringKey], testString)
      assert.sameDeepMembers(testIssues, expectedIssues[testStringKey], testString)
    }
  }

  describe('HED 3 SchemaSpec tests', () => {
    it('should be return a SchemaSpec and no issues when valid', () => {
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

      return checkWithIssues(
        tests,
        expectedResults,
        expectedIssues,
        (string) => {
          const [sp, issues] = parseSchemaSpec(string)
          return [sp, issues]
        },
        10000,
      )
    })

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

      return checkWithIssues(
        tests,
        expectedResults,
        expectedIssues,
        (string) => {
          const [sp, issues] = parseSchemaSpec(string)
          return [sp, issues]
        },
        10000,
      )
    })
  })

  describe('HED 3 SchemasSpec tests', () => {
    it('should be return a SchemasSpec and no issues when valid', () => {
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

      return checkWithIssues(
        tests,
        expectedResults,
        expectedIssues,
        (string) => {
          const [sp, issues] = parseSchemasSpec(string)
          return [sp, issues]
        },
        10000,
      )
    })

    it('should return issues when invalid', () => {
      const schemas1 = new SchemasSpec()
      schemas1.addSchemaSpec(new SchemaSpec('', '8.1.0', '', ''))

      const tests = {
        // bad_version: '3.1.a',
        duplicate_key: ['8.1.0', '8.0.0'],
      }
      const expectedResults = {
        bad_version: new SchemasSpec(),
        duplicate_key: schemas1,
      }
      const expectedIssues = {
        bad_version: [generateIssue('invalidSchemaSpecification', { spec: '3.1.a' })],
        duplicate_key: [generateIssue('invalidSchemaNickname', { spec: '8.0.0', nickname: '' })],
      }

      return checkWithIssues(
        tests,
        expectedResults,
        expectedIssues,
        (string) => {
          const [sp, issues] = parseSchemasSpec(string)
          return [sp, issues]
        },
        10000,
      )
    })
  })
})
