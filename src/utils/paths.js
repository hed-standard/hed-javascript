/**
 * Checks if one path is a subpath of another.
 *
 * This function normalizes the input paths before comparison. Normalization includes:
 * - Converting null or undefined to an empty string.
 * - Replacing a single dot ('.') with an empty string.
 * - Removing leading './'.
 * - Removing trailing '/'.
 *
 * A path is considered a subpath of itself.
 * If the normalized parent path is an empty string (e.g., from '.', './', or '/'),
 * any non-empty child path is considered a subpath.
 *
 * @param {string|null|undefined} potentialChild The path to check if it's a subpath.
 * @param {string|null|undefined} potentialParent The path to check if it's a parent.
 * @returns {boolean} True if potentialChild is a subpath of potentialParent, false otherwise.
 */
export function isSubpath(potentialChild, potentialParent) {
  // Normalize paths for consistent comparison
  const normalizePath = (rawPath) => {
    // Handle null/undefined gracefully, and ensure '.' normalizes to an empty string
    // similar to how './' and '/' are effectively treated.
    let p = String(rawPath == null ? '' : rawPath)

    if (p === '.') {
      return '' // Explicitly normalize '.' to an empty string
    }
    if (p.startsWith('./')) {
      p = p.substring(2)
    }
    if (p.endsWith('/')) {
      p = p.slice(0, -1)
    }
    return p
  }

  const normChild = normalizePath(potentialChild)
  const normParent = normalizePath(potentialParent)

  if (normChild === normParent) {
    // A path is considered a subpath of itself
    return true
  }

  // If the parent path normalizes to an empty string (e.g., from '.', './', or '/'),
  // then any non-empty child path is considered a subpath.
  // (The case where normChild is also empty is covered by normChild === normParent)
  if (normParent === '') {
    return true
  }

  // Check if the child path starts with the parent path followed by a directory separator
  return normChild.startsWith(normParent + '/')
}

/**
 * Organizes a list of relative file paths based on BIDS naming conventions.
 *
 * This function filters and categorizes file paths into a structured object. It identifies files
 * based on whether they are in special directories (like 'phenotype'), are top-level files, or
 * are located within subject-specific directories ('sub-xxx').
 *
 * Files are categorized by matching their filename against a list of suffixes (e.g., 'events',
 * 'participants') or by their presence in a special directory. Only files with '.tsv' or '.json'
 * extensions are considered.
 *
 * @param {string[]} relativeFilePaths - A list of relative file paths to organize.
 * @param {string[]} suffixes - A list of filename suffixes to categorize by (e.g., 'events').
 * @param {string[]} specialDirs - A list of special directory names (e.g., 'phenotype').
 * @returns {{candidates: string[], organizedPaths: Map<string, Map<string, string[]>>}}
 *          An object containing two properties:
 *          - `candidates`: A list of all file paths that were successfully categorized.
 *          - `organizedPaths`: A Map where keys are the suffixes and special directories.
 *            Each value is a Map with 'tsv' and 'json' properties, containing the corresponding
 *            file paths. Keys will be present even if no files are found for them.
 */
export function organizePaths(relativeFilePaths, suffixes, specialDirs) {
  const candidates = []
  // Use helper function to initialize organizedPaths
  const organizedPaths = _initializeOrganizedPaths([...suffixes, ...specialDirs])

  for (const relativePath of relativeFilePaths) {
    // Basic validation and extension check
    if (typeof relativePath !== 'string' || (!relativePath.endsWith('.tsv') && !relativePath.endsWith('.json'))) {
      continue
    }

    const pathParts = relativePath.split('/')
    const basename = pathParts[pathParts.length - 1]
    const firstComponent = pathParts[0]

    const ext = relativePath.endsWith('.tsv') ? 'tsv' : 'json'

    let categorized = false

    // Rule 1: Check if the file is in a special directory.
    if (specialDirs.includes(firstComponent)) {
      organizedPaths.get(firstComponent).get(ext).push(relativePath)
      categorized = true
    } else {
      // Rule 2: Check if it's a top-level file or in a subject directory.
      const isToplevel = pathParts.length === 1
      const inSubDir = firstComponent.startsWith('sub-')

      if (isToplevel || inSubDir) {
        // Rule 3: Either it is the suffix or the suffix starts with an underscore and matches the end of the filename.
        const filenameNoExt = basename.substring(0, basename.lastIndexOf('.'))
        for (const suffix of suffixes) {
          let match = false
          if (filenameNoExt === suffix) {
            match = true
          } else if (suffix.startsWith('_') && filenameNoExt.endsWith(suffix)) {
            match = true
          }
          if (match) {
            organizedPaths.get(suffix).get(ext).push(relativePath)
            categorized = true
            break // Stop after first suffix match.
          }
        }
      }
    }

    // If the file was categorized, add it to the candidates list.
    if (categorized) {
      candidates.push(relativePath)
    }
  }

  return { candidates, organizedPaths }
}

