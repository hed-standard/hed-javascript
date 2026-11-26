import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import { buildSchemas, buildSchemasFromVersion } from '../../src/schema/init'
import { SchemaSpec, SchemasSpec } from '../../src/schema/specs'
import { parseHedString } from '../../src/parser/parser'
import { generateIssue } from '../../src/issues/issues'
import { BidsSidecar } from '../../src/bids/types/json'
import { BidsHedSidecarValidator } from '../../src/bids/validator/sidecarValidator'

const testSchemasDir = 'spec_tests/hed-tests/json_test_data/test_schemas/hedxml'

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

  describe('SchemaUnit.conversionFactor with caret factors', () => {
    // HED 8.2.0 writes modifier factors as powers of ten (10^-15), which must not be read as 10e-15.
    let schemas820

    beforeAll(async () => {
      schemas820 = await buildSchemasFromVersion('8.2.0')
    })

    it.each([
      ['fs', 1e-15],
      ['ks', 1000],
      ['s', 1],
    ])('"%s" converts to seconds with factor %s', (unitString, expected) => {
      const unit = schemas820.baseSchema.entries.unitClasses.getEntry('timeUnits').units.get('s')
      assert.closeTo(unit.conversionFactor(unitString), expected, expected * 1e-9)
    })
  })

  describe('Units of a merge group', () => {
    let mergedSchemas

    beforeAll(async () => {
      // testaux declares the unit class auxUnits with two units; testclash 15.0.0 redeclares it identically with a
      // third unit (hed-tests case aux-new-units-under-shared-class).
      const specs = new SchemasSpec()
        .addSchemaSpec(new SchemaSpec('', '1.0.0', 'testaux', `${testSchemasDir}/HED_testaux_1.0.0.xml`))
        .addSchemaSpec(new SchemaSpec('', '15.0.0', 'testclash', `${testSchemasDir}/HED_testclash_15.0.0.xml`))
      mergedSchemas = await buildSchemas(specs)
    })

    it('should merge the units of a unit class declared by two libraries', () => {
      const unitClass = mergedSchemas.baseSchema.entries.unitClasses.getEntry('auxUnits')
      assert.isDefined(unitClass)
      assert.sameMembers([...unitClass.units.keys()], ['auxunit', 'bigauxunit', 'smallauxunit'])
    })

    it.each(['Aux-measure/2 smallauxunit', 'Aux-measure/5 auxunit'])('should accept "%s"', (tagString) => {
      const [, errorIssues] = parseHedString(tagString, mergedSchemas, false, false, false)
      assert.isEmpty(errorIssues, `"${tagString}" should parse without errors`)
    })
  })

  describe('SchemaUnit.modifiersUsed', () => {
    const unitOf = (unitClassName, unitName) =>
      hedSchemas.baseSchema.entries.unitClasses.getEntry(unitClassName).units.get(unitName)
    const names = (modifiers) => modifiers.map((modifier) => modifier.name)

    it.each([
      ['timeUnits', 's', 's', []],
      ['timeUnits', 's', 'ms', ['m']],
      ['timeUnits', 'second', 'milliseconds', ['milli']],
      ['accelerationUnits', 'm-per-s^2', 'km-per-ms^2', ['k', 'm']],
      ['accelerationUnits', 'm-per-s^2', 'm-per-ms^2', ['m']],
      ['timeUnits', 's', 'xs', []],
    ])('%s unit %s gives "%s" the modifiers %j', (unitClassName, unitName, value, expected) => {
      assert.deepStrictEqual(names(unitOf(unitClassName, unitName).modifiersUsed(value)), expected)
    })
  })

  // Specification 3.1.6 and Appendix B ELEMENT_DEPRECATED (b): a deprecated unit or unit modifier stays valid and is
  // warned about. In testaux 1.1.0 the unit bigauxunit and the unit modifier auxMod are deprecated.
  describe('Deprecated units and unit modifiers', () => {
    let auxSchemas

    beforeAll(async () => {
      const specs = new SchemasSpec().addSchemaSpec(
        new SchemaSpec('', '1.1.0', 'testaux', `${testSchemasDir}/HED_testaux_1.1.0.xml`),
      )
      auxSchemas = await buildSchemas(specs)
    })

    const parseAux = (hedString) => {
      const [, errorIssues, warningIssues] = parseHedString(hedString, auxSchemas, false, false, true)
      return [errorIssues, warningIssues]
    }

    it.each([
      ['Aux-measure/3 bigauxunit', '[Aux-measure/3 bigauxunit]', '[bigauxunit]'],
      ['Aux-measure/3 auxModauxsiunit', '[Aux-measure/3 auxModauxsiunit]', '[auxMod]'],
      [
        'Aux-measure/3 bigauxunit, Aux-measure/4 auxModauxsiunit',
        '[Aux-measure/3 bigauxunit, Aux-measure/4 auxModauxsiunit]',
        '[bigauxunit, auxMod]',
      ],
    ])('should warn ELEMENT_DEPRECATED for "%s"', (hedString, tags, units) => {
      const [errorIssues, warningIssues] = parseAux(hedString)
      assert.isEmpty(errorIssues)
      assert.deepStrictEqual(warningIssues, [
        generateIssue('deprecatedUnit', { tags: tags, units: units, string: hedString }),
      ])
    })

    it.each(['Aux-measure/3 auxunit', 'Aux-measure/3 auxsiunit'])('should not warn for "%s"', (hedString) => {
      assert.deepStrictEqual(parseAux(hedString), [[], []])
    })

    // The sidecar validator parses each annotation twice; the warning is reported once.
    it.each([
      ['Aux-measure/3 bigauxunit', []],
      ['Aux-measure/3 bigauxunit, Def/Missing', ['missingDefinitionForDef']],
    ])('should warn once for the sidecar annotation "%s"', (hedString, errorCodes) => {
      const sidecar = new BidsSidecar('thisOne', { path: 'thisOne.json' }, { code: { HED: { go: hedString } } })
      const validator = new BidsHedSidecarValidator(sidecar, auxSchemas)
      validator.validate()
      assert.deepStrictEqual(
        validator.errors.map((issue) => issue.hedIssue.internalCode),
        errorCodes,
      )
      assert.deepStrictEqual(
        validator.warnings.map((issue) => issue.hedIssue.internalCode),
        ['deprecatedUnit'],
      )
    })
  })

  describe('SchemaUnitClass.defaultUnit', () => {
    it('should return the listed default unit', () => {
      const unitClass = hedSchemas.baseSchema.entries.unitClasses.getEntry('speedUnits')
      assert.strictEqual(unitClass.defaultUnit.name, 'm-per-s')
    })

    describe('with a default derived from a listed unit (HED 8.5.0)', () => {
      let schemas850

      beforeAll(async () => {
        const specs = new SchemasSpec().addSchemaSpec(new SchemaSpec('', '8.5.0', '', `${testSchemasDir}/HED8.5.0.xml`))
        schemas850 = await buildSchemas(specs)
      })

      it.each([
        ['currentUnits', 'mA', 'A'],
        ['resistanceUnits', 'kOhm', 'Ohm'],
      ])('%s with default %s should return the unit %s', (unitClassName, defaultUnits, expected) => {
        const unitClass = schemas850.baseSchema.entries.unitClasses.getEntry(unitClassName)
        assert.strictEqual(unitClass.getSingleAttributeValue('defaultUnits'), defaultUnits)
        assert.strictEqual(unitClass.defaultUnit.name, expected)
      })
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

  describe('ParsedHedTag.valueAsDefaultUnit with anyUnits', () => {
    let schemas850

    beforeAll(async () => {
      const specs = new SchemasSpec().addSchemaSpec(new SchemaSpec('', '8.5.0', '', `${testSchemasDir}/HED8.5.0.xml`))
      schemas850 = await buildSchemas(specs)
    })

    const parseTag850 = (tagString) => {
      const [parsedString, errorIssues] = parseHedString(tagString, schemas850, false, false, false)
      assert.isEmpty(errorIssues, `"${tagString}" should parse without errors`)
      return parsedString.tags[0]
    }

    it('should not convert a bare value, which has no default unit', () => {
      assert.isNull(parseTag850('Quantity/3').valueAsDefaultUnit())
    })

    it("should convert a value with a unit to the default unit of that unit's class", () => {
      assert.closeTo(parseTag850('Quantity/300 ms').valueAsDefaultUnit(), 0.3, 1e-12)
    })
  })
})
