import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
// import eslintConfigPrettier from "eslint-config-prettier";
// import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{ languageOptions: { globals: globals.node } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	{
		ignores: ['node_modules', 'dist', 'public'],
	},
	{
		files: ['**/*.{js,mjs,cjs,ts}'],
		rules: {
			'indent': ['error', 4],
			// "camelcase": "off",
			// "@typescript-eslint/camelcase": "off",
			'no-underscore-dangle': 'off',
			'prettier/prettier': ['error', { tabWidth: 4, useTabs: true }], // Ajoutez cette ligne pour intégrer Prettier avec ESLint

			// "import/prefer-default-export": "off",
			// "import/extensions": [
			//   "error",
			//   "ignorePackages",
			//   {
			//     "ts": "never"
			//   }
			// ],
			// "class-methods-use-this": "off",
			// "no-useless-constructor": "off"
		},
	},
	eslintPluginPrettierRecommended,
];
