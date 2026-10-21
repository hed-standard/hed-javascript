import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import { buildSchemasFromVersion } from '../../src/schema/init'
import { BidsSidecar, BidsTsvFile } from '../../src/bids'
import {
  convertParsedTSVData,
  findDuplicateHeaders,
  findDuplicateParsedHeaders,
  findHeaderProblems,
  parseTSV,
  parseTSVHeader,
} from '../../src/bids/tsvParser'
import { IssueError } from '../../src/issues/issues'
import { isPaddedName, stripNameWhitespace } from '../../src/utils/string'

// A repeated column name in a tabular file is TABULAR_INVALID (specification 3.2.10, Appendix B).
describe('Repeated TSV column names', () => {
  const repeated = 'onset\tduration\ttrial\ttrial\n1.0\t0\tgo\tstop\n2.0\t0\twait\tgo\n'

  describe('parseTSV', () => {
    it('keeps one column per name, aligned with the rows', () => {
      const columns = parseTSV(repeated)
      assert.deepEqual([...columns.keys()], ['onset', 'duration', 'trial'])
      assert.deepEqual(columns.get('trial'), ['go', 'wait'], 'the first trial column, one cell per row')
      assert.deepEqual(columns.get('onset'), ['1.0', '2.0'])
    })

    it('is unchanged for unique names', () => {
      const columns = parseTSV('onset\tduration\tHED\n1.0\t0\tRed\n')
      assert.deepEqual(
        [...columns.entries()],
        [
          ['onset', ['1.0']],
          ['duration', ['0']],
          ['HED', ['Red']],
        ],
      )
    })
  })

  describe('findDuplicateHeaders', () => {
    it.each([
      ['onset\tduration\tHED\n1\t0\tRed\n', []],
      [repeated, ['trial']],
      ['a\ta\ta\n1\t2\t3\n', ['a']],
      ['a\tb\ta\tb\tc\n1\t2\t3\t4\t5\n', ['a', 'b']],
      ['', []],
      ['\uFEFFa\ta\n1\t2\n', ['a']],
      ['a\ta\r\n1\t2\r\n', ['a']],
      ['a\tb\ra\ta\r', []],
      // Padded and blank names are reported as such (TABULAR_INVALID b and c), not as repeats.
      ['\n  \n a \t a\n1\t2\n', []],
      ['trial\ttrial \n1\t2\n', []],
      ['a\t\t\tb\n1\t2\t3\t4\n', []],
      ['\n\n', []],
    ])('%j gives %j', (contents, expected) => {
      assert.deepEqual(findDuplicateHeaders(contents), expected)
    })
  })

  describe('the old {headers, rows} format', () => {
    const oldFormat = {
      headers: ['onset', 'trial', 'trial'],
      rows: [
        ['onset', 'trial', 'trial'],
        ['1.0', 'go', 'stop'],
      ],
    }

    it('keeps the first column of a repeated name', () => {
      assert.deepEqual(convertParsedTSVData(oldFormat).get('trial'), ['go'])
    })

    it('finds the repeated names', () => {
      assert.deepEqual(findDuplicateParsedHeaders(oldFormat), ['trial'])
    })
  })

  describe('BidsTsvFile validation', () => {
    let hedSchemas
    const sidecar = { trial: { HED: { go: 'Experimental-trial', stop: 'Agent-action', wait: 'Item' } } }

    beforeAll(async () => {
      hedSchemas = await buildSchemasFromVersion('8.4.0')
    })

    const validate = (tsvData) =>
      new BidsTsvFile('events', { path: 'events.tsv' }, tsvData, sidecar).validate(hedSchemas)

    it('reports TABULAR_INVALID naming the repeated column, and nothing else', () => {
      const issues = validate(repeated)
      assert.lengthOf(issues, 1)
      assert.strictEqual(issues[0].subCode, 'TABULAR_INVALID')
      assert.strictEqual(issues[0].hedIssue.parameters.column, 'trial')
      assert.include(issues[0].issueMessage, 'Column "trial" appears more than once')
    })

    it('reports each repeated name once', () => {
      const issues = validate('onset\tduration\ttrial\ttrial\ttrial\n1.0\t0\tgo\tgo\tgo\n')
      assert.deepEqual(
        issues.map((issue) => issue.hedIssue.parameters.column),
        ['trial'],
      )
    })

    it('reports a repeated name in the old format', () => {
      const tsvData = {
        headers: ['onset', 'duration', 'trial', 'trial'],
        rows: [
          ['onset', 'duration', 'trial', 'trial'],
          ['1.0', '0', 'go', 'go'],
        ],
      }
      assert.deepEqual(
        validate(tsvData).map((issue) => issue.subCode),
        ['TABULAR_INVALID'],
      )
    })

    it('validates a file with unique names as before', () => {
      assert.isEmpty(validate('onset\tduration\ttrial\n1.0\t0\tgo\n2.0\t0\tstop\n'))
    })
  })
})

