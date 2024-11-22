import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import mkcert from 'vite-plugin-mkcert';
import inject from '@rollup/plugin-inject';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import EnvironmentPlugin from 'vite-plugin-environment';
import { generateIconNames } from './development/generate-icon-names';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  // server: {
  //   host: true,
  //   proxy: {
  //     '^/api.1inch/.*': {
  //       target: 'https://api.1inch.dev/',
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api.1inch/, ''),
  //     },
  //     '/unizen': {
  //       target: 'https://api.zcx.com',
  //       changeOrigin: true,
  //       secure: false,
  //       rewrite: (path) => path.replace('/unizen', ''),
  //     },
  //   },
  // },
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(
      process.env.npm_package_version,
    ),
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['./ui/css'],
      },
    },
  },
  plugins: [
    nodePolyfills({
      include: ['buffer', 'process'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    react(),
    VitePWA({
      includeAssets: ['images/*'],
      manifest: {
        id: '/',
        name: 'DexTrade',
        short_name: 'DexTrade',
        start_url: '/',
        display: 'standalone',
        background_color: '#f7f8fc',
        lang: 'en',
        scope: '/',
        description: 'Multi-Cryptocurrency Wallet &amp; Exchange Marketplace',
        theme_color: '#f7f8fc',
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
        screenshots: [
          {
            src: 'images/screenshot-1280x800.png',
            sizes: '1280x800',
            type: 'image/png',
          },
          {
            src: 'images/screenshot-750x1334.png',
            sizes: '750x1334',
            type: 'image/png',
          },
        ],
      },
      // strategies: 'injectManifest',
      // registerType: 'autoUpdate',
      injectRegister: false,
      // devOptions: {
      //   enabled: true,
      // },
    }),
    inject({
      include: ['./app/**/*.js', './ui/**/*.js'],
      modules: { Buffer: ['buffer', 'Buffer'], crypto: ['crypto', 'crypto'] },
    }),
    mkcert(),
    viteStaticCopy({
      targets: [
        // {
        //   src: './app/images/*',
        //   dest: 'images',
        // },
        {
          src: './app/fonts/*',
          dest: 'fonts',
        },
        {
          src: './app/_locales/*',
          dest: '_locales',
        },
        {
          src: './app/tokens-registry.json',
          dest: '.',
        },
        {
          src: './app/service-workers/*',
          dest: '.',
        },
        {
          src: 'node_modules/bitcore-lib/bitcore-lib.js',
          dest: 'lib',
        },
        {
          src: '../../assets/images/*',
          dest: 'images',
        },
      ],
    }),
    EnvironmentPlugin({
      IS_PWA: JSON.stringify(true),
      SENTRY_DSN: JSON.stringify(process.env.VITE_SENTRY_DSN) || null,
      SENTRY_DSN_DEV: JSON.stringify(process.env.VITE_SENTRY_DSN_DEV) || null,
      // TESTNET_MODE_INITIAL: 'True',
      DEFAULT_PASSWORD:
        JSON.stringify(process.env.VITE_DEFAULT_PASSWORD) || null,
      INFURA_PROJECT_ID:
        JSON.stringify(process.env.VITE_INFURA_PROJECT_ID) || null,
      ICON_NAMES: generateIconNames(),
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
    }),
    wasm(),
  ],
  resolve: {
    alias: {
      jsbi: path.resolve(__dirname, '../../node_modules/jsbi/dist/jsbi-cjs.js'),
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
    },
  },
});
