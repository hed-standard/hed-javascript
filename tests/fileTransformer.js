module.exports = {
  process(sourceText, sourcePath, options) {
    sourceText = sourceText.replaceAll('`', '\\`')
    return {
      code: `module.exports = \`${sourceText}\`;`,
    }
  },
}
