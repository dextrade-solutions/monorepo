import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    // dts({
    //   entryRoot: './',
    // }),
  ],
  build: {
    // minify: false, // for develop purposes, DISABLE IT IN PRODUCTION
    lib: {
      entry: resolve(__dirname, 'lib/main.tsx'),
      name: 'dex-ui',
      fileName: 'dex-ui',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@mui/material',
        '@mui/material/styles',
        '@mui/styles',
        'classnames',
        '@tanstack/react-query',
        'dex-services',
      ],
      output: {
        globals: {
          react: 'React',
          classnames: 'ClassNames',
          'react-dom': 'React-dom',
          '@mui/material': '@mui/material',
          '@mui/styles': '@mui/styles',
          '@tanstack/react-query': '@tanstack/react-query',
          'dex-services': 'dex-services',
        },
      },
    },
  },
});
