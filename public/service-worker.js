const CACHE_NAME = "sistema-almacen-v1";


const ARCHIVOS_CACHE = [

    "/",
    "/index.html",
    "/style.css",
    "/manifest.json",

    "/entradas.html",
    "/salidas.html",
    "/historial.html",
    "/inventario.html",
    "/materiales.html",
    "/proveedores.html"

];



// INSTALAR APP

self.addEventListener("install", evento => {


    evento.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => {

            return cache.addAll(ARCHIVOS_CACHE);

        })

    );


});




// ACTIVAR Y LIMPIAR VERSIONES ANTIGUAS

self.addEventListener("activate", evento => {


    evento.waitUntil(

        caches.keys()

        .then(keys => {


            return Promise.all(

                keys.map(key => {


                    if(key !== CACHE_NAME){

                        return caches.delete(key);

                    }


                })

            );


        })

    );


});




// CARGAR ARCHIVOS DESDE CACHE

self.addEventListener("fetch", evento => {


    evento.respondWith(


        caches.match(evento.request)

        .then(respuesta => {


            return respuesta || fetch(evento.request);


        })


    );


});