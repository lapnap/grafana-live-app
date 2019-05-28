import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import copy from 'rollup-plugin-copy-glob';
import {terser} from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';

const replace = require('replace-in-file');
const pkg = require('./package.json');
const {PRODUCTION} = process.env;

export default {
  input: [
    'src/module.ts', // app
    'src/datasource/module.ts',
    'src/panels/events/module.ts',
    'src/panels/presense/module.ts',
  ],
  output: [
    {
      dir: 'dist',
      format: 'cjs',
      sourcemap: true,
      chunkFileNames: '[name].js',
    },
  ],
  manualChunks(id) {
    // id == absolute path
    if (id.endsWith('module.ts')) {
      const idx = id.indexOf('/src/');
      if (idx > 0) {
        const p = id.substring(idx + 5, id.lastIndexOf('.'));
        console.log('MODULE:', id, p);
        return p;
      }
    }
    console.log('shared:', id);
    return 'shared';
  },
  external: [
    'jquery', // exported by grafana
    'lodash', // exported by grafana
    'moment', // exported by grafana
    'rxjs', // exported by grafana
    'react', // exported by grafana
    'react-dom', // exported by grafana
    '@grafana/ui', // exported by grafana
  ],
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Allow json resolution
    json(),

    // Compile TypeScript files
    typescript({useTsconfigDeclarationDir: true}),

    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),

    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    // Resolve source maps to the original source
    sourceMaps(),

    // Minify
    PRODUCTION && terser(),

    // Copy files
    copy([{files: 'src/**/*.{json,svg,png,html}', dest: 'dist'}], {verbose: true}),

    // Help avoid including things accidentally
    visualizer({
      filename: 'dist/stats.html',
      title: 'Plugin Stats',
    }),

    // Custom callback when we are done
    finish(),
  ],
};

function finish() {
  return {
    name: 'finish',
    buildEnd() {
      const files = 'dist/plugin.json';
      replace.sync({
        files: files,
        from: /%VERSION%/g,
        to: pkg.version,
      });
      replace.sync({
        files: files,
        from: /%TODAY%/g,
        to: new Date().toISOString().substring(0, 10),
      });

      if (PRODUCTION) {
        console.log('*minified*');
      }
    },
  };
}
