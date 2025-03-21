/// <reference types="vitest" />

import path from 'path';
import { defineConfig } from 'vitest/config';
// import tsconfigPaths from 'vite-tsconfig-paths';

import { loadTestEnv } from './test/setup-test-env';

loadTestEnv();

export default defineConfig({
	// plugins: [tsconfigPaths()],
	// envDir: './',
	test: {
		// environmentMatchGlobs: [['src/http/controllers/**', 'prisma']],
		// exclude: ['packages/template/*'],
		globals: true,
		environment: 'node',
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
