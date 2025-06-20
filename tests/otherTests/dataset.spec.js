import { describe, it, expect, afterEach, jest } from '@jest/globals'
import path from 'path'
import fs from 'fs'
import { toMatchIssue } from '../testHelpers/toMatchIssue'
import { BidsDataset } from '../../src/bids/types/dataset'
import { BidsDirectoryAccessor, BidsFileAccessor } from '../../src/bids/datasetParser'
import { Schemas } from '../../src/schema/containers'

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
      expect(dataset.hedSchemas).toBeInstanceOf(Schemas)
      expect(dataset.sidecarMap.size).toBe(6)
    })

    it('should throw if the dataset has no dataset_description.json', async () => {
      const emptyDir = path.join(invalidDataRoot, 'empty')
      fs.mkdirSync(emptyDir, { recursive: true })
      const [, issues] = await BidsDataset.create(emptyDir, BidsDirectoryAccessor)
      expect(issues.length).toBe(1)
      expect(issues[0].internalCode).toBe('missingSchemaSpecification')
      expect(issues[0].hedCode).toBe('SCHEMA_LOAD_FAILED')
    })
  })

  describe('getHedSchemas', () => {
    it('should load the HED schemas for the BidsDemoData dataset', async () => {
      const accessor = await BidsDirectoryAccessor.create(demoDataRoot)
      const dataset = new BidsDataset(accessor)
      // getHedSchemas is no longer called in the constructor.
      await dataset.getHedSchemas()
      expect(dataset.hedSchemas).toBeDefined()
      expect(dataset.hedSchemas).not.toBeNull()
      expect(dataset.hedSchemas).toBeInstanceOf(Schemas)
    })

    it('should throw "missingSchemaSpecification" if dataset_description.json is missing', async () => {
      const emptyDir = path.join(invalidDataRoot, 'empty')
      fs.mkdirSync(emptyDir, { recursive: true })
      const accessor = await BidsDirectoryAccessor.create(emptyDir)
      const dataset = new BidsDataset(accessor)
      await expect(dataset.getHedSchemas()).rejects.toMatchIssue('missingSchemaSpecification', {})
    })

    it('should throw "invalidSchemaSpecification" if HEDVersion is missing from dataset_description.json', async () => {
      const noHedVersionDir = path.join(invalidDataRoot, 'noHedVersion')
      fs.mkdirSync(noHedVersionDir, { recursive: true })
      fs.writeFileSync(path.join(noHedVersionDir, 'dataset_description.json'), JSON.stringify({ Name: 'Test Dataset' }))
      const accessor = await BidsDirectoryAccessor.create(noHedVersionDir)
      const dataset = new BidsDataset(accessor)
      await expect(dataset.getHedSchemas()).rejects.toMatchIssue('invalidSchemaSpecification', { spec: null })
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
      await expect(dataset.getHedSchemas()).rejects.toMatchIssue('invalidSchemaSpecification', { spec: hedVersion })
    })
  })

  describe('setSidecars', () => {
    it('should populate the sidecarMap correctly for a valid dataset', async () => {
      const accessor = await BidsDirectoryAccessor.create(demoDataRoot)
      expect(accessor.fileMap.size).toBe(23)
      expect(accessor.organizedPaths.size).toBe(9) // participants, events, beh, phenotype, scans, sessions
      const dataset = new BidsDataset(accessor)
      await dataset.setSidecars()
      expect(dataset.sidecarMap).toBeInstanceOf(Map)
      expect(dataset.sidecarMap.size).toBe(6) // participants, events, beh, phenotype, scans

      const participantsSidecars = dataset.sidecarMap.get('participants')
      expect(participantsSidecars).toBeDefined()
      expect(participantsSidecars.length).toBe(1)
      expect(participantsSidecars[0].name).toBe('participants.json')

      const eventsSidecars = dataset.sidecarMap.get('_events')
      expect(eventsSidecars).toBeDefined()
      expect(eventsSidecars.length).toBe(1)
      expect(eventsSidecars[0].name).toBe('task-FacePerception_events.json')

      const behSidecars = dataset.sidecarMap.get('_beh')
      expect(behSidecars).toBeDefined()
      expect(behSidecars.length).toBe(1)
      expect(behSidecars[0].name).toBe('task-FaceRecognition_beh.json')

      const phenotypeSidecars = dataset.sidecarMap.get('phenotype')
      expect(phenotypeSidecars).toBeDefined()
      expect(phenotypeSidecars.length).toBe(2)
      expect(phenotypeSidecars.map((s) => s.name).sort()).toEqual(['KSSSleep.json', 'trainLog.json'].sort())

      const scansSidecars = dataset.sidecarMap.get('_scans')
      expect(scansSidecars).toBeDefined()
      expect(scansSidecars.length).toBe(3)
      expect(scansSidecars.map((s) => s.name).sort()).toEqual(
        ['sub-002_scans.json', 'sub-003_scans.json', 'sub-004_ses-1_scans.json'].sort(),
      )

      expect(dataset.sidecarMap.has('_sessions')).toBe(false)
      expect(dataset.sidecarMap.has('participants')).toBe(true)
      expect(dataset.issues.length).toBe(0)
    })

    it('should handle JSON parsing errors gracefully', async () => {
      const fileMap = new Map([['task-testing_events.json', {}]])
      const accessor = new BidsFileAccessor('/fake/dir', fileMap)

      const getFileContentSpy = jest.spyOn(accessor, 'getFileContent').mockImplementation(async (relativePath) => {
        if (relativePath === 'task-testing_events.json') {
          return '{"HED": "something", "invalidJson": }' // Invalid JSON
        }
        return null
      })

      const dataset = new BidsDataset(accessor)
      await dataset.setSidecars()

      expect(dataset.sidecarMap.has('_events')).toBe(false)
      expect(dataset.issues.length).toBe(1)
      expect(dataset.issues[0].code).toBe('JSON_PARSE_ERROR')
      expect(dataset.issues[0].location).toBe('task-testing_events.json')

      getFileContentSpy.mockRestore()
    })

    // TODO: Add tests for correct error handling.
    // TODO: Add tests for _initializeFileObjects if not covered elsewhere,
    // focusing on its interaction with the accessor.
  })
})
