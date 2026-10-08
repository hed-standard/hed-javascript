import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import { buildSchemasFromVersion } from '../../src/schema/init'
import { parseHedString } from '../../src/parser/parser'

describe('Unit expansion and conversion', () => {
  let hedSchemas

  beforeAll(async () => {
    hedSchemas = await buildSchemasFromVersion('8.4.0')
  })

  const parseTag = (tagString) => {
    const [parsedString, errorIssues] = parseHedString(tagString, hedSchemas, false, false, false)
    assert.isEmpty(errorIssues, `"${tagString}" should parse without errors`)
    return parsedString.tags[0]
  }

  describe('SchemaUnit.conversionFactor', () => {
    const cases = [
      ['timeUnits', 's', 's', 1],
      ['timeUnits', 's', 'ms', 0.001],
      ['timeUnits', 'second', 'milliseconds', 0.001],
      ['timeUnits', 'minute', 'minutes', 60],
      ['timeUnits', 'hour', 'hour', 3600],
      ['timeUnits', 'day', 'day', 86400],
      ['timeUnits', 'month', 'month', null],
      ['timeUnits', 'year', 'year', null],
      ['speedUnits', 'm-per-s', 'm-per-s', 1],
      ['speedUnits', 'm-per-s', 'km-per-s', 1000],
      // HED 8.4.0 writes the micro factor as "10e-6" (1e-5), so cm-per-us is 1000 there; cm-per-ms avoids that quirk.
      ['speedUnits', 'm-per-s', 'cm-per-ms', 10],
      ['speedUnits', 'm-per-s', 'kmm-per-s', null],
      ['volumeUnits', 'm^3', 'mm^3', 1e-9],
      ['accelerationUnits', 'm-per-s^2', 'mm-per-s^2', 0.001],
      ['accelerationUnits', 'm-per-s^2', 'm-per-ms^2', 1e6],
    ]

    it.each(cases)('%s unit %s: "%s" converts with factor %s', (unitClassName, unitName, unitString, expected) => {
      const unitClass = hedSchemas.baseSchema.entries.unitClasses.getEntry(unitClassName)
      const unit = unitClass.units.get(unitName)
      assert.isDefined(unit, `unit ${unitName} of ${unitClassName}`)
      const factor = unit.conversionFactor(unitString)
      if (expected === null) {
        assert.isNull(factor)
      } else {
        assert.closeTo(factor, expected, Math.abs(expected) * 1e-9)
      }
    })
  })

  describe('SchemaUnitClass.defaultUnit', () => {
    it('should return the listed default unit', () => {
      const unitClass = hedSchemas.baseSchema.entries.unitClasses.getEntry('speedUnits')
      assert.strictEqual(unitClass.defaultUnit.name, 'm-per-s')
    })
  })

  describe('ParsedHedTag.valueAsDefaultUnit', () => {
    const cases = [
      ['Duration/300 ms', 0.3],
      ['Duration/2 minutes', 120],
      ['Duration/1.5', 1.5],
      ['Delay/1 day', 86400],
      ['Delay/3 month', null],
      ['Duration/3 year', null],
      ['Speed/3 km-per-s', 3000],
      ['Volume/2 mm^3', 2e-9],
    ]

    it.each(cases)('"%s" in default units is %s', (tagString, expected) => {
      const tag = parseTag(tagString)
      const value = tag.valueAsDefaultUnit()
      if (expected === null) {
        assert.isNull(value)
      } else {
        assert.closeTo(value, expected, Math.abs(expected) * 1e-9)
      }
    })

    it('should return null for a tag without a value', () => {
      const tag = parseTag('Red')
      assert.isNull(tag.valueAsDefaultUnit())
    })
  })
})
