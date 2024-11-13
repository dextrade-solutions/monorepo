import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
// import mkcert from 'vite-plugin-mkcert';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import wasm from 'vite-plugin-wasm';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    // mkcert(),
    VitePWA({
      includeAssets: ['images/*'],
      manifest: {
        id: '/',
        name: 'DexTrade P2P',
        short_name: 'DexTrade P2P',
        start_url: '/',
        display: 'standalone',
        lang: 'en',
        scope: '/',
        description: 'P2P Exchange Marketplace',
        theme_color: '#26202e',
        orientation: 'portrait',
        icons: [
          {
            src: 'images/icon-48.png',
            sizes: '48x48',
            type: 'image/png',
          },
          {
            src: 'images/icon-64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'images/icon-128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'images/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        display_override: ['fullscreen', 'window-controls-overlay'],
        categories: ['finance'],
      },
      // strategies: 'injectManifest',
      // registerType: 'autoUpdate',
      injectRegister: false,
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      // devOptions: {
      //   enabled: true,
      // },
    }),
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
