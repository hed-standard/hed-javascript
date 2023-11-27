import { BidsEventFile, BidsJsonFile, BidsSidecar } from '../bids'
import { recursiveMap } from '../utils/array'

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
          left_press: 'Wicket-spikes, Finding-frequency',
        },
      },
    },
    {
      // Just score as a library
      event_type: {
        HED: {
          show_face: 'sc:Manual-eye-closure, sc:Drowsiness',
          left_press: 'sc:Wicket-spikes, sc:Finding-frequency',
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
  // sub06 - HED definitions
  [
    {
      // Valid
      defs: {
        HED: {
          face: '(Definition/myDef, (Label/Red, Blue)), (Definition/myDef2, (Label/Red, Blue))',
          ball: '(Definition/myDef1, (Label/Red, Blue))',
        },
      },
    },
    {
      // Valid
      defs: {
        HED: {
          def1: '(Definition/Apple/#, (Label/#))',
          def2: '(Definition/Blech/#, (Red, Label/#))',
        },
      },
    },
    {
      // Invalid "value" column with definition
      event_code: {
        HED: '(Definition/myDef, (Label/Red, Blue))',
      },
    },
    {
      // Invalid mix of definitions and non-definitions in categorical column
      event_code: {
        HED: {
          face: 'Red, Blue, (Definition/myDef, (Label/Red, Blue))',
          ball: 'Def/Acc/5.4 m-per-s^2',
        },
      },
    },
    {
      // Invalid mix of definitions and non-definitions in categorical column
      event_code: {
        HED: {
          face: '(Definition/myDef, (Label/Red, Blue))',
          ball: 'Def/Acc/4.5 m-per-s^2',
        },
      },
    },
  ],
]

const hedColumnOnlyHeader = 'onset\tduration\tHED\n'
const tsvFiles = [
  // sub01 - Valid TSV-only data
  [
    [[], {}, hedColumnOnlyHeader + '7\tsomething\tCellphone'],
    [[], {}, hedColumnOnlyHeader + '7\tsomething\tCellphone\n' + '11\telse\tDesktop-computer'],
    [[], {}, hedColumnOnlyHeader + '7\tsomething\tCeramic, Pink'],
  ],
  // sub02 - Invalid TSV-only data
  [
    [[], {}, hedColumnOnlyHeader + '11\telse\tSpeed/300 miles'],
    [[], {}, hedColumnOnlyHeader + '7\tsomething\tTrain/Maglev'],
    [[], {}, hedColumnOnlyHeader + '7\tsomething\tTrain\n' + '11\telse\tSpeed/300 miles'],
    [[], {}, hedColumnOnlyHeader + '7\tsomething\tMaglev\n' + '11\telse\tSpeed/300 miles'],
    [[], {}, hedColumnOnlyHeader + '7\tsomething\tTrain/Maglev\n' + '11\telse\tSpeed/300 miles'],
  ],
  // sub03 - Valid combined sidecar/TSV data
  [
    [['/sub03/sub03_task-test_run-1_events.json'], sidecars[2][0], 'onset\tduration\n' + '7\tsomething'],
    [['/sub01/sub01_task-test_run-1_events.json'], sidecars[0][0], 'onset\tduration\tcolor\n' + '7\tsomething\tred'],
    [['/sub01/sub01_task-test_run-2_events.json'], sidecars[0][1], 'onset\tduration\tspeed\n' + '7\tsomething\t60'],
    [
      ['/sub03/sub03_task-test_run-1_events.json'],
      sidecars[2][0],
      hedColumnOnlyHeader + '7\tsomething\tLaptop-computer',
    ],
    [
      ['/sub01/sub01_task-test_run-1_events.json'],
      sidecars[0][0],
      'onset\tduration\tcolor\tHED\n' + '7\tsomething\tgreen\tLaptop-computer',
    ],
    [
      ['/sub01/sub01_task-test_run-1_events.json', '/sub01/sub01_task-test_run-2_events.json'],
      Object.assign({}, sidecars[0][0], sidecars[0][1]),
      'onset\tduration\tcolor\tvehicle\tspeed\n' + '7\tsomething\tblue\ttrain\t150',
    ],
    [
      ['/sub01/sub01_task-test_run-1_events.json', '/sub01/sub01_task-test_run-2_events.json'],
      Object.assign({}, sidecars[0][0], sidecars[0][1]),
      'onset\tduration\tcolor\tvehicle\tspeed\n' +
        '7\tsomething\tred\ttrain\t150\n' +
        '11\telse\tblue\tboat\t15\n' +
        '15\tanother\tgreen\tcar\t70',
    ],
  ],
  // sub04 - Invalid combined sidecar/TSV data
  [
    [
      ['/sub02/sub02_task-test_run-2_events.json'],
      sidecars[1][1],
      'onset\tduration\temotion\tHED\n' +
        '7\thigh\thappy\tYellow\n' +
        '11\tlow\tsad\tBlue\n' +
        '15\tmad\tangry\tRed\n' +
        '19\thuh\tconfused\tGray',
    ],
    [
      ['/sub02/sub02_task-test_run-1_events.json'],
      sidecars[1][0],
      'onset\tduration\ttransport\n' +
        '7\twet\tboat\n' +
        '11\tsteam\ttrain\n' +
        '15\ttires\tcar\n' +
        '19\tspeedy\tmaglev',
    ],
    [
      ['/sub01/sub01_task-test_run-2_events.json', '/sub02/sub02_task-test_run-1_events.json'],
      Object.assign({}, sidecars[0][1], sidecars[1][0]),
      'onset\tduration\tvehicle\ttransport\tspeed\n' +
        '7\tferry\ttrain\tboat\t20\n' +
        '11\tautotrain\tcar\ttrain\t79\n' +
        '15\ttowing\tboat\tcar\t30\n' +
        '19\ttugboat\tboat\tboat\t5',
    ],
    [
      ['/sub01/sub01_task-test_run-3_events.json'],
      sidecars[0][2],
      'onset\tduration\tage\tHED\n' + '7\tferry\t30\tAge/30',
    ],
    [['/sub01/sub01_task-test_run-1_events.json'], sidecars[0][0], 'onset\tduration\tcolor\n' + '7\troyal\tpurple'],
  ],
  // sub05 - Valid combined sidecar/TSV data from HED 2
  [
    [
      ['/sub04/sub04_task-test_run-1_events.json'],
      sidecars[3][0],
      'onset\tduration\ttest\tHED\n' + '7\tsomething\tfirst\tEvent/Duration/55 ms',
    ],
  ],
  // sub06 - Valid combined sidecar/TSV data with library
  [
    [
      ['/sub05/sub05_task-test_run-1_events.json'],
      sidecars[4][0],
      'onset\tduration\tevent_type\tsize\n' + '7\tn/a\tshow_face\t6\n' + '7\tn/a\tleft_press\t7\n',
    ],
    [
      ['/sub05/sub05_task-test_run-2_events.json'],
      sidecars[4][1],
      'onset\tduration\tevent_type\tsize\n' + '7\tn/a\tshow_face\t6\n' + '7\tn/a\tleft_press\t7\n',
    ],
    [
      ['/sub05/sub05_task-test_run-3_events.json'],
      sidecars[4][2],
      'onset\tduration\tevent_type\tsize\n' + '7\tn/a\tshow_face\t6\n' + '7\tn/a\tleft_press\t7\n',
    ],
    [
      ['/sub05/sub05_task-test_run-4_events.json'],
      sidecars[4][3],
      'onset\tduration\tevent_type\tsize\n' + '7\tn/a\tshow_face\t6\n' + '7\tn/a\tleft_press\t7\n',
    ],
    [
      ['/sub05/sub06_task-test_run-5_events.json'],
      sidecars[4][4],
      'onset\tduration\tevent_type\tsize\n' + '7\tn/a\tshow_face\t6\n' + '7\tn/a\tleft_press\t7\n',
    ],
    [
      ['/sub05/sub06_task-test_run-6_events.json'],
      sidecars[4][5],
      'onset\tduration\tevent_type\tsize\n' + '7\tn/a\tshow_face\t6\n' + '7\tn/a\tleft_press\t7\n',
    ],
    [
      ['/sub05/sub06_task-test_run-7_events.json'],
      sidecars[4][6],
      'onset\tduration\tevent_type\tsize\n' + '7\tn/a\tshow_face\t6\n' + '7\tn/a\tleft_press\t7\n',
    ],
  ],
  // sub07 - Definitions
  [
    [
      ['/sub06/sub06_task-test_run-1_events.json'],
      sidecars[5][0],
      hedColumnOnlyHeader + '7\tsomething\t(Definition/myDef, (Label/Red, Green))',
    ],
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
    { Name: 'OnlyScoreAsBase', BIDSVersion: '1.7.0', HEDVersion: 'score_1.0.0' },
    { Name: 'OnlyScoreAsLib', BIDSVersion: '1.7.0', HEDVersion: 'sc:score_1.0.0' },
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
    { Name: 'NoHedVersion', BIDSVersion: '1.7.0' },
  ],
]

/**
 * @type {BidsSidecar[][]}
 */
export const bidsSidecars = sidecars.map((subData, sub) => {
  return subData.map((runData, run) => {
    const name = `/sub0${sub + 1}/sub0${sub + 1}_task-test_run-${run + 1}_events.json`
    return new BidsSidecar(name, runData, {
      relativePath: name,
      path: name,
    })
  })
})

/**
 * @type {BidsEventFile[][]}
 */
export const bidsTsvFiles = tsvFiles.map((subData, sub) => {
  return subData.map((runData, run) => {
    const [potentialSidecars, mergedDictionary, tsvData] = runData
    const name = `/sub0${sub + 1}/sub0${sub + 1}_task-test_run-${run + 1}_events.tsv`
    return new BidsEventFile(name, potentialSidecars, mergedDictionary, tsvData, {
      relativePath: name,
      path: name,
    })
  })
})

/**
 * @type {BidsJsonFile[][]}
 */
export const bidsDatasetDescriptions = recursiveMap((datasetDescriptionData) => {
  return new BidsJsonFile('/dataset_description.json', datasetDescriptionData, {
    relativePath: '/dataset_description.json',
    path: '/dataset_description.json',
  })
}, datasetDescriptions)
