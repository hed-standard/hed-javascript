import { replaceTagNameWithPound } from '../utils/hedStrings'
import { unicodeName } from 'unicode-name'
import { generateIssue } from '../common/issues/issues'

const CHARACTERS = {
  BLANK: ' ',
  OPENING_GROUP: '(',
  CLOSING_GROUP: ')',
  OPENING_COLUMN: '{',
  CLOSING_COLUMN: '}',
  COMMA: ',',
  COLON: ':',
  SLASH: '/',
}

function getTrimmedBounds(originalString) {
  const start = originalString.search(/\S/)
  const end = originalString.search(/\S\s*$/)

  if (start === -1) {
    // The string contains only whitespace
    return null
  }

  return [start, end + 1]
}

const invalidCharacters = new Set(['[', ']', '~', '"'])
// Add control codes to invalidCharacters
for (let i = 0x00; i <= 0x1f; i++) {
  invalidCharacters.add(String.fromCodePoint(i))
}
for (let i = 0x7f; i <= 0x9f; i++) {
  invalidCharacters.add(String.fromCodePoint(i))
}

const invalidCharactersOutsideOfValues = new Set([':'])

/**
 * A specification for a tokenized substring.
 */
export class SubstringSpec {
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
export class TagSpec extends SubstringSpec {
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
export class GroupSpec extends SubstringSpec {
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
export class ColumnSpliceSpec extends SubstringSpec {
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

class TokenizerState {
  constructor() {
    this.currentToken = '' // Characters in the token currently being parsed
    this.groupDepth = 0
    this.startingIndex = 0 // Starting index of this token
    this.resetIndexFlag = false
    this.slashFound = false
    this.librarySchema = ''
    this.columnSpliceIndex = -1 //Index of { if this token is column splice
    this.currentGroupStack = [[]]
    this.parenthesesStack = []
    this.ignoringCharacters = false
    this.closingGroup = false
    // this.closingColumn = false
  }
}

/**
 * Class for tokenizing HED strings.
 */
export class HedStringTokenizerNew {
  constructor(hedString) {
    this.hedString = hedString
    this.syntaxIssues = []
    this.state = null
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
      if (this.state.resetIndexFlag) {
        this.state.resetIndexFlag = false
        this.state.startingIndex = i + 1
        this.state.currentToken = ''
      }
    }
    //this.pushTag(this.hedString.length - 1)

    if (this.state.columnSpliceIndex >= 0) {
      this.pushIssue('unclosedCurlyBrace', this.state.columnSpliceIndex)
    }

    this.unwindGroupStack()

    const tagSpecs = this.state.currentGroupStack.pop()
    const groupSpecs = this.state.parenthesesStack.pop()
    const issues = {
      syntax: this.syntaxIssues,
      conversion: [],
    }
    return [tagSpecs, groupSpecs, issues]
  }

  initializeTokenizer() {
    this.syntaxIssues = []
    this.state = new TokenizerState()
    this.state.parenthesesStack = [new GroupSpec(0, this.hedString.length, [])]
  }

  tokenizeCharacter(i, character) {
    if (this.state.ignoringCharacters) {
      this.handleIgnoringCharacters(i, character)
    } else {
      this.handleCharacter(i, character)
    }
  }

  handleIgnoringCharacters(i, character) {
    const characterHandler = {
      [CHARACTERS.CLOSING_GROUP]: () => {
        this.clearToken()
        this.handleClosingGroup(i)
      },
      [CHARACTERS.COMMA]: () => {
        this.clearToken()
        this.handleClosingGroup(i)
      },
    }[character]

    if (characterHandler) {
      characterHandler()
    }
  }

  handleCharacter(i, character) {
    const characterHandler = {
      [CHARACTERS.OPENING_GROUP]: () => this.handleOpeningGroup(i),
      [CHARACTERS.CLOSING_GROUP]: () => {
        this.pushTag(i)
        this.handleClosingGroup(i)
      },
      [CHARACTERS.OPENING_COLUMN]: () => this.handleOpeningColumn(i),
      [CHARACTERS.CLOSING_COLUMN]: () => {
        this.pushTag(i)
        this.handleClosingColumn(i)
      },
      [CHARACTERS.COMMA]: () => {
        this.pushTag(i)
        //this.state.closingColumn = false
      },
      [CHARACTERS.COLON]: () => this.handleColon(character),
      [CHARACTERS.SLASH]: () => this.handleSlash(i),
    }[character] // Selects the character handler based on the value of character

    if (characterHandler) {
      characterHandler()
    } else if (invalidCharacters.has(character)) {
      this.pushInvalidCharacterIssue(character, i)
    } else {
      this.handleRegularCharacter(character)
    }
  }

  handleOpeningGroup(i) {
    this.state.currentGroupStack.push([])
    this.state.parenthesesStack.push(new GroupSpec(i, undefined, []))
    this.state.resetIndexFlag = true
    this.state.groupDepth++
  }

  handleClosingGroup(i) {
    // If the group depth is <= 0, it means there's no corresponding opening group.
    if (this.state.groupDepth <= 0) {
      this.pushIssue('unopenedParenthesis', i)
      return
    }
    // Close the group by updating its bounds and moving it to the parent group.
    this.closeGroup(i)
  }

