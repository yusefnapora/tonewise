import { rollupPluginHTML as html } from '@web/rollup-plugin-html'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import copy from 'rollup-plugin-copy'
import { generateSW } from 'rollup-plugin-workbox'

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
      },
    }),
    copy({
      copyOnce: true,
      targets: [
        {
          src: 'src/css',
          dest: 'dist',
        },
        {
          src: 'assets',
          dest: 'dist',
        },
        {
          src: 'assets/favicon/favicon.ico',
          dest: 'dist',
        },
      ],
    }),
    generateSW({
      swDest: 'dist/sw.js',
      globDirectory: 'dist/',
      globPatterns: [
        '**/*.{js,css,html,svg}',
        'assets/audio/*',
        'assets/fonts/*',
      ],
      dontCacheBustURLsMatching: /inline-module-.*\.js/,
      navigateFallback: '/index.html',
      skipWaiting: true,
    }),
    terser({
      ecma: '2016',
      // keep_fnames: true,
    }),
  ],
}
