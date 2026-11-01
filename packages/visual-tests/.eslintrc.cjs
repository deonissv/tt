module.exports = {
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  overrides: [
    {
      files: ['**/*.{mjs,cjs}'],
      extends: ['plugin:@typescript-eslint/disable-type-checked'],
      parserOptions: { project: null },
      rules: { 'no-console': 'off', '@typescript-eslint/no-require-imports': 'off' },
    },
  ],
};
