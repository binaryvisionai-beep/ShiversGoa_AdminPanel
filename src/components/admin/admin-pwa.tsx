import { useEffect } from "react";

/**
 * Registers the PWA service worker only while the admin shell is mounted.
 * Manifest and icons are linked from the /admin route head.
 */
export function AdminPwa() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let updateInterval: ReturnType<typeof setInterval> | undefined;

    void import("virtual:pwa-register")
      .then(({ registerSW }) => {
        const updateSW = registerSW({
          immediate: true,
          onRegisteredSW(_swUrl, registration) {
            if (!registration) return;
            updateInterval = setInterval(() => {
              void registration.update();
            }, 60 * 60 * 1000);
          },
          onOfflineReady() {
            // App shell cached; admin can open from home screen offline.
          },
        });

        return updateSW;
      })
      .catch(() => {
        // SW optional — manifest install still works where supported.
      });

    return () => {
      if (updateInterval) clearInterval(updateInterval);
    };
  }, []);

  return null;
}
