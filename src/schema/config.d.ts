/**
 * Bundled HED schema configuration.
 * @module schema/config
 */
/**
 * This list defines the base names of HED XML schema files that are considered "bundled" with the library.
 * The actual loading mechanism is handled by the schema loader, which may use an application-provided loader
 * for browser environments or a Node.js fs-based loader for server-side/test environments.
 */
export declare const localSchemaNames: readonly string[]
/**
 * A mapping from the bundled schema names to their XML data (as strings).
 */
export declare const localSchemaMap: Readonly<Map<string, string>>
/**
 * Return a copy of the bundled schema names without the "HED" prefix.
 *
 * @returns The list of unprefixed bundled schema names.
 */
export declare function getLocalSchemaVersions(): string[]
