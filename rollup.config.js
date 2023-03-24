import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

import pkg from './package.json' assert { type: 'json' };

const generateOutput = (format) => {
	/** @type {import("rollup").OutputOptions} */
	return {
		file: outputPath[`${format}`],
		exports: 'named',
		format,
	};
};

const outputPath = {
	es: pkg.main,
};

/** @type {import("rollup").RollupOptions} */
export default {
	input: './src/index.js',
	output: generateOutput('es'),
	external: [/.json/, /node_modules/],

	plugins: [
		resolve(),
		commonjs(),
		babel({
			babelHelpers: 'bundled',
		}),
	],
};
