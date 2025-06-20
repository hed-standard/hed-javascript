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
 * Filters a list of relative paths from a dataset according to specific rules.
 *
 * The function assumes that:
 * - `datasetRoot` is the name of the root directory of the dataset (e.g., "myDataset").
 * - All paths in the `paths` array start with this `datasetRoot` segment
 *   (e.g., "myDataset/file.txt", "myDataset/sub-01/data.nii.gz").
 *
 * It keeps paths that match any of the following criteria:
 * 1. Paths under the `phenotype` directory: `datasetRoot/phenotype/...`
 * 2. Paths under a subject directory: `datasetRoot/sub-...` (e.g., `datasetRoot/sub-01/...`)
 * 3. Files or directories that are direct children of `datasetRoot`: `datasetRoot/someFileOrDir`
 *    (e.g., `datasetRoot/README.md`, but not `datasetRoot/derivatives/README.md`).
 *
 * @param {string[]} paths An array of relative path strings.
 * @param {string} datasetRoot The name of the dataset's root directory.
 * @returns {string[]} A new array containing only the filtered paths.
 */
export function filterDatasetPaths(paths, datasetRoot) {
  // Validate datasetRoot: should be a simple, non-empty string without slashes, '.', or '..'
  if (
    !datasetRoot ||
    typeof datasetRoot !== 'string' ||
    datasetRoot.trim() === '' ||
    datasetRoot.includes('/') ||
    datasetRoot === '.' ||
    datasetRoot === '..'
  ) {
    return [] // Return empty array for invalid input
  }

  const rootPrefix = datasetRoot + '/' // e.g., "myDataset/"
  const phenotypePrefix = rootPrefix + 'phenotype/' // e.g., "myDataset/phenotype/"
  const subjectPrefix = rootPrefix + 'sub-' // e.g., "myDataset/sub-"

  return paths.filter((path) => {
    // Rule 1: Keep paths starting with datasetRoot/phenotype/
    if (path.startsWith(phenotypePrefix)) {
      return true
    }

    // Rule 2: Keep paths starting with datasetRoot/sub-
    if (path.startsWith(subjectPrefix)) {
      return true
    }

    // Rule 3: Keep paths that are direct children of datasetRoot
    // Path must start with rootPrefix.
    // The part after rootPrefix must not contain any further '/' and must not be empty.
    if (path.startsWith(rootPrefix)) {
      const pathAfterRoot = path.substring(rootPrefix.length)
      if (pathAfterRoot.length > 0 && !pathAfterRoot.includes('/')) {
        return true
      }
    }

    return false
  })
}

/**
 * Filters a list of relative paths, keeping only those files where the
 * filename (the part before the final extension) ends with a specific suffix.
 *
 * For example:
 * - If path is "path/to/myfile_events.tsv" and targetSuffix is "_events",
 *   the filename part "myfile_events" ends with "_events", so the path is kept.
 * - If path is "path/to/archive.report_final.tar.gz" and targetSuffix is "_final",
 *   the filename part "archive.report_final.tar" (before ".gz") ends with "_final", so the path is kept.
 * - If path is "path/to/README" (no extension) and targetSuffix is "ME",
 *   the filename part "README" ends with "ME", so the path is kept.
 * - Paths ending with '/' are considered directories and are ignored.
 * - If targetSuffix is empty, null, or undefined, an empty list is returned.
 *
 * @param {string[]} paths An array of relative path strings.
 * @param {string} targetSuffix The suffix to check for at the end of the filename part (before the final extension).
 * @returns {string[]} A new array containing only the filtered paths.
 */
export function filterPathsByFilenameSuffix(paths, targetSuffix) {
  if (!targetSuffix || typeof targetSuffix !== 'string' || targetSuffix.trim() === '') {
    return []
  }

  if (!Array.isArray(paths)) {
    return []
  }

  return paths.filter((path) => {
    if (typeof path !== 'string' || path.endsWith('/')) {
      // Ignore non-strings or paths ending with a slash (directories)
      return false
    }

    const basename = path.substring(path.lastIndexOf('/') + 1)
    if (basename === '') {
      // Ignore paths that result in an empty basename (e.g., if path was just '/')
      return false
    }

    const lastDotIndex = basename.lastIndexOf('.')
    const namePart = lastDotIndex === -1 ? basename : basename.substring(0, lastDotIndex)

    if (namePart === '') {
      // If namePart is empty (e.g. ".bashrc" leads to empty namePart), it cannot end with a non-empty targetSuffix.
      return false
    }

    return namePart.endsWith(targetSuffix)
  })
}

