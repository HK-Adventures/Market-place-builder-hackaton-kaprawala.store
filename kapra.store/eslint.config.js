import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const compat = new FlatCompat();

export default [
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  {
    ignores: [
      '.next/*',
      'node_modules/*',
      'dist/*',
      'build/*',
      'coverage/*',
      '*.config.js',
      '*.setup.js'
    ]
  },
  ...compat.config({
    extends: ['next/core-web-vitals'],
    parserOptions: {
      project: './tsconfig.json'
    }
  })
]; 