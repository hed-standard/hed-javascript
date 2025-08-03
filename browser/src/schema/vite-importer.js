// browser/src/schema/vite-importer.js
export const schemaData = import.meta.glob('../../../src/data/schemas/*.xml', { query: '?raw', import: 'default' })
