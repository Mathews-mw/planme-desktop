import js from "@eslint/js";

import tseslint from "typescript-eslint";

import { defineConfig } from "eslint/config";

import reactHooks from "eslint-plugin-react-hooks";

import reactRefresh from "eslint-plugin-react-refresh";

import eslintPluginReactHooks from "eslint-plugin-react-hooks";

import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig(
	{ ignores: ["**/node_modules", "**/dist", "**/out"] },
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],

		settings: {
			react: {
				version: "detect",
			},
		},
	},
	{
		files: ["**/*.{ts,tsx}"],

		plugins: {
			"react-hooks": eslintPluginReactHooks,
			"react-refresh": reactRefresh,
		},

		rules: {
			...reactHooks.configs.recommended.rules,
			"react-refresh/only-export-components": [
				"warn",
				{ allowConstantExport: true },
			],
			// "prettier/prettier": 0,
			"prettier/prettier": [
				"error",
				{
					// singleQuote: true,
					printWidth: 120,
					useTabs: true,
					// semi: true,
					// arrowParens: "always",
					// trailingComma: "es5",
					// bracketSpacing: true,
					// bracketLine: true,
					// endOfLine: "auto",
					// arrowFunctionParens: "always",
				},
			],
			camelcase: "off",
			"no-undef": "off",
			"prefer-const": "off",
			"no-unused-vars": 0,
			"dot-notation": "off",
			"no-useless-constructor": "off",
			"no-trailing-spaces": "error",
			"max-len": ["error", { code: 120, tabWidth: 2 }],
			"@typescript-eslint/no-unused-vars": "warn",
			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/explicit-function-return-type": "off",
		},
	},
	tseslint.configs.recommended,
	eslintPluginPrettierRecommended,
);
