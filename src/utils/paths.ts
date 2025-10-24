/**
 * This module provides utility functions for working with BIDS paths.
 * @module
 */

import path from 'node:path'

import zip from 'lodash/zip'

import { BidsSidecar } from '../bids/types/json'
import { IssueError } from '../issues/issues'
import { iteratePairwiseCombinations } from './array'

/**
 * A parsed BIDS file name.
 */
class ParsedBidsFilename {
  basename: string
  suffix: string | null
  prefix: string | null
  ext: string
  bad: string[]
  entities: Record<string, string>

  constructor() {
    this.basename = ''
    this.suffix = null
    this.prefix = null
    this.ext = ''
    this.bad = []
    this.entities = {}
  }

  /**
   * Whether this file name is equivalent to another one.
   *
   * @param other Another parsed BIDS file name.
   * @returns Whether or not the two names are equivalent.
   */
  public equals(other: ParsedBidsFilename): boolean {
    return this._isSubset(other) && other._isSubset(this)
  }

  /**
   * Whether this file name is a subset of another one.
   *
   * @param other Another parsed BIDS file name.
   * @returns Whether or not this file name is a subset of the other one.
   * @private
   */
  private _isSubset(other: ParsedBidsFilename): boolean {
    const ourEntities = Object.keys(this.entities)
    return ourEntities.every((key) => Object.hasOwn(other.entities, key) && this.entities[key] === other.entities[key])
  }
}

/**
 * A collection of categorized BIDS file paths.
 */
type OrganizedBidsPaths = {
  /**
   * A list of all file paths that were successfully categorized.
   */
  candidates: string[]
  /**
   * A Map where keys are the suffixes and special directories.
   *   Each value is a Map with 'tsv' and 'json' properties, containing the corresponding
   *   file paths. Keys will be present even if no files are found for them.
   */
  organizedPaths: Map<string, Map<string, string[]>>
}

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
 * @param potentialChild The path to check if it's a subpath.
 * @param potentialParent The path to check if it's a parent.
 * @returns True if potentialChild is a subpath of potentialParent, false otherwise.
 */
