module.exports = {
  verbose: false,
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleDirectories: ['node_modules'],
  roots: ['<rootDir>/src'],
  testRegex: '(\\.|/)(test)\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFiles: ['./build/jest-shim.ts', './build/jest-setup.ts'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  globals: {'ts-jest': {isolatedModules: true}},
};
