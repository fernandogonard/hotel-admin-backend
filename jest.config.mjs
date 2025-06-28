import { defaults } from 'jest-config';

export default {
  ...defaults,
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleNameMapper: {},
};
