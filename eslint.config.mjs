import js from '@eslint/js';
import globals from 'globals';
import ts from 'typescript-eslint';
import solid from 'eslint-plugin-solid/configs/typescript';
import * as tsParser from '@typescript-eslint/parser';

export default [
  { languageOptions: { globals: globals.browser } },
  js.configs.recommended,
  ...ts.configs.recommended,
  { ignores: ['dist/'] },
  {
    files: ['**/*.{ts,tsx}'],
    ...solid,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: 'tsconfig.json',
      },
    },
  },
];
