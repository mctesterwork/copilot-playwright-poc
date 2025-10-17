import {defineConfig} from '@kubb/core';
import {pluginOas} from '@kubb/plugin-oas';
import {pluginTs} from '@kubb/plugin-ts';
 
export default defineConfig(() => ({
  input: {
    // This will be the downloaded OpenAPI spec
    path: './api-swagger.json',
  },
  output: {
    path: './src/gen',
    extension: {'.ts': ''},
  },
  root: '.',
  plugins: [
    pluginOas(),
    pluginTs({
      output: {
        path: './api-types.ts',
        barrelType: false,
      },
    }),
  ],
}));