const assert = require('chai').assert
const converterGenerateIssue = require('../converter/issues')
const { generateIssue } = require('../utils/issues/issues')
const {
  BidsDataset,
  BidsEventFile,
  BidsHedIssue,
  BidsSidecar,
  validateBidsDataset,
} = require('../validator/bids')

describe('BIDS datasets', () => {
  const sidecars = [
    // sub01 - Valid sidecars
    [
      {
        color: {
          HED: {
            red: 'RGB-red',
            green: 'RGB-green',
            blue: 'RGB-blue',
          },
        },
      },
      {
        vehicle: {
          HED: {
            car: 'Car',
            train: 'Train',
            boat: 'Boat',
          },
        },
        speed: {
          HED: 'Speed/# mph',
        },
      },
      {
        duration: {
          HED: 'Duration/# s',
        },
        age: {
          HED: 'Age/#',
        },
      },
    ],
    // sub02 - Invalid sidecars
    [
      {
        vehicle: {
          HED: {
            car: 'Car',
            train: 'Train',
            boat: 'Boat',
            maglev: 'Train/Maglev', // Extension.
          },
        },
      },
      {
        emotion: {
          HED: {
            happy: 'Happy',
            sad: 'Sad',
            angry: 'Angry',
            confused: 'Confused', // Not in schema.
          },
        },
      },
    ],
    // sub03 - Placeholders
    [
      {
        valid_definition: {
          HED: { definition: '(Definition/ValidDefinition, (Square))' },
        },
      },
      {
        valid_placeholder_definition: {
          HED: {
            definition:
              '(Definition/ValidPlaceholderDefinition/#, (RGB-red/#))',
          },
        },
      },
      {
        valid_value_and_definition: {
          HED: 'Duration/# ms, (Definition/ValidValueAndDefinition/#, (Age/#))',
        },
      },
      {
        invalid_definition_group: {
          HED: { definition: '(Definition/InvalidDefinitionGroup, (Age/#))' },
        },
      },
      {
        invalid_definition_tag: {
          HED: { definition: '(Definition/InvalidDefinitionTag/#, (Age))' },
        },
      },
      {
        multiple_placeholders_in_group: {
          HED: {
            definition:
              '(Definition/MultiplePlaceholdersInGroupDefinition/#, (Age/#, Duration/# s))',
          },
        },
      },
      {
        multiple_value_tags: {
          HED: 'Duration/# s, RGB-blue/#',
        },
      },
      {
        no_value_tags: {
          HED: 'Sad',
        },
      },
      {
        value_in_categorical: {
          HED: {
            purple: 'Purple',
            yellow: 'Yellow',
            orange: 'Orange',
            green: 'RGB-green/#',
          },
        },
      },
    ],
  ]
  const hedColumnOnlyHeader = ['onset', 'duration', 'HED']
  const bidsTsvFiles = [
    [
      new BidsEventFile(
        '/sub01/sub01_task-test_run-1_events.tsv',
        [],
        {},
        {
          headers: hedColumnOnlyHeader,
          rows: [hedColumnOnlyHeader, ['7', 'something', 'Cellphone']],
        },
        {
          relativePath: '/sub01/sub01_task-test_run-1_events.tsv',
          path: '/sub01/sub01_task-test_run-1_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub01/sub01_task-test_run-2_events.tsv',
        [],
        {},
        {
          headers: hedColumnOnlyHeader,
          rows: [
            hedColumnOnlyHeader,
            ['7', 'something', 'Cellphone'],
            ['11', 'else', 'Desktop-computer'],
          ],
        },
        {
          relativePath: '/sub01/sub01_task-test_run-2_events.tsv',
          path: '/sub01/sub01_task-test_run-2_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub01/sub01_task-test_run-3_events.tsv',
        [],
        {},
        {
          headers: hedColumnOnlyHeader,
          rows: [hedColumnOnlyHeader, ['7', 'something', 'Ceramic, Pink']],
        },
        {
          relativePath: '/sub01/sub01_task-test_run-3_events.tsv',
          path: '/sub01/sub01_task-test_run-3_events.tsv',
        },
      ),
    ],
    [
      new BidsEventFile(
        '/sub02/sub02_task-test_run-1_events.tsv',
        [],
        {},
        {
          headers: hedColumnOnlyHeader,
          rows: [hedColumnOnlyHeader, ['11', 'else', 'Speed/300 miles']],
        },
        {
          relativePath: '/sub02/sub02_task-test_run-1_events.tsv',
          path: '/sub02/sub02_task-test_run-1_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub02/sub02_task-test_run-2_events.tsv',
        [],
        {},
        {
          headers: hedColumnOnlyHeader,
          rows: [hedColumnOnlyHeader, ['7', 'something', 'Train/Maglev']],
        },
        {
          relativePath: '/sub01/sub01_task-test_run-2_events.tsv',
          path: '/sub01/sub01_task-test_run-2_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub02/sub02_task-test_run-3_events.tsv',
        [],
        {},
        {
          headers: hedColumnOnlyHeader,
          rows: [
            hedColumnOnlyHeader,
            ['7', 'something', 'Train'],
            ['11', 'else', 'Speed/300 miles'],
          ],
        },
        {
          relativePath: '/sub02/sub02_task-test_run-3_events.tsv',
          path: '/sub02/sub02_task-test_run-3_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub02/sub02_task-test_run-4_events.tsv',
        [],
        {},
        {
          headers: hedColumnOnlyHeader,
          rows: [
            hedColumnOnlyHeader,
            ['7', 'something', 'Maglev'],
            ['11', 'else', 'Speed/300 miles'],
          ],
        },
        {
          relativePath: '/sub02/sub02_task-test_run-4_events.tsv',
          path: '/sub02/sub02_task-test_run-4_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub02/sub02_task-test_run-5_events.tsv',
        [],
        {},
        {
          headers: hedColumnOnlyHeader,
          rows: [
            hedColumnOnlyHeader,
            ['7', 'something', 'Train/Maglev'],
            ['11', 'else', 'Speed/300 miles'],
          ],
        },
        {
          relativePath: '/sub02/sub02_task-test_run-5_events.tsv',
          path: '/sub02/sub02_task-test_run-5_events.tsv',
        },
      ),
    ],
  ]
  /**
   * @type {object[][]}
   */
  let bidsSidecars

  beforeAll(() => {
    bidsSidecars = sidecars.map((sub_data, sub) => {
      return sub_data.map((run_data, run) => {
        const name = `/sub0${sub + 1}/sub0${sub + 1}_task-test_run-${
          run + 1
        }_events.json`
        return new BidsSidecar(name, run_data, {
          relativePath: name,
          path: name,
        })
      })
    })
  })

  /**
   * Validate the test datasets.
   * @param {object<string,BidsDataset>} testDatasets The datasets to test with.
   * @param {object<string,BidsIssue[]>} expectedIssues The expected issues.
   * @param {object} versionSpec The schema version to test with.
   * @return {Promise}
   */
  const validator = (testDatasets, expectedIssues, versionSpec) => {
    return Promise.all(
      Object.entries(testDatasets).map(([datasetName, dataset]) => {
        return validateBidsDataset(dataset, versionSpec).then((issues) => {
          assert.sameDeepMembers(
            issues,
            expectedIssues[datasetName],
            datasetName,
          )
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
        warning_and_good: new BidsDataset(
          [],
          goodDatasets.concat([bidsSidecars[1][0]]),
        ),
        error_and_good: new BidsDataset(
          [],
          goodDatasets.concat([bidsSidecars[1][1]]),
        ),
      }
      const expectedIssues = {
        single: [],
        all_good: [],
        warning_and_good: [
          new BidsHedIssue(
            generateIssue('extension', { tag: 'Train/Maglev' }),
            bidsSidecars[1][0].file,
          ),
        ],
        error_and_good: [
          new BidsHedIssue(
            converterGenerateIssue('invalidTag', 'Confused', {}, [0, 8]),
            bidsSidecars[1][1].file,
          ),
        ],
      }
      return validator(testDatasets, expectedIssues, { version: '8.0.0' })
    })

    it('should validate placeholders in BIDS sidecars', () => {
      const placeholderDatasets = bidsSidecars[2]
      const testDatasets = {
        placeholders: new BidsDataset([], placeholderDatasets),
      }
      const expectedIssues = {
        placeholders: [
          new BidsHedIssue(
            generateIssue('invalidPlaceholderInDefinition', {
              definition: 'InvalidDefinitionGroup',
            }),
            bidsSidecars[2][3].file,
          ),
          new BidsHedIssue(
            generateIssue('invalidPlaceholderInDefinition', {
              definition: 'InvalidDefinitionTag',
            }),
            bidsSidecars[2][4].file,
          ),
          new BidsHedIssue(
            generateIssue('invalidPlaceholderInDefinition', {
              definition: 'MultiplePlaceholdersInGroupDefinition',
            }),
            bidsSidecars[2][5].file,
          ),
          new BidsHedIssue(
            generateIssue('invalidPlaceholder', { tag: 'Duration/# s' }),
            bidsSidecars[2][6].file,
          ),
          new BidsHedIssue(
            generateIssue('invalidPlaceholder', { tag: 'RGB-blue/#' }),
            bidsSidecars[2][6].file,
          ),
          new BidsHedIssue(
            generateIssue('missingPlaceholder', { string: 'Sad' }),
            bidsSidecars[2][7].file,
          ),
          new BidsHedIssue(
            generateIssue('invalidPlaceholder', { tag: 'RGB-green/#' }),
            bidsSidecars[2][8].file,
          ),
        ],
      }
      return validator(testDatasets, expectedIssues, { version: '8.0.0' })
    })
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
      const maglevError = converterGenerateIssue(
        'invalidTag',
        'Maglev',
        {},
        [0, 6],
      )
      const maglevWarning = generateIssue('extension', { tag: 'Train/Maglev' })
      const expectedIssues = {
        all_good: [],
        all_bad: [
          new BidsHedIssue(speedIssue, badDatasets[0].file),
          new BidsHedIssue(maglevWarning, badDatasets[1].file),
          new BidsHedIssue(speedIssue, badDatasets[2].file),
          new BidsHedIssue(speedIssue, badDatasets[3].file),
          new BidsHedIssue(maglevError, badDatasets[3].file),
          new BidsHedIssue(speedIssue, badDatasets[4].file),
          new BidsHedIssue(maglevWarning, badDatasets[4].file),
        ],
      }
      return validator(testDatasets, expectedIssues, { version: '8.0.0' })
    })
  })

  /*  it('should throw an issue if the HED column in a single row contains invalid HED data in the form of duplicate tags', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\tHED\n' +
          '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Category/Miscellaneous/Test,Event/Description/Test\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {},
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.strictEqual(issues.length, 2)
      assert.strictEqual(issues[0].code, 104)
      assert.strictEqual(issues[1].code, 104)
    })
  })

  it('should not throw any issues if the HED column in a single row contains valid HED data', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\tHED\n' +
          '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {},
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.deepStrictEqual(issues, [])
    })
  })

  it('should not throw any issues if the HED column in a single row contains valid HED data in multiple levels', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\tHED\n' +
          '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test,Item/Object/Vehicle/Train,(Item/Object/Vehicle/Train,Event/Category/Experimental stimulus)\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {},
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.deepStrictEqual(issues, [])
    })
  })

  it('should not throw any issues if the HED column in multiple rows contains valid HED data', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\tHED\n' +
          '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test\n' +
          '8\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {},
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.deepStrictEqual(issues, [])
    })
  })

  it('should throw an issue if the HED columns in a single row, including sidecars, contain invalid HED data', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\tHED\tmycodes\n' +
          '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test\tfirst\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        mycodes: {
          HED: {
            first: 'Event/Category/Miscellaneous/Test',
            second: '/Action/Reach/To touch',
          },
        },
      },
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.strictEqual(issues.length, 2)
      assert.strictEqual(issues[0].code, 104)
      assert.strictEqual(issues[1].code, 104)
    })
  })

  it('should not throw any issues if the HED columns in a single row, including sidecars, contain valid HED data', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\tHED\tmycodes\n' +
          '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test\tsecond\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        mycodes: {
          HED: {
            first: 'Event/Category/Miscellaneous/Test',
            second: '/Action/Reach/To touch',
          },
        },
      },
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.deepStrictEqual(issues, [])
    })
  })

  it('should not throw any issues if the HED columns in multiple rows, including sidecars, contain valid HED data', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\tHED\tmycodes\n' +
          '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test\tsecond\n' +
          '7\tsomething\t/Action/Reach/To touch\tfirst\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        mycodes: {
          HED: {
            first:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            second: '/Action/Reach/To touch',
          },
        },
      },
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.deepStrictEqual(issues, [])
    })
  })

  it('should throw an issue if a single sidecar HED column in a single row contains invalid HED data', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents: 'onset\tduration\tmycodes\n' + '7\tsomething\tfirst\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        mycodes: {
          HED: {
            first:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            second:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
          },
        },
      },
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.strictEqual(issues.length, 2)
      assert.strictEqual(issues[0].code, 104)
      assert.strictEqual(issues[1].code, 104)
    })
  })

  it('should not throw any issues if a single sidecar HED column in a single row contains valid HED data', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents: 'onset\tduration\tmycodes\n' + '7\tsomething\tsecond\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        mycodes: {
          HED: {
            first:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            second:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
          },
        },
      },
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.deepStrictEqual(issues, [])
    })
  })

  it('should not throw any issues if a single sidecar HED column in multiple rows contains valid HED data', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\tmycodes\n' +
          '7\tsomething\tsecond\n' +
          '8\tsomething\tsecond',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        mycodes: {
          HED: {
            first:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            second:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
          },
        },
      },
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.deepStrictEqual(issues, [])
    })
  })

  it('should throw an issue if any sidecar HED columns in a single row contain invalid HED data', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\ttestingCodes\tmyCodes\n' +
          '7\tsomething\tfirst\tone\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        testingCodes: {
          HED: {
            first:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            second:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
          },
        },
        myCodes: {
          HED: {
            one: 'Event/Category/Miscellaneous/Test',
            two: '/Action/Reach/To touch',
          },
        },
      },
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.strictEqual(issues.length, 2)
      assert.strictEqual(issues[0].code, 104)
      assert.strictEqual(issues[1].code, 104)
    })
  })

  it('should not throw an issue if all sidecar HED columns in a single row contain valid HED data', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\ttestingCodes\tmyCodes\n' +
          '7\tsomething\tfirst\ttwo\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        testingCodes: {
          HED: {
            first:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            second:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
          },
        },
        myCodes: {
          HED: {
            one: 'Event/Category/Miscellaneous/Test',
            two: '/Action/Reach/To touch',
          },
        },
      },
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.deepStrictEqual(issues, [])
    })
  })

  it('should not throw an issue if all sidecar HED columns in multiple rows contain valid HED data', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\ttestingCodes\tmyCodes\n' +
          '7\tsomething\tfirst\ttwo\n' +
          '8\tsomething\tsecond\tone\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        testingCodes: {
          HED: {
            first:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            second:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
          },
        },
        myCodes: {
          HED: {
            one: '/Action/Reach/To touch',
            two: '/Action/Reach/To touch',
          },
        },
      },
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.deepStrictEqual(issues, [])
    })
  })

  it('should throw an issue if a sidecar HED column in a single row contains a non-existent key', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents: 'onset\tduration\tmycodes\n' + '7\tsomething\tthird\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        mycodes: {
          HED: {
            first: 'Event/Category/Experimental stimulus',
            second: '/Action/Reach/To touch',
          },
        },
      },
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.strictEqual(issues.length, 1)
      assert.strictEqual(issues[0].code, 108)
    })
  })

  it('should not throw an issue if all sidecar HED columns in a single row contain valid HED value data', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\ttestingCodes\tmyValue\n' +
          '7\tsomething\tfirst\t0.5\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        testingCodes: {
          HED: {
            first:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            second:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
          },
        },
        myValue: {
          HED: 'Attribute/Visual/Color/Red/#,Item/Object/Vehicle/Bicycle',
        },
      },
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.deepStrictEqual(issues, [])
    })
  })

  it('should not throw an issue if all sidecar HED columns in multiple rows contain valid HED value data', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\ttestingCodes\tmyValue\n' +
          '7\tsomething\tfirst\t0.5\n' +
          '8\tsomething\tsecond\t0.6\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        testingCodes: {
          HED: {
            first:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            second:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
          },
        },
        myCodes: {
          HED: 'Attribute/Visual/Color/Red/#,Item/Object/Vehicle/Bicycle',
        },
      },
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.deepStrictEqual(issues, [])
    })
  })

  it('should throw an issue if a sidecar HED value column has no number signs', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\ttestingCodes\tmyValue\n' +
          '7\tsomething\tfirst\tRed\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        testingCodes: {
          HED: {
            first:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            second:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
          },
        },
        myValue: {
          HED: 'Attribute/Visual/Color/Red,Item/Object/Vehicle/Bicycle',
        },
      },
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.strictEqual(issues.length, 1)
      assert.strictEqual(issues[0].code, 104)
    })
  })

  it('should throw an issue if a sidecar HED value column has too many number signs', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\ttestingCodes\tmyValue\n' +
          '7\tsomething\tfirst\t0.5\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        testingCodes: {
          HED: {
            first:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            second:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
          },
        },
        myValue: {
          HED: 'Attribute/Visual/Color/Red/#,Attribute/Visual/Color/Blue/#',
        },
      },
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.strictEqual(issues.length, 2)
      assert.strictEqual(issues[0].code, 104)
      assert.strictEqual(issues[1].code, 104)
    })
  })

  it('should throw an issue if a sidecar HED categorical column has any number signs', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\ttestingCodes\tmyValue\n' +
          '7\tsomething\tfirst\t0.5\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        testingCodes: {
          HED: {
            first:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test,Attribute/Visual/Color/Red/#',
            second:
              'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test,Attribute/Visual/Color/Blue/#',
          },
        },
        myValue: {
          HED: 'Attribute/Visual/Color/Green/#',
        },
      },
      '/dataset_description.json': { HEDVersion: '7.1.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.strictEqual(issues.length, 2)
      assert.strictEqual(issues[0].code, 104)
      assert.strictEqual(issues[1].code, 104)
    })
  })

  it('should not throw an issue if the HED string is valid in a previous remote schema version', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents:
          'onset\tduration\tHED\n' +
          '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test,Event/Duration/3 ms\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {},
      '/dataset_description.json': { HEDVersion: '7.0.5' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.deepStrictEqual(issues, [])
    })
  })

  it('should not throw an issue if the HED string is a valid short-form tag', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents: 'onset\tduration\tHED\n' + '7\tsomething\tDuration/3 ms\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {},
      '/dataset_description.json': { HEDVersion: '8.0.0-alpha.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.deepStrictEqual(issues, [])
    })
  })

  it('should not throw an issue if a sidecar HED string is a valid short-form tag', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents: 'onset\tduration\tmyCodes\n' + '7\tsomething\tone\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        myCodes: {
          HED: {
            one: 'Duration/3 ms',
          },
        },
      },
      '/dataset_description.json': { HEDVersion: '8.0.0-alpha.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.deepStrictEqual(issues, [])
    })
  })

  it('should throw an issue if the HED string contains an invalid short-form tag', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents: 'onset\tduration\tHED\n' + '7\tsomething\tDuration/5 cm\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {},
      '/dataset_description.json': { HEDVersion: '8.0.0-alpha.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.strictEqual(issues.length, 1)
      assert.strictEqual(issues[0].code, 104)
    })
  })

  it('should throw an issue if a sidecar HED string contains an invalid short-form tag', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents: 'onset\tduration\tmyCodes\n' + '7\tsomething\tone\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        myCodes: {
          HED: {
            one: 'Duration/5 cm',
          },
        },
      },
      '/dataset_description.json': { HEDVersion: '8.0.0-alpha.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.strictEqual(issues.length, 1)
      assert.strictEqual(issues[0].code, 104)
    })
  })

  it('properly distinguish errors from warnings in HED strings', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents: 'onset\tduration\tHED\n' + '7\tsomething\tHuman/Driver\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {},
      '/dataset_description.json': { HEDVersion: '8.0.0-alpha.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.strictEqual(issues.length, 1)
      assert.strictEqual(issues[0].code, 105)
    })
  })

  it('properly distinguish errors from warnings in sidecar HED strings', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents: 'onset\tduration\tmyCodes\n' + '7\tsomething\tone\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_events.json': {
        myCodes: {
          HED: {
            one: 'Human/Driver',
          },
        },
      },
      '/dataset_description.json': { HEDVersion: '8.0.0-alpha.1' },
    }

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.strictEqual(issues.length, 1)
      assert.strictEqual(issues[0].code, 105)
    })
  })*/
})