function _updateEntity(nameDict, entity) {
  const parts = entity.split('-')
  if (parts.length === 2 && parts[0] && parts[1]) {
    nameDict.entities[parts[0]] = parts[1]
  } else {
    nameDict.bad.push(entity)
  }
}

/**
 * Split a filename into BIDS-relevant components.
 *
 * This is a JavaScript implementation of the Python code provided by the user.
 *
 * @param {string} filePath Path to be parsed.
 * @returns {{basename: string, suffix: string, prefix: string, ext: string, bad: string[], entities: Record<string, string>}}
 */
export function parseBidsFilename(filePath) {
  const nameDict = {
    basename: '',
    suffix: null,
    prefix: null,
    ext: '',
    bad: [],
    entities: {},
  }

  const strippedPath = filePath.trim()
  const lastSlash = strippedPath.lastIndexOf('/')
  const filename = lastSlash === -1 ? strippedPath : strippedPath.substring(lastSlash + 1)

  // Simplified extension parsing
  const firstDot = filename.indexOf('.')
  let basename = filename
  if (firstDot !== -1) {
    nameDict.ext = filename.substring(firstDot)
    basename = filename.substring(0, firstDot)
  }
  nameDict.basename = basename

  if (!basename) {
    return nameDict
  }

  const lastUnderscore = basename.lastIndexOf('_')

  // Case: No underscore in filename
  if (lastUnderscore === -1) {
    const entityCount = (basename.match(/-/g) || []).length
    if (entityCount > 1) {
      nameDict.bad.push(basename)
    } else if (entityCount === 1) {
      _updateEntity(nameDict, basename)
    } else {
      nameDict.suffix = basename
    }
    return nameDict
  }

  // Case: Underscore present
  const rest = basename.substring(0, lastUnderscore)
  let suffix = basename.substring(lastUnderscore + 1)

  if (suffix.includes('-') && (suffix.match(/-/g) || []).length === 1) {
    _updateEntity(nameDict, suffix)
    suffix = null // it was an entity, not a suffix
  }
  nameDict.suffix = suffix

  const entityPieces = rest.split('_')
  if (entityPieces.length > 0 && !entityPieces[0].includes('-')) {
    nameDict.prefix = entityPieces.shift()
  }

  for (const entity of entityPieces) {
    _updateEntity(nameDict, entity)
  }

  return nameDict
}

/**
 * Get the directory part of a path.
 * @param {string} path The path.
 * @returns {string} The directory part of the path.
 * @private
 */
function _getDir(path) {
  const lastSlash = path.lastIndexOf('/')
  return lastSlash === -1 ? '' : path.substring(0, lastSlash)
}

/**
 * Filter a list of JSON sidecar paths to find candidates for a given TSV file.
 * @param {string[]} jsonList A list of relative paths of JSON sidecars.
 * @param {string} tsvDir The directory of the TSV file.
 * @param {object} tsvParsed The parsed BIDS filename of the TSV file.
 * @returns {string[]} A list of candidate JSON sidecar paths.
 * @private
 */
export function _getCandidates(jsonList, tsvDir, tsvParsed) {
  return jsonList.filter((jsonPath) => {
    const jsonDir = _getDir(jsonPath)

    // Sidecar must be in the tsv file's directory hierarchy.
    if (!isSubpath(tsvDir, jsonDir)) {
      return false
    }

    const jsonParsed = parseBidsFilename(jsonPath)

    // Suffix must match if json has a suffix. An events.json sidecar can apply to any events.tsv file.
    if (jsonParsed.suffix && tsvParsed.suffix !== jsonParsed.suffix) {
      return false
    }

    // All entities in json must be in tsv and have same value
    for (const [key, value] of Object.entries(jsonParsed.entities)) {
      if (tsvParsed.entities[key] !== value) {
        return false
      }
    }

    return true
  })
}