  handleOpeningColumn(i) {
    // We're already in the middle of a token -- can't have an opening brace
    if (this.state.currentToken.trim().length > 0) {
      this.pushInvalidCharacterIssue(CHARACTERS.OPENING_COLUMN, i)
      this.state.ignoringCharacters = true
      return
    }
    if (this.state.columnSpliceIndex >= 0) {
      this.pushIssue('nestedCurlyBrace', i)
    }
    this.state.columnSpliceIndex = i
  }

  handleClosingColumn(i) {
    // If a column splice is not in progress push an issue indicating an unopened curly brace.
    if (this.state.columnSpliceIndex < 0) {
      this.pushIssue('unopenedCurlyBrace', i)
      return
    }
    // Ensure that column slice is not empty
    if (this.state.currentToken == '') {
      this.pushIssue('emptyCurlyBrace', i)
      return
    }

    // Close the column by updating its bounds and moving it to the parent group, push a column splice on the stack.
    this.state.currentGroupStack[this.state.groupDepth].push(
      new ColumnSpliceSpec(this.state.currentToken.trim(), this.state.startingIndex, i),
    )
    this.state.columnSpliceIndex = -1
    this.clearToken()
    this.state.closingColumn = true // Used to indicate that
  }

  handleColon(character) {
    if (!this.state.slashFound && !this.state.librarySchema) {
      this.state.librarySchema = this.state.currentToken
      this.state.resetIndexFlag = true
    } else {
      this.state.currentToken += character
    }
  }

  handleSlash(i) {
    if (!this.state.currentToken || this.state.slashFound) {
      // Leading slash is error -- ignore rest of the token
      this.pushIssue('extraSlash', i)
      this.state.ignoringCharacters = true
    } else {
      this.state.slashFound = true
      this.state.currentToken += CHARACTERS.SLASH
    }
  }

  handleRegularCharacter(character) {
    // if (character != CHARACTERS.BLANK && this.state.closingColumn) {
    //   this.pushIssue('unparsedCurlyBraces', i)
    // }
    if (!this.state.ignoringCharacters) {
      this.state.currentToken += character
      this.state.resetIndexFlag = this.state.currentToken === ''
    }
  }

  unwindGroupStack() {
    while (this.state.groupDepth > 0) {
      this.pushIssue(
        'unclosedParenthesis',
        this.state.parenthesesStack[this.state.parenthesesStack.length - 1].bounds[0],
      )
      this.closeGroup(this.hedString.length)
    }
  }

  pushTag(i) {
    // Called when a token has been parsed

    // if (!this.state.currentToken && isEndOfString) { // If empty token at end of string just return.
    //   return
    // }
    // If we're in the process of closing a group, reset the closingGroup flag (allows for empty groups)
    if (this.state.closingGroup) {
      // Empty groups are allowed.
      this.state.closingGroup = false
    } else if (this.state.slashFound) {
      //Trailing token slash is an error
      this.pushIssue('extraSlash', i)
    } else if (!this.state.currentToken) {
      // Column spec has already been called.
      this.pushIssue('emptyTagFound', i)
    } else if (this.state.columnSpliceIndex < 0) {
      // Not a column splice so goes on group stack as a TagSpec
      this.checkValueTagForInvalidCharacters()
      let bounds = getTrimmedBounds(this.state.currentToken)
      this.state.currentGroupStack[this.state.groupDepth].push(
        new TagSpec(
          this.state.currentToken.trim(),
          this.state.startingIndex + bounds[0],
          this.state.startingIndex + bounds[1],
          this.state.librarySchema,
        ),
      )
    }
    // Clear the current token and reset flags for the next iteration.
    this.clearToken()
  }

  clearToken() {
    this.state.ignoringCharacters = false
    this.state.resetIndexFlag = true
    this.state.slashFound = false
    this.state.librarySchema = ''
    this.state.closingColumn = false
  }

  closeGroup(i) {
    const groupSpec = this.state.parenthesesStack.pop()
    groupSpec.bounds[1] = i + 1
    this.state.parenthesesStack[this.state.groupDepth - 1].children.push(groupSpec)
    this.state.currentGroupStack[this.state.groupDepth - 1].push(this.state.currentGroupStack.pop())
    this.state.groupDepth--
    //this.closingColumn = false
  }

  checkValueTagForInvalidCharacters() {
    const formToCheck = replaceTagNameWithPound(this.state.currentToken)
    for (let i = 0; i < formToCheck.length; i++) {
      const character = formToCheck.charAt(i)
      if (invalidCharactersOutsideOfValues.has(character)) {
        this.pushInvalidCharacterIssue(character, this.state.startingIndex + i)
      }
    }
  }

  pushIssue(issueCode, index) {
    this.syntaxIssues.push(generateIssue(issueCode, { index, string: this.hedString }))
  }

  pushInvalidCharacterIssue(character, index) {
    this.syntaxIssues.push(
      generateIssue('invalidCharacter', {
        character: unicodeName(character),
        index,
        string: this.hedString,
      }),
    )
  }
}
