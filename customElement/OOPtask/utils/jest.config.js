module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.spec.js'],
  collectCoverage: false,
  verbose: true,
  roots: ['<rootDir>'],
  moduleFileExtensions: ['js', 'json'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {}
};