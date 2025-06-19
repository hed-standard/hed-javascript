import {
  isSubpath,
  filterDatasetPaths,
  filterPathsByFilenameSuffix,
  filterPathsByExtension,
  getBidsFiles,
  organizeBySuffix,
  organizePaths,
} from '../../src/utils/paths.js'
import { describe, test, expect } from '@jest/globals'

describe('isSubpath', () => {
  // Test cases where isSubpath should return true
  test('should return true for a direct subpath', () => {
    expect(isSubpath('parent/child', 'parent')).toBe(true)
  })

  test('should return true for a deeper subpath', () => {
    expect(isSubpath('parent/child/grandchild', 'parent')).toBe(true)
  })

  test('should return true when paths are identical', () => {
    expect(isSubpath('parent/child', 'parent/child')).toBe(true)
  })

  test('should return true with leading ./ on child', () => {
    expect(isSubpath('./parent/child', 'parent')).toBe(true)
  })

  test('should return true with leading ./ on parent', () => {
    expect(isSubpath('parent/child', './parent')).toBe(true)
  })

  test('should return true with trailing / on child', () => {
    expect(isSubpath('parent/child/', 'parent')).toBe(true)
  })

  test('should return true with trailing / on parent', () => {
    expect(isSubpath('parent/child', 'parent/')).toBe(true)
  })

  test('should return true with leading ./ and trailing / on both', () => {
    expect(isSubpath('./parent/child/', './parent/')).toBe(true)
  })

  test('should return true for identical paths with normalization characters', () => {
    expect(isSubpath('./parent/child/', './parent/child/')).toBe(true)
  })

  test('should return true when parent is effectively empty after normalization and child is not (e.g. parent is ./)', () => {
    expect(isSubpath('some/path', './')).toBe(true) // './' normalizes to ''
  })

  test('should return true when parent is effectively empty after normalization and child is not (e.g. parent is /)', () => {
    // Assuming '/' is treated as a root and any non-empty path is under it.
    // The current normalizePath turns '/' into ''
    expect(isSubpath('some/path', '/')).toBe(true)
  })

  test('should return true for single segment paths', () => {
    expect(isSubpath('child', '.')).toBe(true) // '.' normalizes to ''
    expect(isSubpath('child', './')).toBe(true) // './' normalizes to ''
  })

  // Test cases where isSubpath should return false
  test('should return false when child is not a subpath', () => {
    expect(isSubpath('other/child', 'parent')).toBe(false)
  })

  test('should return false when parent is a subpath of child', () => {
    expect(isSubpath('parent', 'parent/child')).toBe(false)
  })

  test('should return false for partial matches that are not directory boundaries', () => {
    expect(isSubpath('parent-other/child', 'parent')).toBe(false)
  })

  test('should return false when child is different at the root level', () => {
    expect(isSubpath('child/grandchild', 'parent/grandchild')).toBe(false)
  })

  test('should return false when comparing unrelated paths', () => {
    expect(isSubpath('foo/bar', 'baz/qux')).toBe(false)
  })

  test('should return false when child is shorter and a partial match of parent', () => {
    expect(isSubpath('parent', 'parentlonger')).toBe(false)
  })

  // Edge cases
  test('should return true when both paths are identical and simple', () => {
    expect(isSubpath('a', 'a')).toBe(true)
  })

  test('should return true when both paths are effectively empty (e.g. . and ./)', () => {
    expect(isSubpath('.', './')).toBe(true) // Both normalize to ''
    expect(isSubpath('', '')).toBe(true)
    expect(isSubpath('./', './')).toBe(true)
  })

  test('should return true if child is not empty and parent is effectively empty', () => {
    expect(isSubpath('a', '')).toBe(true)
    expect(isSubpath('a/b', '.')).toBe(true)
  })

  test('should return false if child is effectively empty and parent is not', () => {
    expect(isSubpath('', 'a')).toBe(false)
    expect(isSubpath('.', 'a/b')).toBe(false)
  })
})

