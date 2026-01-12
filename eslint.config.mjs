import { defineConfig } from "eslint/config";
import tseslint from "@electron-toolkit/eslint-config-ts";
import eslintConfigPrettier from "@electron-toolkit/eslint-config-prettier";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";

export default defineConfig(
	{ ignores: ["**/node_modules", "**/dist", "**/out"] },
	tseslint.configs.recommended,
	{
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
		},
		rules: {
			"prettier/prettier": [
				"error",
				{
					printWidth: 120,
					useTabs: true,
					semi: true,
					arrowParens: "always",
					trailingComma: "es5",
					bracketSpacing: true,
					bracketLine: true,
					endOfLine: "auto",
					arrowFunctionParens: "always",
				},
			],
			camelcase: "off",
			"no-undef": "off",
			"prefer-const": "off",
			"no-unused-vars": 0,
			"dot-notation": "off",
			"no-useless-constructor": "off",
			"no-trailing-spaces": "error",
			"@typescript-eslint/no-unused-vars": "warn",
			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/explicit-function-return-type": "off",
			...eslintPluginReactHooks.configs.recommended.rules,
		},
	},
	eslintConfigPrettier,
);
