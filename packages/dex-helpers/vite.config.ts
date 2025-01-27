import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

import serializeTokensPlugin from './plugins/serializeTokensPlugin.ts';

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
    lib: {
      entry: path.resolve(__dirname, './lib/main.ts'),
      name: 'MyLib',
      fileName: (format) => `dex-helpers.${format}.js`,
    },
    target: 'esnext',
    rollupOptions: {
      external: ['ethers'],
      output: {
        globals: {
          ethers: 'ethers',
        },
      },
    },
  },
});