describe('filterDatasetPaths', () => {
  const datasetRoot = 'myDataset'
  const allPathsForRootValidation = [
    'myDataset/phenotype/data.csv',
    'myDataset/sub-01/anat/T1w.nii.gz',
    'myDataset/README.md',
  ]

  test('should return an empty array if input paths is empty', () => {
    expect(filterDatasetPaths([], datasetRoot)).toEqual([])
  })

  test('should correctly filter paths based on the rules', () => {
    const paths = [
      'myDataset/phenotype/data.csv', // Keep R1
      'myDataset/sub-01/anat/T1w.nii.gz', // Keep R2
      'myDataset/README.md', // Keep R3
      'myDataset/derivatives/report.html', // Discard
      'myDataset/code/script.py', // Discard
      'myDataset/sub-02/', // Keep R2
      'myDataset/participants.tsv', // Keep R3
      'myDataset/sourcedata', // Keep R3
      'myDataset/sourcedata/anat/T1.nii.gz', // Discard
      'myDataset/phenotype_mismatch/data.csv', // Discard
      'myDataset/sub-biological/info.txt', // Keep R2
    ]
    const expected = [
      'myDataset/phenotype/data.csv',
      'myDataset/sub-01/anat/T1w.nii.gz',
      'myDataset/README.md',
      'myDataset/sub-02/',
      'myDataset/participants.tsv',
      'myDataset/sourcedata',
      'myDataset/sub-biological/info.txt',
    ]
    const result = filterDatasetPaths(paths, datasetRoot)
    expect(result).toEqual(expected)
  })

  test('should filter a comprehensive list of paths, preserving order', () => {
    const allPaths = [
      'myDataset/phenotype/data.csv', // R1
      'myDataset/phenotype/other_info/extra.txt', // R1
      'myDataset/sub-01/anat/T1w.nii.gz', // R2
      'myDataset/sub-02/func/bold.nii.gz', // R2
      'myDataset/sub-01/', // R2
      'myDataset/README.md', // R3
      'myDataset/participants.tsv', // R3
      'myDataset/dataset_description.json', // R3
      'myDataset/code', // R3 (direct child dir, no slash)
      'myDataset/derivatives/fmriprep/report.html', // No
      'myDataset/sourcedata/sub-01/anat/T1w.nii.gz', // No
      'myDataset/code/processing/script.py', // No
      'myDataset/phenotype_extra/data.csv', // No
      'myDataset/not-sub/data.txt', // No
      'myDataset/stimuli/images/img.jpg', // No
      'myDataset/sub-03', // R2
      'myDataset/phenotype/', // R1
      'myDataset/stimuli/', // No (direct child dir with slash, not caught by R3)
      'myDataset/models', // R3
      'myDataset/models/model.json', // No
    ]
    const expectedFilteredPaths = [
      'myDataset/phenotype/data.csv',
      'myDataset/phenotype/other_info/extra.txt',
      'myDataset/sub-01/anat/T1w.nii.gz',
      'myDataset/sub-02/func/bold.nii.gz',
      'myDataset/sub-01/',
      'myDataset/README.md',
      'myDataset/participants.tsv',
      'myDataset/dataset_description.json',
      'myDataset/code',
      'myDataset/sub-03',
      'myDataset/phenotype/',
      'myDataset/models',
    ]
    const result = filterDatasetPaths(allPaths, datasetRoot)
    expect(result).toEqual(expectedFilteredPaths)
  })

  describe('datasetRoot validation', () => {
    test('should return empty array for null datasetRoot', () => {
      expect(filterDatasetPaths(allPathsForRootValidation, null)).toEqual([])
    })

    test('should return empty array for empty string datasetRoot', () => {
      expect(filterDatasetPaths(allPathsForRootValidation, '')).toEqual([])
    })

    test('should return empty array for datasetRoot with spaces only', () => {
      expect(filterDatasetPaths(allPathsForRootValidation, '   ')).toEqual([])
    })

    test('should return empty array for datasetRoot containing /', () => {
      expect(filterDatasetPaths(allPathsForRootValidation, 'myDataset/')).toEqual([])
      expect(filterDatasetPaths(allPathsForRootValidation, 'root/myDataset')).toEqual([])
    })

    test('should return empty array for datasetRoot being .', () => {
      expect(filterDatasetPaths(allPathsForRootValidation, '.')).toEqual([])
    })

    test('should return empty array for datasetRoot being ..', () => {
      expect(filterDatasetPaths(allPathsForRootValidation, '..')).toEqual([])
    })

    test('should not return empty array for a valid datasetRoot (it should process paths)', () => {
      // This test now checks that it doesn't return an empty list for valid root if paths are valid
      const result = filterDatasetPaths(allPathsForRootValidation, 'validRoot')
      // Since "validRoot" doesn't match "myDataset" in allPathsForRootValidation,
      // the result will be empty. If allPathsForRootValidation used "validRoot" it would be different.
      // The key is that it *tried* to process, rather than short-circuiting due to invalid root.
      // For this specific input, an empty array is expected because no paths will match "validRoot/"
      expect(result).toEqual([])
      // A more robust test for "valid root processing" would be to ensure it *doesn't* return empty
      // if there are paths that *should* match the valid root.
      const pathsForValidRoot = ['validRoot/phenotype/data.csv', 'validRoot/file.txt']
      const expectedForValidRoot = ['validRoot/phenotype/data.csv', 'validRoot/file.txt']
      expect(filterDatasetPaths(pathsForValidRoot, 'validRoot')).toEqual(expectedForValidRoot)
    })
  })

  test('should handle paths that are exactly datasetRoot/phenotype or datasetRoot/sub-X (no trailing slash)', () => {
    const paths = [
      'myDataset/phenotype', // Kept by Rule 3
      'myDataset/sub-01', // Kept by Rule 2
      'myDataset/phenotype/', // Kept by Rule 1
      'myDataset/sub-02/', // Kept by Rule 2
    ]
    const expected = ['myDataset/phenotype', 'myDataset/sub-01', 'myDataset/phenotype/', 'myDataset/sub-02/']
    const result = filterDatasetPaths(paths, datasetRoot)
    expect(result).toEqual(expected)
  })

  test('should correctly handle paths that are direct children directories with and without trailing slashes', () => {
    const paths = [
      'myDataset/data', // Rule 3 (direct child dir, no slash) -> Keep
      'myDataset/data/', // Not Rule 3 (pathAfterRoot is "data/", includes "/"). Not R1 or R2. -> Discard
      'myDataset/data/file', // Not Rule 3 (pathAfterRoot is "data/file", includes "/"). Not R1 or R2. -> Discard
    ]
    const expected = ['myDataset/data']
    const result = filterDatasetPaths(paths, datasetRoot)
    expect(result).toEqual(expected)
  })

  test('should filter out path that is exactly datasetRoot', () => {
    // This path does not start with datasetRoot + '/', so it won't match any rules.
    const paths = ['myDataset']
    expect(filterDatasetPaths(paths, datasetRoot)).toEqual([])
  })

  test('paths that are sub-directories of phenotype or sub- should be kept', () => {
    const paths = [
      'myDataset/phenotype/group1/data.tsv', // Rule 1
      'myDataset/sub-01/ses-01/anat/T1.nii.gz', // Rule 2
    ]
    const expected = ['myDataset/phenotype/group1/data.tsv', 'myDataset/sub-01/ses-01/anat/T1.nii.gz']
    const result = filterDatasetPaths(paths, datasetRoot)
    expect(result).toEqual(expected)
  })

  test('paths that look like sub- or phenotype but are not at the correct level should be discarded', () => {
    const paths = [
      'myDataset/derivatives/phenotype/data.csv', // Not Rule 1 (not datasetRoot/phenotype)
      'myDataset/sourcedata/sub-01/anat/T1.nii.gz', // Not Rule 2 (not datasetRoot/sub-01)
    ]
    expect(filterDatasetPaths(paths, datasetRoot)).toEqual([])
  })
})

