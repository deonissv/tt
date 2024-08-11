module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: [
      './packages/client/tsconfig.json',
      './packages/client/tsconfig.node.json',
      './packages/client/tsconfig.app.json',
      './packages/server/tsconfig.json',
      './packages/playground/tsconfig.app.json',
      './packages/playground/tsconfig.json',
      './packages/shared/tsconfig.json',
    ],
    tsconfigRootDir: __dirname,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/jsx-runtime',
    'plugin:prettier/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:@typescript-eslint/recommended-type-checked',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', '*.config.ts', '*.config.js', 'vitest*', './packages/playground'],
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'no-console': 'error',
    'no-debugger': 'error',
  },
  overrides: [
    {
      files: ['packages/server/**/*.{ts,tsx}'],
      rules: {
        'react/prop-types': 'off',
        'react-hooks/rules-of-hooks': 'off',
      },
    },
  ],
};
