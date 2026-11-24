import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import { buildSchemasFromVersion } from '../../src/schema/init'
import { parseHedString } from '../../src/parser/parser'
import { readUnitPlurals } from '../../src/schema/entries/unit'
import unitPluralsData from '../../src/data/json/unit_plurals.json'
import { IssueError } from '../../src/issues/issues'

// Specification section 3.1.4.4: no plural is derived by a rule. A unit name that is a key of
// unit_plurals.json has that plural, a name that is not a key has none, and a unit symbol has none.
describe('Unit plurals from unit_plurals.json', () => {
  let hedSchemas

  beforeAll(async () => {
    hedSchemas = await buildSchemasFromVersion('8.5.0')
  })

  const errorCodes = (hedString) =>
    parseHedString(hedString, hedSchemas, false, false, true)[1].map((issue) => issue.hedCode)

  it.each([
    ['Quantity/3 degrees-Celsius', 'the listed plural of degree-Celsius'],
    ['Quantity/3 millidegrees-Celsius', 'an SI modifier followed by the listed plural'],
    ['Quantity/3 milliseconds', 'an SI modifier followed by the listed plural'],
    ['Frequency/3 hertz', 'hertz, its own plural'],
    ['Frequency/3 Hz', 'a unit symbol'],
  ])('accepts "%s" (%s)', (hedString) => {
    assert.deepStrictEqual(errorCodes(hedString), [])
  })

  it.each([
    ['Quantity/3 degree-Celsiuses', 'a derived plural that the file does not list'],
    ['Quantity/3 millidegree-Celsiuses', 'a modifier with a derived plural'],
    ['Frequency/3 hertzs', 'a derived plural of a name that is its own plural'],
    ['Frequency/3 Hzs', 'a plural of a unit symbol'],
  ])('rejects "%s" (%s) as UNITS_INVALID', (hedString) => {
    assert.deepStrictEqual(errorCodes(hedString), ['UNITS_INVALID'])
  })

  // Specification Appendix A.6.1: refuse a file whose file version major number is not 1.
  describe('file version', () => {
    const withVersion = (fileVersion) => ({ ...unitPluralsData, file_version: fileVersion })

    it('the packaged file carries a file_version with major 1', () => {
      assert.match(unitPluralsData.file_version, /^1\.\d+\.\d+$/)
    })

    it('reads the plurals of the packaged file', () => {
      const plurals = readUnitPlurals(unitPluralsData)
      assert.strictEqual(plurals.get('degree-Celsius'), 'degrees-Celsius')
      assert.strictEqual(plurals.get('hertz'), 'hertz')
      assert.isUndefined(plurals.get('Hz'))
    })

    it.each(['1.0.0', '1.2.3'])('reads file_version %s', (version) => {
      assert.doesNotThrow(() => readUnitPlurals(withVersion(version)))
    })

    it.each([
      ['major 2', '2.0.0', '"2.0.0"'],
      ['no file_version', undefined, 'missing'],
    ])('refuses a file with %s', (label, version, shown) => {
      const error = assert.throws(() => readUnitPlurals(withVersion(version)), IssueError)
      assert.include(error.message, `unit_plurals.json has file_version ${shown}`)
    })
  })
})