describe('filterPathsByFilenameSuffix', () => {
  test('should return an empty array if input paths is empty', () => {
    expect(filterPathsByFilenameSuffix([], '_events')).toEqual([])
  })

  test('should return an empty array if targetSuffix is empty', () => {
    expect(filterPathsByFilenameSuffix(['file_events.txt'], '')).toEqual([])
  })

  test('should return an empty array if targetSuffix is null', () => {
    expect(filterPathsByFilenameSuffix(['file_events.txt'], null)).toEqual([])
  })

  test('should return an empty array if targetSuffix is undefined', () => {
    expect(filterPathsByFilenameSuffix(['file_events.txt'], undefined)).toEqual([])
  })

  test('should return empty array if paths is not an array', () => {
    expect(filterPathsByFilenameSuffix(null, '_events')).toEqual([])
    expect(filterPathsByFilenameSuffix(undefined, '_events')).toEqual([])
    expect(filterPathsByFilenameSuffix('a/b/c_events.txt', '_events')).toEqual([])
  })

  test('should correctly filter paths with matching suffixes', () => {
    const paths = [
      'data/subject1_events.tsv',
      'data/subject1_main.tsv',
      'subject2_events.json',
      'subject2_events_extra.txt',
    ]
    const expected = ['data/subject1_events.tsv', 'subject2_events.json']
    expect(filterPathsByFilenameSuffix(paths, '_events')).toEqual(expected)
  })

  test('should handle paths with no extensions', () => {
    const paths = ['README_draft', 'CHANGELOG', 'another_draft_file']
    const expected = ['README_draft'] // Corrected: 'another_draft_file' does not end with '_draft'
    expect(filterPathsByFilenameSuffix(paths, '_draft')).toEqual(expected)
  })

  test('should handle paths with multiple dots in the filename', () => {
    const paths = [
      'archive.report_final.tar.gz', // namePart: archive.report_final.tar -> matches _final.tar
      'archive.report_beta.tar.gz', // namePart: archive.report_beta.tar -> no match for _final
      'myfile.version1_final.zip', // namePart: myfile.version1_final -> matches _final
    ]
    expect(filterPathsByFilenameSuffix(paths, '_final')).toEqual(['myfile.version1_final.zip'])
    expect(filterPathsByFilenameSuffix(paths, '_final.tar')).toEqual(['archive.report_final.tar.gz'])
  })

  test('should handle targetSuffix with dots', () => {
    const paths = ['backup.v1.snapshot.zip', 'backup.v2.main.zip']
    const expected = ['backup.v1.snapshot.zip']
    expect(filterPathsByFilenameSuffix(paths, '.snapshot')).toEqual(expected)
  })

  test('should be case-sensitive', () => {
    const paths = ['file_Events.txt', 'file_events.txt']
    expect(filterPathsByFilenameSuffix(paths, '_events')).toEqual(['file_events.txt'])
    expect(filterPathsByFilenameSuffix(paths, '_Events')).toEqual(['file_Events.txt'])
  })

  test('should ignore directories (paths ending with /)', () => {
    const paths = ['mydir_outputs/', 'file_outputs.txt', 'another_outputs']
    const expected = ['file_outputs.txt', 'another_outputs']
    expect(filterPathsByFilenameSuffix(paths, '_outputs')).toEqual(expected)
  })

  test('should ignore paths that are just / or result in empty basenames', () => {
    const paths = ['/', 'somedir/', 'file_norm.txt']
    expect(filterPathsByFilenameSuffix(paths, '_norm')).toEqual(['file_norm.txt'])
  })

  test('should return empty array if namePart is shorter than targetSuffix', () => {
    const paths = ['short.txt'] // namePart: short
    expect(filterPathsByFilenameSuffix(paths, '_verylongsuffix')).toEqual([])
  })

  test('should handle filenames starting with a dot (e.g., .bashrc)', () => {
    // .bashrc -> basename ".bashrc", namePart "" -> no match
    // .config_profile -> basename ".config_profile", namePart ".config" -> match for "_profile" is false
    // file.config_profile -> basename "file.config_profile", namePart "file.config" -> match for "_profile" is false
    const paths = ['.bashrc', 'src/.config_profile', 'docs/file.config_profile', 'other_profile.ini']
    expect(filterPathsByFilenameSuffix(paths, 'rc')).toEqual([]) // .bashrc -> namePart ""
    expect(filterPathsByFilenameSuffix(paths, '_profile')).toEqual(['other_profile.ini'])
    expect(filterPathsByFilenameSuffix(paths, '.config_profile')).toEqual([]) // namePart for src/.config_profile is ""
  })

  test('should correctly handle filenames that are only extensions or start with multiple dots', () => {
    const paths = [
      '.gitattributes', // namePart: ""
      '..configrc', // namePart: ".."
      '.config.json', // namePart: ".config"
      'file.json', // namePart: "file"
      'data_config.json', // namePart: "data_config"
    ]
    expect(filterPathsByFilenameSuffix(paths, 'attributes')).toEqual([])
    expect(filterPathsByFilenameSuffix(paths, 'rc')).toEqual([]) // namePart for ..configrc is ".."
    expect(filterPathsByFilenameSuffix(paths, 'json')).toEqual([]) // namePart for .config.json is ".config", for file.json is "file"
    expect(filterPathsByFilenameSuffix(paths, 'config')).toEqual(['.config.json', 'data_config.json']) // .config.json -> namePart ".config", data_config.json -> namePart "data_config"
  })

  test('should handle various path structures', () => {
    const paths = [
      './data_events.tsv',
      '../logs_events.txt',
      'no_prefix_events.md',
      'a/b/c/deep_path_events.jsonl.gz', // namePart: a/b/c/deep_path_events.jsonl
    ]
    const expected = [
      './data_events.tsv',
      '../logs_events.txt',
      'no_prefix_events.md',
      // 'a/b/c/deep_path_events.jsonl.gz' // namePart is 'deep_path_events.jsonl', endsWith '_events.jsonl' not '_events'
    ]
    expect(filterPathsByFilenameSuffix(paths, '_events')).toEqual(expected)
    expect(filterPathsByFilenameSuffix(['a/b/c/deep_path_events.jsonl.gz'], '_events.jsonl')).toEqual([
      'a/b/c/deep_path_events.jsonl.gz',
    ])
  })
})

