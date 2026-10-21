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
  isMissingTsvValue,
  parseTSV,
  parseTSVHeader,
} from '../../src/bids/tsvParser'
import { IssueError } from '../../src/issues/issues'
import { columnNameText, isPaddedName, stripNameWhitespace } from '../../src/utils/string'

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

    it('treats a name that is not a string as not padded', () => {
      assert.isFalse(isPaddedName(null))
      assert.isFalse(isPaddedName(1))
    })
  })

  describe('columnNameText', () => {
    it.each([
      ['trial ', 'trial '],
      [1, '1'],
      [1.0, '1'],
      [-0, '0'],
      [1.5, '1.5'],
      [1e21, '1000000000000000000000'],
      [null, ''],
      [undefined, ''],
      [NaN, ''],
    ])('%j becomes %j', (name, text) => {
      assert.strictEqual(columnNameText(name), text)
    })
  })

  describe('parseTSV and parseTSVHeader', () => {
    it('keep the header cells and the data cells as written', () => {
      const contents = 'onset\t HED\ttrial \t\n 1.0 \t Red \t go\t\n'
      assert.deepEqual(parseTSVHeader(contents), ['onset', ' HED', 'trial ', ''])
      assert.deepEqual(
        [...parseTSV(contents).entries()],
        [
          ['onset', [' 1.0 ']],
          [' HED', [' Red ']],
          ['trial ', [' go']],
          ['', ['']],
        ],
      )
    })

    it('keep a header of tabs only as blank names, not skip it', () => {
      const contents = '\n\t\n1\tgo\n'
      assert.deepEqual(parseTSVHeader(contents), ['', ''])
      assert.deepEqual([...parseTSV(contents).entries()], [['', ['1']]])
    })

    it('still skip blank lines before the header', () => {
      assert.deepEqual(parseTSVHeader('\n  \nonset\tHED\n1\tRed\n'), ['onset', 'HED'])
    })

    it('keep a data line with a tab as a row, and skip an empty line or blanks without a tab', () => {
      // As pandas reads it in hed-python (skip_blank_lines): ` \t` is a row; '' and '   ' are not.
      assert.deepEqual(
        [...parseTSV('trial\tHED\n \t\n\n   \ngo\tRed\n').entries()],
        [
          ['trial', [' ', 'go']],
          ['HED', ['', 'Red']],
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

    it('reports every name of a header of tabs only as blank', () => {
      const issues = validate('\t\n1\tgo\n')
      assert.deepEqual(describeIssues(issues), [
        ['TABULAR_INVALID', 'blankTsvColumn'],
        ['TABULAR_INVALID', 'blankTsvColumn'],
      ])
      assert.deepEqual(
        issues.map((issue) => issue.hedIssue.parameters.position),
        ['1', '2'],
      )
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

    it('checks Map keys and old-format headers as text', () => {
      const map = new Map([
        ['onset', ['1.0']],
        [1, ['go']],
        ['1', ['stop']],
        ['HED', ['Red']],
      ])
      assert.deepEqual(describeIssues(validate(map, {})), [['TABULAR_INVALID', 'duplicateTsvColumn']])
      const oldFormat = (headers) => ({ headers, rows: [headers, ['1.0', 'go', 'Red']] })
      assert.deepEqual(describeIssues(validate(oldFormat([1, 1.0, 'HED']), {})), [
        ['TABULAR_INVALID', 'duplicateTsvColumn'],
      ])
      assert.deepEqual(describeIssues(validate(oldFormat(['onset', null, 'HED']), {})), [
        ['TABULAR_INVALID', 'blankTsvColumn'],
      ])
    })

    it('matches a numeric name to its sidecar key', () => {
      const map = new Map([
        ['onset', ['1.0']],
        [1, ['go']],
      ])
      const file = new BidsTsvFile('events', { path: 'events.tsv' }, map, { 1: { HED: { go: 'Red' } } })
      assert.deepEqual([...file.parsedTsv.keys()], ['onset', '1'])
      assert.isEmpty(file.validate(hedSchemas))
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

// A padded value in a column with HED annotations is TABULAR_INVALID (specification 3.2.10.2, Appendix B reason d),
// and a padded key under HED in a categorical entry is SIDECAR_INVALID (3.2.9.2, reason e).
describe('Padded values and categorical keys', () => {
  let hedSchemas
  const sidecar = {
    trial: { HED: { go: 'Experimental-trial', stop: 'Agent-action' } },
    age: { HED: 'Age/#' },
  }
  const header = 'onset\tduration\ttrial\tage\tHED'

  beforeAll(async () => {
    hedSchemas = await buildSchemasFromVersion('8.4.0')
  })

  const validate = (rows, dictionary = sidecar, firstLine = header) =>
    new BidsTsvFile('events', { path: 'events.tsv' }, [firstLine, ...rows].join('\n') + '\n', dictionary).validate(
      hedSchemas,
    )
  const describeIssues = (issues) => issues.map((issue) => [issue.subCode, issue.hedIssue.internalCode])

  describe('isMissingTsvValue', () => {
    it.each([
      ['', true],
      ['n/a', true],
      ['n/a ', true],
      [' ', true],
      [null, true],
      ['go', false],
      ['n/a ', false],
    ])('%j is missing: %j', (value, missing) => {
      assert.strictEqual(isMissingTsvValue(value), missing)
    })
  })

  describe('BidsTsvFile validation', () => {
    it.each([['go '], [' go'], [' '], ['n/a ']])('reports the categorical value %j and nothing else', (cell) => {
      const issues = validate([`1.0\t0\t${cell}\t30\tRed`])
      assert.deepEqual(describeIssues(issues), [['TABULAR_INVALID', 'paddedTsvValue']])
      assert.strictEqual(issues[0].hedIssue.parameters.column, 'trial')
      assert.strictEqual(issues[0].hedIssue.parameters.value, JSON.stringify(cell))
      assert.strictEqual(issues[0].hedIssue.parameters.tsvLine, '2')
    })

    it.each([['30 '], [' 30']])('reports the value-column value %j instead of a value error', (cell) => {
      const issues = validate([`1.0\t0\tgo\t${cell}\tRed`])
      assert.deepEqual(describeIssues(issues), [['TABULAR_INVALID', 'paddedTsvValue']])
      assert.strictEqual(issues[0].hedIssue.parameters.column, 'age')
    })

    it('reports each distinct value once and stops before the HED column', () => {
      const issues = validate(['1.0\t0\tgo \t30\tInvalidTagXYZ', '2.0\t0\tgo \t30\tRed', '3.0\t0\tstop \t30\tRed'])
      assert.deepEqual(describeIssues(issues), [
        ['TABULAR_INVALID', 'paddedTsvValue'],
        ['TABULAR_INVALID', 'paddedTsvValue'],
      ])
      assert.deepEqual(
        issues.map((issue) => issue.hedIssue.parameters.tsvLine),
        ['2', '4'],
      )
    })

    it('reports a padded value on a data line of blanks and tabs, as for Map input', () => {
      const dictionary = { trial: { HED: { go: 'Experimental-trial' } } }
      const textIssues = validate([' \t'], dictionary, 'trial\tHED')
      assert.deepEqual(describeIssues(textIssues), [['TABULAR_INVALID', 'paddedTsvValue']])
      assert.strictEqual(textIssues[0].hedIssue.parameters.tsvLine, '2')
      const mapInput = new Map([
        ['trial', [' ']],
        ['HED', ['']],
      ])
      const mapIssues = new BidsTsvFile('events', { path: 'events.tsv' }, mapInput, dictionary).validate(hedSchemas)
      assert.deepEqual(describeIssues(mapIssues), describeIssues(textIssues))
    })

    it('groups onsets that differ only by surrounding whitespace when checking duplicates across rows', () => {
      const onsetHeader = 'onset\tduration\tHED'
      const plain = validate(['19\t0\tRed', '19\t0\tRed'], {}, onsetHeader)
      assert.isNotEmpty(plain, 'two rows with the same onset and the same tag report a duplicate')
      const padded = validate(['19\t0\tRed', ' 19 \t0\tRed'], {}, onsetHeader)
      assert.deepEqual(describeIssues(padded), describeIssues(plain))
    })

    it('passes clean values, missing values, a padded HED cell and an unannotated column', () => {
      assert.isEmpty(validate(['1.0\t0\tgo\t30\t Red ', '2.0\t0\tn/a\t\tBlue', '3.0\t0\tstop\t30\tn/a ']))
      assert.isEmpty(validate(['1.0\t0\tgo\tx \tRed'], sidecar, 'onset\tduration\ttrial\tnote\tHED'))
    })

    it('treats a value ending with a no-break space as a value without an annotation', () => {
      const issues = validate(['1.0\t0\tgo \t30\tRed'])
      assert.deepEqual(describeIssues(issues), [['SIDECAR_KEY_MISSING', 'sidecarKeyMissing']])
    })

    it('refuses a padded categorical key when the sidecar is built', () => {
      // Thrown as paddedSidecarKey is; dataset validation turns the throw into an issue.
      for (const key of ['go ', ' go', 'go\t']) {
        try {
          new BidsSidecar('sidecar', { path: 'sidecar.json' }, { trial: { HED: { [key]: 'Experimental-trial' } } })
          assert.fail(`the sidecar with key ${JSON.stringify(key)} was built without an error`)
        } catch (error) {
          assert.instanceOf(error, IssueError)
          assert.deepEqual(
            [error.issue.hedCode, error.issue.internalCode, error.issue.parameters.categoricalKey],
            ['SIDECAR_INVALID', 'paddedSidecarCategoricalKey', JSON.stringify(key)],
          )
        }
      }
    })

    it('does not check the keys of a Levels dictionary or an inner blank', () => {
      const dictionary = {
        trial: { Levels: { 'go ': 'A go trial' }, HED: { go: 'Experimental-trial', 'go now': 'Agent-action' } },
      }
      assert.isEmpty(validate(['1.0\t0\tgo\tRed'], dictionary, 'onset\tduration\ttrial\tHED'))
    })
  })
})
