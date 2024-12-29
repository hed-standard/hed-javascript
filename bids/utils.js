/**
 * Determine whether a bidsFile value has HED data.
 *
 * @param {object} sidecarValue A BIDS bidsFile value.
 * @returns {boolean} Whether the bidsFile value has HED data.
 */
export const sidecarValueHasHed = function (sidecarValue) {
  return sidecarValue !== null && typeof sidecarValue === 'object' && sidecarValue.HED !== undefined
}
