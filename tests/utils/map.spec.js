import chai from 'chai'
const assert = chai.assert
import { describe, it } from '@jest/globals'

import isEqual from 'lodash/isEqual'

import * as mapUtils from '../../utils/map'

describe('Map utility functions', () => {
  describe('Non-equal duplicate filtering', () => {
    it('must filter non-equal duplicates', () => {
      const keyValueList = [
        ['first', 21],
        ['second', 42],
        ['duplicate', 63],
        ['duplicate', 64],
        ['third', 75],
        ['fourth', 100],
      ]
      const expectedMap = new Map([
        ['first', 21],
        ['second', 42],
        ['third', 75],
        ['fourth', 100],
      ])
      const expectedDuplicates = [
        ['duplicate', 63],
        ['duplicate', 64],
      ]
      const [actualMap, actualDuplicates] = mapUtils.filterNonEqualDuplicates(keyValueList, isEqual)
      assert.deepStrictEqual(actualMap, expectedMap, 'Filtered map')
      assert.sameDeepMembers(actualDuplicates, expectedDuplicates, 'Duplicate map')
    })
  })
})
