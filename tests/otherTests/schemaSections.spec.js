import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'

import { buildSchemas } from '../../src/schema/init'
import { SchemaSpec, SchemasSpec } from '../../src/schema/specs'
import { IssueError } from '../../src/issues/issues'

// HED specification A.3.1 lists the section elements of an XML schema file, and Appendix B SCHEMA_SECTION_MISSING
// says only the sources, prefixes and external annotations may be missing at load. A file that is not well-formed
// XML or lacks a required section fails to load with SCHEMA_LOAD_FAILED (reason f), naming the problem. The broken
// files are made from the bundled HED 8.5.0 in a temporary directory.
describe('Schema files with missing sections', () => {
  const requiredSections = [
    'schema',
    'unitClassDefinitions',
    'unitModifierDefinitions',
    'valueClassDefinitions',
    'schemaAttributeDefinitions',
    'propertyDefinitions',
  ]
  const optionalSections = ['schemaSources', 'schemaPrefixes', 'externalAnnotations']

  const xml = fs.readFileSync(path.join(__dirname, '../../src/data/schemas/HED8.5.0.xml'), 'utf8')
  const sectionPattern = (section) => new RegExp(`<${section}>[\\s\\S]*?</${section}>`)
  let tempDir

  const loadText = async (name, text) => {
    const file = path.join(tempDir, `HED8.5.0_${name}.xml`)
    fs.writeFileSync(file, text)
    return buildSchemas(new SchemasSpec().addSchemaSpec(new SchemaSpec('', '8.5.0', '', file)))
  }

  const loadError = (name, text) => loadText(name, text).catch((caught) => caught)

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hed-schema-sections-'))
  })

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('finds every section in the bundled file', () => {
    for (const section of [...requiredSections, ...optionalSections]) {
      expect(xml).toMatch(sectionPattern(section))
    }
  })

  it.each(requiredSections)('should fail to load without the "%s" section', async (section) => {
    const error = await loadError(`no_${section}`, xml.replace(sectionPattern(section), ''))
    expect(error).toBeInstanceOf(IssueError)
    expect(error.issue.hedCode).toBe('SCHEMA_LOAD_FAILED')
    expect(error.issue.parameters.error).toContain(`no "${section}" element`)
  })

  it('should fail to load a file without a HED element', async () => {
    const error = await loadError('no_HED', '<?xml version="1.0" ?>\n<schema></schema>\n')
    expect(error).toBeInstanceOf(IssueError)
    expect(error.issue.hedCode).toBe('SCHEMA_LOAD_FAILED')
    expect(error.issue.parameters.error).toContain('no "HED" element')
  })

  it('should fail to load a file that is not well-formed XML', async () => {
    const error = await loadError('half', xml.slice(0, Math.floor(xml.length / 2)))
    expect(error).toBeInstanceOf(IssueError)
    expect(error.issue.hedCode).toBe('SCHEMA_LOAD_FAILED')
    expect(error.issue.parameters.error).toContain('not well-formed XML')
  })

  it('should load a file with an empty section and no optional sections', async () => {
    let text = xml.replace(sectionPattern('propertyDefinitions'), '<propertyDefinitions/>')
    for (const section of optionalSections) {
      text = text.replace(sectionPattern(section), '')
    }
    const schemas = await loadText('empty_properties', text)
    expect(schemas.baseSchema.version).toBe('8.5.0')
    expect(schemas.baseSchema.entries.tags.hasEntry('event')).toBe(true)
  })
})
