export default {
  process(sourceText, sourcePath, options) {
    sourceText = sourceText.replace(/"/g, '\\"').replace(/\n/g, '\\n')
    return {
      code: `module.exports = "${sourceText}";`,
    }
  },
}
