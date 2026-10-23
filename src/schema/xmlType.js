/** This module holds the helpers for reading schema XML elements.
 * @module schema/xmlType
 */

/**
 * Extract the name of an XML element.
 *
 * @param {Object} element An XML element.
 * @returns {string} The name of the element.
 */
export function getElementName(element) {
  return element.name._
}

/**
 * Extract the description of an XML element.
 *
 * @param {Object} element An XML element.
 * @returns {string|undefined} The description of the element.
 */
export function getElementDescription(element) {
  return element.description?._
}
