import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import AstroPWA from '@vite-pwa/astro';

// GitHub *project* pages serve at `<domain>/<repo>/`, so the deploy workflow
// sets ASTRO_BASE=/zelda-wind-waker-guide. Local dev leaves it unset → '/'.
const BASE = process.env.ASTRO_BASE || '/';
// Public-asset prefix that respects BASE — used for the manifest icon paths.
const asset = (p) => `${BASE.replace(/\/$/, '')}/${p.replace(/^\//, '')}`;
// start_url/scope/id must end in '/' — GitHub Pages 301-redirects the
// no-slash form, adding a hop every time the installed app launches.
const SCOPE = BASE.endsWith('/') ? BASE : `${BASE}/`;

export default defineConfig({
  site: 'https://artemiopadilla.github.io',
  base: BASE,
  // Spanish is the source language (matching the sibling RE4 guide) and
  // stays unprefixed at the root; English lives under /en/. Astro's
  // built-in i18n routing handles the URL structure.
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    react(),
    AstroPWA({
      // registerType: 'autoUpdate' — see rationale in the sibling RE4 guide:
      // every route here is a full document navigation and every React
      // island's script is a plain <script type=module> emitted at build
      // time (zero dynamic `import()` in src/ outside test files), so an
      // already-open tab has nothing the new SW wouldn't still serve.
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      manifest: {
        id: SCOPE,
        name: 'The Wind Waker — Guía',
        short_name: 'WW Guía',
        description:
          'Guía y tracker offline de The Legend of Zelda: The Wind Waker HD: el Gran Mar isla a isla, mazmorras, Trozos de Corazón, Cartas del Triforce y jefes.',
        lang: 'es',
        theme_color: '#0b3d5c',
        background_color: '#0b3d5c',
        display: 'standalone',
        start_url: SCOPE,
        scope: SCOPE,
        icons: [
          { src: asset('icons/pwa-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: asset('icons/pwa-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: asset('icons/pwa-maskable-512.png'),
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache all static assets produced by the Astro build — the guide
        // must be fully usable offline once installed.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff2}'],
        navigateFallback: SCOPE,
      },
      experimental: { directoryAndTrailingSlashHandler: true },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  output: 'static',
});
