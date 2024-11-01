import { BidsEventFile, BidsJsonFile, BidsSidecar } from '../../bids'
import { recursiveMap } from '../../utils/array'

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
        HED: 'Label/#, Description/#',
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
  // sub07 - Standalone HED curly brace tests
  [
    {
      // Valid definitions
      defs: {
        HED: {
          def1: '(Definition/Acc/#, (Acceleration/#, Red))',
          def2: '(Definition/MyColor, (Label/Pie))',
        },
      },
    },
    {
      // Invalid definitions
      defs: {
        HED: {
          def1: '(Definition/Acc/#, {event_code}, (Acceleration/#, Red))',
          def2: '(Definition/MyColor, (Label/Pie, {response_time}))',
        },
      },
    },
    {
      // Valid reference to named column with HED
      event_code: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow))',
          ball: '{response_time}, (Def/Acc/3.5 m-per-s^2)',
        },
      },
      response_time: {
        Description: 'Has description with HED',
        HED: 'Label/#',
      },
    },
    {
      // Valid reference to HED column
      event_code: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow))',
          ball: '{HED}, (Def/Acc/3.5 m-per-s^2)',
        },
      },
      response_action: {
        Description: 'Does not correspond to curly braces',
      },
    },
    {
      // Valid references to named column and HED column
      event_code: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow))',
          ball: '{response_time}, (Def/Acc/3.5 m-per-s^2), ({HED})',
        },
      },
      response_time: {
        Description: 'Has description with HED',
        HED: 'Label/#',
      },
    },
    {
      // Valid use of shared curly brace column references
      event_code: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow))',
          ball: '{response_time}, (Def/Acc/3.5 m-per-s^2)',
        },
      },
      response_time: {
        Description: 'Has description with HED',
        HED: 'Label/#',
      },
      response_count: {
        Description: 'A count used to test curly braces in value columns.',
        HED: '(Item-count/#, {response_time})',
      },
    },
    {
      // Invalid use of mutually recursive curly brace references
      event_code: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow)), {HED}',
          ball: '{response_time}, (Def/Acc/3.5 m-per-s^2)',
        },
      },
      response_time: {
        HED: 'Label/#, {event_code}',
      },
    },
    {
      // Invalid use of recursive curly brace references
      event_code: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow)), {HED}',
          ball: '(Def/Acc/3.5 m-per-s^2)',
          dog: 'Orange, {event_type}',
        },
      },
      response_time: {
        HED: 'Label/#, {response_time2}',
      },
      response_time2: {
        HED: 'Label/#',
      },
      event_type: {
        HED: {
          banana: 'Blue, {event_code}',
          apple: 'Green',
        },
      },
    },
    {
      // Invalid use of self-recursive curly braces
      event_code: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow)), {HED}',
          ball: '{HED}, (Def/Acc/3.5 m-per-s^2)',
        },
      },
      response_time: {
        HED: 'Label/#, {response_time}',
      },
    },
    {
      // Invalid syntax errors in curly braces
      event_code: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow))',
          ball: '{response_time}{, (Def/Acc/3.5 m-per-s^2)',
        },
      },
      event_code2: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow))',
          ball: '{{response_time}, (Def/Acc/3.5 m-per-s^2)',
        },
      },
      event_code3: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow))',
          ball: '{response_time}}, (Def/Acc/3.5 m-per-s^2)',
        },
      },
      event_code4: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow))',
          ball: '{}, (Def/Acc/3.5 m-per-s^2)',
        },
      },
      response_time: {
        Description: 'Has description but no HED',
        HED: 'Label/#',
      },
    },
  ],
  // sub08 - Combined HED curly brace tests
  [
    {
      // Valid definitions
      defs: {
        HED: {
          def1: '(Definition/Acc/#, (Acceleration/#, Red))',
          def2: '(Definition/MyColor, (Label/Pie))',
        },
      },
    },
    {
      // Invalid definitions
      defs: {
        HED: {
          def1: '(Definition/Acc/#, {event_code}, (Acceleration/#, Red))',
          def2: '(Definition/MyColor, (Label/Pie, {response_time}))',
        },
      },
    },
    {
      // Valid reference to named column with HED
      event_code: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow))',
          ball: '{response_time}, (Def/Acc/3.5 m-per-s^2)',
        },
      },
      response_time: {
        Description: 'Has description with HED',
        HED: 'Label/#',
      },
    },
    {
      // Valid reference to HED column
      event_code: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow))',
          ball: '{HED}, (Def/Acc/3.5 m-per-s^2)',
        },
      },
      response_action: {
        Description: 'Does not correspond to curly braces',
      },
    },
    {
      // Valid references to named column and HED column
      event_code: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow))',
          ball: '{response_time}, (Def/Acc/3.5 m-per-s^2), ({HED})',
        },
      },
      response_time: {
        Description: 'Has description with HED',
        HED: 'Label/#',
      },
    },
    {
      // Invalid reference to column with no HED
      event_code: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow))',
          ball: '{response_time}, (Def/Acc/3.5 m-per-s^2)',
        },
      },
      response_time: {
        Description: 'Has description but no HED',
      },
    },
    {
      // Invalid reference to non-existent column
      event_code: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow))',
          ball: '{response_time}, (Def/Acc/3.5 m-per-s^2)',
        },
      },
      response_action: {
        Description: 'Does not correspond to curly braces',
      },
    },
    {
      // Invalid duplicate reference to existing column
      event_code: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow))',
          ball: '{response_time}, {response_time}, (Def/Acc/3.5 m-per-s^2)',
        },
      },
      response_time: {
        Description: 'Has description with HED',
        HED: 'Label/#',
      },
    },
  ],
  // sub09 - Syntax errors
  [
    {
      // Invalid location of curly braces
      event_code: {
        HED: {
          face: '(Red, Blue), (Green, (Yellow))',
          ball: '(Def/Acc/{response_time})',
        },
      },
      response_time: {
        Description: 'Has description with HED',
        HED: 'Label/#',
      },
    },
  ],
  // sub10 - Lazy partnered schemas
  [
    {
      // Valid partnered schemas
      instruments: {
        HED: {
          piano_and_violin: '(Piano-sound, Violin-sound)',
          flute_and_oboe: '(Flute-sound, Oboe-sound)',
          choral_piano: '(Piano-sound, Vocalized-sound)',
        },
      },
    },
  ],
]

