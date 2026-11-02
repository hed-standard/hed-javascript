/** Checks of the machine-readable files the HED specification publishes (Appendix A.6.1).
 *
 * src/data/json/reservedTags.json and src/data/json/characterSets.json are verbatim copies of the specification's
 * reserved_tags.json and character_sets.json. Each carries a file version X.Y.Z; a validator must not apply a file
 * whose major number it does not support, and accepts any minor and patch number under a supported major.
 *
 * @module utils/specFiles
 */
import { IssueError } from '../issues/issues'

/**
 * The file version major number this validator supports, for every specification file.
 * @type {number}
 */
export const SUPPORTED_FILE_MAJOR = 1

/**
 * Refuse a specification file whose file version major number this validator does not support.
 *
 * @param {Object} data The parsed file.
 * @param {string} versionKey The file's version key: "fileVersion" (reserved_tags.json) or "file_version"
 *     (character_sets.json). The two files spell it differently; that is the specification's choice.
 * @param {string} fileName The file's name, for the message.
 * @throws {IssueError} An internalError if the key is missing, is not an X.Y.Z string, or has another major number.
 */
export function checkFileVersion(data, versionKey, fileName) {
  const version = data != null && Object.hasOwn(data, versionKey) ? data[versionKey] : undefined
  const match = typeof version === 'string' ? /^(\d+)\.(\d+)\.(\d+)$/.exec(version) : null
  if (match === null || Number(match[1]) !== SUPPORTED_FILE_MAJOR) {
    IssueError.generateAndThrowInternalError(
      `${fileName} has ${versionKey} ${JSON.stringify(version) ?? 'missing'}; this validator applies only file ` +
        `version ${SUPPORTED_FILE_MAJOR}.x.x (HED specification Appendix A.6.1)`,
    )
  }
}