/**
 * Sort a list of candidate sidecar paths from least to most specific.
 * @param {string[]} candidates A list of candidate JSON sidecar paths.
 * @private
 */
export function _sortCandidates(candidates) {
  candidates.sort((a, b) => {
    const aDir = _getDir(a)
    const bDir = _getDir(b)
    if (aDir.length !== bDir.length) {
      return aDir.length - bDir.length
    }
    const aParsed = parseBidsFilename(a)
    const bParsed = parseBidsFilename(b)
    return Object.keys(aParsed.entities).length - Object.keys(bParsed.entities).length
  })
}

/**
 * Get the merged sidecar for a given TSV file.
 * @param {string} tsvPath The path to the TSV file.
 * @param {string[]} jsonList A list of relative paths of JSON sidecars.
 * @param {Map<string, BidsSidecar>} sidecarMap A map of sidecars.
 * @returns {object} The merged sidecar data.
 */
export function getMergedSidecarData(tsvPath, jsonList, sidecarMap) {
  const tsvDir = _getDir(tsvPath)
  const tsvParsed = parseBidsFilename(tsvPath)

  // 1. Filter to find applicable sidecars
  const candidates = _getCandidates(jsonList, tsvDir, tsvParsed)

  // 2. Sort applicable sidecars from least to most specific.
  _sortCandidates(candidates)

  // 3. Check for conflicts
  const groupedByDir = candidates.reduce((acc, path) => {
    const dir = _getDir(path)
    if (!acc.has(dir)) {
      acc.set(dir, [])
    }
    acc.get(dir).push(path)
    return acc
  }, new Map())

  for (const [dir, sidecarsInDir] of groupedByDir.entries()) {
    if (sidecarsInDir.length > 1) {
      for (let i = 0; i < sidecarsInDir.length; i++) {
        for (let j = i + 1; j < sidecarsInDir.length; j++) {
          const aParsed = parseBidsFilename(sidecarsInDir[i])
          const bParsed = parseBidsFilename(sidecarsInDir[j])
          const aEntities = Object.keys(aParsed.entities)
          const bEntities = Object.keys(bParsed.entities)
          const aIsSubset = aEntities.every((k) => bEntities.includes(k) && aParsed.entities[k] === bParsed.entities[k])
          const bIsSubset = bEntities.every((k) => aEntities.includes(k) && bParsed.entities[k] === aParsed.entities[k])
          if (aIsSubset === bIsSubset) {
            throw new Error(
              `BIDS inheritance conflict in directory '${dir}': sidecars '${sidecarsInDir[i]}' and '${sidecarsInDir[j]}' are not hierarchically related.`,
            )
          }
        }
      }
    }
  }

  // 4. Merge
  let merged = {}
  for (const path of candidates) {
    const sidecar = sidecarMap.get(path)
    if (sidecar && sidecar.jsonData) {
      merged = { ...merged, ...sidecar.jsonData }
    }
  }

  return merged
}

/**
 * A generator function that yields the paths of a given file extension from a BIDS-style organized path mapping.
 *
 * @param {Map<string, Map<string, string[]>>} organizedPaths A BIDS-style organized path mapping.
 * @param {string} targetExtension The file extension to search for.
 * @yields {string} The paths of the given file extension.
 */
export function* organizedPathsGenerator(organizedPaths, targetExtension) {
  if (!organizedPaths) {
    return
  }
  const extKey = targetExtension.startsWith('.') ? targetExtension.slice(1) : targetExtension
  for (const innerMap of organizedPaths.values()) {
    const pathArray = innerMap.get(extKey)
    if (Array.isArray(pathArray)) {
      for (const path of pathArray) {
        yield path
      }
    }
  }
}

// Helper function to initialize organized paths
const _initializeOrganizedPaths = (keys) => {
  const map = new Map()
  for (const key of keys) {
    map.set(
      key,
      new Map([
        ['json', []],
        ['tsv', []],
      ]),
    )
  }
  return map
}
