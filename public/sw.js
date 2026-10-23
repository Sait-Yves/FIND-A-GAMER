// Service Worker pour LobbyGamer (PWA & Push Notifications)

const CACHE_NAME = "lobbygamer-v1";
const OFFLINE_URL = "/fallback-offline.html";

const PRECACHE_ASSETS = [
  "/",
  "/fallback-offline.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// 1. Installation & Mise en cache des assets essentiels
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activation & Nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// 3. Stratégie Fetch (Network First avec secours Offline)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Ignorer les requêtes d'API internes et RAWG pour toujours garder les données fraîches
  if (event.request.url.includes("/api/") || event.request.url.includes("api.rawg.io")) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      // Si la ressource demandée est une navigation de page HTML, renvoyer la page de secours
      if (event.request.mode === "navigate") {
        return cache.match(OFFLINE_URL);
      }
      return new Response("Hors-ligne", { status: 503, statusText: "Service Unavailable" });
    })
  );
});

// 4. Gestion des Notifications Push (Nouveau message ou ticket accepté)
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || "LobbyGamer Notification";
    const options = {
      body: payload.body || "Vous avez une nouvelle notification.",
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      data: {
        url: payload.url || "/",
      },
      vibrate: [100, 50, 100],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Erreur push notification:", err);
  }
});

// 5. Clic sur la notification -> Ouverture du salon correspondant
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
