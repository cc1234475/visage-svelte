import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import svelte from 'rollup-plugin-svelte';
import css from 'rollup-plugin-css-only';
import sveltePreprocess from 'svelte-preprocess';
import MagicString from 'magic-string';
import replace from '@rollup/plugin-replace';

const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.ts',
	output: {
		sourcemap: false,
		format: 'iife',
		name: 'app',
		file: 'dist/visage.js'
	},
	plugins: [

		svelte({
			preprocess: sveltePreprocess({
				sourceMap: !production
			}),
			compilerOptions: {
				dev: !production
			}
		}),

		css({
			output: 'visage.css'
		}),
		
		// rollup-plugin-tampermonkey-css
		((options = {}) => ({
			name: 'rollup-plugin-tampermonkey-css',
			renderChunk: (code, renderedChunk, outputOptions) => {
				let magicString = new MagicString(code);
				const result = { code: magicString.toString() }
				if(outputOptions.sourceMap !== false) {
					result.map = magicString.generateMap({hires: true})
				}
				return result
			}
		}))(), 

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),

		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),

		replace({
			'https:/raw.': 'https://raw.',
			'_VISAGE_API_URL': production ? 'https://cc1234-stashface.hf.space/api/predict' : 'https://cc1234-stashface.hf.space/api/predict'
		})
	],
	watch: {
		clearScreen: false
	}
};
