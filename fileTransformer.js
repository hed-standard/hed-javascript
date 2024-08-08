const normalizeEOL = (str) => str.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

export default {
  process(sourceText, sourcePath, options) {
    sourceText = normalizeEOL(sourceText)
    return {
      code: `module.exports = ${JSON.stringify(sourceText)};`,
    }
  },
}