describe('filterPathsByExtension', () => {
  test('should return an empty array if input paths is empty', () => {
    expect(filterPathsByExtension([], '.tsv')).toEqual([])
  })

  test('should return an empty array if targetExtensions is empty string', () => {
    expect(filterPathsByExtension(['file.tsv'], '')).toEqual([])
  })

  test('should return an empty array if targetExtensions is empty array', () => {
    expect(filterPathsByExtension(['file.tsv'], [])).toEqual([])
  })

  test('should return an empty array if targetExtensions is null', () => {
    expect(filterPathsByExtension(['file.tsv'], null)).toEqual([])
  })

  test('should return an empty array if targetExtensions is undefined', () => {
    expect(filterPathsByExtension(['file.tsv'], undefined)).toEqual([])
  })

  test('should return empty array if paths is not an array', () => {
    expect(filterPathsByExtension(null, '.tsv')).toEqual([])
    expect(filterPathsByExtension(undefined, '.tsv')).toEqual([])
    expect(filterPathsByExtension('a/b/c.tsv', '.tsv')).toEqual([])
  })

  test('should return empty array if targetExtensions contains invalid types', () => {
    expect(filterPathsByExtension(['file.tsv'], [null, undefined, ''])).toEqual([])
    expect(filterPathsByExtension(['file.tsv'], [123, '.json'])).toEqual([]) // Assuming 123 is filtered out
  })

  test('should filter by a single extension string (with dot)', () => {
    const paths = ['data.tsv', 'script.js', 'image.TSV', 'archive.tar.gz']
    const expected = ['data.tsv', 'image.TSV']
    expect(filterPathsByExtension(paths, '.tsv')).toEqual(expected)
  })

  test('should filter by a single extension string (without dot)', () => {
    const paths = ['data.tsv', 'script.js', 'image.TSV']
    const expected = ['data.tsv', 'image.TSV']
    expect(filterPathsByExtension(paths, 'tsv')).toEqual(expected)
  })

  test('should filter by an array of extensions', () => {
    const paths = ['data.tsv', 'script.js', 'config.json', 'image.JPEG', 'text.md']
    const expected = ['data.tsv', 'config.json', 'image.JPEG']
    expect(filterPathsByExtension(paths, ['.tsv', 'json', '.jpeg'])).toEqual(expected)
  })

  test('should be case-insensitive by default', () => {
    const paths = ['file.TXT', 'FILE.txt', 'file.Txt', 'other.log']
    const expected = ['file.TXT', 'FILE.txt', 'file.Txt']
    expect(filterPathsByExtension(paths, '.txt')).toEqual(expected)
  })

  test('should be case-sensitive when specified', () => {
    const paths = ['file.TXT', 'FILE.txt', 'file.Txt', 'other.log']
    expect(filterPathsByExtension(paths, '.txt', true)).toEqual(['FILE.txt'])
    expect(filterPathsByExtension(paths, '.TXT', true)).toEqual(['file.TXT'])
    expect(filterPathsByExtension(paths, '.Txt', true)).toEqual(['file.Txt'])
  })

  test('should ignore paths with no extensions', () => {
    const paths = ['README', 'file.txt', 'LICENSE']
    const expected = ['file.txt']
    expect(filterPathsByExtension(paths, '.txt')).toEqual(expected)
  })

  test('should ignore directory paths (ending with /)', () => {
    const paths = ['mydir/', 'data.json/', 'file.json']
    const expected = ['file.json']
    expect(filterPathsByExtension(paths, '.json')).toEqual(expected)
  })

  test('should handle paths with multiple dots correctly (matches final extension)', () => {
    const paths = ['archive.tar.gz', 'backup.min.js', 'document.v1.docx']
    expect(filterPathsByExtension(paths, '.gz')).toEqual(['archive.tar.gz'])
    expect(filterPathsByExtension(paths, '.js')).toEqual(['backup.min.js'])
    expect(filterPathsByExtension(paths, '.docx')).toEqual(['document.v1.docx'])
    expect(filterPathsByExtension(paths, '.tar')).toEqual([]) // Does not match .tar if final is .gz
  })

  test('should not match if path starts with a dot and has no further extension (hidden files)', () => {
    const paths = ['.bashrc', '.gitconfig', 'file.txt', '.profile.bak']
    expect(filterPathsByExtension(paths, '.bashrc')).toEqual([])
    expect(filterPathsByExtension(paths, '.gitconfig')).toEqual([])
    expect(filterPathsByExtension(paths, '.txt')).toEqual(['file.txt'])
    expect(filterPathsByExtension(paths, '.bak')).toEqual(['.profile.bak'])
  })

  test('should not match if path ends with a dot', () => {
    const paths = ['file.', 'anotherfile.txt']
    expect(filterPathsByExtension(paths, '.')).toEqual([]) // Target extension '.' is tricky, current logic won't match
    expect(filterPathsByExtension(paths, 'txt')).toEqual(['anotherfile.txt'])
  })

  test('should handle mixed valid and invalid target extensions in an array', () => {
    const paths = ['a.txt', 'b.log', 'c.dat']
    expect(filterPathsByExtension(paths, ['.txt', null, 'log', '', undefined, 123])).toEqual(['a.txt', 'b.log'])
  })
})

