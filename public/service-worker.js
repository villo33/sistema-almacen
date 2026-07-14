// =======================================
// SISTEMA DE ALMACÉN
// Service Worker Profesional
// Versión 1.0
// =======================================

const CACHE_NAME = "sistema-almacen-v4";

// Archivos principales
const STATIC_CACHE = [

    "/",
    "/index.html",

    "/style.css",

    "/manifest.json",

    "/logo-192.png",
    "/logo-512.png"

];



// =======================================
// INSTALACIÓN
// =======================================

self.addEventListener("install", event => {

    console.log("Instalando Service Worker...");

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => cache.addAll(STATIC_CACHE))

    );

});



// =======================================
// ACTIVACIÓN
// =======================================

self.addEventListener("activate", event => {

    console.log("Activando nueva versión...");

    event.waitUntil(

        caches.keys()

        .then(keys =>

            Promise.all(

                keys.map(key => {

                    if (key !== CACHE_NAME) {

                        console.log("Eliminando:", key);

                        return caches.delete(key);

                    }

                })

            )

        )

        .then(() => self.clients.claim())

    );

});



// =======================================
// FETCH
// Estrategia:
// Network First
// =======================================

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") return;

    event.respondWith(

        fetch(event.request)

        .then(response => {

            // Solo guardar respuestas válidas
            if (!response || response.status !== 200) {

                return response;

            }

            const copia = response.clone();

            caches.open(CACHE_NAME)

            .then(cache => {

                cache.put(event.request, copia);

            });

            return response;

        })

        .catch(() => {

            return caches.match(event.request)

            .then(cacheResponse => {

                if (cacheResponse) {

                    return cacheResponse;

                }

                // Página de respaldo si falla todo
                return new Response(

                    `
                    <!DOCTYPE html>

                    <html lang="es">

                    <head>

                    <meta charset="UTF-8">

                    <title>Sin conexión</title>

                    <style>

                    body{

                        font-family:Arial;
                        text-align:center;
                        padding:50px;
                        background:#f5f5f5;

                    }

                    h1{

                        color:#1565c0;

                    }

                    p{

                        color:#555;

                    }

                    </style>

                    </head>

                    <body>

                        <h1>📶 Sin conexión</h1>

                        <p>No fue posible comunicarse con el servidor.</p>

                        <p>Revisa tu conexión e inténtalo nuevamente.</p>

                    </body>

                    </html>
                    `,

                    {

                        headers:{

                            "Content-Type":"text/html"

                        }

                    }

                );

            });

        })

    );

});