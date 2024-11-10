import regexData from '../data/json/class_regex.json'

// Function to get the RegExp
export function getRegExp(name) {
  if (!regexData.class_chars[name]) {
    throw new Error(`Invalid class name: ${name}`)
  }

  const charNames = regexData.class_chars[name]
  if (charNames.length === 0) {
    throw new Error(`No character definitions for class: ${name}`)
  }

  // Join the individual character regex patterns
  const pattern = charNames
    .map((charName) => {
      if (!regexData.char_regex[charName]) {
        throw new Error(`Invalid character name: ${charName}`)
      }
      return regexData.char_regex[charName]
    })
    .join('|')

  return new RegExp(`^(?:${pattern})+$`)
}
