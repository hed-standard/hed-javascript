import { unicodeName } from 'unicode-name'

import { generateIssue } from '../issues/issues'

const CHARACTERS = {
  BLANK: ' ',
  OPENING_GROUP: '(',
  CLOSING_GROUP: ')',
  OPENING_COLUMN: '{',
  CLOSING_COLUMN: '}',
  COMMA: ',',
  COLON: ':',
  SLASH: '/',
  PLACEHOLDER: '#',
}

function getTrimmedBounds(originalString) {
  const start = originalString.search(/\S/)

  if (start === -1) {
    // The string contains only whitespace
    return null
  }
  const end = originalString.search(/\S\s*$/)
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

/**
 * A class representing the current state of the HED string tokenizer.
 *
 * @internal
 */
export class TokenizerState {
  constructor() {
    this.currentToken = '' // Characters in the token currently being parsed
    this.groupDepth = 0
    this.startingIndex = 0 // Starting index of this token
    this.lastDelimiter = [undefined, -1] // Type and position of the last delimiter
    this.librarySchema = ''
    this.lastSlash = -1 // Position of the last slash in current token
    this.currentGroupStack = [[]]
    this.parenthesesStack = []
  }
}

/**
 * Class for tokenizing HED strings.
 */
export class HedStringTokenizer {
  /**
   * The HED string being tokenized.
   * @type {string}
   */
  hedString
  /**
   * The issues found during tokenization.
   * @type {Issue[]}
   */
  issues
  /**
   * The current state of the tokenizer.
   * @type {TokenizerState}
   * @internal
   */
  state

  /**
   * Constructor.
   * @param {string} hedString The HED string to tokenize.
   */
  constructor(hedString) {
    this.hedString = hedString
    this.issues = []
    this.state = null
  }

  /**
   * Split the HED string into delimiters and tags.
   *
   * @returns {Array} - [TagSpec[], GroupSpec, Issue[]] representing the tag specifications, group bounds, and any issues found.
   */
  tokenize() {
    this.initializeTokenizer()
    // Empty strings cannot be tokenized
    if (this.hedString.trim().length === 0) {
      this.pushIssue('emptyTagFound', 0, 'Empty commas at the beginning Ex: ",x"')
      return [[], null, this.issues]
    }
    for (let i = 0; i < this.hedString.length; i++) {
      const character = this.hedString.charAt(i)
      this.handleCharacter(i, character)
      if (this.issues.length > 0) {
        return [[], null, this.issues]
      }
    }
    this.finalizeTokenizer()
    if (this.issues.length > 0) {
      return [[], null, this.issues]
    } else {
      return [this.state.currentGroupStack.pop(), this.state.parenthesesStack.pop(), []]
    }
  }

  /**
   * Reset the current token.
   * @param {number} i The current index in the HED string.
   * @internal
   */
  resetToken(i) {
    this.state.startingIndex = i + 1
    this.state.currentToken = ''
    this.state.librarySchema = ''
    this.state.lastSlash = '-1'
  }

  /**
   * Finalize the tokenization process.
   * @internal
   */
  finalizeTokenizer() {
    if (this.state.lastDelimiter[0] === CHARACTERS.OPENING_COLUMN) {
      // Extra opening brace
      this.pushIssue(
        'unclosedCurlyBrace',
        this.state.lastDelimiter[1],
        'The string ends before the previous "{" has been closed.',
      ) // Extra opening brace
    } else if (this.state.lastDelimiter[0] === CHARACTERS.OPENING_GROUP) {
      // Extra opening parenthesis
      this.pushIssue(
        'unclosedParentheses',
        this.state.lastDelimiter[1],
        'The string ends before the previous "(" has been closed.',
      ) // Extra opening parenthesis
    } else if (
      this.state.lastDelimiter[0] === CHARACTERS.COMMA &&
      this.hedString.slice(this.state.lastDelimiter[1] + 1).trim().length === 0
    ) {
      this.pushIssue('emptyTagFound', this.state.lastDelimiter[1], 'Probably extra commas at end.') // Extra comma
    } else if (this.state.lastSlash >= 0 && this.hedString.slice(this.state.lastSlash + 1).trim().length === 0) {
      this.pushIssue(
        'extraSlash',
        this.state.lastSlash,
        'Usually the result of multiple consecutive slashes or a slash at the end.',
      ) // Extra slash
    }
    if (
      this.state.currentToken.trim().length > 0 &&
      ![undefined, CHARACTERS.COMMA].includes(this.state.lastDelimiter[0])
    ) {
      // Missing comma
      this.pushIssue(
        'commaMissing',
        this.state.lastDelimiter[1] + 1,
        `This likely occurred near the end of "${this.hedString}"`,
      )
    } else {
      if (this.state.currentToken.trim().length > 0) {
        this.pushTag(this.hedString.length)
      }
      this.unwindGroupStack()
    }
  }

  /**
   * Initialize the tokenizer.
   * @internal
   */
  initializeTokenizer() {
    this.issues = []
    this.state = new TokenizerState()
    this.state.parenthesesStack = [new GroupSpec(0, this.hedString.length, [])]
  }

  /**
   * Handle a single character during tokenization.
   * @param {number} i The index of the character.
   * @param {string} character The character to handle.
   * @internal
   */
  handleCharacter(i, character) {
    const characterHandler = {
      [CHARACTERS.OPENING_GROUP]: () => this.handleOpeningGroup(i),
      [CHARACTERS.CLOSING_GROUP]: () => this.handleClosingGroup(i),
      [CHARACTERS.OPENING_COLUMN]: () => this.handleOpeningColumn(i),
      [CHARACTERS.CLOSING_COLUMN]: () => this.handleClosingColumn(i),
      [CHARACTERS.COMMA]: () => this.handleComma(i),
      [CHARACTERS.COLON]: () => this.handleColon(i),
      [CHARACTERS.SLASH]: () => this.handleSlash(i),
    }[character] // Selects the character handler based on the value of character

    if (characterHandler) {
      characterHandler()
    } else if (invalidCharacters.has(character)) {
      this.pushInvalidCharacterIssue(character, i)
    } else {
      this.state.currentToken += character
    }
  }

  /**
   * Handle a comma character.
   * @param {number} i The index of the comma.
   * @internal
   */
  handleComma(i) {
    const trimmed = this.hedString.slice(this.state.lastDelimiter[1] + 1, i).trim()
    if (
      [CHARACTERS.OPENING_GROUP, CHARACTERS.COMMA, undefined].includes(this.state.lastDelimiter[0]) &&
      trimmed.length === 0
    ) {
      this.pushIssue(
        'emptyTagFound',
        i,
        'Usually a comma after another comma or an open parenthesis or at beginning of string.',
      )
    } else if (this.state.lastDelimiter[0] === CHARACTERS.OPENING_COLUMN) {
      this.pushIssue(
        'unclosedCurlyBrace',
        this.state.lastDelimiter[1],
        'A "{" appears before the previous "{" was closed.',
      ) // Unclosed curly brace Ex: "{ x,"
    }
    if (
      [CHARACTERS.CLOSING_GROUP, CHARACTERS.CLOSING_COLUMN].includes(this.state.lastDelimiter[0]) &&
      trimmed.length > 0
    ) {
      // A tag followed a group or column with no comma Ex:  (x) yz
      this.pushInvalidTag('invalidTag', i, trimmed, 'Tag found after group or column without a comma.')
    } else if (trimmed.length > 0) {
      this.pushTag(i) // Tag has just finished
    } else {
      this.resetToken(i) // After a group or column
    }
    this.state.lastDelimiter = [CHARACTERS.COMMA, i]
  }

  /**
   * Handle a slash character.
   * @param {number} i The index of the slash.
   * @internal
   */
  handleSlash(i) {
    if (this.state.currentToken.trim().length === 0) {
      // Slash at beginning of tag.
      this.pushIssue('extraSlash', i, '"/" at the beginning of tag.') // Slash at beginning of tag.
    } else if (this.state.lastSlash >= 0 && this.hedString.slice(this.state.lastSlash + 1, i).trim().length === 0) {
      this.pushIssue('extraSlash', i, 'Slashes with only blanks between') // Slashes with only blanks between
    } else if (i > 0 && this.hedString.charAt(i - 1) === CHARACTERS.BLANK) {
      this.pushIssue('extraBlank', i - 1, 'Blank before an internal slash -- often a slash in a value') // Blank before slash such as slash in value
    } else if (i < this.hedString.length - 1 && this.hedString.charAt(i + 1) === CHARACTERS.BLANK) {
      this.pushIssue('extraBlank', i + 1, 'Blank after a slash.') //Blank after a slash
    } else if (this.hedString.slice(i).trim().length === 0) {
      this.pushIssue('extraSlash', this.state.startingIndex, 'Extra slash at the end') // Extra slash at the end
    } else {
      this.state.currentToken += CHARACTERS.SLASH
      this.state.lastSlash = i
    }
  }

  /**
   * Handle an opening group character.
   * @param {number} i The index of the opening group character.
   * @internal
   */
  handleOpeningGroup(i) {
    if (this.state.lastDelimiter[0] === CHARACTERS.OPENING_COLUMN) {
      this.pushIssue(
        'unclosedCurlyBrace',
        this.state.lastDelimiter[1],
        'Previous "{" is not closed and braces or parentheses cannot appear inside braces.',
      ) // After open curly brace Ex: "{  ("
    } else if (this.state.lastDelimiter[0] === CHARACTERS.CLOSING_COLUMN) {
      this.pushIssue('commaMissing', this.state.lastDelimiter[1], 'Missing comma after "}".') // After close curly brace Ex: "} ("
    } else if (this.state.lastDelimiter[0] === CHARACTERS.CLOSING_GROUP) {
      this.pushIssue('commaMissing', this.state.lastDelimiter[1] + 1, 'Missing comma after ")".') // After close group Ex: ") ("
    } else if (this.state.currentToken.trim().length > 0) {
      this.pushInvalidTag('commaMissing', i, this.state.currentToken.trim(), 'Missing comma before "(".') // After tag Ex: "x ("
    } else {
      this.state.currentGroupStack.push([])
      this.state.parenthesesStack.push(new GroupSpec(i, undefined, []))
      this.resetToken(i)
      this.state.groupDepth++
      this.state.lastDelimiter = [CHARACTERS.OPENING_GROUP, i]
    }
  }

  /**
   * Handle a closing group character.
   * @param {number} i The index of the closing group character.
   * @internal
   */
  handleClosingGroup(i) {
    if (this.state.groupDepth <= 0) {
      this.pushIssue('unopenedParenthesis', i, 'A ")" appears before a matching "("') // No corresponding opening group
    } else if (this.state.lastDelimiter[0] === CHARACTERS.OPENING_COLUMN) {
      this.pushIssue(
        'unclosedCurlyBrace',
        this.state.lastDelimiter[1],
        'A "{" appears before the previous "{" has been closed.',
      ) // After open curly brace Ex: "{ )"
    } else {
      if ([CHARACTERS.OPENING_GROUP, CHARACTERS.COMMA].includes(this.state.lastDelimiter[0])) {
        // Should be a tag here
        this.pushTag(i)
      }
      this.closeGroup(i) // Close the group by updating its bounds and moving it to the parent group.
      this.state.lastDelimiter = [CHARACTERS.CLOSING_GROUP, i]
    }
  }

  /**
   * Handle an opening column character.
   * @param {number} i The index of the opening column character.
   * @internal
   */
  handleOpeningColumn(i) {
    if (this.state.currentToken.trim().length > 0) {
      this.pushInvalidCharacterIssue(CHARACTERS.OPENING_COLUMN, i, 'Brace in the middle of a tag Ex: "x {"')
    } else if (this.state.lastDelimiter[0] === CHARACTERS.OPENING_COLUMN) {
      this.pushIssue('nestedCurlyBrace', i, 'Often after another open brace Ex:  Ex: "{x{"')
    } else {
      this.state.lastDelimiter = [CHARACTERS.OPENING_COLUMN, i]
    }
  }

  /**
   * Handle a closing column character.
   * @param {number} i The index of the closing column character.
   * @internal
   */
  handleClosingColumn(i) {
    if (this.state.lastDelimiter[0] !== CHARACTERS.OPENING_COLUMN) {
      this.pushIssue('unopenedCurlyBrace', i, 'No matching open brace Ex: " x}"')
    } else if (!this.state.currentToken.trim()) {
      this.pushIssue('emptyCurlyBrace', i, 'Column slice cannot be empty Ex: "{  }"')
    } else {
      // Close column by updating bounds and moving it to the parent group, push a column splice on the stack.
      this.state.currentGroupStack[this.state.groupDepth].push(
        new ColumnSpliceSpec(this.state.currentToken.trim(), this.state.lastDelimiter[1], i),
      )
      this.resetToken(i)
      this.state.lastDelimiter = [CHARACTERS.CLOSING_COLUMN, i]
    }
  }

  /**
   * Handle a colon character.
   * @param {number} i The index of the colon.
   * @internal
   */
  handleColon(i) {
    const trimmed = this.state.currentToken.trim()
    if (this.state.librarySchema || trimmed.includes(CHARACTERS.BLANK) || trimmed.includes(CHARACTERS.SLASH)) {
      this.state.currentToken += CHARACTERS.COLON // If colon has been seen or is part of a value.
    } else if (/[^A-Za-z]/.test(trimmed)) {
      this.pushIssue('invalidTagPrefix', i, `The prefix ${trimmed} is not alphabetic`) // Prefix not alphabetic Ex:  "1a:xxx"
    } else {
      const lib = this.state.currentToken.trimStart()
      this.resetToken(i)
      this.state.librarySchema = lib
    }
  }

  /**
   * Unwind the group stack to handle unclosed groups.
   * @internal
   */
  unwindGroupStack() {
    while (this.state.groupDepth > 0) {
      this.pushIssue(
        'unclosedParenthesis',
        this.state.parenthesesStack[this.state.parenthesesStack.length - 1].bounds[0],
        'Unclosed group due to unmatched "(".',
      )
      this.closeGroup(this.hedString.length)
    }
  }

  /**
   * Push a tag to the current group stack.
   * @param {number} i The current index in the HED string.
   * @internal
   */
  pushTag(i) {
    if (this.state.currentToken.trim().length === 0) {
      this.pushIssue('emptyTagFound', i, 'Empty tag found likely between commas, before ")" or after "("')
      return
    }
    const msg = this._checkForBadPlaceholderIssues()
    if (msg.length > 0) {
      this.pushInvalidTag('invalidPlaceholder', i, this.state.currentToken, msg)
      return
    }
    const bounds = getTrimmedBounds(this.state.currentToken)
    this.state.currentGroupStack[this.state.groupDepth].push(
      new TagSpec(
        this.state.currentToken.trim(),
        this.state.startingIndex + bounds[0],
        this.state.startingIndex + bounds[1],
        this.state.librarySchema,
      ),
    )
    this.resetToken(i)
  }

  /**
   * Check for issues related to placeholders in the current token.
   * @returns {string} empty string if no issues, otherwise a message describing the issue.
   * @internal
   */
  _checkForBadPlaceholderIssues() {
    const tokenSplit = this.state.currentToken.split(CHARACTERS.PLACEHOLDER)
    let msg = ''
    if (tokenSplit.length === 1) {
      msg = ''
    } else if (tokenSplit.length > 2) {
      msg = `${tokenSplit.length - 1} placeholders found, but only one is allowed.`
    } else if (!tokenSplit[0].endsWith(CHARACTERS.SLASH)) {
      msg = 'A placeholder must be preceded by a slash in the tag.'
    } else if (tokenSplit[1].trim().length > 0 && tokenSplit[1][0] !== CHARACTERS.BLANK) {
      msg = 'Units following a placeholder must be preceded by a blank space.'
    }
    return msg
  }

  /**
   * Close the current group.
   * @param {number} i The current index in the HED string.
   * @internal
   */
  closeGroup(i) {
    const groupSpec = this.state.parenthesesStack.pop()
    groupSpec.bounds[1] = i + 1
    if (this.hedString.slice(groupSpec.bounds[0] + 1, i).trim().length === 0) {
      this.pushIssue('emptyTagFound', i, 'Empty group, e.g. "(  )"') //The group is empty
    }
    this.state.parenthesesStack[this.state.groupDepth - 1].children.push(groupSpec)
    this.state.currentGroupStack[this.state.groupDepth - 1].push(this.state.currentGroupStack.pop())
    this.state.groupDepth--
  }

  /**
   * Push an issue to the issue list.
   * @param {string} issueCode The issue code.
   * @param {number} index The index of the issue.
   * @param {string} msg An optional message to include with the error
   * @internal
   */
  pushIssue(issueCode, index, msg = '') {
    this.issues.push(generateIssue(issueCode, { index: index, string: this.hedString, msg: msg }))
  }

  /**
   * Push an invalid tag issue to the issue list.
   * @param {string} issueCode The issue code.
   * @param {number} index The index of the issue.
   * @param {string} tag The invalid tag.
   * @param {string} msg An optional message to include with the error.
   * @internal
   */
  pushInvalidTag(issueCode, index, tag, msg = '') {
    this.issues.push(generateIssue(issueCode, { index, tag: tag, string: this.hedString, msg: msg }))
  }

  /**
   * Push an invalid character issue to the issue list.
   * @param {string} character The invalid character.
   * @param {number} index The index of the character.
   * @param {string} msg An optional message to include with the error.
   * @internal
   */
  pushInvalidCharacterIssue(character, index, msg = '') {
    this.issues.push(
      generateIssue('invalidCharacter', { character: unicodeName(character), index, string: this.hedString, msg: msg }),
    )
  }
}