/**
 * Filters a list of relative paths, keeping only those that match the given extension(s).
 *
 * @param {string[]} paths An array of relative path strings.
 * @param {string|string[]} targetExtensions The target extension(s) (e.g., '.tsv' or ['tsv', '.json']).
 *                                            Extensions are matched case-insensitively by default.
 *                                            If an extension string does not start with '.', it will be added.
 * @param {boolean} [caseSensitive=false] Whether the extension matching should be case-sensitive.
 * @returns {string[]} A new array containing only the filtered paths.
 */
export function filterPathsByExtension(paths, targetExtensions, caseSensitive = false) {
  if (!Array.isArray(paths)) {
    return []
  }

  let extensionsToMatch = []
  if (typeof targetExtensions === 'string') {
    extensionsToMatch = [targetExtensions]
  } else if (Array.isArray(targetExtensions)) {
    extensionsToMatch = targetExtensions
  } else {
    return []
  }

  extensionsToMatch = extensionsToMatch
    .filter((ext) => typeof ext === 'string' && ext.trim() !== '')
    .map((ext) => {
      const trimmedExt = ext.trim()
      return trimmedExt.startsWith('.') ? trimmedExt : '.' + trimmedExt
    })

  if (extensionsToMatch.length === 0) {
    return []
  }

  if (!caseSensitive) {
    extensionsToMatch = extensionsToMatch.map((ext) => ext.toLowerCase())
  }

  return paths.filter((path) => {
    if (typeof path !== 'string' || path.endsWith('/')) {
      // Ignore non-strings or paths ending with a slash (directories)
      return false
    }

    const lastDotIndex = path.lastIndexOf('.')
    if (lastDotIndex === -1 || lastDotIndex === 0 || lastDotIndex === path.length - 1) {
      // No extension, hidden file without extension (e.g. .bashrc), or ends with a dot.
      return false
    }

    let fileExtension = path.substring(lastDotIndex)
    if (!caseSensitive) {
      fileExtension = fileExtension.toLowerCase()
    }

    return extensionsToMatch.includes(fileExtension)
  })
}

/**
 * Initializes the result object for getBidsFiles.
 * @param {string[]} subdirectories - An array of subdirectory names.
 * @returns {Object<string, {tsv: string[], json: string[]}>} The initialized result object.
 * @private
 */
function _initializeBidsResult(subdirectories) {
  const initialResult = {}
  const effectiveSubdirectories = Array.isArray(subdirectories) ? subdirectories : []
  effectiveSubdirectories.forEach((subDir) => {
    if (typeof subDir === 'string' && subDir.trim() !== '') {
      initialResult[subDir.trim()] = { tsv: [], json: [] }
    }
  })
  initialResult.other = { tsv: [], json: [] }
  return initialResult
}

/**
 * Validates the main inputs for getBidsFiles.
 * If inputs are invalid, it returns a cleaned version of the initialResult.
 * Otherwise, it returns null, indicating inputs are valid.
 * @param {string[]} paths - An array of relative path strings.
 * @param {string} datasetRoot - The name of the dataset's root directory.
 * @param {Object<string, {tsv: string[], json: string[]}>} initialResult - The initial result structure.
 * @returns {Object<string, {tsv: string[], json: string[]}> | null} Cleaned result if invalid, else null.
 * @private
 */
function _validateGetBidsFilesInputs(paths, datasetRoot, initialResult) {
  if (
    !Array.isArray(paths) ||
    !datasetRoot ||
    typeof datasetRoot !== 'string' ||
    datasetRoot.trim() === '' ||
    datasetRoot.includes('/') ||
    datasetRoot === '.' ||
    datasetRoot === '..'
  ) {
    const cleanedResult = JSON.parse(JSON.stringify(initialResult))
    for (const key in cleanedResult) {
      if (cleanedResult[key].tsv.length === 0 && cleanedResult[key].json.length === 0) {
        delete cleanedResult[key]
      }
    }
    return cleanedResult
  }
  return null
}

