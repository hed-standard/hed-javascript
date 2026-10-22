import chai from 'chai'
const assert = chai.assert
import { beforeAll, describe, it } from '@jest/globals'

import { BidsSidecar } from '../../src/bids/types/json'
import { buildSchemasFromVersion } from '../../src/schema/init'

describe('BidsHedSidecarValidator', () => {
  let hedSchemas

  beforeAll(async () => {
    hedSchemas = await buildSchemasFromVersion('8.4.0')
  })

  it('should stop before the full-validation pass when the string checks found errors', () => {
    // The missing definition is found by the string checks; the ungrouped Onset only by the full-validation pass.
    const sidecar = new BidsSidecar(
      'task-test_events.json',
      { path: 'task-test_events.json' },
      { event_code: { HED: { face: 'Def/Missing-def, Onset' } } },
    )
    const issues = sidecar.validate(hedSchemas)
    assert.deepStrictEqual(
      issues.map((issue) => issue.hedIssue.internalCode),
      ['missingDefinitionForDef'],
    )
  })

  it('should add the sidecar key and file path to definition and placeholder issues', () => {
    const sidecar = new BidsSidecar(
      'task-test_events.json',
      { path: 'task-test_events.json' },
      { event_code: { HED: { face: 'Def/Missing-def' } } },
    )
    const [issue] = sidecar.validate(hedSchemas)
    assert.strictEqual(issue.hedIssue.parameters.sidecarKey, 'event_code')
    assert.strictEqual(issue.hedIssue.parameters.filePath, 'task-test_events.json')
    assert.include(issue.issueMessage, 'File path: "task-test_events.json"')
  })
})
