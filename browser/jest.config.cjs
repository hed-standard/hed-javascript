const baseConfig = require('../jest.config.js');

module.exports = {
  ...baseConfig,
  rootDir: '..',
  testMatch: ['<rootDir>/browser/src/**/*.spec.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '<rootDir>/browser/src/schema/vite-importer.js': '<rootDir>/browser/vite-importer-transformer.cjs',
    '\\.xml$': '<rootDir>/xml-transformer.js',
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
};
