const { createTransformer } = require('babel-jest').default;
const fs = require('node:fs');
const path = require('node:path');

function transformImportMetaGlob(src, file) {
  if (!src.includes('import.meta.glob')) {
    return src;
  }

  const globRegex = /import\.meta\.glob\((['"])(.*?)\1(,\s*(\{.*?\})?)?\)/g;
  let newSrc = src;
  let match;

  while ((match = globRegex.exec(src)) !== null) {
    const globPattern = match[2];
    const options = match[4] ? JSON.parse(match[4].replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')) : {};

    const globPath = path.resolve(path.dirname(file), globPattern.replace(/\/\*/, ''));
    const files = fs.readdirSync(globPath);

    let replacement = '{';
    for (const f of files) {
      const filePath = path.join(globPath, f).replace(/\\/g, '/');
      const relativePath = './' + path.relative(path.dirname(file), filePath).replace(/\\/g, '/');
      replacement += `"${relativePath}": () => import("${relativePath}"),`;
    }
    replacement += '}';

    newSrc = newSrc.replace(match[0], replacement);
  }

  return newSrc;
}

module.exports = {
  createTransformer,
  process(src, filename, config, options) {
    const newSrc = transformImportMetaGlob(src, filename);
    const babelTransformer = createTransformer({
      ...config.globals.babelConfig,
    });
    return babelTransformer.process(newSrc, filename, config, options);
  },
};
