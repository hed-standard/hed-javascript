import chai from 'chai'
const assert = chai.assert
import { describe, it } from '@jest/globals'

import { buildSchemas } from '../../src/schema/init'
import { SchemaSpec, SchemasSpec } from '../../src/schema/specs'
import { parseHedString } from '../../src/parser/parser'

// A partnered library schema distributed in unmerged form (header unmerged="True") is merged with its standard
// partner while it is parsed (src/schema/init.js). Loading the unmerged file must give the same schema as loading
// the merged file of the same library version. The fixtures are the hed-tests test schemas: the merged files in
// test_schemas/hedxml and the unmerged ones in test_schemas/<library>/hedxml_unmerged. Their standard partners
// (8.4.0, 8.5.0) are bundled, so no test here needs the network.
const testSchemasDir = 'spec_tests/hed-tests/json_test_data/test_schemas'
const mergedPath = (library, version) => `${testSchemasDir}/hedxml/HED_${library}_${version}.xml`
const unmergedPath = (library, version) => `${testSchemasDir}/${library}/hedxml_unmerged/HED_${library}_${version}.xml`

// Every partnered library version that hed-tests ships in both forms.
const partneredLibraries = [
  ['testaux', '1.0.0'],
  ...Array.from({ length: 19 }, (_, index) => ['testclash', `${index + 1}.0.0`]),
  ['testconflict', '2.0.0'],
  ['testconflict', '2.1.0'],
  ['testconflict', '2.1.1'],
  ['testminimal', '2.0.0'],
  ['testminimal', '2.1.0'],
]

const entryManagers = ['properties', 'attributes', 'valueClasses', 'unitClasses', 'unitModifiers', 'tags']

/**
 * Build the schemas of one merge group from [library, version, path] triples ('' library for a standard schema).
 */
const build = (specs) => {
  const schemasSpec = new SchemasSpec()
  for (const [library, version, path] of specs) {
    schemasSpec.addSchemaSpec(new SchemaSpec('', version, library, path))
  }
  return buildSchemas(schemasSpec)
}

/**
 * List how two loaded schemas differ: missing or extra entries, entries that are not equivalent (which ignores
 * inLibrary and hedId), and units of a unit class.
 */
const differences = (first, second) => {
  const found = []
  const compareMaps = (label, firstMap, secondMap) => {
    for (const name of firstMap.keys()) {
      if (!secondMap.has(name)) {
        found.push(`${label} "${name}" only in the merged schema`)
      } else if (!firstMap.get(name).equivalent(secondMap.get(name))) {
        found.push(`${label} "${name}" differs`)
      }
    }
    for (const name of secondMap.keys()) {
      if (!firstMap.has(name)) {
        found.push(`${label} "${name}" only in the unmerged schema`)
      }
    }
  }
  for (const manager of entryManagers) {
    compareMaps(manager, new Map(first.entries[manager]), new Map(second.entries[manager]))
  }
  for (const [name, unitClass] of first.entries.unitClasses) {
    const other = second.entries.unitClasses.getEntry(name)
    if (other !== undefined) {
      compareMaps(`units of ${name}`, unitClass.units, other.units)
    }
  }
  return found
}

/**
 * The entries of a loaded schema that carry inLibrary, with its value, as "manager:name=library" strings.
 */
const inLibraryEntries = (schema) => {
  const found = []
  for (const manager of entryManagers) {
    for (const [name, entry] of schema.entries[manager]) {
      if (entry.hasAttribute?.('inLibrary')) {
        found.push(`${manager}:${name}=${entry.getAttributeValue('inLibrary')}`)
      }
    }
  }
  return found.sort()
}

describe('Unmerged partnered library schemas', () => {
  describe.each(partneredLibraries)('%s_%s', (library, version) => {
    let merged, unmerged

    const load = async () => {
      merged ??= (await build([[library, version, mergedPath(library, version)]])).baseSchema
      unmerged ??= (await build([[library, version, unmergedPath(library, version)]])).baseSchema
    }

    it('loads to the same schema as the merged file', async () => {
      await load()
      assert.strictEqual(unmerged.withStandard, merged.withStandard)
      assert.deepEqual(differences(merged, unmerged), [])
    })

    it('reports the library name and version as the merged file does', async () => {
      await load()
      assert.deepEqual([unmerged.library, unmerged.version], [merged.library, merged.version])
    })

    it('marks the same entries with inLibrary', async () => {
      await load()
      assert.deepEqual(inLibraryEntries(unmerged), inLibraryEntries(merged))
    })
  })

  describe('in a merge group', () => {
    it('with its standard partner listed gives the same schema', async () => {
      const merged = (await build([['testminimal', '2.1.0', mergedPath('testminimal', '2.1.0')]])).baseSchema
      const listed = (
        await build([
          ['', '8.5.0', ''],
          ['testminimal', '2.1.0', unmergedPath('testminimal', '2.1.0')],
        ])
      ).baseSchema
      assert.deepEqual(differences(merged, listed), [])
    })

    it('with another library gives the same schema whichever forms are loaded', async () => {
      const group = (minimalPath, conflictPath) =>
        build([
          ['testminimal', '2.1.0', minimalPath],
          ['testconflict', '2.1.0', conflictPath],
        ])
      const allMerged = (await group(mergedPath('testminimal', '2.1.0'), mergedPath('testconflict', '2.1.0')))
        .baseSchema
      const allUnmerged = (await group(unmergedPath('testminimal', '2.1.0'), unmergedPath('testconflict', '2.1.0')))
        .baseSchema
      const mixed = (await group(mergedPath('testminimal', '2.1.0'), unmergedPath('testconflict', '2.1.0'))).baseSchema
      assert.deepEqual(differences(allMerged, allUnmerged), [], 'both unmerged')
      assert.deepEqual(differences(allMerged, mixed), [], 'one merged, one unmerged')
    })
  })

  describe('validation with an unmerged library', () => {
    it('lets a rooted tag inherit extensionAllowed from its anchor in the partner (testclash 7.0.0)', async () => {
      for (const path of [mergedPath('testclash', '7.0.0'), unmergedPath('testclash', '7.0.0')]) {
        const schemas = await build([['testclash', '7.0.0', path]])
        const [, errors, warnings] = parseHedString('Rooted-tag/Blah', schemas, false, false, true)
        assert.isEmpty(errors, path)
        assert.deepEqual(
          warnings.map((issue) => issue.hedCode),
          ['TAG_EXTENDED'],
          path,
        )
      }
    })

    it('rejects a tag whose name repeats its parent apart from case (SCHEMA_DUPLICATE_NODE)', async () => {
      const path = 'tests/otherTestData/HED_testminimal_2.1.0_duplicate_child.xml'
      try {
        await build([['testminimal', '2.1.0', path]])
        assert.fail('the duplicate MINI-TAG was accepted')
      } catch (error) {
        assert.strictEqual(error.issue?.internalCode, 'duplicateTagsInSchema', error.message)
      }
    })

    it('rejects an unmerged library that redeclares a tag of its standard partner', async () => {
      const path = 'tests/otherTestData/HED_testminimal_2.1.0_redeclares_event.xml'
      try {
        await build([['testminimal', '2.1.0', path]])
        assert.fail('the redeclaration of Event was accepted')
      } catch (error) {
        assert.strictEqual(error.issue?.internalCode, 'lazyPartneredSchemaOverloadsStandardTag', error.message)
      }
    })
  })
})