/**
 * Determines the file extension key ('tsv' or 'json') or null if not applicable.
 * @param {string} path - The file path.
 * @returns {string|null} 'tsv', 'json', or null.
 * @private
 */
function _getFileExtensionKey(path) {
  const lastDotIndex = path.lastIndexOf('.')
  if (lastDotIndex === -1 || lastDotIndex === 0 || lastDotIndex === path.length - 1) {
    return null // No valid extension
  }
  const extension = path.substring(lastDotIndex).toLowerCase()
  if (extension === '.tsv') {
    return 'tsv'
  } else if (extension === '.json') {
    return 'json'
  }
  return null // Not a .tsv or .json file
}

/**
 * Categorizes a single file into the result object.
 * @param {string} path - The file path.
 * @param {string} rootPrefix - The datasetRoot followed by '/'.
 * @param {string[]} effectiveSubdirectories - Trimmed and validated subdirectory names.
 * @param {Object<string, {tsv: string[], json: string[]}>} result - The result object to update.
 * @param {string} extKey - The extension key ('tsv' or 'json').
 * @private
 */
function _categorizeFile(path, rootPrefix, effectiveSubdirectories, result, extKey) {
  if (!path.startsWith(rootPrefix)) {
    return // Path is not under the dataset root
  }

  const pathAfterRoot = path.substring(rootPrefix.length)
  if (pathAfterRoot.length === 0) {
    return // Path is just the dataset root itself
  }

  const pathSegments = pathAfterRoot.split('/')
  const firstSegmentAfterRoot = pathSegments[0]

  let categorized = false

  // Check against specified subdirectories (e.g., "phenotype")
  // These are expected to be direct children of the datasetRoot.
  if (pathSegments.length > 1) {
    // File must be *inside* a directory
    for (const cleanSubDir of effectiveSubdirectories) {
      if (firstSegmentAfterRoot === cleanSubDir) {
        result[cleanSubDir][extKey].push(path)
        categorized = true
        break
      }
    }
  }

  if (!categorized) {
    // Check for "other" category:
    // 1. Top-level files (directly under datasetRoot): pathAfterRoot does not contain '/'
    // 2. Files under any 'sub-X' directory: firstSegmentAfterRoot starts with 'sub-'
    const isTopLevelFile = !pathAfterRoot.includes('/')
    const isInSubXDirectory = firstSegmentAfterRoot.startsWith('sub-')

    if (isTopLevelFile || isInSubXDirectory) {
      result.other[extKey].push(path)
    }
  }
}

/**
 * Removes categories from the result object if they have no files.
 * @param {Object<string, {tsv: string[], json: string[]}>} result - The result object to clean.
 * @private
 */
function _cleanupEmptyCategories(result) {
  Object.keys(result).forEach((key) => {
    // Changed from for...in to Object.keys().forEach
    if (result[key].tsv.length === 0 && result[key].json.length === 0) {
      delete result[key]
    }
  })
}

/**
 * Categorizes BIDS dataset files based on specified subdirectories, filename suffixes,
 * and fixed extensions (.tsv, .json).
 *
 * Files are categorized into:
 * 1. Specified subdirectories (e.g., "phenotype", "stimuli").
 * 2. An "other" category, which includes:
 *    - Files directly under the datasetRoot.
 *    - Files within any 'sub-X' directory (e.g., 'sub-01', 'sub-02/anat').
 *
 * Within each category, files are further divided into 'tsv' and 'json' lists
 * based on their extension.
 *
 * The function expects input paths to be relative to the workspace root and
 * start with the `datasetRoot` segment (e.g., "myDataset/sub-01/data.tsv").
 *
 * @param {string[]} paths An array of relative path strings.
 * @param {string} datasetRoot The name of the dataset's root directory (e.g., "myDataset").
 *                             Should be a simple name, without slashes.
 * @param {string[]} subdirectories An array of subdirectory names to categorize explicitly
 *                                  (e.g., ["phenotype", "stimuli"]).
 * @returns {Object<string, {tsv: string[], json: string[]}>} An object where keys are
 *          the subdirectory names (from `subdirectories` parameter) plus "other".
 *          Values are objects with "tsv" and "json" properties, each holding an array of matching file paths.
 *          Example: { "phenotype": { "tsv": [], "json": [] }, "other": { "tsv": [], "json": [] } }
 */
