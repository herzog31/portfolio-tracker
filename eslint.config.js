import preactConfig from 'eslint-config-preact'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', 'output.txt'],
  },
  ...preactConfig,
  {
    rules: {
      'no-console': 'off',
      'react/prop-types': 'off',
    },
  },
]
