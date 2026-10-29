import path from 'node:path'

import { afterEach, describe, expect, it, jest } from '@jest/globals'

import AbstractHedSchemaLoader from '../../src/schema/abstractLoader'
import HedSchemaBrowserLoader from '../../src/schema/browserLoader'
import HedSchemaLoader from '../../src/schema/loader'
import MockHedSchemaLoader from '../../src/schema/__mocks__/loader'
import * as config from '../../src/schema/config'
import { SchemaSpec } from '../../src/schema/specs'
import { HedSchemas } from '../../src/schema/containers'
import { IssueError } from '../../src/issues/issues'
import * as files from '../../src/utils/files'

const bundledSchemaFile = path.join(__dirname, '../../src/data/schemas/HED8.4.0.xml')

afterEach(() => {
  jest.restoreAllMocks()
})

describe('HedSchemaLoader', () => {
  it('loads a bundled schema on demand and reads no other bundled schema', async () => {
    const tableSpy = jest.spyOn(config, 'getBundledSchema')
    const schemas = await new HedSchemaLoader().buildSchemasFromVersion('8.4.0')
    expect(schemas).toBeInstanceOf(HedSchemas)
    expect(schemas.baseSchema.version).toBe('8.4.0')
    expect(tableSpy).toHaveBeenCalledTimes(1)
    expect(tableSpy).toHaveBeenCalledWith('HED8.4.0')
  })

  it('serves every bundled name from the table', async () => {
    for (const name of config.localSchemaNames) {
      const xml = await config.getBundledSchema(name)
      expect(typeof xml).toBe('string')
      expect(xml).toContain('<HED')
    }
  })

  it('reads a local schema file', async () => {
    const readSpy = jest.spyOn(files, 'readFile')
    const xmlData = await new HedSchemaLoader().loadSchema(new SchemaSpec('', '8.4.0', '', bundledSchemaFile))
    expect(xmlData.HED.$.version).toBe('8.4.0')
    expect(readSpy).toHaveBeenCalledWith(bundledSchemaFile)
  })

  it('reports a missing local schema file as localSchemaLoadFailed', async () => {
    const missing = path.join(__dirname, 'no_such_schema.xml')
    const error = await new HedSchemaLoader()
      .loadSchema(new SchemaSpec('', '8.4.0', '', missing))
      .catch((caught) => caught)
    expect(error).toBeInstanceOf(IssueError)
    expect(error.issue.internalCode).toBe('localSchemaLoadFailed')
    expect(error.issue.parameters.path).toBe(missing)
  })

  it('fetches a schema that is not bundled from the HED GitHub repository', async () => {
    const xml = await config.getBundledSchema('HED8.4.0')
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, text: async () => xml })
    const xmlData = await new HedSchemaLoader().loadSchema(new SchemaSpec('', '1.1.0', 'notbundled'))
    expect(xmlData.HED.$.version).toBe('8.4.0')
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(fetchSpy.mock.calls[0][0]).toBe(
      'https://raw.githubusercontent.com/hed-standard/hed-schemas/refs/heads/main/library_schemas/notbundled/hedxml/HED_notbundled_1.1.0.xml',
    )
  })

  it('reports a failed remote read as remoteSchemaLoadFailed', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' })
    const error = await new HedSchemaLoader().loadSchema(new SchemaSpec('', '9.9.9')).catch((caught) => caught)
    expect(error).toBeInstanceOf(IssueError)
    expect(error.issue.internalCode).toBe('remoteSchemaLoadFailed')
    expect(error.issue.parameters.error).toContain('404')
  })

  it('reports a null specification as invalidSchemaSpecification', async () => {
    const error = await new HedSchemaLoader().loadSchema(null).catch((caught) => caught)
    expect(error).toBeInstanceOf(IssueError)
    expect(error.issue.internalCode).toBe('invalidSchemaSpecification')
  })
})

describe('HedSchemaBrowserLoader', () => {
  it('never reads a local file', async () => {
    const readSpy = jest.spyOn(files, 'readFile')
    const error = await new HedSchemaBrowserLoader()
      .loadSchema(new SchemaSpec('', '8.4.0', '', bundledSchemaFile))
      .catch((caught) => caught)
    expect(error).toBeInstanceOf(IssueError)
    expect(error.issue.internalCode).toBe('localSchemaLoadFailed')
    expect(error.issue.parameters.error).toContain('Local file reading is not supported in browser environment')
    expect(readSpy).not.toHaveBeenCalled()
  })

  it('loads bundled schemas', async () => {
    const schemas = await new HedSchemaBrowserLoader().buildSchemasFromVersion('8.4.0, sc:score_2.1.0')
    expect(schemas.baseSchema.version).toBe('8.4.0')
    expect(schemas.getSchema('sc').version).toBe('2.1.0')
  })
})

describe('MockHedSchemaLoader', () => {
  it('serves a hed-tests schema and falls back to the bundled schemas', async () => {
    const readSpy = jest.spyOn(files, 'readFile')
    const loader = new MockHedSchemaLoader()
    const testSchema = await loader.loadSchema(new SchemaSpec('', '1.0.0', 'testaux'))
    expect(testSchema.HED.$.library).toBe('testaux')
    expect(readSpy).toHaveBeenCalledTimes(1)
    expect(readSpy.mock.calls[0][0]).toMatch(/test_schemas[\\/]hedxml[\\/]HED_testaux_1\.0\.0\.xml$/)

    const bundled = await loader.loadSchema(new SchemaSpec('', '1.1.0', 'lang'))
    expect(bundled.HED.$.library).toBe('lang')
    expect(readSpy).toHaveBeenCalledTimes(1)
  })
})

describe('AbstractHedSchemaLoader', () => {
  it('requires a subclass for the environment hooks', async () => {
    const loader = new AbstractHedSchemaLoader()
    expect(() => loader.hasBundledSchema(new SchemaSpec('', '8.4.0'))).toThrow(IssueError)
    await expect(loader.getBundledSchema(new SchemaSpec('', '8.4.0'))).rejects.toThrow(IssueError)
    await expect(loader.loadLocalSchema('x.xml')).rejects.toThrow(IssueError)
  })
})
