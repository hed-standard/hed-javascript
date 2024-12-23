import classRegex from '../data/json/class_regex.json'

export class RegexClass {
  // Static method that returns the RegExp object

  static getValueClassChars(name) {
    let classChars
    if (Array.isArray(classRegex.class_chars[name]) && classRegex.class_chars[name].length > 0) {
      classChars =
        '^(?:' + classRegex.class_chars[name].map((charClass) => classRegex.char_regex[charClass]).join('|') + ')+$'
    } else {
      classChars = '^.+$' // Any non-empty line or string.
    }
    return new RegExp(classChars)
  }

  static testRegex(name, value) {
    const regex = RegexClass.getValueClassChars(name)
    return regex.test(value)
  }
}
