import { unicodeName } from 'unicode-name'

import { generateIssue } from '../common/issues/issues'
import { stringIsEmpty } from '../utils/string'
import { replaceTagNameWithPound } from '../utils/hedStrings'

const openingGroupCharacter = '('
const closingGroupCharacter = ')'
const openingColumnCharacter = '{'
const closingColumnCharacter = '}'
const commaCharacter = ','
const colonCharacter = ':'
const slashCharacter = '/'

const invalidCharacters = new Set(['[', ']', '~', '"'])
const invalidCharactersOutsideOfValues = new Set([':'])
// C0 control codes
for (let i = 0x00; i <= 0x1f; i++) {
  invalidCharacters.add(String.fromCodePoint(i))
}
// DEL and C1 control codes
for (let i = 0x7f; i <= 0x9f; i++) {
  invalidCharacters.add(String.fromCodePoint(i))
}

/**
 * A specification for a tokenized substring.
 */
class SubstringSpec {
  /**
   * The starting and ending bounds of the substring.
   * @type {number[]}
   */
  bounds

  constructor(start, end) {
    this.bounds = [start, end]
  }
}

/**
 * A specification for a tokenized tag.
 */
class TagSpec extends SubstringSpec {
  /**
   * The tag this spec represents.
   * @type {string}
   */
  tag
  /**
   * The schema prefix for this tag, if any.
   * @type {string}
   */
  library

  constructor(tag, start, end, librarySchema) {
    super(start, end)

    this.tag = tag.trim()
    this.library = librarySchema
  }
}

/**
 * A specification for a tokenized tag group.
 */
class GroupSpec extends SubstringSpec {
  /**
   * The child group specifications.
   * @type {GroupSpec[]}
   */
  children

  constructor(start, end, children) {
    super(start, end)

    this.children = children
  }
}

/**
 * A specification for a tokenized column splice template.
 */
class ColumnSpliceSpec extends SubstringSpec {
  /**
   * The column name this spec refers to.
   * @type {string}
   */
  columnName

  constructor(name, start, end) {
    super(start, end)

    this.columnName = name.trim()
  }
}

/**
 * Class for tokenizing HED strings.
 */
export class HedStringTokenizerOld {
  /**
   * The HED string being parsed.
   * @type {string}
   */
  hedString

  syntaxIssues

  /**
   * The current substring being parsed.
   * @type {string}
   */
  currentTag

  /**
   * Whether we are currently closing a group.
   * @type {boolean}
   */
  closingGroup

  groupDepth
  startingIndex
  resetStartingIndex
  slashFound
  librarySchema
  currentGroupStack
  parenthesesStack
  ignoringCharacters

  constructor(hedString) {
    this.hedString = hedString
  }

  /**
   * Split the HED string into delimiters and tags.
   *
   * @returns {[TagSpec[], GroupSpec, Object<string, Issue[]>]} The tag specifications, group bounds, and any issues found.
   */
  tokenize() {
    this.initializeTokenizer()

    for (let i = 0; i < this.hedString.length; i++) {
      const character = this.hedString.charAt(i)
      this.tokenizeCharacter(i, character)
      if (this.resetStartingIndex) {
        this.resetStartingIndex = false
        this.startingIndex = i + 1
        this.currentTag = ''
      }
    }
    this.pushTag(this.hedString.length, true)

    if (this.columnSpliceIndex >= 0) {
      this._pushSyntaxIssue('unclosedCurlyBrace', this.columnSpliceIndex)
    }

    this.unwindGroupStack()

    const tagSpecs = this.currentGroupStack.pop()
    const groupSpecs = this.parenthesesStack.pop()
    const issues = {
      syntax: this.syntaxIssues,
      conversion: [],
    }
    return [tagSpecs, groupSpecs, issues]
  }

  initializeTokenizer() {
    this.syntaxIssues = []

    this.currentTag = ''
    this.groupDepth = 0
    this.startingIndex = 0
    this.resetStartingIndex = false
    this.slashFound = false
    this.librarySchema = ''
    this.columnSpliceIndex = -1
    this.currentGroupStack = [[]]
    this.parenthesesStack = [new GroupSpec(0, this.hedString.length, [])]
    this.ignoringCharacters = false
    this.closingGroup = false
  }

  tokenizeCharacter(i, character) {
    let dispatchTable
    if (this.ignoringCharacters) {
      dispatchTable = {
        [closingGroupCharacter]: (i /* character */) => {
          this.clearTag()
          this.closingGroupCharacter(i)
        },
        [commaCharacter]: (/*i, character */) => this.clearTag(),
      }
    } else {
      dispatchTable = {
        [openingGroupCharacter]: (i /* character */) => this.openingGroupCharacter(i),
        [closingGroupCharacter]: (i /* character */) => {
          this.pushTag(i, false)
          this.closingGroupCharacter(i)
        },
        [openingColumnCharacter]: (i /* character */) => this.openingColumnCharacter(i),
        [closingColumnCharacter]: (i /* character */) => this.closingColumnCharacter(i),
        [commaCharacter]: (i /* character */) => this.pushTag(i, false),
        [colonCharacter]: (i, character) => this.colonCharacter(character),
        [slashCharacter]: (i, character) => this.slashCharacter(character),
      }
    }
    const characterHandler = dispatchTable[character]
    if (characterHandler) {
      characterHandler(i, character)
    } else if (invalidCharacters.has(character)) {
      this._pushInvalidCharacterIssue(character, i)
    } else {
      this.otherCharacter(character)
    }
  }

