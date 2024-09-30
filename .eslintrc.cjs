const path = require('path');

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',

    path.resolve(__dirname, '.eslintrc.base.cjs'),
  ],
  ignorePatterns: ['dist', '.eslintrc.*'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    'import/resolver': {
      // When determining the location of an `import`, use Node's resolution
      // algorithm, then fall back to TypeScript's. This allows TypeScript
      // files (which Node's algorithm doesn't recognize) to be imported
      // from JavaScript files, while also preventing issues when using
      // packages like `prop-types` (where we would otherwise get "No
      // default export found in imported module 'prop-types'" from
      // TypeScript because imports work differently there).
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  rules: {
    'id-length': 'off',
    'no-restricted-globals': 'off',
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    'react-refresh/only-export-components': "off",
  },
}
