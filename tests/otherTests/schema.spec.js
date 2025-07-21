import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import { generateIssue } from '../../src/issues/issues'
import { PartneredSchema } from '../../src/schema/containers'
import { buildSchemas, buildSchemasFromVersion } from '../../src/schema/init'
import { SchemaSpec, SchemasSpec } from '../../src/schema/specs'
import { buildSchemasSpec } from '../../src/bids/schema'
import { BidsJsonFile } from '../../src/bids/index.js'
import { IssueError } from '../../src/issues/issues.js'

describe('HED schemas', () => {
  describe('Schema loading', () => {
    describe('Bundled HED schemas', () => {
      it('a standard schema can be loaded from locally stored schema', async () => {
        const spec1 = new SchemaSpec('', '8.0.0', '', '')
        const specs = new SchemasSpec().addSchemaSpec(spec1)

        const hedSchemas = await buildSchemas(specs)

        assert.strictEqual(hedSchemas.baseSchema.version, spec1.version, 'Schema has wrong version number')
      })

      it('a library schema can be loaded from locally stored schema', async () => {
        const spec1 = new SchemaSpec('', '2.0.0', 'testlib', '')
        const specs = new SchemasSpec().addSchemaSpec(spec1)

        const hedSchemas = await buildSchemas(specs)

        assert.strictEqual(hedSchemas.baseSchema.version, spec1.version, 'Schema has wrong version number')
        assert.strictEqual(hedSchemas.baseSchema.library, spec1.library, 'Schema has wrong library name')
      })

      it('a base schema with a prefix can be loaded from locally stored schema', async () => {
        const spec1 = new SchemaSpec('nk', '8.0.0', '', '')
        const specs = new SchemasSpec().addSchemaSpec(spec1)

        const hedSchemas = await buildSchemas(specs)
        const schema1 = hedSchemas.getSchema(spec1.prefix)

        assert.strictEqual(schema1.version, spec1.version, 'Schema has wrong version number')
        assert.strictEqual(schema1.library, spec1.library, 'Schema has wrong library name')
      })

      it('multiple local schemas can be loaded', async () => {
        const spec1 = new SchemaSpec('nk', '8.0.0', '', '')
        const spec2 = new SchemaSpec('ts', '2.0.0', 'testlib', '')
        const spec3 = new SchemaSpec('', '2.0.0', 'testlib', '')
        const specs = new SchemasSpec().addSchemaSpec(spec1).addSchemaSpec(spec2).addSchemaSpec(spec3)

        const hedSchemas = await buildSchemas(specs)
        const schema1 = hedSchemas.getSchema(spec1.prefix)
        const schema2 = hedSchemas.getSchema(spec2.prefix)
        const schema3 = hedSchemas.getSchema(spec3.prefix)

        assert.strictEqual(schema1.version, spec1.version, 'Schema 1 has wrong version number')
        assert.strictEqual(schema1.library, spec1.library, 'Schema 1 has wrong library name')
        assert.strictEqual(schema2.version, spec2.version, 'Schema 2 has wrong version number')
        assert.strictEqual(schema2.library, spec2.library, 'Schema 2 has wrong library name')
        assert.strictEqual(schema3.version, spec3.version, 'Schema 3 has wrong version number')
        assert.strictEqual(schema3.library, spec3.library, 'Schema 3 has wrong library name')

        const schema4 = hedSchemas.getSchema('baloney')
        assert.isUndefined(schema4, 'baloney schema exists')
      })
    })

    describe('Remote HED schemas', () => {
      it('a HED 3 schema can be loaded remotely', async () => {
        const spec1 = new SchemaSpec('', '2.1.0', 'testlib', '')
        const specs = new SchemasSpec().addSchemaSpec(spec1)

        const hedSchemas = await buildSchemas(specs)
        const schema1 = hedSchemas.getSchema(spec1.prefix)

        assert.strictEqual(schema1.version, spec1.version, 'Schema has wrong version number')
        assert.strictEqual(schema1.library, spec1.library, 'Schema has wrong library name')
      })
    })

    describe('Local HED schemas', () => {
      it('a standard schema can be loaded from a path', async () => {
        const localHedSchemaFile = 'src/data/schemas/HED8.0.0.xml'
        const localHedSchemaVersion = '8.0.0'
        const schemaSpec = new SchemaSpec('', '', '', localHedSchemaFile)
        const schemasSpec = new SchemasSpec().addSchemaSpec(schemaSpec)

        const hedSchemas = await buildSchemas(schemasSpec)

        const hedSchemaVersion = hedSchemas.baseSchema.version
        assert.strictEqual(hedSchemaVersion, localHedSchemaVersion, 'Schema has wrong version number')
      })

      it('a library schema can be loaded from a path', async () => {
        const localHedLibrarySchemaName = 'testlib'
        const localHedLibrarySchemaVersion = '2.0.0'
        const localHedLibrarySchemaFile = 'tests/otherTestData/HED_testlib_2.0.0.xml'
        const schemaSpec = new SchemaSpec(localHedLibrarySchemaName, '', '', localHedLibrarySchemaFile)
        const schemasSpec = new SchemasSpec().addSchemaSpec(schemaSpec)

        const hedSchemas = await buildSchemas(schemasSpec)

        const hedSchema = hedSchemas.getSchema(localHedLibrarySchemaName)
        assert.strictEqual(hedSchema.library, localHedLibrarySchemaName, 'Schema has wrong library name')
        assert.strictEqual(hedSchema.version, localHedLibrarySchemaVersion, 'Schema has wrong version number')
      })
    })
  })

  describe('HED-3G schemas', () => {
    const localHedSchemaFile = 'src/data/schemas/HED8.0.0.xml'
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

      checkWithIssues(tests, expectedResults, expectedIssues, SchemaSpec.parseVersionSpec)
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

      checkWithIssues(tests, expectedResults, expectedIssues, SchemaSpec.parseVersionSpec)
    })
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

      checkWithIssues(tests, expectedResults, expectedIssues, SchemasSpec.parseVersionSpecs)
    })

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

      checkWithIssues(tests, expectedResults, expectedIssues, SchemasSpec.parseVersionSpecs)
    })
  })

  describe('HED 3 partnered schemas', () => {
    const testLib200SchemaFile = 'tests/otherTestData/HED_testlib_2.0.0.xml'
    const testLib210SchemaFile = 'tests/otherTestData/HED_testlib_2.1.0.xml'
    const testLib300SchemaFile = 'tests/otherTestData/HED_testlib_3.0.0.xml'
    let specs1, specs2, specs3

    beforeAll(() => {
      const spec200 = new SchemaSpec('testlib', '2.0.0', 'testlib', testLib200SchemaFile)
      const spec210 = new SchemaSpec('testlib', '2.1.0', 'testlib', testLib210SchemaFile)
      const spec300 = new SchemaSpec('testlib', '3.0.0', 'testlib', testLib300SchemaFile)
      specs1 = new SchemasSpec().addSchemaSpec(spec200).addSchemaSpec(spec210)
      specs2 = new SchemasSpec().addSchemaSpec(spec200).addSchemaSpec(spec300)
      specs3 = new SchemasSpec().addSchemaSpec(spec210).addSchemaSpec(spec300)
    })

    it('should fail when trying to merge incompatible schemas', async () => {
      try {
        await buildSchemas(specs1)
        assert.fail('Incompatible schemas testlib_2.0.0 and testlib_2.1.0 were incorrectly merged without an error')
      } catch (issueError) {
        const issue = issueError.issue
        assert.deepStrictEqual(issue, generateIssue('lazyPartneredSchemasShareTag', { tag: 'A-nonextension' }))
      }

      try {
        await buildSchemas(specs3)
        assert.fail('Incompatible schemas testlib_2.1.0 and testlib_3.0.0 were incorrectly merged without an error')
      } catch (issueError) {
        const issue = issueError.issue
        assert.deepStrictEqual(issue, generateIssue('lazyPartneredSchemasShareTag', { tag: 'Piano-sound' }))
      }

      const schemas = await buildSchemas(specs2)
      assert.instanceOf(
        schemas.getSchema('testlib'),
        PartneredSchema,
        'Parsed testlib schema (combined 2.0.0 and 3.0.0) is not an instance of PartneredSchema',
      )
    })
  })

  describe('Schema parsing and building functions', () => {
    describe('buildSchemasFromVersion', () => {
      it('should build schemas from a single version string', async () => {
        const versionString = '8.0.0'
        const schemas = await buildSchemasFromVersion(versionString)

        assert.isNotNull(schemas, 'Schemas should not be null')
        assert.strictEqual(schemas.baseSchema.version, '8.0.0', 'Schema version should match')
        assert.strictEqual(schemas.baseSchema.library, '', 'Base schema should have empty library')
      })

      it('should build schemas from a library version string', async () => {
        const versionString = 'testlib_2.0.0'
        const schemas = await buildSchemasFromVersion(versionString)

        assert.isNotNull(schemas, 'Schemas should not be null')
        assert.strictEqual(schemas.baseSchema.version, '2.0.0', 'Schema version should match')
        assert.strictEqual(schemas.baseSchema.library, 'testlib', 'Schema library should match')
      })

      it('should build schemas from comma-separated version strings', async () => {
        const versionString = '8.2.0, testlib_2.0.0'
        const schemas = await buildSchemasFromVersion(versionString)

        assert.isNotNull(schemas, 'Schemas should not be null')
        // Should have multiple schemas available
        assert.isNotNull(schemas.baseSchema, 'Should have a base schema')
      })

      it('should build schemas from comma-separated version strings with spaces', async () => {
        const versionString = '  8.2.0  ,  testlib_2.0.0  '
        const schemas = await buildSchemasFromVersion(versionString)

        assert.isNotNull(schemas, 'Schemas should not be null')
        assert.instanceOf(schemas.baseSchema, PartneredSchema)
        assert.strictEqual(schemas.baseSchema.withStandard, '8.2.0')
      })

      it('should build schemas from multiple partnered schemas', async () => {
        const versionString = '8.4.0, lang_1.1.0, score_2.1.0'
        const schemas = await buildSchemasFromVersion(versionString)

        assert.isNotNull(schemas, 'Schemas should not be null')
        assert.instanceOf(schemas.baseSchema, PartneredSchema)
        assert.strictEqual(schemas.baseSchema.withStandard, '8.4.0')
        assert.strictEqual(schemas.baseSchema.entries.tags._definitions.size, 1994)
      })

      it('should handle version strings with prefix', async () => {
        const versionString = 'nick:8.0.0'
        const schemas = await buildSchemasFromVersion(versionString)
        assert.isNotNull(schemas, 'Schemas should not be null')
        assert.strictEqual(schemas.schemas.get('nick').version, '8.0.0', 'Schema version should match')
      })

      it('should throw error for invalid version specification', async () => {
        const invalidVersionString = 'invalid_version_format'

        try {
          await buildSchemasFromVersion(invalidVersionString)
          assert.fail('Should have thrown an error for invalid version')
        } catch (error) {
          assert.instanceOf(error, IssueError)
          assert.strictEqual(error.issue.internalCode, 'invalidSchemaSpecification')
        }
      })

      it('should throw error for empty version string', async () => {
        try {
          await buildSchemasFromVersion('')
          assert.fail('Should have thrown an error for empty version')
        } catch (error) {
          assert.instanceOf(error, IssueError)
          assert.strictEqual(error.issue.internalCode, 'missingSchemaSpecification')
        }
      })
    })

    describe('SchemaSpec.parseVersionSpec', () => {
      it('should parse a simple version specification', () => {
        const spec = SchemaSpec.parseVersionSpec('8.0.0')

        assert.strictEqual(spec.prefix, '', 'Prefix should be empty')
        assert.strictEqual(spec.version, '8.0.0', 'Version should match')
        assert.strictEqual(spec.library, '', 'Library should be empty')
      })

      it('should parse a library version specification', () => {
        const spec = SchemaSpec.parseVersionSpec('testlib_2.0.0')

        assert.strictEqual(spec.prefix, '', 'Prefix should be empty')
        assert.strictEqual(spec.version, '2.0.0', 'Version should match')
        assert.strictEqual(spec.library, 'testlib', 'Library should match')
      })

      it('should parse a specification with prefix', () => {
        const spec = SchemaSpec.parseVersionSpec('nick:8.0.0')

        assert.strictEqual(spec.prefix, 'nick', 'Prefix should match')
        assert.strictEqual(spec.version, '8.0.0', 'Version should match')
        assert.strictEqual(spec.library, '', 'Library should be empty')
      })

      it('should parse a specification with prefix and library', () => {
        const spec = SchemaSpec.parseVersionSpec('nick:testlib_2.0.0')

        assert.strictEqual(spec.prefix, 'nick', 'Prefix should match')
        assert.strictEqual(spec.version, '2.0.0', 'Version should match')
        assert.strictEqual(spec.library, 'testlib', 'Library should match')
      })

      it('should throw IssueError for invalid version format', async () => {
        try {
          await buildSchemasFromVersion('invalid_version')
          assert.fail('Should have thrown an error for empty version')
        } catch (error) {
          assert.instanceOf(error, IssueError)
          assert.strictEqual(error.issue.internalCode, 'invalidSchemaSpecification')
        }
      })

      it('should throw IssueError for too many colons', async () => {
        try {
          await SchemaSpec.parseVersionSpec('nick:more:colons:8.0.0')
        } catch (error) {
          assert.instanceOf(error, IssueError)
          assert.strictEqual(error.issue.internalCode, 'invalidSchemaSpecification')
        }
      })

      it('should throw IssueError for too many underscores', async () => {
        try {
          await SchemaSpec.parseVersionSpec('lib_more_underscores_8.0.0')
        } catch (error) {
          assert.instanceOf(error, IssueError)
          assert.strictEqual(error.issue.internalCode, 'invalidSchemaSpecification')
        }
      })

      it('should throw error for non-alphabetic prefix', async () => {
        try {
          await SchemaSpec.parseVersionSpec('nick123:8.0.0')
        } catch (error) {
          assert.instanceOf(error, IssueError)
          assert.strictEqual(error.issue.internalCode, 'invalidSchemaSpecification')
        }
      })

      it('should throw IssueError for non-alphabetic library name', async () => {
        try {
          await SchemaSpec.parseVersionSpec('lib123_8.0.0')
        } catch (error) {
          assert.instanceOf(error, IssueError)
          assert.strictEqual(error.issue.internalCode, 'invalidSchemaSpecification')
        }
      })
    })

    describe('SchemasSpec.parseVersionSpecs', () => {
      it('should parse a single schema specification string', () => {
        const specsObj = SchemasSpec.parseVersionSpecs('8.0.0')

        assert.instanceOf(specsObj, SchemasSpec, 'Should return SchemasSpec instance')
        assert.strictEqual(specsObj.data.size, 1, 'Should contain one prefix entry')
        const specs = specsObj.data.get('')
        assert.isArray(specs, 'Should have array of specs for empty prefix')
        assert.lengthOf(specs, 1, 'Should contain one spec')
        assert.strictEqual(specs[0].version, '8.0.0', 'Version should match')
      })

      it('should parse an array of schema specification strings', () => {
        const specsObj = SchemasSpec.parseVersionSpecs(['8.0.0', 'testlib_2.0.0'])

        assert.instanceOf(specsObj, SchemasSpec, 'Should return SchemasSpec instance')
        assert.strictEqual(specsObj.data.size, 1, 'Should contain one prefix entry (both have empty prefix)')
        const specs = specsObj.data.get('')
        assert.lengthOf(specs, 2, 'Should contain two specs')
        assert.strictEqual(specs[0].version, '8.0.0', 'First version should match')
        assert.strictEqual(specs[1].version, '2.0.0', 'Second version should match')
        assert.strictEqual(specs[1].library, 'testlib', 'Second library should match')
      })

      it('should handle mixed specification formats with different prefixes', () => {
        const specsObj = SchemasSpec.parseVersionSpecs(['nick:8.0.0', 'testlib_2.0.0', 'other:8.1.0'])

        assert.strictEqual(specsObj.data.size, 3, 'Should contain three prefix entries')

        const nickSpecs = specsObj.data.get('nick')
        assert.lengthOf(nickSpecs, 1, 'Should have one spec for nick prefix')
        assert.strictEqual(nickSpecs[0].prefix, 'nick', 'Nick prefix should match')
        assert.strictEqual(nickSpecs[0].version, '8.0.0', 'Nick version should match')

        const emptySpecs = specsObj.data.get('')
        assert.lengthOf(emptySpecs, 1, 'Should have one spec for empty prefix')
        assert.strictEqual(emptySpecs[0].library, 'testlib', 'Library should match')

        const otherSpecs = specsObj.data.get('other')
        assert.lengthOf(otherSpecs, 1, 'Should have one spec for other prefix')
        assert.strictEqual(otherSpecs[0].version, '8.1.0', 'Other version should match')
      })
    })

    describe.skip('buildSchemasSpec', () => {
      it('should build schemas spec from BidsJsonFile with HEDVersion', () => {
        const jsonData = { HEDVersion: '8.0.0' }
        const bidsFile = new BidsJsonFile('test', { path: 'test.json' }, jsonData)

        const specsObj = buildSchemasSpec(bidsFile)

        assert.isNotNull(specsObj, 'Should return schemas spec object')
        assert.instanceOf(specsObj, SchemasSpec, 'Should return SchemasSpec instance')
        assert.strictEqual(specsObj.data.size, 1, 'Should contain one prefix entry')
        const specs = specsObj.data.get('')
        assert.lengthOf(specs, 1, 'Should contain one spec')
        assert.strictEqual(specs[0].version, '8.0.0', 'Version should match')
      })

      it('should build schemas spec from BidsJsonFile with array HEDVersion', () => {
        const jsonData = { HEDVersion: ['8.0.0', 'testlib_2.0.0'] }
        const bidsFile = new BidsJsonFile('test', { path: 'test.json' }, jsonData)

        const specsObj = buildSchemasSpec(bidsFile)

        assert.isNotNull(specsObj, 'Should return schemas spec object')
        const specs = specsObj.data.get('')
        assert.lengthOf(specs, 2, 'Should contain two specs')
      })

      it('should return null for BidsJsonFile without HEDVersion', () => {
        const jsonData = { otherField: 'value' }
        const bidsFile = new BidsJsonFile('test', { path: 'test.json' }, jsonData)

        const specsObj = buildSchemasSpec(bidsFile)

        assert.isNull(specsObj, 'Should return null when no HEDVersion')
      })

      it('should return null for BidsJsonFile with null jsonData', () => {
        const bidsFile = new BidsJsonFile('test', { path: 'test.json' }, null)

        const specsObj = buildSchemasSpec(bidsFile)

        assert.isNull(specsObj, 'Should return null when jsonData is null')
      })

      it('should return null for BidsJsonFile with undefined jsonData', () => {
        const bidsFile = new BidsJsonFile('test', { path: 'test.json' }, undefined)

        const specsObj = buildSchemasSpec(bidsFile)

        assert.isNull(specsObj, 'Should return null when jsonData is undefined')
      })
    })
  })
})