describe('getBidsFiles', () => {
  const datasetRoot = 'myBidsDataset'
  const defaultSubdirectories = ['phenotype', 'stimuli']
  test('should return an empty object for empty paths array', () => {
    expect(getBidsFiles([], datasetRoot, defaultSubdirectories)).toEqual({})
  })

  test('should return an empty object for invalid datasetRoot', () => {
    expect(getBidsFiles(['myBidsDataset/file.tsv'], '', defaultSubdirectories)).toEqual({})
    expect(getBidsFiles(['myBidsDataset/file.tsv'], null, defaultSubdirectories)).toEqual({})
    expect(getBidsFiles(['myBidsDataset/file.tsv'], 'root/', defaultSubdirectories)).toEqual({})
  })

  test('should return an empty object if subdirectories array is effectively empty and paths are empty', () => {
    // If paths is empty, all categories will be empty and removed.
    expect(getBidsFiles([], datasetRoot, [])).toEqual({})
    expect(getBidsFiles([], datasetRoot, null)).toEqual({})
    expect(getBidsFiles([], datasetRoot, [' ', undefined, null])).toEqual({})
  })

  test('should categorize files into specified subdirectories and other', () => {
    const paths = [
      `${datasetRoot}/phenotype/desc.tsv`,
      `${datasetRoot}/phenotype/participants.json`,
      `${datasetRoot}/stimuli/images.tsv`,
      `${datasetRoot}/stimuli/trials.json`,
      `${datasetRoot}/dataset_description.json`, // other (top-level)
      `${datasetRoot}/sub-01/anat/T1w.json`, // other (sub-X)
      `${datasetRoot}/sub-02/func/bold.tsv`, // other (sub-X)
      `${datasetRoot}/README.md`, // ignored (not tsv/json)
      `${datasetRoot}/derivatives/fmriprep.json`, // ignored (not in specified subdir or other criteria)
    ]
    const expected = {
      phenotype: { tsv: [`${datasetRoot}/phenotype/desc.tsv`], json: [`${datasetRoot}/phenotype/participants.json`] },
      stimuli: { tsv: [`${datasetRoot}/stimuli/images.tsv`], json: [`${datasetRoot}/stimuli/trials.json`] },
      other: {
        tsv: [`${datasetRoot}/sub-02/func/bold.tsv`],
        json: [`${datasetRoot}/dataset_description.json`, `${datasetRoot}/sub-01/anat/T1w.json`],
      },
    }
    expect(getBidsFiles(paths, datasetRoot, defaultSubdirectories)).toEqual(expected)
  })

  test('should handle subdirectories with leading/trailing spaces and not create empty categories', () => {
    const paths = [
      `${datasetRoot}/ actual_phenotype /data.tsv`, // This path has spaces in its segment
      `${datasetRoot}/stimuli/trials.json`,
    ]
    // ' phenotype ' (with spaces) will be trimmed to 'phenotype' for matching.
    // It will not match the path segment ' actual_phenotype '.
    // 'valid_stimuli' is specified but will have no files.
    const subdirsToTest = [' phenotype ', 'stimuli', 'valid_stimuli']
    const expected = {
      // The category 'phenotype' (from ' phenotype ') should not appear because no files match `${datasetRoot}/phenotype/...`.
      // The category 'valid_stimuli' should not appear because no files match `${datasetRoot}/valid_stimuli/...`.
      stimuli: { tsv: [], json: [`${datasetRoot}/stimuli/trials.json`] },
      // The path `${datasetRoot}/ actual_phenotype /data.tsv` is not top-level, not sub-X,
      // and does not match any trimmed specified subdirectory, so it's not included in 'other' or any category.
      // Therefore, 'other' will be empty and removed.
    }
    const result = getBidsFiles(paths, datasetRoot, subdirsToTest)
    expect(result).toEqual(expected)
    expect(result[' phenotype ']).toBeUndefined() // Key with spaces should not exist.
    expect(result.phenotype).toBeUndefined() // Trimmed key 'phenotype' should be absent as its category would be empty.
    expect(result.valid_stimuli).toBeUndefined() // 'valid_stimuli' category should be absent as it's empty.
    expect(result.other).toBeUndefined() // 'other' category should be absent as it's empty.
  })

  test('should only include .tsv and .json files', () => {
    const paths = [
      `${datasetRoot}/phenotype/data.tsv`,
      `${datasetRoot}/phenotype/script.js`,
      `${datasetRoot}/other_file.txt`,
      `${datasetRoot}/sub-01/config.json`,
    ]
    const expected = {
      phenotype: { tsv: [`${datasetRoot}/phenotype/data.tsv`], json: [] },
      other: { tsv: [], json: [`${datasetRoot}/sub-01/config.json`] },
    }
    expect(getBidsFiles(paths, datasetRoot, ['phenotype'])).toEqual(expected)
  })

  test('should ignore directory paths (ending with /)', () => {
    const paths = [
      `${datasetRoot}/phenotype/data.tsv`,
      `${datasetRoot}/phenotype/subdir/`,
      `${datasetRoot}/sub-01/anat/`,
      `${datasetRoot}/participants.json`,
    ]
    const expected = {
      phenotype: { tsv: [`${datasetRoot}/phenotype/data.tsv`], json: [] },
      other: { tsv: [], json: [`${datasetRoot}/participants.json`] },
    }
    expect(getBidsFiles(paths, datasetRoot, ['phenotype'])).toEqual(expected)
  })

  test('should ignore files not starting with datasetRoot, removing empty categories', () => {
    const paths = [`otherRoot/phenotype/data.tsv`, `${datasetRoot}/participants.json`]
    const expected = {
      // phenotype category will be empty and thus removed.
      other: { tsv: [], json: [`${datasetRoot}/participants.json`] },
    }
    expect(getBidsFiles(paths, datasetRoot, ['phenotype'])).toEqual(expected)
  })

  test('should ignore files with no extension or hidden files without valid BIDS extension, removing empty categories', () => {
    const paths = [
      `${datasetRoot}/README`,
      `${datasetRoot}/.config`,
      `${datasetRoot}/phenotype/data.tsv`,
      `${datasetRoot}/phenotype/.hidden.json`,
    ]
    const expected = {
      phenotype: { tsv: [`${datasetRoot}/phenotype/data.tsv`], json: [`${datasetRoot}/phenotype/.hidden.json`] }, // .hidden.json is valid json
      // other category will be empty and thus removed.
    }
    expect(getBidsFiles(paths, datasetRoot, ['phenotype'])).toEqual(expected)
  })

  describe('suffix filtering', () => {
    const pathsWithSuffixes = [
      `${datasetRoot}/phenotype/desc_events.tsv`,
      `${datasetRoot}/phenotype/participants.json`,
      `${datasetRoot}/stimuli/images_trial.tsv`,
      `${datasetRoot}/stimuli/trials_events.json`,
      `${datasetRoot}/dataset_description.json`,
      `${datasetRoot}/sub-01/anat/T1w_bold.json`,
      `${datasetRoot}/sub-02/func/task_events.tsv`,
      `${datasetRoot}/sub-03/data_no_suffix.tsv`,
    ]

    // Test cases for suffix filtering are removed as the functionality is removed from getBidsFiles.
    // These can be adapted for a separate suffix filtering function or if suffix logic is reintroduced.

    // test('should apply single suffix filter', () => {
    //   const suffixes = ['_events'];
    //   const expected = {
    //     phenotype: { tsv: [`${datasetRoot}/phenotype/desc_events.tsv`], json: [] },
    //     stimuli: { tsv: [], json: [`${datasetRoot}/stimuli/trials_events.json`] },
    //     other: { tsv: [`${datasetRoot}/sub-02/func/task_events.tsv`], json: [] },
    //   };
    //   expect(getBidsFiles(pathsWithSuffixes, datasetRoot, defaultSubdirectories, suffixes)).toEqual(expected);
    // });

    // test('should apply multiple suffix filters', () => {
    //   const suffixes = ['_events', '_bold'];
    //   const expected = {
    //     phenotype: { tsv: [`${datasetRoot}/phenotype/desc_events.tsv`], json: [] },
    //     stimuli: { tsv: [], json: [`${datasetRoot}/stimuli/trials_events.json`] },
    //     other: { tsv: [`${datasetRoot}/sub-02/func/task_events.tsv`], json: [`${datasetRoot}/sub-01/anat/T1w_bold.json`] },
    //   };
    //   expect(getBidsFiles(pathsWithSuffixes, datasetRoot, defaultSubdirectories, suffixes)).toEqual(expected);
    // });

    test('should not filter by suffix if suffixes parameter is not provided (ensure original behavior without suffixes)', () => {
      const expectedNoSuffixFilter = {
        phenotype: {
          tsv: [`${datasetRoot}/phenotype/desc_events.tsv`],
          json: [`${datasetRoot}/phenotype/participants.json`],
        },
        stimuli: {
          tsv: [`${datasetRoot}/stimuli/images_trial.tsv`],
          json: [`${datasetRoot}/stimuli/trials_events.json`],
        },
        other: {
          tsv: [`${datasetRoot}/sub-02/func/task_events.tsv`, `${datasetRoot}/sub-03/data_no_suffix.tsv`],
          json: [`${datasetRoot}/dataset_description.json`, `${datasetRoot}/sub-01/anat/T1w_bold.json`],
        },
      }
      expect(getBidsFiles(pathsWithSuffixes, datasetRoot, defaultSubdirectories)).toEqual(expectedNoSuffixFilter)
    })

    // test('should handle suffixes with leading/trailing spaces (they are trimmed)', () => {
    //   const suffixes = [' _events ', ' _bold '];
    //   const expected = {
    //     phenotype: { tsv: [`${datasetRoot}/phenotype/desc_events.tsv`], json: [] },
    //     stimuli: { tsv: [], json: [`${datasetRoot}/stimuli/trials_events.json`] },
    //     other: { tsv: [`${datasetRoot}/sub-02/func/task_events.tsv`], json: [`${datasetRoot}/sub-01/anat/T1w_bold.json`] },
    //   };
    //   expect(getBidsFiles(pathsWithSuffixes, datasetRoot, defaultSubdirectories, suffixes)).toEqual(expected);
    // });

    // test('should correctly filter files with multiple dots in name before extension', () => {
    //     const paths = [
    //         `${datasetRoot}/file.first_events.tsv`,
    //         `${datasetRoot}/file.second.no_suffix.json`,
    //         `${datasetRoot}/sub-01/complex.name_events.json`
    //     ];
    //     const suffixes = ['_events'];
    //     const expected = {
    //         other: { tsv: [`${datasetRoot}/file.first_events.tsv`], json: [`${datasetRoot}/sub-01/complex.name_events.json`] }
    //     };
    //     expect(getBidsFiles(paths, datasetRoot, [], suffixes)).toEqual(expected);
    // });

    // test('should not match suffix if filename part is empty (e.g. .config_events.json)', () => {
    //     const paths = [
    //         `${datasetRoot}/.config_events.json`,
    //         `${datasetRoot}/_events.tsv`
    //     ];
    //     const suffixes = ['_events'];
    //     const expected = {
    //         other: { tsv: [], json: [] }
    //     };
    //     expect(getBidsFiles(paths, datasetRoot, [], suffixes)).toEqual(expected);
    // });
  })

  test('complex scenario with mixed conditions (no suffix filtering)', () => {
    const paths = [
      `${datasetRoot}/phenotype/participants_info.tsv`,
      `${datasetRoot}/phenotype/demographics_detail.json`,
      `${datasetRoot}/phenotype/ignored.txt`,
      `${datasetRoot}/stimuli/visual_cue.tsv`,
      `${datasetRoot}/stimuli/audio_trigger.json`,
      `${datasetRoot}/stimuli/data_events.json`,
      `${datasetRoot}/sub-01/anat/T1w_mprage.json`,
      `${datasetRoot}/sub-01/func/task-rest_bold.tsv`,
      `${datasetRoot}/sub-02/dwi/data_dwi.json`, // This will go to 'other'
      `${datasetRoot}/sub-02/fmap/phasediff_fmap.tsv`,
      `${datasetRoot}/participants.tsv`, // other, top-level
      `${datasetRoot}/dataset_description.json`, // other, top-level
      `${datasetRoot}/README_scan_key.json`, // other, top-level, suffix _key
      `${datasetRoot}/code/process.json`, // not in specified, not top-level, not sub-X
      `someother_root/data.tsv`, // ignored, wrong root
      `${datasetRoot}/.hidden_events.tsv`, // other, top-level, suffix _events
    ]
    const subdirs = ['phenotype', 'stimuli', ' dwi '] // 'dwi' category will be initialized then removed if empty
    const expected = {
      phenotype: {
        tsv: [`${datasetRoot}/phenotype/participants_info.tsv`],
        json: [`${datasetRoot}/phenotype/demographics_detail.json`],
      },
      stimuli: {
        tsv: [`${datasetRoot}/stimuli/visual_cue.tsv`],
        json: [`${datasetRoot}/stimuli/audio_trigger.json`, `${datasetRoot}/stimuli/data_events.json`],
      },
      // 'dwi' key is removed as the category will be empty and cleaned up
      other: {
        tsv: [
          `${datasetRoot}/sub-01/func/task-rest_bold.tsv`,
          `${datasetRoot}/sub-02/fmap/phasediff_fmap.tsv`,
          `${datasetRoot}/participants.tsv`,
          `${datasetRoot}/.hidden_events.tsv`,
        ],
        json: [
          `${datasetRoot}/sub-01/anat/T1w_mprage.json`,
          `${datasetRoot}/sub-02/dwi/data_dwi.json`, // Moved to other.json
          `${datasetRoot}/dataset_description.json`,
          `${datasetRoot}/README_scan_key.json`,
        ],
      },
    }
    const result = getBidsFiles(paths, datasetRoot, subdirs)
    expect(result.phenotype).toEqual(expected.phenotype)
    expect(result.stimuli).toEqual(expected.stimuli)
    expect(result.dwi).toBeUndefined() // Assert that 'dwi' category is not present after cleanup
    expect(result.other).toEqual(expected.other)
    // 'dwi' should not be in the keys of the result because it was empty
    expect(Object.keys(result).sort()).toEqual(['other', 'phenotype', 'stimuli'].sort())
  })
})

