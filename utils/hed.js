const defaultUnitAttribute = 'default'
const defaultUnitsForTypeAttribute = 'default_units'
const extensionAllowedAttribute = 'extensionAllowed'
const tagsDictionaryKey = 'tags'
const takesValueType = 'takesValue'
const unitClassType = 'unitClass'
const unitClassUnitsType = 'units'

/**
 * Replace the end of a HED tag with a pound sign.
 */
const replaceTagNameWithPound = function(formattedTag) {
  const lastTagSlashIndex = formattedTag.lastIndexOf('/')
  if (lastTagSlashIndex !== -1) {
    return formattedTag.substring(0, lastTagSlashIndex) + '/#'
  } else {
    return '#'
  }
}

/**
 * Get the indices of all slashes in a HED tag.
 */
const getTagSlashIndices = function(tag) {
  const indices = []
  let i = -1
  while ((i = tag.indexOf('/', i + 1)) >= 0) {
    indices.push(i)
  }
  return indices
}

/**
 * Get the last part of a HED tag.
 */
const getTagName = function(tag) {
  const lastSlashIndex = tag.lastIndexOf('/')
  if (lastSlashIndex === -1) {
    return tag
  } else {
    return tag.substring(lastSlashIndex + 1)
  }
}

/**
 * Check for a valid unit and remove it.
 */
const stripOffUnitsIfValid = function(tagUnitValues, tagUnitClassUnits) {
  tagUnitClassUnits.sort(function(first, second) {
    return first.length < second.length
  })
  for (const units of tagUnitClassUnits) {
    if (tagUnitValues.startsWith(units)) {
      return tagUnitValues.substring(units.length).trim()
    } else if (tagUnitValues.endsWith(units)) {
      return tagUnitValues.slice(0, -units.length).trim()
    }
  }
  return tagUnitValues
}

/**
 * Determine if a HED tag is in the schema.
 */
const tagExistsInSchema = function(formattedTag, hedSchema) {
  return formattedTag in hedSchema.dictionaries[tagsDictionaryKey]
}

/**
 * Checks if a HED tag has the 'takesValue' attribute.
 */
const tagTakesValue = function(formattedTag, hedSchema) {
  const takesValueTag = replaceTagNameWithPound(formattedTag)
  return hedSchema.tagHasAttribute(takesValueTag, takesValueType)
}

/**
 * Checks if a HED tag has the 'unitClass' attribute.
 */
const isUnitClassTag = function(formattedTag, hedSchema) {
  const takesValueTag = replaceTagNameWithPound(formattedTag)
  return hedSchema.tagHasAttribute(takesValueTag, unitClassType)
}

/**
 * Get the default unit for a particular HED tag.
 */
const getUnitClassDefaultUnit = function(formattedTag, hedSchema) {
  if (isUnitClassTag(formattedTag, hedSchema)) {
    const unitClassTag = replaceTagNameWithPound(formattedTag)
    const hasDefaultAttribute = hedSchema.tagHasAttribute(
      unitClassTag,
      defaultUnitAttribute,
    )
    if (hasDefaultAttribute) {
      return hedSchema.dictionaries[defaultUnitAttribute][unitClassTag]
    } else if (unitClassTag in hedSchema.dictionaries[unitClassType]) {
      const unitClasses = hedSchema.dictionaries[unitClassType][
        unitClassTag
      ].split(',')
      const firstUnitClass = unitClasses[0]
      return hedSchema.dictionaries[defaultUnitsForTypeAttribute][
        firstUnitClass
      ]
    }
  } else {
    return ''
  }
}

/**
 * Get the unit classes for a particular HED tag.
 */
const getTagUnitClasses = function(formattedTag, hedSchema) {
  if (isUnitClassTag(formattedTag, hedSchema)) {
    const unitClassTag = replaceTagNameWithPound(formattedTag)
    const unitClassesString =
      hedSchema.dictionaries[unitClassType][unitClassTag]
    return unitClassesString.split(',')
  } else {
    return []
  }
}

/**
 * Get the legal units for a particular HED tag.
 */
const getTagUnitClassUnits = function(formattedTag, hedSchema) {
  const tagUnitClasses = getTagUnitClasses(formattedTag, hedSchema)
  const units = []
  for (const unitClass of tagUnitClasses) {
    const unitClassUnits = hedSchema.dictionaries[unitClassUnitsType][unitClass]
    Array.prototype.push.apply(
      units,
      unitClassUnits.map(unit => {
        return unit.toLowerCase()
      }),
    )
  }
  return units
}

/**
 * Check if any level of a HED tag allows extensions.
 */
const isExtensionAllowedTag = function(formattedTag, hedSchema) {
  if (hedSchema.tagHasAttribute(formattedTag, extensionAllowedAttribute)) {
    return true
  }
  const tagSlashIndices = getTagSlashIndices(formattedTag)
  for (const tagSlashIndex of tagSlashIndices) {
    const tagSubstring = formattedTag.slice(0, tagSlashIndex)
    if (hedSchema.tagHasAttribute(tagSubstring, extensionAllowedAttribute)) {
      return true
    }
  }
  return false
}

module.exports = {
  replaceTagNameWithPound: replaceTagNameWithPound,
  getTagSlashIndices: getTagSlashIndices,
  getTagName: getTagName,
  stripOffUnitsIfValid: stripOffUnitsIfValid,
  tagExistsInSchema: tagExistsInSchema,
  tagTakesValue: tagTakesValue,
  isUnitClassTag: isUnitClassTag,
  getUnitClassDefaultUnit: getUnitClassDefaultUnit,
  getTagUnitClasses: getTagUnitClasses,
  getTagUnitClassUnits: getTagUnitClassUnits,
  isExtensionAllowedTag: isExtensionAllowedTag,
}
