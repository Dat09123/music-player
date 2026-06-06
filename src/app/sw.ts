import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

const __sw_manifest = (self as unknown as { __SW_MANIFEST: any }).__SW_MANIFEST;

const serwist = new Serwist({
  precacheEntries: __sw_manifest,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    // Deezer API responses — stale-while-revalidate for faster offline recovery
    {
      matcher: /^https:\/\/api\.deezer\.com\/.*/,
      handler: "StaleWhileRevalidate" as any,
      options: {
        cacheName: "deezer-api",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
      },
    } as any,
    // Deezer CDN images — cache-first for speed
    {
      matcher: /^https:\/\/e-cdns-images\.dzcdn\.net\/.*/,
      handler: "CacheFirst" as any,
      options: {
        cacheName: "deezer-images",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    } as any,
    // Deezer CDN images (alt domain)
    {
      matcher: /^https:\/\/cdn-images\.dzcdn\.net\/.*/,
      handler: "CacheFirst" as any,
      options: {
        cacheName: "deezer-images",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    } as any,
  ],
} as any);

serwist.addEventListeners();
