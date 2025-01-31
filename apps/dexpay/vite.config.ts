import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
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
  ],
  // optimizeDeps: {
  //   include: ['eventemitter3'],
  // },
  // resolve: {
  //   preserveSymlinks: true // this is the fix!
  // },
});
