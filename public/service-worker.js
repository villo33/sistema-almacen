const CACHE_NAME = "sistema-almacen-v3";

const ARCHIVOS_CACHE = [

    "/",
    "/index.html",
    "/style.css",
    "/manifest.json",

    "/logo-192.png",
    "/logo-512.png"

];

// =========================
// INSTALAR
// =========================

self.addEventListener("install", event => {

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ARCHIVOS_CACHE))

    );

});

// =========================
// ACTIVAR
// =========================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys =>

            Promise.all(

                keys.map(key => {

                    if (key !== CACHE_NAME) {

                        return caches.delete(key);

                    }

                })

            )

        ).then(() => self.clients.claim())

    );

});

// =========================
// FETCH
// =========================

self.addEventListener("fetch", event => {

    // Solo manejar peticiones GET
    if (event.request.method !== "GET") return;

    event.respondWith(

        fetch(event.request)

            .then(response => {

                // Guardar copia en caché
                const copia = response.clone();

                caches.open(CACHE_NAME)
                .then(cache => {

                    cache.put(event.request, copia);

                });

                return response;

            })

            .catch(() => {

                return caches.match(event.request);

            })

    );

});