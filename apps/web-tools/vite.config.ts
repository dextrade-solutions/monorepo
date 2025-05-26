import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
// import mkcert from 'vite-plugin-mkcert';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import wasm from 'vite-plugin-wasm';
import { VitePluginRadar } from 'vite-plugin-radar';
import packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  define: {
    __VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [
    react(),
    VitePluginRadar({
      analytics: {
        id: 'G-TP5FLD97M4',
      },
    }),
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
      injectRegister: false,
      workbox: {
        maximumFileSizeToCacheInBytes: 11 * 1024 * 1024,
      },
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
    viteStaticCopy({
      targets: [
        {
          src: '../../assets/images/*',
          dest: 'images',
        },
      ],
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