const hedColumnOnlyHeader = 'onset\tduration\tHED\n'
const tsvFiles = [
  // sub01 - Valid TSV-only data
  [
    [{}, hedColumnOnlyHeader + '7\tsomething\tCellphone'],
    [{}, hedColumnOnlyHeader + '7\tsomething\tCellphone\n' + '11\telse\tDesktop-computer'],
    [{}, hedColumnOnlyHeader + '7\tsomething\tCeramic, Pink'],
  ],
  // sub02 - Invalid TSV-only data
  [
    [{}, hedColumnOnlyHeader + '11\telse\tSpeed/300 miles'],
    [{}, hedColumnOnlyHeader + '7\tsomething\tTrain/Maglev'],
    [{}, hedColumnOnlyHeader + '7\tsomething\tTrain\n' + '11\telse\tSpeed/300 miles'],
    [{}, hedColumnOnlyHeader + '7\tsomething\tMaglev\n' + '11\telse\tSpeed/300 miles'],
    [{}, hedColumnOnlyHeader + '7\tsomething\tTrain/Maglev\n' + '11\telse\tSpeed/300 miles'],
  ],
  // sub03 - Valid combined sidecar/TSV data
  [
    [sidecars[2][0], 'onset\tduration\n' + '7\t4'],
    [sidecars[0][0], 'onset\tduration\tcolor\n' + '7\t4\tred'],
    [sidecars[0][1], 'onset\tduration\tspeed\n' + '7\t4\t60'],
    [sidecars[2][0], hedColumnOnlyHeader + '7\t4\tLaptop-computer'],
    [sidecars[0][0], 'onset\tduration\tcolor\tHED\n' + '7\t4\tgreen\tLaptop-computer'],
    [
      Object.assign({}, sidecars[0][0], sidecars[0][1]),
      'onset\tduration\tcolor\tvehicle\tspeed\n' + '7\tsomething\tblue\ttrain\t150',
    ],
    [
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
      sidecars[1][1],
      'onset\tduration\temotion\tHED\n' +
        '7\thigh\thappy\tYellow\n' +
        '11\tlow\tsad\tBlue\n' +
        '15\tmad\tangry\tRed\n' +
        '19\thuh\tconfused\tGray',
    ],
    [
      sidecars[1][0],
      'onset\tduration\ttransport\n' +
        '7\twet\tboat\n' +
        '11\tsteam\ttrain\n' +
        '15\ttires\tcar\n' +
        '19\tspeedy\tmaglev',
    ],
    [
      Object.assign({}, sidecars[0][1], sidecars[1][0]),
      'onset\tduration\tvehicle\ttransport\tspeed\n' +
        '7\tferry\ttrain\tboat\t20\n' +
        '11\tautotrain\tcar\ttrain\t79\n' +
        '15\ttowing\tboat\tcar\t30\n' +
        '19\ttugboat\tboat\tboat\t5\n',
    ],
    [sidecars[0][2], 'onset\tduration\tage\tHED\n' + '7\tferry\t30\tAge/30\n'],
    [sidecars[0][0], 'onset\tduration\tcolor\n' + '7\troyal\tpurple\n'],
  ],
  // sub05 - Valid combined sidecar/TSV data from HED 2 - Deprecated
  [],
  // sub06 - Valid combined sidecar/TSV data with library
  [
    [sidecars[4][0], 'onset\tduration\tevent_type\tsize\n' + '7\tn/a\tshow_face\t6\n' + '7\tn/a\tleft_press\t7\n'],
    [sidecars[4][1], 'onset\tduration\tevent_type\tsize\n' + '7\tn/a\tshow_face\t6\n' + '7\tn/a\tleft_press\t7\n'],
    [sidecars[4][2], 'onset\tduration\tevent_type\tsize\n' + '7\tn/a\tshow_face\t6\n' + '7\tn/a\tleft_press\t7\n'],
    [sidecars[4][3], 'onset\tduration\tevent_type\tsize\n' + '7\tn/a\tshow_face\t6\n' + '7\tn/a\tleft_press\t7\n'],
    [sidecars[4][4], 'onset\tduration\tevent_type\tsize\n' + '7\tn/a\tshow_face\t6\n' + '7\tn/a\tleft_press\t7\n'],
    [sidecars[4][5], 'onset\tduration\tevent_type\tsize\n' + '7\tn/a\tshow_face\t6\n' + '7\tn/a\tleft_press\t7\n'],
    [sidecars[4][6], 'onset\tduration\tevent_type\tsize\n' + '7\tn/a\tshow_face\t6\n' + '7\tn/a\tleft_press\t7\n'],
  ],
  // sub07 - Definitions
  [[sidecars[5][0], hedColumnOnlyHeader + '7\tsomething\t(Definition/myDef, (Label/Red, Green))']],
  // sub08 - Standalone curly brace tests
  [
    [
      Object.assign({}, sidecars[6][0], sidecars[6][4]),
      'onset\tduration\tevent_code\tHED\tresponse_time\n' +
        '4.5\t0\tface\tBlue\t0\n' +
        '5.0\t0\tball\tGreen,Def/MyColor\t1\n' +
        '5.5\t0\tface\t\t2\n' +
        '5.7\t0\tface\tn/a\t3',
    ],
    [
      Object.assign({}, sidecars[6][0], sidecars[6][4]),
      'onset\tduration\tevent_code\tHED\n' +
        '4.5\t0\tface\tBlue, {response_time}\n' +
        '5.0\t0\tball\tGreen, Def/MyColor\n' +
        '5.2\t0\tface\t\n' +
        '5.5\t0\tface\tn/a',
    ],
  ],
  // sub09 - Combined curly brace tests
  [
    [
      Object.assign({}, sidecars[7][0], sidecars[7][5]),
      'onset\tduration\tevent_code\tHED\tresponse_time\n' +
        '4.5\t0\tface\tBlue\t0\n' +
        '5.0\t0\tball\tGreen,Def/MyColor\t1\n' +
        '5.5\t0\tface\t\t2\n' +
        '5.7\t0\tface\tn/a\t3',
    ],
    [
      Object.assign({}, sidecars[7][0], sidecars[7][6]),
      'onset\tduration\tevent_code\tHED\tresponse_action\n' +
        '4.5\t0\tface\tBlue\t0\n' +
        '5.0\t0\tball\tGreen,Def/MyColor\t1\n' +
        '5.5\t0\tface\t\t2\n' +
        '5.7\t0\tface\tn/a\t3',
    ],
    [
      Object.assign({}, sidecars[7][0], sidecars[7][7]),
      'onset\tduration\tevent_code\tHED\tresponse_time\n' +
        '4.5\t0\tface\tBlue\t0\n' +
        '5.0\t0\tball\tGreen,Def/MyColor\t1\n' +
        '5.5\t0\tface\t\t2\n' +
        '5.7\t0\tface\tn/a\t3',
    ],
  ],
  // sub10 - HED column curly brace tests
  [
    [
      Object.assign({}, sidecars[6][0], sidecars[6][4]),
      'onset\tduration\tevent_code\tHED\n' +
        '4.5\t0\tface\tBlue, {response_time}\n' +
        '5.0\t0\tball\tGreen, Def/MyColor\n' +
        '5.2\t0\tface\t\n' +
        '5.5\t0\tface\tn/a',
    ],
  ],
  // sub11 - 'n/a' curly brace tests
  [
    [
      // Control
      Object.assign({}, sidecars[6][0], sidecars[6][5]),
      'onset\tduration\tevent_code\tresponse_time\tresponse_count\n' + '5.0\t0\tball\t1\t2\n',
    ],
    [
      Object.assign({}, sidecars[6][0], sidecars[6][2]),
      'onset\tduration\tevent_code\tresponse_time\n' + '5.0\t0\tball\tn/a\n',
    ],
    [
      Object.assign({}, sidecars[6][0], sidecars[6][4]),
      'onset\tduration\tevent_code\tHED\tresponse_time\n' + '5.0\t0\tball\tGreen,Def/MyColor\tn/a\n',
    ],
    [
      Object.assign({}, sidecars[6][0], sidecars[6][4]),
      'onset\tduration\tevent_code\tHED\tresponse_time\n' + '5.0\t0\tball\tn/a\t1\n',
    ],
    [
      Object.assign({}, sidecars[6][0], sidecars[6][4]),
      'onset\tduration\tevent_code\tHED\tresponse_time\n' + '5.0\t0\tball\tn/a\tn/a\n',
    ],
    [
      Object.assign({}, sidecars[6][0], sidecars[6][5]),
      'onset\tduration\tevent_code\tresponse_time\tresponse_count\n' + '5.0\t0\tface\t1\tn/a\n',
    ],
  ],
  // sub12 - Lazy partnered schemas
  [
    [
      sidecars[9][0],
      'onset\tduration\tinstruments\n' +
        '4.5\t0\tpiano_and_violin\n' +
        '5.0\t0\tflute_and_oboe\n' +
        '5.2\t0\tchoral_piano\n',
    ],
  ],
]

