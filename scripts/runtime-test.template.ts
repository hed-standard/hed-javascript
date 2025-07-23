import { getLocalSchemaVersions } from 'hed-validator'

const versions = getLocalSchemaVersions()
console.log('✅ Available schema versions:', versions.length)
console.log('✅ First version:', versions[0])

// Type check
const firstVersion: string = versions[0]
console.log('✅ Type test passed')
