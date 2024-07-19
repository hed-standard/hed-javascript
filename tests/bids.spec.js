import chai from 'chai'
const assert = chai.assert
import cloneDeep from 'lodash/cloneDeep'

import converterGenerateIssue from '../converter/issues'
import { generateIssue } from '../common/issues/issues'
import { SchemaSpec, SchemasSpec } from '../common/schema/types'
import { buildBidsSchemas, parseSchemasSpec } from '../bids/schema'
import { BidsDataset, BidsHedIssue, BidsIssue, validateBidsDataset } from '../bids'
import { bidsDatasetDescriptions, bidsSidecars, bidsTsvFiles } from './bids.spec.data'
import { parseHedString } from '../parser/main'
import { BidsHedTsvParser } from '../bids/validator/bidsHedTsvValidator'

describe('BIDS datasets', () => {
  /**
   * @type {SchemasSpec}
   */
  let specs
  /**
   * @type {SchemasSpec}
   */
  let specs2

  beforeAll(() => {
    const spec1 = new SchemaSpec('', '8.0.0')
    specs = new SchemasSpec().addSchemaSpec(spec1)
    const spec2 = new SchemaSpec('', '7.2.0')
    specs2 = new SchemasSpec().addSchemaSpec(spec2)
  })

  /**
   * Validate the test datasets.
   * @param {Object<string,BidsDataset>} testDatasets The datasets to test with.
   * @param {Object<string,BidsIssue[]>} expectedIssues The expected issues.
   * @param {SchemasSpec} versionSpec The schema version to test with.
   * @returns {Promise}
   */
  const validator = (testDatasets, expectedIssues, versionSpec) => {
    return Promise.all(
      Object.entries(testDatasets).map(([datasetName, dataset]) => {
        assert.property(expectedIssues, datasetName, datasetName + ' is not in expectedIssues')
        return validateBidsDataset(dataset, versionSpec).then((issues) => {
          assert.sameDeepMembers(issues, expectedIssues[datasetName], datasetName)
        })
      }),
    )
  }

  /**
   * Validate the test datasets.
   * @param {Object<string,BidsDataset>} testDatasets The datasets to test with.
   * @param {Object<string,BidsIssue[]>} expectedIssues The expected issues.
   * @param {SchemasSpec} versionSpecs The schema version to test with.
   * @returns {Promise}
   */
  const validatorWithSpecs = (testDatasets, expectedIssues, versionSpecs) => {
    return Promise.all(
      Object.entries(testDatasets).map(([datasetName, dataset]) => {
        assert.property(expectedIssues, datasetName, datasetName + ' is not in expectedIssues')
        let specs = versionSpecs
        if (versionSpecs) {
          assert.property(versionSpecs, datasetName, datasetName + ' is not in versionSpecs')
          specs = versionSpecs[datasetName]
        }
        return validateBidsDataset(dataset, specs).then((issues) => {
          assert.sameDeepMembers(issues, expectedIssues[datasetName], datasetName)
        })
      }),
    )
  }

  describe('Sidecar-only datasets', () => {
    it('should validate non-placeholder HED strings in BIDS sidecars', () => {
      const goodDatasets = bidsSidecars[0]
      const testDatasets = {
        single: new BidsDataset([], [bidsSidecars[0][0]]),
        all_good: new BidsDataset([], goodDatasets),
        warning_and_good: new BidsDataset([], goodDatasets.concat([bidsSidecars[1][0]])),
        error_and_good: new BidsDataset([], goodDatasets.concat([bidsSidecars[1][1]])),
      }
      const expectedIssues = {
        single: [],
        all_good: [],
        warning_and_good: [
          BidsHedIssue.fromHedIssue(
            generateIssue('extension', { tag: 'Train/Maglev', sidecarKey: 'transport' }),
            bidsSidecars[1][0].file,
          ),
        ],
        error_and_good: [
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidTag', { tag: 'Confused', bounds: [0, 8] }),
            bidsSidecars[1][1].file,
          ),
        ],
      }
      return validator(testDatasets, expectedIssues, specs)
    }, 10000)

    it('should validate placeholders in BIDS sidecars', () => {
      const placeholderDatasets = bidsSidecars[2]
      const testDatasets = {
        placeholders: new BidsDataset([], placeholderDatasets),
      }
      const expectedIssues = {
        placeholders: [
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidPlaceholderInDefinition', {
              definition: 'InvalidDefinitionGroup',
              sidecarKey: 'invalid_definition_group',
            }),
            placeholderDatasets[2].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidPlaceholderInDefinition', {
              definition: 'InvalidDefinitionTag',
              sidecarKey: 'invalid_definition_tag',
            }),
            placeholderDatasets[3].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidPlaceholderInDefinition', {
              definition: 'MultiplePlaceholdersInGroupDefinition',
              sidecarKey: 'multiple_placeholders_in_group',
            }),
            placeholderDatasets[4].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidPlaceholder', { tag: 'Duration/# s', sidecarKey: 'multiple_value_tags' }),
            placeholderDatasets[5].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidPlaceholder', { tag: 'RGB-blue/#', sidecarKey: 'multiple_value_tags' }),
            placeholderDatasets[5].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('missingPlaceholder', { string: 'Sad', sidecarKey: 'no_value_tags' }),
            placeholderDatasets[6].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidPlaceholder', { tag: 'RGB-green/#', sidecarKey: 'value_in_categorical' }),
            placeholderDatasets[7].file,
          ),
        ],
      }
      return validator(testDatasets, expectedIssues, specs)
    }, 10000)
  })

  describe('TSV-only datasets', () => {
    it('should validate HED strings in BIDS event files', () => {
      const goodDatasets = bidsTsvFiles[0]
      const badDatasets = bidsTsvFiles[1]
      const testDatasets = {
        all_good: new BidsDataset(goodDatasets, []),
        all_bad: new BidsDataset(badDatasets, []),
      }
      const legalSpeedUnits = ['m-per-s', 'kph', 'mph']
      const speedIssue = generateIssue('unitClassInvalidUnit', {
        tag: 'Speed/300 miles',
        unitClassUnits: legalSpeedUnits.sort().join(','),
      })
      const converterMaglevError = generateIssue('invalidTag', { tag: 'Maglev', bounds: [0, 6] })
      const maglevError = generateIssue('invalidTag', { tag: 'Maglev' })
      const maglevWarning = generateIssue('extension', { tag: 'Train/Maglev' })
      const expectedIssues = {
        all_good: [],
        all_bad: [
          BidsHedIssue.fromHedIssue(cloneDeep(speedIssue), badDatasets[0].file, { tsvLine: 2 }),
          BidsHedIssue.fromHedIssue(cloneDeep(maglevWarning), badDatasets[1].file, { tsvLine: 2 }),
          BidsHedIssue.fromHedIssue(cloneDeep(speedIssue), badDatasets[2].file, { tsvLine: 3 }),
          BidsHedIssue.fromHedIssue(converterMaglevError, badDatasets[3].file, { tsvLine: 2 }),
          BidsHedIssue.fromHedIssue(cloneDeep(maglevError), badDatasets[3].file, { tsvLine: 2 }),
          BidsHedIssue.fromHedIssue(cloneDeep(speedIssue), badDatasets[3].file, { tsvLine: 3 }),
          BidsHedIssue.fromHedIssue(cloneDeep(maglevWarning), badDatasets[4].file, { tsvLine: 2 }),
          BidsHedIssue.fromHedIssue(cloneDeep(speedIssue), badDatasets[4].file, { tsvLine: 3 }),
        ],
      }
      return validator(testDatasets, expectedIssues, specs)
    }, 10000)
  })

  describe('Combined datasets', () => {
    it('should validate BIDS event files combined with JSON sidecar data', () => {
      const goodDatasets = bidsTsvFiles[2]
      const badDatasets = bidsTsvFiles[3]
      const testDatasets = {
        all_good: new BidsDataset(goodDatasets, []),
        all_bad: new BidsDataset(badDatasets, []),
      }
      const expectedIssues = {
        all_good: [],
        all_bad: [
          // BidsHedIssue.fromHedIssue(generateIssue('invalidTag', { tag: 'Confused' }), badDatasets[0].file),
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidTag', { tag: 'Confused', bounds: [0, 8] }),
            badDatasets[0].file,
          ),
          // TODO: Catch warning in sidecar validation
          /* BidsHedIssue.fromHedIssue(
            generateIssue('extension', { tag: 'Train/Maglev' }),
            badDatasets[1].file,
          ), */
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', {
              tag: 'Boat',
            }),
            badDatasets[2].file,
            { tsvLine: 5 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', {
              tag: 'Boat',
            }),
            badDatasets[2].file,
            { tsvLine: 5 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidValue', {
              tag: 'Duration/ferry s',
            }),
            badDatasets[3].file,
            { tsvLine: 2 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', {
              tag: 'Age/30',
            }),
            badDatasets[3].file,
            { tsvLine: 2 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', {
              tag: 'Age/30',
            }),
            badDatasets[3].file,
            { tsvLine: 2 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('sidecarKeyMissing', {
              key: 'purple',
              column: 'color',
              file: '/sub04/sub04_task-test_run-5_events.tsv',
            }),
            badDatasets[4].file,
            { tsvLine: 2 },
          ),
        ],
      }
      return validator(testDatasets, expectedIssues, specs)
    }, 10000)
  })

  describe('HED 3 library schema tests', () => {
    let goodEvents
    let goodDatasetDescriptions, badDatasetDescriptions

    beforeAll(() => {
      goodEvents = bidsTsvFiles[5]
      goodDatasetDescriptions = bidsDatasetDescriptions[0]
      badDatasetDescriptions = bidsDatasetDescriptions[1]
    })

    describe('HED 3 library schema good tests', () => {
      it('should validate HED 3 in BIDS event with json and a dataset description and no version spec', () => {
        const testDatasets = {
          basestd_with_std_no_defs: new BidsDataset([goodEvents[2]], [], goodDatasetDescriptions[0]),
          basestd_with_std_and_libtestlib_nodefs: new BidsDataset([goodEvents[2]], [], goodDatasetDescriptions[1]),
          basestd_with_std_and_two_libtestlibs_nodefs: new BidsDataset([goodEvents[2]], [], goodDatasetDescriptions[3]),
          libtestlib_with_basestd_and_libtestlib_nodefs: new BidsDataset(
            [goodEvents[1]],
            [],
            goodDatasetDescriptions[1],
          ),
          libtestlib_with_basestd_and_two_libtestlibs_nodefs: new BidsDataset(
            [goodEvents[1]],
            [],
            goodDatasetDescriptions[3],
          ),
          libtestlib_with_two_libtestlibs_nodefs: new BidsDataset([goodEvents[1]], [], goodDatasetDescriptions[4]),
          basestd_libtestlib_with_basestd_and_libtestlib_defs: new BidsDataset(
            [goodEvents[0]],
            [],
            goodDatasetDescriptions[1],
          ),
          basestd_libtestlib_with_basestd_and_two_libtestlib_defs: new BidsDataset(
            [goodEvents[0]],
            [],
            goodDatasetDescriptions[3],
          ),
          basescore_with_basescore_no_defs: new BidsDataset([goodEvents[3]], [], goodDatasetDescriptions[5]),
          libscore_with_libscore_nodefs: new BidsDataset([goodEvents[4]], [], goodDatasetDescriptions[6]),
          basetestlib_with_basetestlib_with_defs: new BidsDataset([goodEvents[5]], [], goodDatasetDescriptions[7]),
          libtestlib_with_basestd_and_libtestlib_with_defs: new BidsDataset(
            [goodEvents[6]],
            [],
            goodDatasetDescriptions[1],
          ),
          libtestlib_with_libtestlib_with_defs: new BidsDataset([goodEvents[6]], [], goodDatasetDescriptions[2]),
          libtestlib_with_basestd_and_two_libtestlib_with_defs: new BidsDataset(
            [goodEvents[6]],
            [],
            goodDatasetDescriptions[3],
          ),
          libtestlib_with_two_libtestlib_with_defs: new BidsDataset([goodEvents[6]], [], goodDatasetDescriptions[4]),
        }
        const expectedIssues = {
          basestd_with_std_no_defs: [],
          basestd_with_std_and_libtestlib_nodefs: [],
          basestd_with_std_and_two_libtestlibs_nodefs: [],
          libtestlib_with_basestd_and_libtestlib_nodefs: [],
          libtestlib_with_basestd_and_two_libtestlibs_nodefs: [],
          libtestlib_with_two_libtestlibs_nodefs: [],
          basestd_libtestlib_with_basestd_and_libtestlib_defs: [],
          basestd_libtestlib_with_basestd_and_two_libtestlib_defs: [],
          basescore_with_basescore_no_defs: [],
          libscore_with_libscore_nodefs: [],
          basetestlib_with_basetestlib_with_defs: [],
          libtestlib_with_basestd_and_libtestlib_with_defs: [],
          libtestlib_with_libtestlib_with_defs: [],
          libtestlib_with_basestd_and_two_libtestlib_with_defs: [],
          libtestlib_with_two_libtestlib_with_defs: [],
        }
        return validator(testDatasets, expectedIssues, null)
      }, 10000)
    })

    describe('HED 3 library schema bad tests', () => {
      it('should not validate when library schema specifications are invalid', () => {
        const testDatasets = {
          unknown_library: new BidsDataset([goodEvents[2]], [], badDatasetDescriptions[0]),
          leading_colon: new BidsDataset([goodEvents[2]], [], badDatasetDescriptions[1]),
          bad_nickname: new BidsDataset([goodEvents[2]], [], badDatasetDescriptions[2]),
          multipleColons1: new BidsDataset([goodEvents[2]], [], badDatasetDescriptions[3]),
          multipleColons2: new BidsDataset([goodEvents[2]], [], badDatasetDescriptions[4]),
          noLibraryName: new BidsDataset([goodEvents[2]], [], badDatasetDescriptions[5]),
          badVersion1: new BidsDataset([goodEvents[2]], [], badDatasetDescriptions[6]),
          badVersion2: new BidsDataset([goodEvents[2]], [], badDatasetDescriptions[7]),
          badRemote1: new BidsDataset([goodEvents[2]], [], badDatasetDescriptions[8]),
          badRemote2: new BidsDataset([goodEvents[2]], [], badDatasetDescriptions[9]),
          noHedVersion: new BidsDataset([goodEvents[2]], [], badDatasetDescriptions[10]),
        }

        const expectedIssues = {
          unknown_library: [
            BidsHedIssue.fromHedIssue(
              generateIssue('remoteSchemaLoadFailed', {
                spec: JSON.stringify(new SchemaSpec('ts', '1.0.2', 'badlib')),
                error:
                  'Server responded to https://raw.githubusercontent.com/hed-standard/hed-schemas/main/library_schemas/badlib/hedxml/HED_badlib_1.0.2.xml with status code 404: Not Found',
              }),
              badDatasetDescriptions[0].file,
            ),
          ],
          leading_colon: [
            BidsHedIssue.fromHedIssue(
              generateIssue('invalidSchemaNickname', { nickname: '', spec: ':testlib_1.0.2' }),
              badDatasetDescriptions[1].file,
            ),
          ],
          bad_nickname: [
            BidsHedIssue.fromHedIssue(
              generateIssue('invalidSchemaNickname', { nickname: 't-s', spec: 't-s:testlib_1.0.2' }),
              badDatasetDescriptions[2].file,
            ),
          ],
          multipleColons1: [
            BidsHedIssue.fromHedIssue(
              generateIssue('invalidSchemaSpecification', { spec: 'ts::testlib_1.0.2' }),
              badDatasetDescriptions[3].file,
            ),
          ],
          multipleColons2: [
            BidsHedIssue.fromHedIssue(
              generateIssue('invalidSchemaSpecification', { spec: ':ts:testlib_1.0.2' }),
              badDatasetDescriptions[4].file,
            ),
          ],
          noLibraryName: [
            BidsHedIssue.fromHedIssue(
              generateIssue('invalidSchemaSpecification', { spec: 'ts:_1.0.2' }),
              badDatasetDescriptions[5].file,
            ),
          ],
          badVersion1: [
            BidsHedIssue.fromHedIssue(
              generateIssue('invalidSchemaSpecification', { spec: 'ts:testlib1.0.2' }),
              badDatasetDescriptions[6].file,
            ),
          ],
          badVersion2: [
            BidsHedIssue.fromHedIssue(
              generateIssue('invalidSchemaSpecification', { spec: 'ts:testlib_1.a.2' }),
              badDatasetDescriptions[7].file,
            ),
          ],
          badRemote1: [
            BidsHedIssue.fromHedIssue(
              generateIssue('remoteSchemaLoadFailed', {
                spec: JSON.stringify(new SchemaSpec('ts', '1.800.2', 'testlib')),
                error:
                  'Server responded to https://raw.githubusercontent.com/hed-standard/hed-schemas/main/library_schemas/testlib/hedxml/HED_testlib_1.800.2.xml with status code 404: Not Found',
              }),
              badDatasetDescriptions[8].file,
            ),
          ],
          badRemote2: [
            BidsHedIssue.fromHedIssue(
              generateIssue('remoteSchemaLoadFailed', {
                spec: JSON.stringify(new SchemaSpec('', '8.828.0', '')),
                error:
                  'Server responded to https://raw.githubusercontent.com/hed-standard/hed-schemas/main/standard_schema/hedxml/HED8.828.0.xml with status code 404: Not Found',
              }),
              badDatasetDescriptions[9].file,
            ),
          ],
          noHedVersion: [
            BidsHedIssue.fromHedIssue(generateIssue('missingSchemaSpecification', {}), badDatasetDescriptions[10].file),
          ],
        }
        return validator(testDatasets, expectedIssues, null)
      }, 10000)
    })

    describe('HED 3 library schema with version spec', () => {
      it('should validate HED 3 in BIDS event files sidecars and libraries using version spec', () => {
        const specs0 = parseSchemasSpec(['8.1.0'])
        const specs1 = parseSchemasSpec(['8.1.0', 'ts:testlib_1.0.2'])
        const specs2 = parseSchemasSpec(['ts:testlib_1.0.2'])
        const specs3 = parseSchemasSpec(['8.1.0', 'ts:testlib_1.0.2', 'bg:testlib_1.0.2'])
        const specs4 = parseSchemasSpec(['ts:testlib_1.0.2', 'bg:testlib_1.0.2'])
        const testDatasets1 = {
          library_and_defs_base_ignored: new BidsDataset([goodEvents[0]], [], goodDatasetDescriptions[1]),
          library_and_defs_no_base: new BidsDataset([goodEvents[0]], [], goodDatasetDescriptions[3]),
          library_only_with_extra_base: new BidsDataset([goodEvents[1]], [], goodDatasetDescriptions[1]),
          library_only: new BidsDataset([goodEvents[1]], [], goodDatasetDescriptions[1]),
          just_base2: new BidsDataset([goodEvents[2]], [], goodDatasetDescriptions[0]),
          library_not_needed1: new BidsDataset([goodEvents[2]], [], goodDatasetDescriptions[1]),
          library_not_needed2: new BidsDataset([goodEvents[2]], [], goodDatasetDescriptions[3]),
          library_and_base_with_extra_schema: new BidsDataset([goodEvents[0]], [], goodDatasetDescriptions[1]),
        }
        const expectedIssues1 = {
          library_and_defs_base_ignored: [],
          library_and_defs_no_base: [],
          library_only_with_extra_base: [],
          library_only: [],
          just_base2: [],
          library_not_needed1: [],
          library_not_needed2: [],
          library_and_base_with_extra_schema: [],
        }
        const schemaSpecs = {
          library_and_defs_base_ignored: specs1,
          library_and_defs_no_base: specs3,
          library_only_with_extra_base: specs1,
          library_only: specs1,
          just_base2: specs0,
          library_not_needed1: specs1,
          library_not_needed2: specs3,
          library_and_base_with_extra_schema: specs1,
        }
        return validatorWithSpecs(testDatasets1, expectedIssues1, schemaSpecs)
      }, 10000)
    })
  })

  describe('Definition context', () => {
    it('should validate the BIDS context of HED definitions', () => {
      const badTsvDatasets = bidsTsvFiles[6]
      const defSidecars = bidsSidecars[5]
      const testDatasets = {
        bad_tsv: new BidsDataset(badTsvDatasets, []),
        sidecars: new BidsDataset([], defSidecars),
      }
      const expectedIssues = {
        bad_tsv: [
          BidsHedIssue.fromHedIssue(
            generateIssue('illegalDefinitionContext', { string: '(Definition/myDef, (Label/Red, Green))', tsvLine: 2 }),
            badTsvDatasets[0].file,
          ),
        ],
        sidecars: [
          BidsHedIssue.fromHedIssue(
            generateIssue('illegalDefinitionContext', {
              string: bidsSidecars[5][2].hedData.get('event_code'),
              sidecarKey: 'event_code',
            }),
            defSidecars[2].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('missingPlaceholder', {
              string: bidsSidecars[5][2].hedData.get('event_code'),
              sidecarKey: 'event_code',
            }),
            defSidecars[2].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('illegalDefinitionInExclusiveContext', {
              string: 'Red, Blue, (Definition/myDef, (Label/Red, Blue))',
              sidecarKey: 'event_code',
            }),
            defSidecars[3].file,
          ),
          /* TODO: Fix cross-string exclusive context tests.
           BidsHedIssue.fromHedIssue(
            generateIssue('illegalDefinitionInExclusiveContext', { string: 'Def/Acc/5.4 m-per-s^2' }),
            defSidecars[3].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('illegalDefinitionInExclusiveContext', { string: 'Def/Acc/4.5 m-per-s^2' }),
            defSidecars[4].file,
          ), */
        ],
      }
      return validator(testDatasets, expectedIssues, specs)
    }, 10000)
  })

  describe('Curly braces', () => {
    it('should validate the use of HED curly braces in BIDS data', () => {
      const standaloneTsvFiles = bidsTsvFiles[7]
      const standaloneSidecars = bidsSidecars[6]
      const combinedDatasets = bidsTsvFiles[8]
      const hedColumnDatasets = bidsTsvFiles[9]
      const syntaxSidecars = bidsSidecars[8].slice(0, 1)
      const testDatasets = {
        tsv: new BidsDataset(standaloneTsvFiles, []),
        sidecars: new BidsDataset([], standaloneSidecars),
        combined: new BidsDataset(combinedDatasets, []),
        hedColumn: new BidsDataset(hedColumnDatasets, []),
        syntax: new BidsDataset([], syntaxSidecars),
      }
      const expectedIssues = {
        tsv: [
          BidsHedIssue.fromHedIssue(
            generateIssue('curlyBracesInHedColumn', { column: '{response_time}' }),
            standaloneTsvFiles[1].file,
            { tsvLine: 2 },
          ),
        ],
        sidecars: [
          BidsHedIssue.fromHedIssue(
            generateIssue('curlyBracesInDefinition', {
              definition: 'Acc/#',
              column: 'event_code',
              sidecarKey: 'defs',
            }),
            standaloneSidecars[1].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('curlyBracesInDefinition', {
              definition: 'MyColor',
              column: 'response_time',
              sidecarKey: 'defs',
            }),
            standaloneSidecars[1].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('recursiveCurlyBracesWithKey', {
              column: 'response_time',
              referrer: 'event_code',
            }),
            standaloneSidecars[6].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('recursiveCurlyBracesWithKey', {
              column: 'event_code',
              referrer: 'response_time',
            }),
            standaloneSidecars[6].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('recursiveCurlyBracesWithKey', {
              column: 'event_type',
              referrer: 'event_code',
            }),
            standaloneSidecars[7].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('recursiveCurlyBracesWithKey', {
              column: 'response_time',
              referrer: 'event_type',
            }),
            standaloneSidecars[7].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('recursiveCurlyBracesWithKey', {
              column: 'response_time',
              referrer: 'event_code',
            }),
            standaloneSidecars[7].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('recursiveCurlyBracesWithKey', {
              column: 'response_time',
              referrer: 'response_time',
            }),
            standaloneSidecars[8].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('unclosedCurlyBrace', {
              index: 15,
              string: standaloneSidecars[9].hedData.get('event_code').ball,
            }),
            standaloneSidecars[9].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('nestedCurlyBrace', {
              index: 1,
              string: standaloneSidecars[9].hedData.get('event_code2').ball,
            }),
            standaloneSidecars[9].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('unopenedCurlyBrace', {
              index: 15,
              string: standaloneSidecars[9].hedData.get('event_code3').ball,
            }),
            standaloneSidecars[9].file,
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('emptyCurlyBrace', {
              string: standaloneSidecars[9].hedData.get('event_code4').ball,
            }),
            standaloneSidecars[9].file,
          ),
        ],
        combined: [
          BidsHedIssue.fromHedIssue(
            generateIssue('undefinedCurlyBraces', {
              column: 'response_time',
            }),
            combinedDatasets[0].file,
            { tsvLine: 3 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('undefinedCurlyBraces', {
              column: 'response_time',
            }),
            combinedDatasets[1].file,
            { tsvLine: 3 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', {
              tag: 'Label/1',
            }),
            combinedDatasets[2].file,
            { tsvLine: 3 },
          ),
          BidsHedIssue.fromHedIssue(
            generateIssue('duplicateTag', {
              tag: 'Label/1',
            }),
            combinedDatasets[2].file,
            { tsvLine: 3 },
          ),
        ],
        hedColumn: [
          BidsHedIssue.fromHedIssue(
            generateIssue('curlyBracesInHedColumn', { column: '{response_time}' }),
            hedColumnDatasets[0].file,
            { tsvLine: 2 },
          ),
        ],
        syntax: [
          BidsHedIssue.fromHedIssue(
            generateIssue('invalidCharacter', {
              character: '{',
              index: 9,
              string: '(Def/Acc/{response_time})',
            }),
            syntaxSidecars[0].file,
          ),
        ],
      }
      return validator(testDatasets, expectedIssues, specs)
    }, 10000)

    it('should splice strings by replacing placeholders and deleting "n/a" values', () => {
      const tsvFiles = bidsTsvFiles[10]
      const expectedStrings = [
        'Label/1, (Def/Acc/3.5 m-per-s^2), (Item-count/2, Label/1)',
        '(Def/Acc/3.5 m-per-s^2)',
        '(Def/Acc/3.5 m-per-s^2), (Green, Def/MyColor)',
        'Label/1, (Def/Acc/3.5 m-per-s^2)',
        '(Def/Acc/3.5 m-per-s^2)',
        '(Red, Blue), (Green, (Yellow))',
      ]
      const dataset = new BidsDataset(tsvFiles, [])
      return buildBidsSchemas(dataset, specs).then((hedSchemas) => {
        const parsedExpectedStrings = []
        for (const expectedString of expectedStrings) {
          const [parsedExpectedString, parsingIssues] = parseHedString(expectedString, hedSchemas)
          assert.isEmpty(Object.values(parsingIssues).flat(), `String "${expectedString}" failed to parse`)
          parsedExpectedStrings.push(parsedExpectedString)
        }
        const tsvHedStrings = []
        for (const tsvFile of tsvFiles) {
          tsvFile.mergedSidecar.parseHedStrings(hedSchemas)
          const tsvValidator = new BidsHedTsvParser(tsvFile, hedSchemas)
          const tsvHed = tsvValidator.parse()
          assert.isEmpty(tsvValidator.issues, 'TSV file failed to parse')
          tsvHedStrings.push(...tsvHed)
        }
        const formatMap = (hedString) => hedString.format()
        assert.deepStrictEqual(
          tsvHedStrings.map(formatMap),
          parsedExpectedStrings.map(formatMap),
          'Mismatch in parsed strings',
        )
      })
    }, 10000)
  })

  describe('HED 3 partnered schema tests', () => {
    let goodEvent
    let goodDatasetDescriptions, badDatasetDescriptions

    beforeAll(() => {
      goodEvent = bidsTsvFiles[11][0]
      goodDatasetDescriptions = bidsDatasetDescriptions[0]
      badDatasetDescriptions = bidsDatasetDescriptions[1]
    })

    it('should validate HED 3 in BIDS event TSV files with JSON sidecar data using tags from merged partnered schemas', () => {
      const testDatasets = {
        validPartneredTestlib: new BidsDataset([goodEvent], [], goodDatasetDescriptions[8]),
        validPartneredTestlibWithStandard: new BidsDataset([goodEvent], [], goodDatasetDescriptions[9]),
        invalidPartneredTestlib1: new BidsDataset([goodEvent], [], badDatasetDescriptions[11]),
        invalidPartneredTestlib2: new BidsDataset([goodEvent], [], badDatasetDescriptions[12]),
        invalidPartneredTestlibWithStandard: new BidsDataset([goodEvent], [], badDatasetDescriptions[13]),
      }
      const expectedIssues = {
        validPartneredTestlib: [],
        validPartneredTestlibWithStandard: [],
        invalidPartneredTestlib1: [
          BidsHedIssue.fromHedIssue(
            generateIssue('lazyPartneredSchemasShareTag', { tag: 'A-nonextension' }),
            badDatasetDescriptions[11].file,
          ),
        ],
        invalidPartneredTestlib2: [
          BidsHedIssue.fromHedIssue(
            generateIssue('lazyPartneredSchemasShareTag', { tag: 'Piano-sound' }),
            badDatasetDescriptions[12].file,
          ),
        ],
        invalidPartneredTestlibWithStandard: [
          BidsHedIssue.fromHedIssue(
            generateIssue('differentWithStandard', { first: '8.1.0', second: '8.2.0' }),
            badDatasetDescriptions[13].file,
          ),
        ],
      }
      return validator(testDatasets, expectedIssues, null)
    }, 10000)
  })
})
