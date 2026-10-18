import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import { buildSchemasFromVersion } from '../../src/schema/init'
import { BidsTsvFile } from '../../src/bids'
import {
  convertParsedTSVData,
  findDuplicateHeaders,
  findDuplicateParsedHeaders,
  parseTSV,
} from '../../src/bids/tsvParser'

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
