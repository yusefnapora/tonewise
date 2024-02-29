import { rollupPluginHTML as html } from '@web/rollup-plugin-html' 
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import copy from 'rollup-plugin-copy'

export default {
	input: 'src/index.html',
	output: {
		dir: 'dist',
	},
	plugins: [
		html({ extractAssets: false }),
		nodeResolve(),
		replace({
			preventAssignment: true,
			values: {
				'process.env.NODE_ENV': JSON.stringify('production'),
			}
		}),
    copy({
      copyOnce: true,
      targets: [
				{
					src: 'src/css',
					dest: 'dist',
				},
        {
          src: 'node_modules/@shoelace-style/shoelace/dist/assets',
          dest: 'dist/shoelace'
        }
      ]
    })
	],
}