export function isSubpath(
  potentialChild: string | null | undefined,
  potentialParent: string | null | undefined,
): boolean {
  // Normalize paths for consistent comparison
  const normalizePath = (rawPath: string | null | undefined) => {
    // Handle null/undefined gracefully, and ensure '.' normalizes to an empty string
    // similar to how './' and '/' are effectively treated.
    let p = rawPath ?? ''

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
 * @param relativeFilePaths A list of relative file paths to organize.
 * @param suffixes A list of filename suffixes to categorize by (e.g., 'events').
 * @param specialDirs A list of special directory names (e.g., 'phenotype').
 * @returns The relative file paths organized according to BIDS naming conventions.
 */
export function organizePaths(
  relativeFilePaths: string[],
  suffixes: string[],
  specialDirs: string[],
): OrganizedBidsPaths {
  const candidates: string[] = []
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

/**
 * Updates the entity dictionary with a new entity.
 *
 * @param nameDict The dictionary of BIDS filename parts.
 * @param entity The entity string to parse and add.
 */
function _updateEntity(nameDict: ParsedBidsFilename, entity: string): void {
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
 * @param filePath Path to be parsed.
 * @returns An object containing the parts of the BIDS filename.
 */
export function parseBidsFilename(filePath: string): ParsedBidsFilename {
  const nameDict = new ParsedBidsFilename()

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
 *
 * @param path The path.
 * @returns The directory part of the path.
 */
export function getDir(path: string): string {
  const lastSlash = path.lastIndexOf('/')
  return lastSlash === -1 ? '' : path.substring(0, lastSlash)
}

/**
 * Filter a list of JSON sidecar paths to find candidates for a given TSV file.
 *
 * @param jsonList A list of relative paths of JSON sidecars.
 * @param tsvDir The directory of the TSV file.
 * @param tsvParsed The parsed BIDS filename of the TSV file.
 * @returns A list of candidate JSON sidecar paths.
 */
export function _getCandidates(jsonList: string[], tsvDir: string, tsvParsed: ParsedBidsFilename): string[] {
  return jsonList.filter((jsonPath) => {
    const jsonDir = path.dirname(jsonPath)

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
 *
 * The sorting is done based on path depth and number of entities.
 *
 * @param candidates A list of candidate JSON sidecar paths.
 */
export function _sortCandidates(candidates: string[]) {
  candidates.sort((a, b) => {
    const aDir = path.dirname(a)
    const bDir = path.dirname(b)
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
 *
 * This function implements the BIDS inheritance principle for sidecar files.
 * It finds all applicable sidecars for a given TSV file, sorts them by specificity,
 * checks for conflicts, and then merges them.
 *
 * Note: This function assumes that the sidecars are already parsed and stored in a Map.
 *
 * Note: This function should not be called for files in directories with special association rules such as 'phenotype'.
 *
 * @param tsvPath The path to the TSV file.
 * @param jsonList A list of relative paths of JSON sidecars.
 * @param sidecarMap A map of sidecars.
 * @returns The merged sidecar data.
 * @throws {IssueError} If a BIDS inheritance conflict is detected.
 */
export function getMergedSidecarData(
  tsvPath: string,
  jsonList: string[],
  sidecarMap: Map<string, BidsSidecar>,
): object {
  const tsvDir = path.dirname(tsvPath)
  const tsvParsed = parseBidsFilename(tsvPath)

  // 1. Filter to find applicable sidecars
  const candidates = _getCandidates(jsonList, tsvDir, tsvParsed)

  // 2. Sort applicable sidecars from least to most specific.
  _sortCandidates(candidates)
  // 3. Check for conflicts
  const groupedByDir = candidates.reduce((acc, xpath) => {
    const dir = path.dirname(xpath)
    if (!acc.has(dir)) {
      acc.set(dir, [])
    }
    acc.get(dir).push(xpath)
    return acc
  }, new Map())

  for (const [dir, sidecarsInDir] of groupedByDir.entries()) {
    if (sidecarsInDir.length > 1) {
      _testSameDir(dir, sidecarsInDir)
    }
  }

  // 4. Merge
  let merged = {}
  for (const path of candidates) {
    const sidecar = sidecarMap.get(path)
    if (sidecar?.jsonData) {
      merged = { ...merged, ...sidecar.jsonData }
    }
  }

  return merged
}

/**
 * Tests that sidecar files in the same directory do not have conflicting inheritance relationships.
 *
 * In BIDS inheritance, sidecar files must be hierarchically related - one must be a
 * subset of another in terms of entities. This function validates that no two sidecars
 * in the same directory have conflicting inheritance relationships (i.e., neither is
 * a subset of the other, or both are subsets of each other).
 *
 * @param dir The directory path being tested
 * @param sidecarsInDir Array of sidecar filenames in the directory
 * @throws {IssueError} Throws an error if any two sidecars are hierarchically related
 */
function _testSameDir(dir: string, sidecarsInDir: string[]) {
  const parsedBidsFileNames = sidecarsInDir.map((path) => parseBidsFilename(path))
  const iterator = iteratePairwiseCombinations(zip(sidecarsInDir, parsedBidsFileNames))
  for (const [[firstName, firstParsed], [secondName, secondParsed]] of iterator) {
    if (firstParsed.equals(secondParsed)) {
      IssueError.generateAndThrowInternalError(
        `BIDS inheritance conflict in directory '${dir}': sidecars '${firstName}' and '${secondName}' are not hierarchically related.`,
      )
    }
  }
}

/**
 * A generator function that yields the paths of a given file extension from a BIDS-style organized path mapping.
 *
 * @param organizedPaths A BIDS-style organized path mapping.
 * @param targetExtension The file extension to search for (e.g., '.json').
 * @returns A generator for the paths of the given file extension.
 */
export function* organizedPathsGenerator(
  organizedPaths: Map<string, Map<string, string[]>>,
  targetExtension: string,
): Generator<string> {
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

/**
 * Initialize the organized paths map.
 *
 * @param keys The keys to initialize the map with.
 * @returns The initialized map.
 */
function _initializeOrganizedPaths(keys: string[]): Map<string, Map<string, string[]>> {
  const map = new Map<string, Map<string, string[]>>()
  for (const key of keys) {
    map.set(
      key,
      new Map<string, string[]>([
        ['json', []],
        ['tsv', []],
      ]),
    )
  }
  return map
}
