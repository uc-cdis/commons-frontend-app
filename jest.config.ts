import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest',
  rootDir: __dirname,
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@/components(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^redux-persist/lib/storage/createWebStorage$':
      '<rootDir>/__mocks__/createWebStorageMock.js',
  },
  testEnvironment: 'jest-fixed-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)?$': [
      'ts-jest',
      {
        isolatedModules: true,
        tsconfig: 'tsconfig.test.json',
      },
    ],
    'node_modules/(flat|jsonpath-plus|uuid)/.+\\.(j|t)sx?$': ['ts-jest', {}],
  },
  transformIgnorePatterns: ['/node_modules/(?!(flat|jsonpath-plus|uuid))'],
  modulePaths: ['<rootDir>'],
  globals: {
    fetch: global.fetch,
  },
};

export default jestConfig;
