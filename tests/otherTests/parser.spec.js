import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import { parseHedString, parseHedStrings } from '../../src/parser/parser'
import { GroupSpec } from '../../src/parser/tokenizer'
import { buildSchemasFromVersion } from '../../src/schema/init'

describe('Parser layer', () => {
  let hedSchemas

  beforeAll(async () => {
    hedSchemas = await buildSchemasFromVersion('8.4.0')
  })

  /**
   * Parse a HED string that must parse without errors.
   *
   * @param {string} hedString - The HED string.
   * @returns {ParsedHedString} The parsed string.
   */
  const parse = (hedString) => {
    const [parsedString, errors] = parseHedString(hedString, hedSchemas, false, false, false)
    assert.isEmpty(errors, `"${hedString}" should parse without errors`)
    return parsedString
  }

  describe('ParsedHedTag', () => {
    it('should give the unit classes of a value tag that has them', () => {
      const tag = parse('Frequency/3 Hz').tags[0]
      assert.deepStrictEqual(
        tag.unitClasses.map((unitClass) => unitClass.name),
        ['frequencyUnits'],
      )
      assert.isTrue(tag.hasUnitClass)
    })

    it('should give no unit classes for a value tag without them or a tag without a value', () => {
      for (const hedString of ['Label/abc', 'Red']) {
        const tag = parse(hedString).tags[0]
        assert.isFalse(tag.hasUnitClass, hedString)
        assert.deepStrictEqual(tag.unitClasses, [], hedString)
      }
    })

    it('should reject a value for a tag that takes no value', () => {
      const tag = parse('Red').tags[0]
      assert.include(tag.checkValue('abc'), 'does not take a value')
      assert.isFalse(tag.takesValue)
    })

    it('should accept a valid value for a tag that takes a value', () => {
      const tag = parse('Label/abc').tags[0]
      assert.isTrue(tag.takesValue)
      assert.strictEqual(tag.checkValue('xyz'), '')
    })

    it('should expose the value, split value and remainder', () => {
      const defTag = parse('Def/MyDef/3').tags[0]
      assert.strictEqual(defTag.value, 'MyDef')
      assert.strictEqual(defTag.splitValue, '3')
      assert.strictEqual(defTag.remainder, 'MyDef/3')
      const labelTag = parse('Label/abc').tags[0]
      assert.strictEqual(labelTag.value, 'abc')
      assert.isNull(labelTag.splitValue)
      assert.strictEqual(labelTag.remainder, 'abc')
    })
  })

  describe('ParsedHedGroup.subParsedGroupIterator', () => {
    it('should yield no group when no group has the named tag at its top level', () => {
      const group = parse('(Red, (Blue, Green))').tagGroups[0]
      assert.lengthOf([...group.subParsedGroupIterator('Def-expand')], 0)
      assert.lengthOf([...group.subParsedGroupIterator()], 2)
    })

    it('should yield only the groups with the named tag at their top level', () => {
      const group = parse('(Def-expand/MyDef, (Red, (Blue)))').tagGroups[0]
      const groups = [...group.subParsedGroupIterator('Def-expand')]
      assert.lengthOf(groups, 1)
      assert.strictEqual(groups[0], group)
    })
  })

  describe('parseHedStrings', () => {
    it('should apply fullValidation to each string', () => {
      const [parsedFull, errorsFull] = parseHedStrings(['Onset'], hedSchemas, false, false, true)
      assert.lengthOf(errorsFull, 1)
      assert.strictEqual(errorsFull[0].hedCode, 'TAG_GROUP_ERROR')
      assert.deepStrictEqual(parsedFull, [null])

      const [parsedPartial, errorsPartial] = parseHedStrings(['Onset'], hedSchemas, false, false, false)
      assert.lengthOf(errorsPartial, 0)
      assert.lengthOf(parsedPartial, 1)
      assert.isNotNull(parsedPartial[0])
    })
  })

  describe('parseHedString', () => {
    it('should report a HED string that is not a string', () => {
      const [parsedString, errors] = parseHedString(42, hedSchemas, false, true, true)
      assert.isNull(parsedString)
      assert.deepStrictEqual(
        errors.map((issue) => issue.internalCode),
        ['invalidTagString'],
      )
    })
  })

  describe('GroupSpec', () => {
    it('should default the end bound to -1 and the children to an empty list', () => {
      const groupSpec = new GroupSpec(3)
      assert.deepStrictEqual(groupSpec.bounds, [3, -1])
      assert.deepStrictEqual(groupSpec.children, [])
    })
  })
})
