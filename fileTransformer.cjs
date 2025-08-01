const normalizeEOL = (str) => str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

module.exports = {
  process(sourceText, sourcePath, options) {
    // Normalize line endings and return as module export
    const normalizedText = normalizeEOL(sourceText);
    return {
      code: `module.exports = ${JSON.stringify(normalizedText)};`,
    };
  },
};
