import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import { buildSchemasFromVersion } from '../../src/schema/init'
import { BidsSidecar, BidsTsvFile } from '../../src/bids'
import parseTSV from '../../src/bids/tsvParser'
import { Definition, DefinitionManager } from '../../src/parser/definitionManager'
import { parseHedString } from '../../src/parser/parser'
import { ReservedChecker } from '../../src/parser/reservedChecker'

// The rules of src/data/json/reservedTags.json (the specification's reserved_tags.json, section 3.2.8).
describe('Reserved tags from the published reserved_tags.json', () => {
  const schemaVersions = ['8.0.0', '8.1.0', '8.2.0', '8.4.0']
  const schemasByVersion = new Map()

  beforeAll(async () => {
    for (const version of schemaVersions) {
      schemasByVersion.set(version, await buildSchemasFromVersion(version))
    }
  })

  const newDefManager = (hedSchemas) => {
    const defManager = new DefinitionManager()
    const [definition, issues] = Definition.createDefinition('(Definition/MyColor, (Label/Pie))', hedSchemas)
    assert.isEmpty(issues, 'the test definition should be valid')
    defManager.addDefinition(definition)
    return defManager
  }

  // The HED codes of the errors (not warnings) in a list of Issue or BidsHedIssue objects.
  const errorCodes = (issues) =>
    issues
      .filter((issue) => (issue.severity ?? issue.level) === 'error')
      .map((issue) => issue.hedIssue?.hedCode ?? issue.hedCode)

  const validateString = (hedString, version = '8.4.0') => {
    const [, errorIssues] = parseHedString(hedString, schemasByVersion.get(version), false, false, true)
    return errorCodes(errorIssues)
  }

  const validateSidecar = (sidecar, version = '8.4.0') => {
    const hedSchemas = schemasByVersion.get(version)
    const bidsSidecar = new BidsSidecar('sidecar', { path: 'sidecar.json' }, sidecar, newDefManager(hedSchemas))
    return errorCodes(bidsSidecar.validate(hedSchemas))
  }

  const validateEvents = (tsvText, sidecar = {}, version = '8.4.0') => {
    const hedSchemas = schemasByVersion.get(version)
    const tsvFile = new BidsTsvFile(
      'events',
      { path: 'events.tsv' },
      parseTSV(tsvText),
      sidecar,
      newDefManager(hedSchemas),
    )
    return errorCodes(tsvFile.validate(hedSchemas))
  }

  describe('The loaded file', () => {
    it('has the seven rows of tags and the three two-part tags of valueForms', () => {
      assert.sameMembers(
        [...ReservedChecker.reservedMap.keys()],
        ['Definition', 'Delay', 'Duration', 'Event-context', 'Inset', 'Offset', 'Onset'],
      )
      assert.sameMembers([...ReservedChecker.getInstance().twoPartValueTags], ['Definition', 'Def', 'Def-expand'])
      assert.deepEqual(ReservedChecker.reservedMap.get('Delay').secondaryWith, ['Duration', 'Onset', 'Offset', 'Inset'])
    })
  })

  describe('The governing row of a group (rule 3)', () => {
    const cases = [
      ['(Onset, Def/MyColor, Delay/3 s)', []],
      ['(Offset, Def/MyColor, Delay/3 s)', []],
      ['(Inset, Def/MyColor, Delay/3 s, (Red))', []],
      ['(Duration/3 s, Delay/2 s, (Red))', []],
      ['(Delay/3 s, (Red))', []],
      ['(Delay/3 s)', ['TEMPORAL_TAG_ERROR']],
      ['(Delay/3 s, Duration/2 s)', ['TEMPORAL_TAG_ERROR']],
      ['(Delay/3 s, (Red), (Blue))', ['TEMPORAL_TAG_ERROR']],
      ['(Offset, Def/MyColor, Delay/3 s, (Red))', ['TEMPORAL_TAG_ERROR']],
      ['(Onset, Duration/2 s, Def/MyColor)', ['TAG_GROUP_ERROR']],
      ['(Delay/3 s, Delay/2 s, (Red))', ['TAG_GROUP_ERROR']],
      ['(Onset, Def/MyColor, Red)', ['TAG_GROUP_ERROR']],
    ]
    it.each(cases)('"%s" gives %j', (hedString, expected) => {
      assert.deepEqual(validateString(hedString), expected)
    })
  })

  describe('Anchors (rule 2) carry the row code (rule 6)', () => {
    const cases = [
      ['(Duration/3 s, Def/MyColor, (Red))', ['TEMPORAL_TAG_ERROR']],
      ['(Duration/3 s, (Def-expand/MyColor, (Label/Pie)), (Red))', ['TEMPORAL_TAG_ERROR']],
      ['(Duration/3 s, ((Def/MyColor), Red))', []],
      ['(Onset, (Red))', ['TEMPORAL_TAG_ERROR']],
      ['(Onset, Def/MyColor, Def/MyColor2)', ['TEMPORAL_TAG_ERROR']],
      ['(Event-context, Def/MyColor, (Red))', ['TAG_GROUP_ERROR']],
    ]
    it.each(cases)('"%s" gives %j', (hedString, expected) => {
      assert.deepEqual(validateString(hedString), expected)
    })
  })

  describe('The rules apply in every standard schema version', () => {
    const cases = [
      ['(Delay/3 s)', ['TEMPORAL_TAG_ERROR']],
      ['(Duration/3 s, Def/MyColor, (Red))', ['TEMPORAL_TAG_ERROR']],
      ['(Red, (Duration/3 s, (Blue)))', ['TAG_GROUP_ERROR']],
      ['(Duration, (Red))', ['TAG_REQUIRES_CHILD']],
      ['(Delay, (Red))', ['TAG_REQUIRES_CHILD']],
      ['(Onset, Def/MyColor, Delay/3 s)', []],
    ]
    for (const version of ['8.0.0', '8.1.0', '8.2.0']) {
      it.each(cases)(`under ${version} "%s" gives %j`, (hedString, expected) => {
        assert.deepEqual(validateString(hedString, version), expected)
      })
    }
  })

  describe('Group rules wait for column splices (rule 5)', () => {
    it('accepts groups whose splice supplies the inner group or the anchor', () => {
      for (const template of ['(Duration/3 s, {other})', '(Delay/3 s, {other})', '(Duration/3 s, ({other}))']) {
        assert.isEmpty(validateSidecar({ event_code: { HED: { face: template } }, other: { HED: { x: '(Red)' } } }))
      }
      assert.isEmpty(
        validateSidecar({ event_code: { HED: { face: '(Onset, {other})' } }, other: { HED: { x: 'Def/MyColor' } } }),
      )
    })

    it('checks the assembled annotation', () => {
      const events = 'onset\tduration\tevent_code\tother\n4.5\t0\tface\tx\n'
      const supplies = (value) => ({
        event_code: { HED: { face: '(Duration/3 s, {other})' } },
        other: { HED: { x: value } },
      })
      assert.isEmpty(validateEvents(events, supplies('(Red)')))
      assert.deepEqual(validateEvents(events, supplies('Red')), ['TAG_GROUP_ERROR'])
      const twoGroups = {
        event_code: { HED: { face: '(Onset, Def/MyColor, {other}, {third})' } },
        other: { HED: { x: '(Red)' } },
        third: { HED: { y: '(Blue)' } },
      }
      const twoGroupEvents = 'onset\tduration\tevent_code\tother\tthird\n4.5\t0\tface\tx\ty\n'
      assert.isEmpty(validateSidecar(twoGroups))
      assert.deepEqual(validateEvents(twoGroupEvents, twoGroups), ['TEMPORAL_TAG_ERROR'])
    })

    it('still rejects what a substitution cannot repair', () => {
      const sidecar = (template) => ({ event_code: { HED: { face: template } }, other: { HED: { x: '(Red)' } } })
      assert.deepEqual(validateSidecar(sidecar('(Duration/3 s, Def/MyColor, {other})')), ['TEMPORAL_TAG_ERROR'])
      assert.deepEqual(validateSidecar(sidecar('(Offset, Def/MyColor, (Blue), {other})')), ['TEMPORAL_TAG_ERROR'])
      assert.deepEqual(validateSidecar(sidecar('(Onset, Def/MyColor, Red, {other})')), ['TAG_GROUP_ERROR'])
    })
  })

  describe('A column splice in a group whose row has allowSpliceInGroup false (rule 5)', () => {
    it('rejects a splice inside an Event-context group', () => {
      const sidecar = { event_code: { HED: { face: '(Event-context, {other})' } }, other: { HED: { x: '(Red)' } } }
      assert.deepEqual(validateSidecar(sidecar), ['TAG_GROUP_ERROR'])
      const nested = { event_code: { HED: { face: '(Event-context, ({other}))' } }, other: { HED: { x: 'Red' } } }
      assert.deepEqual(validateSidecar(nested), ['TAG_GROUP_ERROR'])
    })

    it('accepts a splice beside an Event-context group', () => {
      const sidecar = {
        event_code: { HED: { face: '(Event-context, (Blue)), {other}' } },
        other: { HED: { x: '(Red)' } },
      }
      assert.isEmpty(validateSidecar(sidecar))
    })
  })

  describe('The two-part value of Definition (DEFINITION_INVALID l)', () => {
    const definitions = (definition) => ({ defs: { HED: { def1: definition } } })
    it.each([
      ['(Definition/NewDef/3, (Label/#))', ['DEFINITION_INVALID']],
      ['(Definition/NewDef/Extra, (Red))', ['DEFINITION_INVALID']],
      ['(Definition/NewDef/#, (Label/#))', []],
      ['(Definition/NewDef, (Red))', []],
    ])('"%s" gives %j', (definition, expected) => {
      assert.deepEqual(validateSidecar(definitions(definition)), expected)
    })
  })

  describe('A Def-expand group with extra tags (DEF_EXPAND_INVALID f)', () => {
    it('is DEF_EXPAND_INVALID', () => {
      assert.deepEqual(validateString('(Def-expand/MyColor, (Label/Pie), Blue)'), ['DEF_EXPAND_INVALID'])
    })
  })

  describe('Time conversion in a schema without conversion factors (8.0.0)', () => {
    const timeline = (annotation) => `onset\tduration\tHED\n4.5\t0\t${annotation}\n`
    it.each([
      ['(Duration/3 s, (Red))', []],
      ['(Duration/3 second, (Red))', []],
      ['(Duration/3 seconds, (Red))', []],
      ['(Duration/3, (Red))', []],
      ['(Delay/3 s, (Blue))', []],
      ['(Duration/300 ms, (Red))', ['TEMPORAL_TAG_ERROR']],
      ['(Duration/2 minute, (Red))', ['TEMPORAL_TAG_ERROR']],
    ])('timeline "%s" gives %j', (annotation, expected) => {
      assert.deepEqual(validateEvents(timeline(annotation), {}, '8.0.0'), expected)
    })

    it('converts the default unit with factor 1', () => {
      const [parsedString] = parseHedString('Duration/3 second', schemasByVersion.get('8.0.0'), false, false, false)
      assert.strictEqual(parsedString.tags[0].valueAsDefaultUnit(), 3)
    })

    it('accepts any unit of the class in a descriptor table', () => {
      assert.isEmpty(validateEvents('duration\tHED\n0\t(Duration/2 minute, (Red))\n', {}, '8.0.0'))
    })

    it('converts minutes in a schema with conversion factors', () => {
      assert.isEmpty(validateEvents(timeline('(Duration/2 minute, (Red))'), {}, '8.4.0'))
    })
  })
})
