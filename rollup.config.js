import { rollupPluginHTML as html } from '@web/rollup-plugin-html' 
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'

export default {
	input: 'src/index.html',
	output: {
		dir: 'dist',
	},
	plugins: [
		html(),
		nodeResolve(),
		replace({
			preventAssignment: true,
			values: {
				'process.env.NODE_ENV': JSON.stringify('production'),
			}
		})
	],
}

