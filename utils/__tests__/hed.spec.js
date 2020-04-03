const assert = require('chai').assert
const hed = require('../hed')
const schema = require('../../validators/schema')

describe('HED tag string utility functions', () => {
  it('should properly replace tag values with the pound character', () => {
    const slashString = 'Event/Duration/4 ms'
    const noSlashString = 'Something'
    const replacedSlashString = hed.replaceTagNameWithPound(slashString)
    const replacedNoSlashString = hed.replaceTagNameWithPound(noSlashString)
    assert.strictEqual(replacedSlashString, 'Event/Duration/#')
    assert.strictEqual(replacedNoSlashString, '#')
  })

  it('should detect the locations of slashes in a tag', () => {
    const string1 = 'Event/Description/Something'
    const string2 = 'Attribute/Direction/Left'
    const slashIndices1 = hed.getTagSlashIndices(string1)
    const slashIndices2 = hed.getTagSlashIndices(string2)
    assert.deepStrictEqual(slashIndices1, [5, 17])
    assert.deepStrictEqual(slashIndices2, [9, 19])
  })

  it('should extract the last part of a tag', () => {
    const string1 = 'Event/Description/Something'
    const string2 = 'Attribute/Direction/Left'
    const noSlashString = 'Participant'
    const name1 = hed.getTagName(string1)
    const name2 = hed.getTagName(string2)
    const noSlashName = hed.getTagName(noSlashString)
    assert.strictEqual(name1, 'Something')
    assert.strictEqual(name2, 'Left')
    assert.strictEqual(noSlashName, 'Participant')
  })
})

const localHedSchemaFile = 'tests/data/HED-devunit.xml'

