// Mock `import.meta.glob` for Jest environment
globalThis.importMetaGlob = (pattern, options) => {
  return {};
};

// Mock import.meta for Jest environment
global.importMeta = {
  glob: (pattern, options) => {
    return {};
  }
};

// Since we can't directly mock import.meta due to syntax restrictions,
// the Babel plugin in babel.config.cjs handles the transformation
// of import.meta.glob calls during compilation
