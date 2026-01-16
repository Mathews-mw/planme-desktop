import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig(
	{ ignores: ['**/node_modules', '**/dist', '**/out'] },

	// Base JS/TS
	js.configs.recommended,
	...tseslint.configs.recommended,

	// Regras do projeto
	{
		files: ['**/*.{ts,tsx}'],
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

			// regras "de código"
			camelcase: 'off',
			'no-undef': 'off',
			'prefer-const': 'off',
			'dot-notation': 'off',
			'no-useless-constructor': 'off',
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-namespace': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
		},
	},

	// Prettier por último SEMPRE
	eslintPluginPrettierRecommended
);