describe('HED tag schema-based utility functions', () => {
  let hedSchemaPromise

  beforeAll(() => {
    hedSchemaPromise = schema.buildSchema({ path: localHedSchemaFile })
  })

  it('should correctly determine if a tag exists', () => {
    const validTag1 = 'attribute/direction/left'
    const validTag2 = 'item/object/person'
    const validTag3 = 'attribute/duration/#'
    const invalidTag1 = 'something'
    const invalidTag2 = 'attribute/nothing'
    const invalidTag3 = 'participant/#'
    return hedSchemaPromise.then(hedSchema => {
      const validTag1Result = hed.tagExistsInSchema(validTag1, hedSchema)
      const validTag2Result = hed.tagExistsInSchema(validTag2, hedSchema)
      const validTag3Result = hed.tagExistsInSchema(validTag3, hedSchema)
      const invalidTag1Result = hed.tagExistsInSchema(invalidTag1, hedSchema)
      const invalidTag2Result = hed.tagExistsInSchema(invalidTag2, hedSchema)
      const invalidTag3Result = hed.tagExistsInSchema(invalidTag3, hedSchema)
      assert.strictEqual(validTag1Result, true)
      assert.strictEqual(validTag2Result, true)
      assert.strictEqual(validTag3Result, true)
      assert.strictEqual(invalidTag1Result, false)
      assert.strictEqual(invalidTag2Result, false)
      assert.strictEqual(invalidTag3Result, false)
    })
  })

  it('should correctly determine if a tag takes a value', () => {
    const valueTag1 = 'attribute/direction/left/35 px'
    const valueTag2 = 'attribute/id/value/35'
    const valueTag3 = 'attribute/duration/#'
    const noValueTag1 = 'something'
    const noValueTag2 = 'attribute/color/black'
    const noValueTag3 = 'participant/#'
    return hedSchemaPromise.then(hedSchema => {
      const valueTag1Result = hed.tagTakesValue(valueTag1, hedSchema)
      const valueTag2Result = hed.tagTakesValue(valueTag2, hedSchema)
      const valueTag3Result = hed.tagTakesValue(valueTag3, hedSchema)
      const noValueTag1Result = hed.tagTakesValue(noValueTag1, hedSchema)
      const noValueTag2Result = hed.tagTakesValue(noValueTag2, hedSchema)
      const noValueTag3Result = hed.tagTakesValue(noValueTag3, hedSchema)
      assert.strictEqual(valueTag1Result, true)
      assert.strictEqual(valueTag2Result, true)
      assert.strictEqual(valueTag3Result, true)
      assert.strictEqual(noValueTag1Result, false)
      assert.strictEqual(noValueTag2Result, false)
      assert.strictEqual(noValueTag3Result, false)
    })
  })

  it('should correctly determine if a tag has a unit class', () => {
    const unitClassTag1 = 'attribute/direction/left/35 px'
    const unitClassTag2 = 'participant/effect/cognitive/reward/$10.55'
    const unitClassTag3 = 'attribute/duration/#'
    const noUnitClassTag1 = 'something'
    const noUnitClassTag2 = 'attribute/color/red/0.5'
    const noUnitClassTag3 = 'participant/#'
    return hedSchemaPromise.then(hedSchema => {
      const unitClassTag1Result = hed.isUnitClassTag(unitClassTag1, hedSchema)
      const unitClassTag2Result = hed.isUnitClassTag(unitClassTag2, hedSchema)
      const unitClassTag3Result = hed.isUnitClassTag(unitClassTag3, hedSchema)
      const noUnitClassTag1Result = hed.isUnitClassTag(
        noUnitClassTag1,
        hedSchema,
      )
      const noUnitClassTag2Result = hed.isUnitClassTag(
        noUnitClassTag2,
        hedSchema,
      )
      const noUnitClassTag3Result = hed.isUnitClassTag(
        noUnitClassTag3,
        hedSchema,
      )
      assert.strictEqual(unitClassTag1Result, true)
      assert.strictEqual(unitClassTag2Result, true)
      assert.strictEqual(unitClassTag3Result, true)
      assert.strictEqual(noUnitClassTag1Result, false)
      assert.strictEqual(noUnitClassTag2Result, false)
      assert.strictEqual(noUnitClassTag3Result, false)
    })
  })

  it("should correctly determine a tag's default unit, if any", () => {
    const unitClassTag1 = 'attribute/blink/duration/35 ms'
    const unitClassTag2 = 'participant/effect/cognitive/reward/11 dollars'
    const noUnitClassTag = 'attribute/color/red/0.5'
    const noValueTag = 'attribute/color/black'
    return hedSchemaPromise.then(hedSchema => {
      const unitClassTag1Result = hed.getUnitClassDefaultUnit(
        unitClassTag1,
        hedSchema,
      )
      const unitClassTag2Result = hed.getUnitClassDefaultUnit(
        unitClassTag2,
        hedSchema,
      )
      const noUnitClassTagResult = hed.getUnitClassDefaultUnit(
        noUnitClassTag,
        hedSchema,
      )
      const noValueTagResult = hed.getUnitClassDefaultUnit(
        noValueTag,
        hedSchema,
      )
      assert.strictEqual(unitClassTag1Result, 's')
      assert.strictEqual(unitClassTag2Result, '$')
      assert.strictEqual(noUnitClassTagResult, '')
      assert.strictEqual(noValueTagResult, '')
    })
  })

  it("should correctly determine a tag's unit classes, if any", () => {
    const unitClassTag1 = 'attribute/direction/left/35 px'
    const unitClassTag2 = 'participant/effect/cognitive/reward/$10.55'
    const unitClassTag3 = 'attribute/duration/#'
    const noUnitClassTag = 'attribute/color/red/0.5'
    return hedSchemaPromise.then(hedSchema => {
      const unitClassTag1Result = hed.getTagUnitClasses(
        unitClassTag1,
        hedSchema,
      )
      const unitClassTag2Result = hed.getTagUnitClasses(
        unitClassTag2,
        hedSchema,
      )
      const unitClassTag3Result = hed.getTagUnitClasses(
        unitClassTag3,
        hedSchema,
      )
      const noUnitClassTagResult = hed.getTagUnitClasses(
        noUnitClassTag,
        hedSchema,
      )
      assert.sameDeepMembers(unitClassTag1Result, [
        'angle',
        'physicalLength',
        'pixels',
      ])
      assert.sameDeepMembers(unitClassTag2Result, ['currency'])
      assert.sameDeepMembers(unitClassTag3Result, ['time'])
      assert.deepStrictEqual(noUnitClassTagResult, [])
    })
  })

  it("should correctly determine a tag's legal units, if any", () => {
    const unitClassTag1 = 'attribute/direction/left/35 px'
    const unitClassTag2 = 'participant/effect/cognitive/reward/$10.55'
    const noUnitClassTag = 'attribute/color/red/0.5'
    return hedSchemaPromise.then(hedSchema => {
      const unitClassTag1Result = hed.getTagUnitClassUnits(
        unitClassTag1,
        hedSchema,
      )
      const unitClassTag2Result = hed.getTagUnitClassUnits(
        unitClassTag2,
        hedSchema,
      )
      const noUnitClassTagResult = hed.getTagUnitClassUnits(
        noUnitClassTag,
        hedSchema,
      )
      assert.sameDeepMembers(unitClassTag1Result, [
        'degree',
        'radian',
        'rad',
        'm',
        'foot',
        'metre',
        'mile',
        'px',
        'pixel',
      ])
      assert.sameDeepMembers(unitClassTag2Result, [
        'dollar',
        '$',
        'point',
        'fraction',
      ])
      assert.deepStrictEqual(noUnitClassTagResult, [])
    })
  })

  it('should strip valid units from a value', () => {
    const dollarsString = '$25.99'
    const volumeString = '100 m^3'
    const prefixedVolumeString = '100 cm^3'
    const invalidVolumeString = '200 cm'
    const currencyUnits = ['dollars', '$', 'points', 'fraction']
    const volumeUnits = ['m^3']
    return hedSchemaPromise.then(hedSchema => {
      const strippedDollarsString = hed.validateUnits(
        dollarsString,
        dollarsString,
        currencyUnits,
        hedSchema,
      )
      const strippedVolumeString = hed.validateUnits(
        volumeString,
        volumeString,
        volumeUnits,
        hedSchema,
      )
      const strippedPrefixedVolumeString = hed.validateUnits(
        prefixedVolumeString,
        prefixedVolumeString,
        volumeUnits,
        hedSchema,
      )
      const strippedInvalidVolumeString = hed.validateUnits(
        invalidVolumeString,
        invalidVolumeString,
        volumeUnits,
        hedSchema,
      )
      assert.strictEqual(strippedDollarsString, '25.99')
      assert.strictEqual(strippedVolumeString, '100')
      assert.strictEqual(strippedPrefixedVolumeString, '100')
      assert.strictEqual(strippedInvalidVolumeString, '200 cm')
    })
  })

  it('should correctly determine if a tag allows extensions', () => {
    const extensionTag1 = 'item/object/vehicle/boat'
    const extensionTag2 = 'attribute/color/red/0.5'
    const noExtensionTag = 'event/nonsense'
    return hedSchemaPromise.then(hedSchema => {
      const extensionTag1Result = hed.isExtensionAllowedTag(
        extensionTag1,
        hedSchema,
      )
      const extensionTag2Result = hed.isExtensionAllowedTag(
        extensionTag2,
        hedSchema,
      )
      const noExtensionTagResult = hed.isExtensionAllowedTag(
        noExtensionTag,
        hedSchema,
      )
      assert.strictEqual(extensionTag1Result, true)
      assert.strictEqual(extensionTag2Result, true)
      assert.strictEqual(noExtensionTagResult, false)
    })
  })
})