describe('organizeBySuffix', () => {
  const baseFileDict = {
    tsv: [
      'data_events.tsv',
      'data_bold.tsv',
      'log_events.tsv',
      'log_physio.tsv',
      'participants.tsv', // No common suffix
      'dataset_description_events.tsv', // Suffix at start of name part
    ],
    json: [
      'config_events.json',
      'config_bold.json',
      'params_physio.json',
      'settings.json', // No common suffix
      'config_system_events.json', // Suffix in middle
    ],
  }

  test('should return an empty object if suffixes array is empty', () => {
    expect(organizeBySuffix(baseFileDict, [])).toEqual({})
  })

  test('should return an object with suffix keys and empty tsv/json arrays if filedict is null or not an object', () => {
    const suffixes = ['_events', '_bold']
    const expected = {
      _events: { tsv: [], json: [] },
      _bold: { tsv: [], json: [] },
    }
    expect(organizeBySuffix(null, suffixes)).toEqual(expected)
    expect(organizeBySuffix(undefined, suffixes)).toEqual(expected)
    expect(organizeBySuffix('not_an_object', suffixes)).toEqual(expected)
  })

  test('should correctly organize files by given suffixes', () => {
    const suffixes = ['_events', '_bold', '_physio', '_nonexistent']
    const expected = {
      _events: {
        tsv: ['data_events.tsv', 'log_events.tsv', 'dataset_description_events.tsv'],
        json: ['config_events.json', 'config_system_events.json'],
      },
      _bold: {
        tsv: ['data_bold.tsv'],
        json: ['config_bold.json'],
      },
      _physio: {
        tsv: ['log_physio.tsv'],
        json: ['params_physio.json'],
      },
      // '_nonexistent': { tsv: [], json: [] }, // This key will now be removed
    }
    expect(organizeBySuffix(baseFileDict, suffixes)).toEqual(expected)
  })

  test('should handle filedict with only tsv or only json files', () => {
    const suffixes = ['_events']
    const fileDictTsvOnly = { tsv: ['run1_events.tsv', 'run2_data.tsv'], json: [] }
    const expectedTsvOnly = { _events: { tsv: ['run1_events.tsv'], json: [] } }
    expect(organizeBySuffix(fileDictTsvOnly, suffixes)).toEqual(expectedTsvOnly)

    const fileDictJsonOnly = { tsv: [], json: ['setup_events.json', 'setup_params.json'] }
    const expectedJsonOnly = { _events: { tsv: [], json: ['setup_events.json'] } }
    expect(organizeBySuffix(fileDictJsonOnly, suffixes)).toEqual(expectedJsonOnly)
  })

  test('should handle filedict with empty tsv and json arrays', () => {
    const suffixes = ['_events']
    const emptyFileDict = { tsv: [], json: [] }
    const expectedEmpty = {
      // '_events': { tsv: [], json: [] } // This key will now be removed
    }
    expect(organizeBySuffix(emptyFileDict, suffixes)).toEqual(expectedEmpty)
  })

  test('should handle suffixes array with invalid entries (null, undefined, empty string)', () => {
    const suffixes = ['_events', null, '_bold', undefined, '   ', '_data']
    const fileDict = {
      tsv: ['file_events.tsv', 'file_bold.tsv', 'file_data.tsv'],
      json: ['config_events.json', 'config_bold.json', 'config_data.json'],
    }
    const expected = {
      _events: { tsv: ['file_events.tsv'], json: ['config_events.json'] },
      // 'null': { tsv: [], json: [] }, // These keys for invalid suffixes will be removed if empty
      _bold: { tsv: ['file_bold.tsv'], json: ['config_bold.json'] },
      // 'undefined': { tsv: [], json: [] },
      // '   ': { tsv: [], json: [] },
      _data: { tsv: ['file_data.tsv'], json: ['config_data.json'] },
    }
    const result = organizeBySuffix(fileDict, suffixes)
    expect(result['_events']).toEqual(expected['_events'])
    expect(result['null']).toBeUndefined() // Expect key to be absent
    expect(result['_bold']).toEqual(expected['_bold'])
    expect(result['undefined']).toBeUndefined() // Expect key to be absent
    expect(result['   ']).toBeUndefined() // Expect key to be absent
    expect(result['_data']).toEqual(expected['_data'])
    expect(Object.keys(result).length).toBe(3) // Only _events, _bold, _data should remain
  })

  test('should correctly filter files with multiple dots in name part', () => {
    const suffixes = ['_final', '_final.tar']
    const fileDict = {
      tsv: ['archive.report_final.tar.tsv', 'report_beta.tsv'],
      json: ['myfile.version1_final.json', 'archive.report_final.tar.json'],
    }
    const expected = {
      _final: {
        tsv: [], // 'archive.report_final.tar.tsv' name part 'archive.report_final.tar' does not end with just '_final'
        json: ['myfile.version1_final.json'],
      },
      '_final.tar': {
        tsv: ['archive.report_final.tar.tsv'],
        json: ['archive.report_final.tar.json'],
      },
    }
    expect(organizeBySuffix(fileDict, suffixes)).toEqual(expected)
  })

  test('should return all suffix keys even if some have no matching files', () => {
    const suffixes = ['_events', '_nonexistent_suffix']
    const fileDict = { tsv: ['data_events.tsv'], json: [] }
    const expected = {
      _events: { tsv: ['data_events.tsv'], json: [] },
      // '_nonexistent_suffix': { tsv: [], json: [] }, // This key will now be removed
    }
    expect(organizeBySuffix(fileDict, suffixes)).toEqual(expected)
  })
})