export function getBidsFiles(paths, datasetRoot, subdirectories) {
  const initialResult = _initializeBidsResult(subdirectories)

  const validationErrorResult = _validateGetBidsFilesInputs(paths, datasetRoot, initialResult)
  if (validationErrorResult) {
    return validationErrorResult
  }

  const result = JSON.parse(JSON.stringify(initialResult))
  const rootPrefix = datasetRoot + '/'
  // Get effective subdirectories once, already trimmed and keys exist in result
  const effectiveSubdirectories = Object.keys(initialResult).filter((k) => k !== 'other')

  for (const path of paths) {
    if (typeof path !== 'string' || path.endsWith('/')) {
      continue // Skip non-strings or directory paths
    }

    const extKey = _getFileExtensionKey(path)
    if (!extKey) {
      continue // Not a .tsv or .json file, or no valid extension
    }

    _categorizeFile(path, rootPrefix, effectiveSubdirectories, result, extKey)
  }

  _cleanupEmptyCategories(result)
  return result
}

/**
 * Organizes a dictionary of .tsv and .json file paths based on a list of filename suffixes.
 * The suffix is checked against the part of the filename before the final extension.
 *
 * @param {Object<string, string[]>} filedict - An object with 'tsv' and 'json' keys,
 *                                            each holding an array of relative file paths.
 *                                            Example: { tsv: ["path/name_suffix.tsv"], json: [] }
 * @param {string[]} suffixes - An array of suffixes to organize by (e.g., ["_events", "_bold"]).
 * @returns {Object<string, {tsv: string[], json: string[]}>} A new object where keys are the suffixes.
 *          The values are objects with "tsv" and "json" properties, each holding an array of
 *          file paths from the input `filedict` that match the respective suffix and extension.
 *          If a suffix from the input list yields no matching files, it will still be a key
 *          in the returned dictionary with empty tsv/json arrays.
 */
export function organizeBySuffix(filedict, suffixes) {
  const organizedResult = {}

  if (!Array.isArray(suffixes) || suffixes.length === 0) {
    return organizedResult // Return empty object if no suffixes are provided
  }

  if (!filedict || typeof filedict !== 'object') {
    // Initialize all suffix keys with empty arrays if filedict is invalid but suffixes are provided
    suffixes.forEach((suffix) => {
      if (typeof suffix === 'string' && suffix.trim() !== '') {
        organizedResult[suffix] = { tsv: [], json: [] }
      } else {
        // Handle invalid suffix strings in the input array by creating a key representation
        organizedResult[String(suffix)] = { tsv: [], json: [] }
      }
    })
    return organizedResult
  }

  const inputTsvFiles = Array.isArray(filedict.tsv) ? filedict.tsv : []
  const inputJsonFiles = Array.isArray(filedict.json) ? filedict.json : []

  suffixes.forEach((suffix) => {
    const currentSuffixKey = typeof suffix === 'string' && suffix.trim() !== '' ? suffix : String(suffix)
    // Initialize even if suffix is invalid, as per behavior for invalid filedict
    organizedResult[currentSuffixKey] = { tsv: [], json: [] }

    if (typeof suffix !== 'string' || suffix.trim() === '') {
      // Skip actual filtering for invalid suffixes, key is already initialized with empty arrays
      return
    }

    organizedResult[currentSuffixKey].tsv = filterPathsByFilenameSuffix(inputTsvFiles, suffix)
    organizedResult[currentSuffixKey].json = filterPathsByFilenameSuffix(inputJsonFiles, suffix)
  })

  // Remove keys where both tsv and json arrays are empty
  Object.keys(organizedResult).forEach((key) => {
    if (organizedResult[key].tsv.length === 0 && organizedResult[key].json.length === 0) {
      delete organizedResult[key]
    }
  })

  return organizedResult
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
  const organizedPaths = new Map()

  // Initialize organizedPaths with keys for all suffixes and special directories.
  for (const suffix of suffixes) {
    organizedPaths.set(
      suffix,
      new Map([
        ['json', []],
        ['tsv', []],
      ]),
    )
  }
  for (const dir of specialDirs) {
    organizedPaths.set(
      dir,
      new Map([
        ['json', []],
        ['tsv', []],
      ]),
    )
  }

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
