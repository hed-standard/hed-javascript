/**
 * hed-tests cases that hed-javascript does not pass yet, keyed by test case name.
 *
 * The runner (hedTests.spec.js) skips a whole case by name and reports the reason in the jest
 * summary. Remove an entry once the case passes. Reasons record what was observed when the entry
 * was added, not a diagnosis.
 *
 * Observed 2026-10-07 against hed-tests 183c235.
 */
export const skippedTests = {
  // SCHEMA_LOAD_FAILED: merge-group cases that should load, but the partnered schema merger
  // rejects any short tag shared between libraries.
  'multiple-libraries-with-same-partner': 'merger rejects shared short tag Shared-item',
  'merge-order-independent-loads': 'merger rejects shared short tag Shared-item',
  'duplicate-schema-in-merge-group': 'merger rejects the same schema listed twice',
  'shared-element-compatible-across-libraries': 'merger rejects shared short tag Shared-item',
  'shared-rooted-hierarchy-different-children': 'merger rejects shared rooted tag',
  'shared-rooted-tag-disjoint-children': 'merger rejects shared rooted tag',
  'shared-hierarchy-diverges-at-grandchild': 'merger rejects shared tag hierarchy',

  // SCHEMA_LOAD_FAILED: loading an unpartnered library XML throws
  // "TypeError: propertyDefinitions is not iterable" in the schema parser.
  'namespaced-groups-load-independently': 'unpartnered library XML crashes the schema parser',
  'unpartnered-library-in-shared-namespace': 'unpartnered library XML crashes the schema parser',
  'two-unpartnered-libraries-in-same-namespace': 'unpartnered library XML crashes the schema parser',

  // SCHEMA_LOAD_FAILED: auxiliary sections (unit classes, units, unit modifiers, value classes,
  // schema attributes) are not merged and conflicts in them are not detected.
  'aux-new-unit-class-merges-directly': 'merged auxiliary sections not usable after load',
  'aux-new-units-under-shared-class': 'merged auxiliary sections not usable after load',
  'aux-unit-attribute-conflict': 'auxiliary conflict not detected',
  'aux-value-class-conflict': 'auxiliary conflict not detected',
  'aux-schema-attribute-property-conflict': 'auxiliary conflict not detected',
  'aux-schema-attribute-description-conflict': 'auxiliary conflict not detected',
  'aux-unit-modifier-conflict': 'auxiliary conflict not detected',

  // TEMPORAL_TAG_ERROR: non-convertible time units are accepted.
  'temporal-tag-error-delay-not-convertible': 'Delay/3 month accepted',
  'temporal-tag-error-duration-not-convertible': 'Duration/3 year accepted',

  // UNITS_INVALID: compound units and the 8.5.0 anyUnits unit class.
  'units-invalid-compound-units': 'compound unit modifiers not handled',
  'units-invalid-any-units': 'anyUnits unit class and Quantity tag of 8.5.0 not handled',

  // VALUE_INVALID
  'bad-value-in-curly-column': 'value column consumed by a brace reference is not validated',
  'value-invalid-date-time-format': 'date-time values are not checked against the BIDS Datetime format',
}
