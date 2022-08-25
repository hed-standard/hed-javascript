const assert = require('chai').assert
const converterGenerateIssue = require('../converter/issues')
const { generateIssue } = require('../common/issues/issues')
const { SchemaSpec, SchemasSpec } = require('../common/schema/types')
const { recursiveMap } = require('../utils/array')
const { parseSchemasSpec } = require('../validator/bids/schema')
const {
  BidsDataset,
  BidsEventFile,
  BidsHedIssue,
  BidsJsonFile,
  BidsIssue,
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
        transport: {
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
            definition: '(Definition/ValidPlaceholderDefinition/#, (RGB-red/#))',
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
            definition: '(Definition/MultiplePlaceholdersInGroupDefinition/#, (Age/#, Duration/# s))',
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
    // sub04 - HED 2 sidecars
    [
      {
        test: {
          HED: {
            first: 'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
          },
        },
      },
    ],
    // sub05 - HED 3 sidecars with libraries
    [
      {
        // Library and base and defs
        event_type: {
          HED: {
            show_face: 'Sensory-event, ts:Visual-presentation',
            left_press: 'Press, Def/My-def1, ts:Def/My-def2/3',
          },
        },
        dummy_defs: {
          HED: {
            def1: '(Definition/My-def1, (Red, Blue))',
            def2: '(ts:Definition/My-def2/#, (Green, Label/#))',
          },
        },
      },
      {
        // Just library no defs
        event_type: {
          HED: {
            show_face: 'ts:Sensory-event, ts:Visual-presentation',
            left_press: 'ts:Push-button',
          },
        },
      },
      {
        // Just base
        event_type: {
          HED: {
            show_face: 'Sensory-event, Visual-presentation',
            left_press: 'Push-button',
          },
        },
      },
      {
        // Just score as base
        event_type: {
          HED: {
            show_face: 'Manual-eye-closure, Drowsiness',
            left_press: 'Wicket-spikes, Frequency',
          },
        },
      },
      {
        // Just score as a library
        event_type: {
          HED: {
            show_face: 'sc:Manual-eye-closure, sc:Drowsiness',
            left_press: 'sc:Wicket-spikes, sc:Frequency',
          },
        },
      },
      {
        // Testlib with Defs as base
        event_type: {
          HED: {
            show_face: 'Sensory-event, Visual-presentation',
            left_press: 'Press, Def/My-def1, Def/My-def2/3',
          },
        },
        dummy_defs: {
          HED: {
            def1: '(Definition/My-def1, (Red, Blue))',
            def2: '(Definition/My-def2/#, (Green, Label/#))',
          },
        },
      },
      {
        // Testlib with defs with as library
        event_type: {
          HED: {
            show_face: 'ts:Sensory-event, ts:Visual-presentation',
            left_press: 'ts:Press, ts:Def/My-def1, ts:Def/My-def2/3',
          },
        },
        dummy_defs: {
          HED: {
            def1: '(ts:Definition/My-def1, (ts:Red, ts:Blue))',
            def2: '(ts:Definition/My-def2/#, (ts:Green, ts:Label/#))',
          },
        },
      },
    ],
  ]

  const hedColumnOnlyHeader = ['onset', 'duration', 'HED']
  const bidsTsvFiles = [
    // sub01 - Valid TSV-only data
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
          rows: [hedColumnOnlyHeader, ['7', 'something', 'Cellphone'], ['11', 'else', 'Desktop-computer']],
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
    // sub02 - Invalid TSV-only data
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
          relativePath: '/sub02/sub02_task-test_run-2_events.tsv',
          path: '/sub02/sub02_task-test_run-2_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub02/sub02_task-test_run-3_events.tsv',
        [],
        {},
        {
          headers: hedColumnOnlyHeader,
          rows: [hedColumnOnlyHeader, ['7', 'something', 'Train'], ['11', 'else', 'Speed/300 miles']],
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
          rows: [hedColumnOnlyHeader, ['7', 'something', 'Maglev'], ['11', 'else', 'Speed/300 miles']],
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
          rows: [hedColumnOnlyHeader, ['7', 'something', 'Train/Maglev'], ['11', 'else', 'Speed/300 miles']],
        },
        {
          relativePath: '/sub02/sub02_task-test_run-5_events.tsv',
          path: '/sub02/sub02_task-test_run-5_events.tsv',
        },
      ),
    ],
    // sub03 - Valid combined sidecar/TSV data
    [
      new BidsEventFile(
        '/sub03/sub03_task-test_run-1_events.tsv',
        ['/sub03/sub03_task-test_run-1_events.json'],
        sidecars[2][0],
        {
          headers: ['onset', 'duration'],
          rows: [
            ['onset', 'duration'],
            ['7', 'something'],
          ],
        },
        {
          relativePath: '/sub03/sub03_task-test_run-1_events.tsv',
          path: '/sub03/sub03_task-test_run-1_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub03/sub03_task-test_run-2_events.tsv',
        ['/sub01/sub01_task-test_run-1_events.json'],
        sidecars[0][0],
        {
          headers: ['onset', 'duration', 'color'],
          rows: [
            ['onset', 'duration', 'color'],
            ['7', 'something', 'red'],
          ],
        },
        {
          relativePath: '/sub03/sub03_task-test_run-2_events.tsv',
          path: '/sub03/sub03_task-test_run-2_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub03/sub03_task-test_run-3_events.tsv',
        ['/sub01/sub01_task-test_run-2_events.json'],
        sidecars[0][1],
        {
          headers: ['onset', 'duration', 'speed'],
          rows: [
            ['onset', 'duration', 'speed'],
            ['7', 'something', '60'],
          ],
        },
        {
          relativePath: '/sub03/sub03_task-test_run-3_events.tsv',
          path: '/sub03/sub03_task-test_run-3_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub03/sub03_task-test_run-4_events.tsv',
        ['/sub03/sub03_task-test_run-1_events.json'],
        sidecars[2][0],
        {
          headers: hedColumnOnlyHeader,
          rows: [hedColumnOnlyHeader, ['7', 'something', 'Laptop-computer']],
        },
        {
          relativePath: '/sub03/sub03_task-test_run-4_events.tsv',
          path: '/sub03/sub03_task-test_run-4_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub03/sub03_task-test_run-5_events.tsv',
        ['/sub01/sub01_task-test_run-1_events.json'],
        sidecars[0][0],
        {
          headers: ['onset', 'duration', 'color', 'HED'],
          rows: [
            ['onset', 'duration', 'color', 'HED'],
            ['7', 'something', 'green', 'Laptop-computer'],
          ],
        },
        {
          relativePath: '/sub03/sub03_task-test_run-5_events.tsv',
          path: '/sub03/sub03_task-test_run-5_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub03/sub03_task-test_run-6_events.tsv',
        ['/sub01/sub01_task-test_run-1_events.json', '/sub01/sub01_task-test_run-2_events.json'],
        Object.assign({}, sidecars[0][0], sidecars[0][1]),
        {
          headers: ['onset', 'duration', 'color', 'vehicle', 'speed'],
          rows: [
            ['onset', 'duration', 'color', 'vehicle', 'speed'],
            ['7', 'something', 'blue', 'train', '150'],
          ],
        },
        {
          relativePath: '/sub03/sub03_task-test_run-6_events.tsv',
          path: '/sub03/sub03_task-test_run-6_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub03/sub03_task-test_run-7_events.tsv',
        ['/sub01/sub01_task-test_run-1_events.json', '/sub01/sub01_task-test_run-2_events.json'],
        Object.assign({}, sidecars[0][0], sidecars[0][1]),
        {
          headers: ['onset', 'duration', 'color', 'vehicle', 'speed'],
          rows: [
            ['onset', 'duration', 'color', 'vehicle', 'speed'],
            ['7', 'something', 'red', 'train', '150'],
            ['11', 'else', 'blue', 'boat', '15'],
            ['15', 'another', 'green', 'car', '70'],
          ],
        },
        {
          relativePath: '/sub03/sub03_task-test_run-7_events.tsv',
          path: '/sub03/sub03_task-test_run-7_events.tsv',
        },
      ),
    ],
    // sub04 - Invalid combined sidecar/TSV data
    [
      new BidsEventFile(
        '/sub04/sub04_task-test_run-1_events.tsv',
        ['/sub02/sub02_task-test_run-2_events.json'],
        sidecars[1][1],
        {
          headers: ['onset', 'duration', 'emotion', 'HED'],
          rows: [
            ['onset', 'duration', 'emotion', 'HED'],
            ['7', 'high', 'happy', 'Yellow'],
            ['11', 'low', 'sad', 'Blue'],
            ['15', 'mad', 'angry', 'Red'],
            ['19', 'huh', 'confused', 'Gray'],
          ],
        },
        {
          relativePath: '/sub04/sub04_task-test_run-1_events.tsv',
          path: '/sub04/sub04_task-test_run-1_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub04/sub04_task-test_run-2_events.tsv',
        ['/sub02/sub02_task-test_run-1_events.json'],
        sidecars[1][0],
        {
          headers: ['onset', 'duration', 'transport'],
          rows: [
            ['onset', 'duration', 'transport'],
            ['7', 'wet', 'boat'],
            ['11', 'steam', 'train'],
            ['15', 'tires', 'car'],
            ['19', 'speedy', 'maglev'],
          ],
        },
        {
          relativePath: '/sub04/sub04_task-test_run-2_events.tsv',
          path: '/sub04/sub04_task-test_run-2_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub04/sub04_task-test_run-3_events.tsv',
        ['/sub01/sub01_task-test_run-2_events.json', '/sub02/sub02_task-test_run-1_events.json'],
        Object.assign({}, sidecars[0][1], sidecars[1][0]),
        {
          headers: ['onset', 'duration', 'vehicle', 'transport', 'speed'],
          rows: [
            ['onset', 'duration', 'vehicle', 'transport', 'speed'],
            ['7', 'ferry', 'train', 'boat', '20'],
            ['11', 'autotrain', 'car', 'train', '79'],
            ['15', 'towing', 'boat', 'car', '30'],
            ['19', 'tugboat', 'boat', 'boat', '5'],
          ],
        },
        {
          relativePath: '/sub04/sub04_task-test_run-3_events.tsv',
          path: '/sub04/sub04_task-test_run-3_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub04/sub04_task-test_run-4_events.tsv',
        ['/sub01/sub01_task-test_run-3_events.json'],
        sidecars[0][2],
        {
          headers: ['onset', 'duration', 'age', 'HED'],
          rows: [
            ['onset', 'duration', 'age', 'HED'],
            ['7', 'ferry', '30', 'Age/30'],
          ],
        },
        {
          relativePath: '/sub04/sub04_task-test_run-4_events.tsv',
          path: '/sub04/sub04_task-test_run-4_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub04/sub04_task-test_run-5_events.tsv',
        ['/sub01/sub01_task-test_run-1_events.json'],
        sidecars[0][0],
        {
          headers: ['onset', 'duration', 'color'],
          rows: [
            ['onset', 'duration', 'color'],
            ['7', 'royal', 'purple'],
          ],
        },
        {
          relativePath: '/sub04/sub04_task-test_run-5_events.tsv',
          path: '/sub04/sub04_task-test_run-5_events.tsv',
        },
      ),
    ],
    // sub05 - Valid combined sidecar/TSV data from HED 2
    [
      new BidsEventFile(
        '/sub05/sub05_task-test_run-1_events.tsv',
        ['/sub05/sub05_task-test_run-1_events.json'],
        sidecars[3][0],
        {
          headers: ['onset', 'duration', 'test', 'HED'],
          rows: [
            ['onset', 'duration', 'test', 'HED'],
            ['7', 'something', 'first', 'Event/Duration/55 ms'],
          ],
        },
        {
          relativePath: '/sub05/sub05_task-test_run-1_events.tsv',
          path: '/sub05/sub05_task-test_run-1_events.tsv',
        },
      ),
    ],
    // sub06 - Valid combined sidecar/TSV data with library
    [
      new BidsEventFile(
        '/sub06/sub06_task-test_run-1_events.tsv',
        ['/sub06/sub06_task-test_run-1_events.json'],
        sidecars[4][0],
        {
          headers: ['onset', 'duration', 'event_type', 'size'],
          rows: [
            ['onset', 'duration', 'event_type', 'size'],
            ['7', 'n/a', 'show_face', '6'],
            ['7', 'n/a', 'left_press', '7'],
          ],
        },
        {
          relativePath: '/sub06/sub06_task-test_run-1_events.tsv',
          path: '/sub06/sub06_task-test_run-1_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub03/sub06_task-test_run-1_events.tsv',
        ['/sub03/sub06_task-test_run-1_events.json'],
        sidecars[4][1],
        {
          headers: ['onset', 'duration', 'event_type', 'size'],
          rows: [
            ['onset', 'duration', 'event_type', 'size'],
            ['7', 'n/a', 'show_face', '6'],
            ['7', 'n/a', 'left_press', '7'],
          ],
        },
        {
          relativePath: '/sub06/sub06_task-test_run-1_events.tsv',
          path: '/sub06/sub06_task-test_run-1_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub03/sub06_task-test_run-1_events.tsv',
        ['/sub03/sub06_task-test_run-1_events.json'],
        sidecars[4][2],
        {
          headers: ['onset', 'duration', 'event_type', 'size'],
          rows: [
            ['onset', 'duration', 'event_type', 'size'],
            ['7', 'n/a', 'show_face', '6'],
            ['7', 'n/a', 'left_press', '7'],
          ],
        },
        {
          relativePath: '/sub06/sub06_task-test_run-1_events.tsv',
          path: '/sub06/sub06_task-test_run-1_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub03/sub06_task-test_run-1_events.tsv',
        ['/sub03/sub06_task-test_run-1_events.json'],
        sidecars[4][3],
        {
          headers: ['onset', 'duration', 'event_type', 'size'],
          rows: [
            ['onset', 'duration', 'event_type', 'size'],
            ['7', 'n/a', 'show_face', '6'],
            ['7', 'n/a', 'left_press', '7'],
          ],
        },
        {
          relativePath: '/sub06/sub06_task-test_run-1_events.tsv',
          path: '/sub06/sub06_task-test_run-1_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub03/sub06_task-test_run-1_events.tsv',
        ['/sub03/sub06_task-test_run-1_events.json'],
        sidecars[4][4],
        {
          headers: ['onset', 'duration', 'event_type', 'size'],
          rows: [
            ['onset', 'duration', 'event_type', 'size'],
            ['7', 'n/a', 'show_face', '6'],
            ['7', 'n/a', 'left_press', '7'],
          ],
        },
        {
          relativePath: '/sub06/sub06_task-test_run-1_events.tsv',
          path: '/sub06/sub06_task-test_run-1_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub03/sub06_task-test_run-1_events.tsv',
        ['/sub03/sub06_task-test_run-1_events.json'],
        sidecars[4][5],
        {
          headers: ['onset', 'duration', 'event_type', 'size'],
          rows: [
            ['onset', 'duration', 'event_type', 'size'],
            ['7', 'n/a', 'show_face', '6'],
            ['7', 'n/a', 'left_press', '7'],
          ],
        },
        {
          relativePath: '/sub06/sub06_task-test_run-1_events.tsv',
          path: '/sub06/sub06_task-test_run-1_events.tsv',
        },
      ),
      new BidsEventFile(
        '/sub03/sub06_task-test_run-1_events.tsv',
        ['/sub03/sub06_task-test_run-1_events.json'],
        sidecars[4][6],
        {
          headers: ['onset', 'duration', 'event_type', 'size'],
          rows: [
            ['onset', 'duration', 'event_type', 'size'],
            ['7', 'n/a', 'show_face', '6'],
            ['7', 'n/a', 'left_press', '7'],
          ],
        },
        {
          relativePath: '/sub06/sub06_task-test_run-1_events.tsv',
          path: '/sub06/sub06_task-test_run-1_events.tsv',
        },
      ),
    ],
  ]

  const datasetDescriptions = [
    // Good datasetDescription.json files
    [
      { Name: 'OnlyBase', BIDSVersion: '1.7.0', HEDVersion: '8.1.0' },
      { Name: 'BaseAndTest', BIDSVersion: '1.7.0', HEDVersion: ['8.1.0', 'ts:testlib_1.0.2'] },
      { Name: 'OnlyTestAsLib', BIDSVersion: '1.7.0', HEDVersion: ['ts:testlib_1.0.2'] },
      { Name: 'BaseAndTwoTests', BIDSVersion: '1.7.0', HEDVersion: ['8.1.0', 'ts:testlib_1.0.2', 'bg:testlib_1.0.2'] },
      { Name: 'TwoTests', BIDSVersion: '1.7.0', HEDVersion: ['ts:testlib_1.0.2', 'bg:testlib_1.0.2'] },
      { Name: 'OnlyScoreAsBase', BIDSVersion: '1.7.0', HEDVersion: 'score_0.0.1' },
      { Name: 'OnlyScoreAsLib', BIDSVersion: '1.7.0', HEDVersion: 'sc:score_0.0.1' },
      { Name: 'OnlyTestAsBase', BIDSVersion: '1.7.0', HEDVersion: 'testlib_1.0.2' },
    ],
    [
      { Name: 'NonExistentLibrary', BIDSVersion: '1.7.0', HEDVersion: ['8.1.0', 'ts:badlib_1.0.2'] },
      { Name: 'LeadingColon', BIDSVersion: '1.7.0', HEDVersion: [':testlib_1.0.2', '8.1.0'] },
      { Name: 'BadNickName', BIDSVersion: '1.7.0', HEDVersion: ['8.1.0', 't-s:testlib_1.0.2'] },
      { Name: 'MultipleColons1', BIDSVersion: '1.7.0', HEDVersion: ['8.1.0', 'ts::testlib_1.0.2'] },
      { Name: 'MultipleColons2', BIDSVersion: '1.7.0', HEDVersion: ['8.1.0', ':ts:testlib_1.0.2'] },
      { Name: 'NoLibraryName', BIDSVersion: '1.7.0', HEDVersion: ['8.1.0', 'ts:_1.0.2'] },
      { Name: 'BadVersion1', BIDSVersion: '1.7.0', HEDVersion: ['8.1.0', 'ts:testlib1.0.2'] },
      { Name: 'BadVersion2', BIDSVersion: '1.7.0', HEDVersion: ['8.1.0', 'ts:testlib_1.a.2'] },
      { Name: 'BadRemote1', BIDSVersion: '1.7.0', HEDVersion: ['8.1.0', 'ts:testlib_1.800.2'] },
      { Name: 'BadRemote2', BIDSVersion: '1.7.0', HEDVersion: '8.828.0' },
    ],
  ]

  /**
   * @type {BidsSidecar[][]}
   */
  let bidsSidecars
  /**
   * @type {BidsJsonFile[][]}
   */
  let bidsDatasetDescriptions

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
    bidsSidecars = sidecars.map((subData, sub) => {
      return subData.map((runData, run) => {
        const name = `/sub0${sub + 1}/sub0${sub + 1}_task-test_run-${run + 1}_events.json`
        return new BidsSidecar(name, runData, {
          relativePath: name,
          path: name,
        })
      })
    })
    bidsDatasetDescriptions = recursiveMap((datasetDescriptionData) => {
      return new BidsJsonFile('/dataset_description.json', datasetDescriptionData, {
        relativePath: '/dataset_description.json',
        path: '/dataset_description.json',
      })
    }, datasetDescriptions)
  })

  // /**
  //  * Create a schema spec for .
  //  * @param {list} specList The datasets to test with.
  //  * @return {SchemasSpec}
  //  */
  // const getSchemaSpecs = (specList) =>{
  //   const specs = new SchemasSpec()
  //   for (let i=0; i < specList.length; i++) {
  //     const spec = specList[i]
  //     specs.addSchemaSpec(spec.nickname, spec)
  //   }
  //   return specs
  // }

  /**
   * Validate the test datasets.
   * @param {Object<string,BidsDataset>} testDatasets The datasets to test with.
   * @param {Object<string,BidsIssue[]>} expectedIssues The expected issues.
   * @param {SchemasSpec} versionSpec The schema version to test with.
   * @return {Promise}
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
   * @param {SchemasSpec} versionSpec The schema version to test with.
   * @return {Promise}
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
          new BidsHedIssue(generateIssue('extension', { tag: 'Train/Maglev' }), bidsSidecars[1][0].file),
        ],
        error_and_good: [
          // TODO: Duplication temporary
          new BidsHedIssue(converterGenerateIssue('invalidTag', 'Confused', {}, [0, 8]), bidsSidecars[1][1].file),
          new BidsHedIssue(generateIssue('invalidTag', { tag: 'Confused' }), bidsSidecars[1][1].file),
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
          new BidsHedIssue(generateIssue('invalidPlaceholder', { tag: 'Duration/# s' }), bidsSidecars[2][6].file),
          new BidsHedIssue(generateIssue('invalidPlaceholder', { tag: 'RGB-blue/#' }), bidsSidecars[2][6].file),
          new BidsHedIssue(generateIssue('missingPlaceholder', { string: 'Sad' }), bidsSidecars[2][7].file),
          new BidsHedIssue(generateIssue('invalidPlaceholder', { tag: 'RGB-green/#' }), bidsSidecars[2][8].file),
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
      const converterMaglevError = converterGenerateIssue('invalidTag', 'Maglev', {}, [0, 6])
      const maglevError = generateIssue('invalidTag', { tag: 'Maglev' })
      const maglevWarning = generateIssue('extension', { tag: 'Train/Maglev' })
      const expectedIssues = {
        all_good: [],
        all_bad: [
          new BidsHedIssue(speedIssue, badDatasets[0].file),
          new BidsHedIssue(maglevWarning, badDatasets[1].file),
          new BidsHedIssue(speedIssue, badDatasets[2].file),
          new BidsHedIssue(speedIssue, badDatasets[3].file),
          new BidsHedIssue(maglevError, badDatasets[3].file),
          new BidsHedIssue(converterMaglevError, badDatasets[3].file),
          new BidsHedIssue(speedIssue, badDatasets[4].file),
          new BidsHedIssue(maglevWarning, badDatasets[4].file),
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
          new BidsHedIssue(generateIssue('invalidTag', { tag: 'Confused' }), badDatasets[0].file),
          new BidsHedIssue(converterGenerateIssue('invalidTag', 'Confused', {}, [0, 8]), badDatasets[0].file),
          new BidsHedIssue(converterGenerateIssue('invalidTag', 'Gray,Confused', {}, [5, 13]), badDatasets[0].file),
          // TODO: Catch warning in sidecar validation
          /* new BidsHedIssue(
            generateIssue('extension', { tag: 'Train/Maglev' }),
            badDatasets[1].file,
          ), */
          new BidsHedIssue(
            generateIssue('duplicateTag', {
              tag: 'Boat',
              bounds: [0, 4],
            }),
            badDatasets[2].file,
          ),
          new BidsHedIssue(
            generateIssue('duplicateTag', {
              tag: 'Boat',
              bounds: [17, 21],
            }),
            badDatasets[2].file,
          ),
          new BidsHedIssue(
            generateIssue('invalidValue', {
              tag: 'Duration/ferry s',
            }),
            badDatasets[3].file,
          ),
          new BidsHedIssue(
            generateIssue('duplicateTag', {
              tag: 'Age/30',
              bounds: [0, 6],
            }),
            badDatasets[3].file,
          ),
          new BidsHedIssue(
            generateIssue('duplicateTag', {
              tag: 'Age/30',
              bounds: [24, 30],
            }),
            badDatasets[3].file,
          ),
          new BidsIssue(108, badDatasets[4].file, 'purple'),
        ],
      }
      return validator(testDatasets, expectedIssues, specs)
    }, 10000)
  })

  describe('HED 2 combined datasets', () => {
    it('should validate HED 2 data in BIDS event files combined with JSON sidecar data', () => {
      const goodDatasets = bidsTsvFiles[4]
      const testDatasets = {
        all_good: new BidsDataset(goodDatasets, []),
      }
      const expectedIssues = {
        all_good: [],
      }
      return validator(testDatasets, expectedIssues, specs2)
    }, 10000)
  })

  describe('HED 3 library schema tests', () => {
    let goodEvents0, goodEvents1, goodEvents2
    let goodDatasetDescriptions, badDatasetDescriptions

    beforeAll(() => {
      goodEvents0 = [bidsTsvFiles[5][0]]
      goodEvents1 = [bidsTsvFiles[5][1]]
      goodEvents2 = [bidsTsvFiles[5][2]]
      goodDatasetDescriptions = bidsDatasetDescriptions[0]
      badDatasetDescriptions = bidsDatasetDescriptions[1]
    })

    describe('HED 3 library schema good tests', () => {
      it('should validate HED 3 in BIDS event with json and a dataset description and no version spec', () => {
        const testDatasets = {
          just_base: new BidsDataset(goodEvents2, [], goodDatasetDescriptions[0]),
          just_base2: new BidsDataset(goodEvents2, [], goodDatasetDescriptions[1]),
          just_base3: new BidsDataset(goodEvents2, [], goodDatasetDescriptions[3]),
          just_library: new BidsDataset(goodEvents1, [], goodDatasetDescriptions[1]),
          just_library2: new BidsDataset(goodEvents1, [], goodDatasetDescriptions[3]),
          //just_library3: new BidsDataset(goodEvents1, [], goodDatasetDescriptions[4]),
        }
        const expectedIssues = {
          just_base: [],
          just_base2: [],
          just_base3: [],
          just_library: [],
          just_library2: [],
          //just_library3: [],
        }
        return validator(testDatasets, expectedIssues, null)
      }, 10000)

      it('should validate HED 3 in BIDS event files sidecars and libraries using dataset descriptions', () => {
        const testDatasets1 = {
          library_and_defs_base_ignored: new BidsDataset(goodEvents0, [], goodDatasetDescriptions[1]),
          library_and_defs_no_base: new BidsDataset(goodEvents0, [], goodDatasetDescriptions[3]),
          library_only_with_extra_base: new BidsDataset(goodEvents1, [], goodDatasetDescriptions[1]),
          library_only: new BidsDataset(goodEvents1, [], goodDatasetDescriptions[1]),
          just_base2: new BidsDataset(goodEvents2, [], goodDatasetDescriptions[0]),
          library_not_needed1: new BidsDataset(goodEvents2, [], goodDatasetDescriptions[1]),
          library_not_needed2: new BidsDataset(goodEvents2, [], goodDatasetDescriptions[3]),
          library_and_base_with_extra_schema: new BidsDataset(goodEvents2, [], goodDatasetDescriptions[3]),
        }
        const expectedIssues1 = {
          library_and_defs_base_ignored: [],
          library_and_defs_no_base: [],
          library_only_with_extra_base: [],
          library_only: [],
          library_only_extra_schema: [],
          only_libraries: [],
          just_base2: [],
          library_not_needed1: [],
          library_not_needed2: [],
          library_and_base_with_extra_schema: [],
        }
        return validator(testDatasets1, expectedIssues1, null)
      }, 10000)
    })

    describe('HED 3 library schema bad tests', () => {
      it('should not validate when library schema specifications are invalid', () => {
        const testDatasets = {
          unknown_library: new BidsDataset(goodEvents2, [], badDatasetDescriptions[0]),
          leading_colon: new BidsDataset(goodEvents2, [], badDatasetDescriptions[1]),
          bad_nickname: new BidsDataset(goodEvents2, [], badDatasetDescriptions[2]),
          multipleColons1: new BidsDataset(goodEvents2, [], badDatasetDescriptions[3]),
          multipleColons2: new BidsDataset(goodEvents2, [], badDatasetDescriptions[4]),
          noLibraryName: new BidsDataset(goodEvents2, [], badDatasetDescriptions[5]),
          badVersion1: new BidsDataset(goodEvents2, [], badDatasetDescriptions[6]),
          badVersion2: new BidsDataset(goodEvents2, [], badDatasetDescriptions[7]),
          badRemote1: new BidsDataset(goodEvents2, [], badDatasetDescriptions[8]),
          badRemote2: new BidsDataset(goodEvents2, [], badDatasetDescriptions[9]),
        }

        const expectedIssues = {
          unknown_library: [
            new BidsHedIssue(
              generateIssue('remoteSchemaLoadFailed', {
                spec: JSON.stringify(new SchemaSpec('ts', '1.0.2', 'badlib')),
                error:
                  'Server responded to https://raw.githubusercontent.com/hed-standard/hed-schema-library/main/library_schemas/badlib/hedxml/HED_badlib_1.0.2.xml with status code 404:\n404: Not Found',
              }),
              badDatasetDescriptions[0].file,
            ),
          ],
          leading_colon: [
            new BidsHedIssue(
              generateIssue('invalidSchemaNickname', { nickname: '', spec: ':testlib_1.0.2' }),
              badDatasetDescriptions[1].file,
            ),
          ],
          bad_nickname: [
            new BidsHedIssue(
              generateIssue('invalidSchemaNickname', { nickname: 't-s', spec: 't-s:testlib_1.0.2' }),
              badDatasetDescriptions[2].file,
            ),
          ],
          multipleColons1: [
            new BidsHedIssue(
              generateIssue('invalidSchemaSpecification', { spec: 'ts::testlib_1.0.2' }),
              badDatasetDescriptions[3].file,
            ),
          ],
          multipleColons2: [
            new BidsHedIssue(
              generateIssue('invalidSchemaSpecification', { spec: ':ts:testlib_1.0.2' }),
              badDatasetDescriptions[4].file,
            ),
          ],
          noLibraryName: [
            new BidsHedIssue(
              generateIssue('invalidSchemaSpecification', { spec: 'ts:_1.0.2' }),
              badDatasetDescriptions[5].file,
            ),
          ],
          badVersion1: [
            new BidsHedIssue(
              generateIssue('invalidSchemaSpecification', { spec: 'ts:testlib1.0.2' }),
              badDatasetDescriptions[6].file,
            ),
          ],
          badVersion2: [
            new BidsHedIssue(
              generateIssue('invalidSchemaSpecification', { spec: 'ts:testlib_1.a.2' }),
              badDatasetDescriptions[7].file,
            ),
          ],
          badRemote1: [
            new BidsHedIssue(
              generateIssue('remoteSchemaLoadFailed', {
                spec: JSON.stringify(new SchemaSpec('ts', '1.800.2', 'testlib')),
                error:
                  'Server responded to https://raw.githubusercontent.com/hed-standard/hed-schema-library/main/library_schemas/testlib/hedxml/HED_testlib_1.800.2.xml with status code 404:\n404: Not Found',
              }),
              badDatasetDescriptions[8].file,
            ),
          ],
          badRemote2: [
            new BidsHedIssue(
              generateIssue('remoteSchemaLoadFailed', {
                spec: JSON.stringify(new SchemaSpec('', '8.828.0', '')),
                error:
                  'Server responded to https://raw.githubusercontent.com/hed-standard/hed-specification/master/hedxml/HED8.828.0.xml with status code 404:\n404: Not Found',
              }),
              badDatasetDescriptions[9].file,
            ),
          ],
        }
        return validator(testDatasets, expectedIssues, null)
      }, 10000)
    })

    describe('HED 3 library schema with version spec', () => {
      it('should validate HED 3 in BIDS event files sidecars and libraries using version spec', () => {
        const [specs0] = parseSchemasSpec(['8.1.0'])
        const [specs1] = parseSchemasSpec(['8.1.0', 'ts:testlib_1.0.2'])
        const [specs2] = parseSchemasSpec(['ts:testlib_1.0.2'])
        const [specs3] = parseSchemasSpec(['8.1.0', 'ts:testlib_1.0.2', 'bg:testlib_1.0.2'])
        const [specs4] = parseSchemasSpec(['ts:testlib_1.0.2', 'bg:testlib_1.0.2'])
        const testDatasets1 = {
          library_and_defs_base_ignored: new BidsDataset(goodEvents0, [], goodDatasetDescriptions[1]),
          library_and_defs_no_base: new BidsDataset(goodEvents0, [], goodDatasetDescriptions[3]),
          library_only_with_extra_base: new BidsDataset(goodEvents1, [], goodDatasetDescriptions[1]),
          library_only: new BidsDataset(goodEvents1, [], goodDatasetDescriptions[1]),
          just_base2: new BidsDataset(goodEvents2, [], goodDatasetDescriptions[0]),
          library_not_needed1: new BidsDataset(goodEvents2, [], goodDatasetDescriptions[1]),
          library_not_needed2: new BidsDataset(goodEvents2, [], goodDatasetDescriptions[3]),
          library_and_base_with_extra_schema: new BidsDataset(goodEvents0, [], goodDatasetDescriptions[1]),
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
})