  openingGroupCharacter(i) {
    this.currentGroupStack.push([])
    this.parenthesesStack.push(new GroupSpec(i, undefined, []))
    this.resetStartingIndex = true
    this.groupDepth++
  }

  closingGroupCharacter(i) {
    this.closingGroup = true
    if (this.groupDepth <= 0) {
      this._pushSyntaxIssue('unopenedParenthesis', i)
      return
    }
    this.closeGroup(i)
  }

  openingColumnCharacter(i) {
    if (this.currentTag.length > 0) {
      this._pushInvalidCharacterIssue(openingColumnCharacter, i)
      this.ignoringCharacters = true
      return
    }
    if (this.columnSpliceIndex >= 0) {
      this._pushSyntaxIssue('nestedCurlyBrace', i)
    }
    this.columnSpliceIndex = i
  }

  closingColumnCharacter(i) {
    this.closingGroup = true
    if (this.columnSpliceIndex < 0) {
      this._pushSyntaxIssue('unopenedCurlyBrace', i)
      return
    }
    if (!stringIsEmpty(this.currentTag)) {
      this.currentGroupStack[this.groupDepth].push(new ColumnSpliceSpec(this.currentTag.trim(), this.startingIndex, i))
    } else {
      this.syntaxIssues.push(
        generateIssue('emptyCurlyBrace', {
          string: this.hedString,
        }),
      )
    }
    this.columnSpliceIndex = -1
    this.resetStartingIndex = true
    this.slashFound = false
  }

  colonCharacter(character) {
    if (!this.slashFound && !this.librarySchema) {
      this.librarySchema = this.currentTag
      this.resetStartingIndex = true
    } else {
      this.currentTag += character
    }
  }

  slashCharacter(character) {
    this.slashFound = true
    this.currentTag += character
  }

  otherCharacter(character) {
    if (this.ignoringCharacters) {
      return
    }
    this.currentTag += character
    this.resetStartingIndex = stringIsEmpty(this.currentTag)
  }

  unwindGroupStack() {
    // groupDepth is decremented in closeGroup.
    // eslint-disable-next-line no-unmodified-loop-condition
    while (this.groupDepth > 0) {
      this._pushSyntaxIssue('unclosedParenthesis', this.parenthesesStack[this.parenthesesStack.length - 1].bounds[0])
      this.closeGroup(this.hedString.length)
    }
  }

  /**
   * Push a tag to the current group.
   *
   * @param {number} i The current index.
   * @param {boolean} isEndOfString Whether we are at the end of the string.
   */
  pushTag(i, isEndOfString) {
    if (stringIsEmpty(this.currentTag) && isEndOfString) {
      return
    } else if (this.closingGroup) {
      this.closingGroup = false
    } else if (stringIsEmpty(this.currentTag)) {
      this.syntaxIssues.push(generateIssue('emptyTagFound', { index: i }))
    } else if (this.columnSpliceIndex < 0) {
      this._checkValueTagForInvalidCharacters()
      this.currentGroupStack[this.groupDepth].push(
        new TagSpec(this.currentTag.trim(), this.startingIndex, i, this.librarySchema),
      )
    }
    this.resetStartingIndex = true
    this.slashFound = false
    this.librarySchema = ''
  }

  clearTag() {
    this.ignoringCharacters = false
    this.resetStartingIndex = true
    this.slashFound = false
    this.librarySchema = ''
  }

  closeGroup(i) {
    const groupSpec = this.parenthesesStack.pop()
    groupSpec.bounds[1] = i + 1
    this.parenthesesStack[this.groupDepth - 1].children.push(groupSpec)
    this.currentGroupStack[this.groupDepth - 1].push(this.currentGroupStack.pop())
    this.groupDepth--
  }

  /**
   * Check an individual tag for invalid characters.
   *
   * @private
   */
  _checkValueTagForInvalidCharacters() {
    const formToCheck = replaceTagNameWithPound(this.currentTag)
    for (let i = 0; i < formToCheck.length; i++) {
      const character = formToCheck.charAt(i)
      if (!invalidCharactersOutsideOfValues.has(character)) {
        continue
      }
      this._pushInvalidCharacterIssue(character, this.startingIndex + i)
    }
  }

  /**
   * Push an issue to the syntax issue list.
   *
   * @param {string} issueCode The internal code of the issue to be pushed.
   * @param {number} index The location of the issue.
   * @private
   */
  _pushSyntaxIssue(issueCode, index) {
    this.syntaxIssues.push(
      generateIssue(issueCode, {
        index: index,
        string: this.hedString,
      }),
    )
  }

  /**
   * Push an invalid character issue to the syntax issue list.
   *
   * @param {string} character The illegal character to be reported.
   * @param {number} index The location of the character.
   * @private
   */
  _pushInvalidCharacterIssue(character, index) {
    this.syntaxIssues.push(
      generateIssue('invalidCharacter', {
        character: unicodeName(character),
        index: index,
        string: this.hedString,
      }),
    )
  }
}