describe('organizePaths', () => {
  const suffixes = ['participants', '_events']
  const specialDirs = ['phenotype', 'stimuli']

  test('should return empty candidates and initialized organizedPaths for empty file list', () => {
    const { candidates, organizedPaths } = organizePaths([], suffixes, specialDirs)
    expect(candidates).toEqual([])
    expect(organizedPaths).toBeInstanceOf(Map)
    expect(organizedPaths.size).toBe(suffixes.length + specialDirs.length)
    expect(Array.from(organizedPaths.keys())).toEqual(['participants', '_events', 'phenotype', 'stimuli'])
  })

  test('should correctly categorize top-level, subject, and special directory files', () => {
    const paths = [
      'participants.tsv',
      'sub-01/sub-01_events.tsv',
      'phenotype/measure.tsv',
      'stimuli/images.json',
      'participants.json',
      'sub-02/sub-02_events.json',
    ]
    const { candidates, organizedPaths } = organizePaths(paths, suffixes, specialDirs)
    expect(candidates).toEqual(paths)
    expect(organizedPaths.get('participants').get('json')).toEqual(['participants.json'])
    expect(organizedPaths.get('participants').get('tsv')).toEqual(['participants.tsv'])
    expect(organizedPaths.get('_events').get('json')).toEqual(['sub-02/sub-02_events.json'])
    expect(organizedPaths.get('_events').get('tsv')).toEqual(['sub-01/sub-01_events.tsv'])
    expect(organizedPaths.get('phenotype').get('json')).toEqual([])
    expect(organizedPaths.get('phenotype').get('tsv')).toEqual(['phenotype/measure.tsv'])
    expect(organizedPaths.get('stimuli').get('json')).toEqual(['stimuli/images.json'])
    expect(organizedPaths.get('stimuli').get('tsv')).toEqual([])
  })

  test('should ignore files with non-matching extensions or in non-BIDS directories', () => {
    const paths = [
      'participants.txt', // wrong extension
      'derivatives/something.tsv', // wrong directory
      'README.md', // wrong extension and suffix
    ]
    const { candidates, organizedPaths } = organizePaths(paths, suffixes, specialDirs)
    expect(candidates).toEqual([])
    expect(organizedPaths.get('participants').get('json')).toEqual([])
    expect(organizedPaths.get('participants').get('tsv')).toEqual([])
    expect(organizedPaths.get('_events').get('json')).toEqual([])
    expect(organizedPaths.get('_events').get('tsv')).toEqual([])
  })

  test('should handle a complex mix of valid and invalid paths', () => {
    const paths = [
      'participants.tsv',
      'dataset_description.json', // Not in suffixes, ignored
      'sub-01/sub-01_sessions.tsv', // Not in suffixes, ignored
      'sub-01/sub-01_events.tsv',
      'phenotype/demographics.tsv',
      'stimuli/paradigms.json',
      'derivatives/sub-01/sub-01_events.tsv', // In derivatives, ignored
      'code/process.py', // wrong extension and directory
    ]
    const { candidates, organizedPaths } = organizePaths(paths, suffixes, specialDirs)
    expect(candidates).toEqual([
      'participants.tsv',
      'sub-01/sub-01_events.tsv',
      'phenotype/demographics.tsv',
      'stimuli/paradigms.json',
    ])
    expect(organizedPaths.get('participants').get('tsv')).toEqual(['participants.tsv'])
    expect(organizedPaths.get('_events').get('tsv')).toEqual(['sub-01/sub-01_events.tsv'])
    expect(organizedPaths.get('phenotype').get('tsv')).toEqual(['phenotype/demographics.tsv'])
    expect(organizedPaths.get('stimuli').get('json')).toEqual(['stimuli/paradigms.json'])
  })
})