const datasetDescriptions = [
  // Good datasetDescription.json files
  [
    { Name: 'OnlyBase', BIDSVersion: '1.10.0', HEDVersion: '8.3.0' },
    { Name: 'BaseAndTest', BIDSVersion: '1.10.0', HEDVersion: ['8.3.0', 'ts:testlib_1.0.2'] },
    { Name: 'OnlyTestAsLib', BIDSVersion: '1.10.0', HEDVersion: ['ts:testlib_1.0.2'] },
    { Name: 'BaseAndTwoTests', BIDSVersion: '1.10.0', HEDVersion: ['8.3.0', 'ts:testlib_1.0.2', 'bg:testlib_1.0.2'] },
    { Name: 'TwoTests', BIDSVersion: '1.10.0', HEDVersion: ['ts:testlib_1.0.2', 'bg:testlib_1.0.2'] },
    { Name: 'OnlyScoreAsBase', BIDSVersion: '1.10.0', HEDVersion: 'score_1.0.0' },
    { Name: 'OnlyScoreAsLib', BIDSVersion: '1.10.0', HEDVersion: 'sc:score_1.0.0' },
    { Name: 'OnlyTestAsBase', BIDSVersion: '1.10.0', HEDVersion: 'testlib_1.0.2' },
    { Name: 'GoodLazyPartneredSchemas', BIDSVersion: '1.10.0', HEDVersion: ['testlib_2.0.0', 'testlib_3.0.0'] },
    {
      Name: 'GoodLazyPartneredSchemasWithStandard',
      BIDSVersion: '1.10.0',
      HEDVersion: ['testlib_2.0.0', 'testlib_3.0.0', '8.2.0'],
    },
  ],
  // Bad datasetDescription.json files
  [
    { Name: 'NonExistentLibrary', BIDSVersion: '1.10.0', HEDVersion: ['8.3.0', 'ts:badlib_1.0.2'] },
    { Name: 'LeadingColon', BIDSVersion: '1.10.0', HEDVersion: [':testlib_1.0.2', '8.3.0'] },
    { Name: 'BadNickName', BIDSVersion: '1.10.0', HEDVersion: ['8.3.0', 't-s:testlib_1.0.2'] },
    { Name: 'MultipleColons1', BIDSVersion: '1.10.0', HEDVersion: ['8.3.0', 'ts::testlib_1.0.2'] },
    { Name: 'MultipleColons2', BIDSVersion: '1.10.0', HEDVersion: ['8.3.0', ':ts:testlib_1.0.2'] },
    { Name: 'NoLibraryName', BIDSVersion: '1.10.0', HEDVersion: ['8.3.0', 'ts:_1.0.2'] },
    { Name: 'BadVersion1', BIDSVersion: '1.10.0', HEDVersion: ['8.3.0', 'ts:testlib1.0.2'] },
    { Name: 'BadVersion2', BIDSVersion: '1.10.0', HEDVersion: ['8.3.0', 'ts:testlib_1.a.2'] },
    { Name: 'BadRemote1', BIDSVersion: '1.10.0', HEDVersion: ['8.3.0', 'ts:testlib_1.800.2'] },
    { Name: 'BadRemote2', BIDSVersion: '1.10.0', HEDVersion: '8.828.0' },
    { Name: 'NoHedVersion', BIDSVersion: '1.10.0' },
    { Name: 'BadLazyPartneredSchema1', BIDSVersion: '1.10.0', HEDVersion: ['testlib_2.0.0', 'testlib_2.1.0'] },
    { Name: 'BadLazyPartneredSchema2', BIDSVersion: '1.10.0', HEDVersion: ['testlib_2.1.0', 'testlib_3.0.0'] },
    {
      Name: 'LazyPartneredSchemasWithWrongStandard',
      BIDSVersion: '1.10.0',
      HEDVersion: ['testlib_2.0.0', 'testlib_3.0.0', '8.1.0'],
    },
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
    const [mergedDictionary, tsvData] = runData
    const name = `/sub0${sub + 1}/sub0${sub + 1}_task-test_run-${run + 1}_events.tsv`
    return new BidsEventFile(name, [], mergedDictionary, tsvData, {
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
