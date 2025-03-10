import { ManifestOptions } from 'vite-plugin-pwa';

const manifest: Partial<ManifestOptions> = {
  id: '/',
  name: 'DexPay - Payment gateway platform',
  short_name: 'DexPay',
  start_url: '/',
  display: 'standalone',
  lang: 'en',
  scope: '/',
  description:
    'Secure and efficient payment gateway platform for seamless transactions.', // More descriptive
  theme_color: '#3C76FF',
  background_color: '#FFFFFF', // Add background_color
  orientation: 'portrait',
  icons: [
    {
      src: 'images/icon-48.png',
      sizes: '48x48',
      type: 'image/png',
      purpose: 'any', // Add purpose
    },
    {
      src: 'images/icon-64.png',
      sizes: '64x64',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: 'images/icon-128.png',
      sizes: '128x128',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: 'images/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: 'images/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: 'images/maskable-icon-512.png', // Add maskable icon
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
  display_override: [
    'window-controls-overlay',
    'fullscreen',
    'minimal-ui',
    'browser',
  ], // Reorder and add more options
  categories: ['finance', 'payments', 'business'], // Add more relevant categories
  screenshots: [
    // optional add screenshots for app store
    // {
    //   src: 'images/screenshot1.png',
    //   sizes: '1280x720',
    //   type: 'image/png',
    //   form_factor: 'wide',
    // },
    // {
    //   src: 'images/screenshot2.png',
    //   sizes: '720x1280',
    //   type: 'image/png',
    //   form_factor: 'narrow',
    // },
  ],
};

export default manifest;
