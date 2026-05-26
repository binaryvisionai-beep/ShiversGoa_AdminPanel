/**
 * TanStack Start sets ssr:true on client builds, so vite-plugin-pwa does not emit sw.js.
 * This script runs after `vite build` to precache static client assets.
 */
import { generateSW } from "workbox-build";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const clientDist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "client");

const { count, size, warnings } = await generateSW({
  swDest: join(clientDist, "sw.js"),
  globDirectory: clientDist,
  globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest,woff2}"],
  globIgnores: ["**/sw.js", "**/workbox-*.js"],
  navigateFallback: null,
  cleanupOutdatedCaches: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "supabase-api",
        expiration: { maxEntries: 64, maxAgeSeconds: 5 * 60 },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "admin-pages",
        networkTimeoutSeconds: 8,
      },
    },
  ],
});

if (warnings.length) {
  console.warn("[workbox] warnings:", warnings);
}

console.log(`[workbox] sw.js — ${count} precached files (${(size / 1024).toFixed(1)} KiB)`);
