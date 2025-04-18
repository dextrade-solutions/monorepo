import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import manifest from './manifest';
import { readFileSync } from 'fs';
import { join } from 'path';

const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.1'),
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: '../../assets/images/*',
          dest: 'images',
        },
      ],
    }),
    nodePolyfills({
      include: ['buffer', 'process', 'crypto'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    VitePWA({
      includeAssets: ['images/*'],
      manifest,
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        skipWaiting: true,    // Activate new SW immediately
        clientsClaim: true,   // Claim all pages under scope
        cleanupOutdatedCaches: true, // Removes old precaches
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
});
