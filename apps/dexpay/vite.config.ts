import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import manifest from './manifest';

export default defineConfig({
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
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
});
