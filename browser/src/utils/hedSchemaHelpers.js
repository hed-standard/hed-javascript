// filepath: i:\HEDJavascript\hed-javascript\browser\src\utils\hedSchemaHelpers.js
/**
 * Asynchronously builds a HED schema collection from a HED version specification.
 *
 * @param {string | string[] | {HEDVersion: string | string[]}} hedSpec -
 *   The HED version specification. Can be a version string (e.g., "8.3.0"),
 *   an array of version strings (for multiple schemas), or an object
 *   (e.g., { HEDVersion: "8.3.0" } or { HEDVersion: ["8.3.0", "testlib_1.0.0"] }).
 * @returns {Promise<Object|null>} A Promise that resolves to the HED schema collection
 *   (HedSchemas object from the library) or null if input is invalid or schemas cannot be built.
 * @throws {Error} If schema building fails and isn't handled by returning null.
 */
export async function getHedSchemaCollection(hedSpec) {
  // Dynamically import necessary modules when the function is called
  const { buildBidsSchemas, BidsJsonFile } = await import('@hed-javascript-root/index.js') // Use alias

  let jsonDataPayload

  if (typeof hedSpec === 'string' || Array.isArray(hedSpec)) {
    jsonDataPayload = { HEDVersion: hedSpec }
  } else if (typeof hedSpec === 'object' && hedSpec !== null && hedSpec.HEDVersion) {
    // Assuming standard "HEDVersion" key based on library's expectation
    jsonDataPayload = hedSpec
  } else {
    console.error('Invalid HED specification for schema building:', hedSpec)
    return null
  }

  // buildBidsSchemas expects a BidsJsonFile-like object, specifically its jsonData.HEDVersion property.
  const mockBidsJsonFile = new BidsJsonFile(
    'virtual_dataset_description.json', // Placeholder name
    { path: 'virtual_dataset_description.json' }, // Placeholder file object
    jsonDataPayload,
  )

  try {
    console.log('[hedSchemaHelpers] Calling buildBidsSchemas with mockBidsJsonFile:', mockBidsJsonFile)
    const schemaCollection = await buildBidsSchemas(mockBidsJsonFile)

    if (!schemaCollection) {
      console.error(
        '[hedSchemaHelpers] buildBidsSchemas returned a falsy value. This usually means HEDVersion was missing or invalid in the input spec.',
        'Input hedSpec:',
        hedSpec,
        'Constructed jsonDataPayload:',
        jsonDataPayload,
      )
      return null
    }

    console.info('[hedSchemaHelpers] HED schema collection loaded successfully:', schemaCollection)
    return schemaCollection
  } catch (error) {
    console.error('[hedSchemaHelpers] Error during buildBidsSchemas call for hedSpec:', hedSpec, error)
    // Check if the error is an IssueError and if it indicates a load failure for remote.
    if (error.issue && error.issue.code === 'remoteSchemaLoadFailed') {
      console.warn(
        '[hedSchemaHelpers] Remote schema load specifically failed for spec:',
        hedSpec,
        'Original error message:',
        error.issue.message,
      )
    } else if (error.issue) {
      console.warn('[hedSchemaHelpers] An IssueError occurred:', error.issue.code, error.issue.message)
    }
    throw error // Re-throw or return null based on desired error handling
  }
}
