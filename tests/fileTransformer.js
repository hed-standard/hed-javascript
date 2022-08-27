module.exports = {
  process(sourceText, sourcePath, options) {
    sourceText = sourceText.replace(/`/g, '\\`')
    return {
      code: `module.exports = \`${sourceText}\`;`,
    }
  },
}
