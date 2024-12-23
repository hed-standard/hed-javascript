import lt from 'semver/functions/lt'

/**
 * Determine the HED generation for a base schema version number.
 *
 * @param {string} version A HED base schema version number.
 * @returns {number} The HED generation the base schema belongs to.
 */
export const getGenerationForSchemaVersion = function (version) {
  if (lt(version, '4.0.0')) {
    return 1
  } else if (lt(version, '8.0.0-alpha')) {
    return 2
  } else {
    return 3
  }
}
