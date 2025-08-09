module.exports = {
  testEnvironment: 'node',
  transform: {
    '\\.xml$': '<rootDir>/xml-transformer.js',
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  transformIgnorePatterns: ['/node_modules/(?!unicode-name|semver)'],
  testPathIgnorePatterns: ['node_modules/', '<rootDir>/types/test.ts', '<rootDir>/browser/'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
}
