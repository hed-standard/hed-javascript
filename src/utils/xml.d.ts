/**
 * XML parsing utilities.
 * @module
 */
import { type HedSchemaXMLObject } from '../schema/xmlType'
/**
 * Parse the schema XML data.
 *
 * @param data - The XML data.
 * @returns The schema XML data.
 */
export default function parseSchemaXML(data: string): HedSchemaXMLObject