// A column name or top-level sidecar key that begins or ends with whitespace, or a blank column name, is invalid
// (specification 3.2.10, TABULAR_INVALID b and c, SIDECAR_INVALID d). Names are compared exactly as written.
describe('Padded and blank TSV column names and sidecar keys', () => {
  describe('isPaddedName and stripNameWhitespace', () => {
    it.each([
      ['trial', false, 'trial'],
      ['trial ', true, 'trial'],
      [' trial', true, 'trial'],
      ['trial\t', true, 'trial'],
      ['\r\ntrial\n', true, 'trial'],
      ['trial type', false, 'trial type'],
      [' ', true, ''],
      ['', false, ''],
      ['trial\u00A0', false, 'trial\u00A0'],
      ['\uFEFFtrial', false, '\uFEFFtrial'],
    ])('%j: padded %j, stripped %j', (name, padded, stripped) => {
      assert.strictEqual(isPaddedName(name), padded)
      assert.strictEqual(stripNameWhitespace(name), stripped)
    })
  })

  describe('parseTSV and parseTSVHeader', () => {
    it('keep the header cells as written and trim the data cells', () => {
      const contents = 'onset\t HED\ttrial \t\n 1.0 \t Red \t go\t\n'
      assert.deepEqual(parseTSVHeader(contents), ['onset', ' HED', 'trial ', ''])
      assert.deepEqual(
        [...parseTSV(contents).entries()],
        [
          ['onset', ['1.0']],
          [' HED', ['Red']],
          ['trial ', ['go']],
          ['', ['']],
        ],
      )
    })
  })

  describe('findHeaderProblems', () => {
    it.each([
      [['onset', 'duration', 'HED'], [], [], []],
      [['onset', 'HED '], ['HED '], [], []],
      [['onset', 'trial', 'trial '], ['trial '], [], []],
      [['onset', 'trial ', 'trial '], ['trial '], [], []],
      [['onset', ' ', 'HED'], [' '], [], []],
      [['onset', 'duration', 'HED', ''], [], [4], []],
      [['onset', '', '', 'HED'], [], [2, 3], []],
      [['trial ', '', 'onset', 'onset', ' x'], ['trial ', ' x'], [2], ['onset']],
      [['trial\u00A0', 'trial type'], [], [], []],
    ])('%j gives padded %j, blank %j, repeated %j', (headers, padded, blank, duplicate) => {
      assert.deepEqual(findHeaderProblems(headers), { padded, blank, duplicate })
    })
  })

  describe('BidsTsvFile validation', () => {
    let hedSchemas
    const sidecar = { trial: { HED: { go: 'Experimental-trial', stop: 'Agent-action' } } }

    beforeAll(async () => {
      hedSchemas = await buildSchemasFromVersion('8.4.0')
    })

    const validate = (tsvData, dictionary = sidecar) =>
      new BidsTsvFile('events', { path: 'events.tsv' }, tsvData, dictionary).validate(hedSchemas)
    const describeIssues = (issues) => issues.map((issue) => [issue.subCode, issue.hedIssue.internalCode])

    it('reports padded, then blank, then repeated names, and nothing else', () => {
      const issues = validate('onset\ttrial \t\tduration\tduration\t\t HED\n1.0\tgo\t\t0\t0\t\tRed\n')
      assert.deepEqual(describeIssues(issues), [
        ['TABULAR_INVALID', 'paddedTsvColumn'],
        ['TABULAR_INVALID', 'paddedTsvColumn'],
        ['TABULAR_INVALID', 'blankTsvColumn'],
        ['TABULAR_INVALID', 'blankTsvColumn'],
        ['TABULAR_INVALID', 'duplicateTsvColumn'],
      ])
      assert.deepEqual(
        issues.map((issue) => issue.hedIssue.parameters.column ?? issue.hedIssue.parameters.position),
        ['"trial "', '" HED"', '3', '6', 'duration'],
      )
      assert.include(issues[0].issueMessage, 'Column name "trial " in the header')
      assert.include(issues[2].issueMessage, 'Column 3 in the header of the tabular file has a blank name')
    })

    it('reports a name both padded and repeated once, as padded', () => {
      assert.deepEqual(describeIssues(validate('onset\ttrial \ttrial \n1.0\tgo\tgo\n')), [
        ['TABULAR_INVALID', 'paddedTsvColumn'],
      ])
    })

    it('reports a padded HED column in a file with no sidecar', () => {
      assert.deepEqual(describeIssues(validate('onset\tHED \n1.0\tRed\n', {})), [
        ['TABULAR_INVALID', 'paddedTsvColumn'],
      ])
    })

    it('does not check a file with no HED column and no HED sidecar', () => {
      assert.isEmpty(validate('onset\ttrial \t\n1.0\tgo\t\n', {}))
    })

    it('checks Map and old-format input the same way', () => {
      const map = new Map([
        ['onset', ['1.0']],
        ['trial ', ['go']],
        ['', ['']],
      ])
      assert.deepEqual(describeIssues(validate(map)), [
        ['TABULAR_INVALID', 'paddedTsvColumn'],
        ['TABULAR_INVALID', 'blankTsvColumn'],
      ])
      const oldFormat = {
        headers: ['onset', 'trial', 'HED '],
        rows: [
          ['onset', 'trial', 'HED '],
          ['1.0', 'go', 'Red'],
        ],
      }
      assert.deepEqual(describeIssues(validate(oldFormat, {})), [['TABULAR_INVALID', 'paddedTsvColumn']])
    })

    it('validates a name with an inner blank as before', () => {
      assert.isEmpty(validate('onset\tduration\ttrial type\n1.0\t0\tgo\n', { 'trial type': sidecar.trial }))
    })
  })

  describe('BidsSidecar keys', () => {
    const construct = (data) => new BidsSidecar('sidecar', { path: 'sidecar.json' }, data)
    const thrownIssue = (data) => {
      try {
        construct(data)
      } catch (error) {
        assert.instanceOf(error, IssueError)
        return [error.issue.hedCode, error.issue.internalCode, error.issue.parameters.sidecarKey]
      }
      assert.fail('the sidecar was constructed without an error')
    }

    it.each([
      ['a trailing blank', { 'trial ': { HED: { go: 'Red' } } }, '"trial "'],
      ['a leading blank', { ' response_time': { HED: 'Label/#' } }, '" response_time"'],
      ['a trailing tab', { 'trial\t': { HED: { go: 'Red' } } }, '"trial\\t"'],
      ['an entry without HED', { 'trial ': { Description: 'The trial type.' } }, '"trial "'],
      ['a padded HED key', { 'HED ': { HED: 'Red' } }, '"HED "'],
      ['the first of several', { trial: { HED: { go: 'Red' } }, ' a': {}, 'b ': {} }, '" a"'],
    ])('reports %s as SIDECAR_INVALID', (_, data, sidecarKey) => {
      assert.deepEqual(thrownIssue(data), ['SIDECAR_INVALID', 'paddedSidecarKey', sidecarKey])
    })

    it('still reports an unpadded HED key as illegalSidecarHedKey', () => {
      assert.deepEqual(thrownIssue({ HED: { HED: 'Red' } }), ['SIDECAR_INVALID', 'illegalSidecarHedKey', 'HED'])
    })

    it('keeps an unpadded key, including one with an inner blank, as written', () => {
      const sidecar = construct({ 'trial type': { HED: { go: 'Red' } }, trial: { HED: { go: 'Blue' } } })
      assert.deepEqual([...sidecar.sidecarKeys.keys()], ['trial type', 'trial'])
    })
  })
})
