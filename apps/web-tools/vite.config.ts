import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import wasm from 'vite-plugin-wasm';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    // VitePWA(),
    wasm(),
    nodePolyfills({
      include: ['buffer', 'process', 'crypto'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    alias: {
      tronweb: path.resolve(
        __dirname,
        '../../node_modules/tronweb/dist/TronWeb.js', // reslove browser version
      ),
    },
  },
});
