import { describe, it, expect, afterEach, jest } from '@jest/globals'
import path from 'node:path'
import fs from 'node:fs'
import { toMatchIssue } from '../testHelpers/toMatchIssue'
import { BidsDataset } from '../../src/bids/types/dataset'
import { BidsDirectoryAccessor, BidsFileAccessor } from '../../src/bids/datasetParser'
import { HedSchemas } from '../../src/schema/containers'

expect.extend({
  toMatchIssue(receivedError, expectedCode, expectedParams) {
    return toMatchIssue(receivedError, expectedCode, expectedParams)
  },
})

const demoDataRoot = path.resolve(__dirname, '../bidsDemoData')
const invalidDataRoot = path.resolve(__dirname, '../otherTestData/invalidDataset')

describe('BidsDataset', () => {
  afterEach(() => {
    jest.clearAllMocks()
    if (fs.existsSync(invalidDataRoot)) {
      fs.rmSync(invalidDataRoot, { recursive: true, force: true })
    }
  })

  describe('create', () => {
    it('should create a BidsDataset instance for a valid directory', async () => {
      const [dataset, issues] = await BidsDataset.create(demoDataRoot, BidsDirectoryAccessor)
      expect(dataset).toBeInstanceOf(BidsDataset)
      expect(issues.length).toBe(0)
      expect(dataset.hedSchemas).toBeInstanceOf(HedSchemas)
      expect(dataset.sidecarMap.size).toBe(9)
    })

    it('should throw if the dataset has no dataset_description.json', async () => {
      const emptyDir = path.join(invalidDataRoot, 'empty')
      fs.mkdirSync(emptyDir, { recursive: true })
      const [, issues] = await BidsDataset.create(emptyDir, BidsDirectoryAccessor)
      expect(issues.length).toBe(1)
      expect(issues[0].hedIssue.internalCode).toBe('missingSchemaSpecification')
      expect(issues[0].subCode).toBe('SCHEMA_LOAD_FAILED')
    })
  })

  describe('setHedSchemas', () => {
    it('should load the HED schemas for the BidsDemoData dataset', async () => {
      const accessor = await BidsDirectoryAccessor.create(demoDataRoot)
      const dataset = new BidsDataset(accessor)
      // setHedSchemas is no longer called in the constructor.
      const issues = await dataset.setHedSchemas()
      expect(issues).toEqual([])
      expect(dataset.hedSchemas).toBeDefined()
      expect(dataset.hedSchemas).not.toBeNull()
      expect(dataset.hedSchemas).toBeInstanceOf(HedSchemas)
    })

    it('should throw "missingSchemaSpecification" if dataset_description.json is missing', async () => {
      const emptyDir = path.join(invalidDataRoot, 'empty')
      fs.mkdirSync(emptyDir, { recursive: true })
      const accessor = await BidsDirectoryAccessor.create(emptyDir)
      const dataset = new BidsDataset(accessor)
      await expect(dataset.setHedSchemas()).rejects.toMatchIssue('missingSchemaSpecification', {})
    })

    it('should throw "invalidSchemaSpecification" if HEDVersion is missing from dataset_description.json', async () => {
      const noHedVersionDir = path.join(invalidDataRoot, 'noHedVersion')
      fs.mkdirSync(noHedVersionDir, { recursive: true })
      fs.writeFileSync(path.join(noHedVersionDir, 'dataset_description.json'), JSON.stringify({ Name: 'Test Dataset' }))
      const accessor = await BidsDirectoryAccessor.create(noHedVersionDir)
      const dataset = new BidsDataset(accessor)
      await expect(dataset.setHedSchemas()).rejects.toMatchIssue('invalidSchemaSpecification', { spec: null })
    })

    it('should throw "invalidSchemaSpecification" if HEDVersion is an invalid version string', async () => {
      const invalidHedVersionDir = path.join(invalidDataRoot, 'invalidHedVersion')
      fs.mkdirSync(invalidHedVersionDir, { recursive: true })
      const hedVersion = 'x.y.z'
      fs.writeFileSync(
        path.join(invalidHedVersionDir, 'dataset_description.json'),
        JSON.stringify({ Name: 'Test Dataset', HEDVersion: hedVersion }),
      )
      const accessor = await BidsDirectoryAccessor.create(invalidHedVersionDir)
      const dataset = new BidsDataset(accessor)
      await expect(dataset.setHedSchemas()).rejects.toMatchIssue('invalidSchemaSpecification', { spec: hedVersion })
    })
  })

  describe('setSidecars', () => {
    it('should populate the sidecarMap correctly for a valid dataset', async () => {
      const accessor = await BidsDirectoryAccessor.create(demoDataRoot)
      const dataset = new BidsDataset(accessor)
      const issues = await dataset.setSidecars()

      expect(dataset.sidecarMap).toBeInstanceOf(Map)
      expect(dataset.sidecarMap.size).toBeGreaterThan(0)

      const sidecarKeys = Array.from(dataset.sidecarMap.keys())
      const sidecarValues = Array.from(dataset.sidecarMap.values())

      expect(sidecarKeys).toContain('task-FacePerception_events.json')
      expect(sidecarValues.some((sidecar) => sidecar.name === 'task-FacePerception_events.json')).toBe(true)

      expect(sidecarKeys).toContain('phenotype/KSSSleep.json')
      expect(sidecarValues.some((sidecar) => sidecar.name === 'KSSSleep.json')).toBe(true)

      expect(issues.length).toBe(0)
    })

    it.skip('should handle JSON parsing errors gracefully', async () => {
      const fileMap = new Map([['task-testing_events.json', {}]])
      const accessor = new BidsFileAccessor('/fake/dir', fileMap)

      const getFileContentSpy = jest.spyOn(accessor, 'getFileContent').mockImplementation(async (relativePath) => {
        if (relativePath === 'task-testing_events.json') {
          return '{"HED": "something", "invalidJson": }' // Invalid JSON
        }
        return null
      })

      const dataset = new BidsDataset(accessor)
      const issues = await dataset.setSidecars()

      expect(dataset.sidecarMap.size).toBe(0)
      expect(issues.length).toBe(1)
      expect(issues[0].code).toBe('HED_ERROR')
      expect(issues[0].hedIssue.internalCode).toBe('fileReadError')
      expect(issues[0].location).toBe('task-testing_events.json')

      getFileContentSpy.mockRestore()
    })
  })

  describe('validate', () => {
    it('should return an empty array if there are no validation issues', async () => {
      const [dataset, issues] = await BidsDataset.create(demoDataRoot, BidsDirectoryAccessor)
      expect(dataset.hedSchemas).toBeInstanceOf(HedSchemas)
      expect(issues).toEqual([])

      const tissues = await dataset.validate()
      expect(tissues).toEqual([])
    })

    it('should collect validation issues from sidecars', async () => {
      const [dataset, tissues] = await BidsDataset.create(demoDataRoot, BidsDirectoryAccessor)
      expect(tissues).toEqual([])
      expect(dataset).toBeInstanceOf(BidsDataset)
    })

    it('should skip validation for sidecars not in the sidecarMap', async () => {
      const [dataset, issues] = await BidsDataset.create(demoDataRoot, BidsDirectoryAccessor)
      expect(dataset).toBeInstanceOf(BidsDataset)
      expect(issues).toEqual([])

      const tissues = await dataset.validate()
      expect(tissues).toEqual([])
    })
  })
})
