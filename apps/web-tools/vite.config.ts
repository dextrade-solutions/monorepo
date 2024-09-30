import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

import serializeTokensPlugin from './src/plugins/serializeTokensPlugin.ts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    serializeTokensPlugin(),
    // inject({
    //   include: ['./app/**/*.js', './ui/**/*.js'],
    //   modules: { Buffer: ['buffer', 'Buffer'], crypto: ['crypto', 'crypto'] },
    // }),
    wasm(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // plugins: [
      //   NodeGlobalsPolyfillPlugin({
      //     buffer: true,
      //   }),
      // ],
    },
  },
  build: {
    target: 'esnext',
  },
});
