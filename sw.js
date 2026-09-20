const CACHE_NAME = "album-player-v1";


const FILES_TO_CACHE = [

    "./",

    "./index.html",

    "./style.css",

    "./app.js",

    "./manifest.json",

    "./portada.jpg",


    // ==========================
    // MÚSICA
    // ==========================

    "./music/Get Lucky (feat. Pharrell Williams & Nile Rodgers) - Radio Edit.mp3",
    "./music/Instant Crush (feat. Julian Casablancas).mp3",
    "./music/Lose Yourself to Dance (feat. Pharrell Williams).mp3",
    "./music/One More Time.mp3"

];


/* =========================================================
   INSTALAR
   ========================================================= */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(cache => {

                    return cache.addAll(
                        FILES_TO_CACHE
                    );

                })
                .then(() => {

                    return self.skipWaiting();

                })

        );

    }
);


/* =========================================================
   ACTIVAR
   ========================================================= */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()
                .then(keys => {

                    return Promise.all(

                        keys
                            .filter(
                                key =>
                                    key !==
                                    CACHE_NAME
                            )

                            .map(
                                key =>
                                    caches.delete(
                                        key
                                    )
                            )

                    );

                })

                .then(() =>
                    self.clients.claim()
                )

        );

    }
);


/* =========================================================
   RANGE REQUESTS PARA FLAC
   ========================================================= */

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        if (
            request.method !== "GET"
        ) {
            return;
        }


        event.respondWith(

            caches.match(request)
                .then(cached => {

                    if (
                        cached &&
                        !request.headers.has(
                            "range"
                        )
                    ) {

                        return cached;

                    }


                    if (
                        request.headers.has(
                            "range"
                        )
                    ) {

                        return handleRangeRequest(
                            request
                        );

                    }


                    return fetch(request)
                        .then(response => {

                            if (
                                response.ok
                            ) {

                                const copy =
                                    response.clone();


                                caches.open(
                                    CACHE_NAME
                                ).then(
                                    cache =>
                                        cache.put(
                                            request,
                                            copy
                                        )
                                );

                            }


                            return response;

                        })
                        .catch(() => {

                            return caches.match(
                                "./index.html"
                            );

                        });

                })

        );

    }
);


/* =========================================================
   MANEJAR RANGE
   ========================================================= */

async function handleRangeRequest(request) {

    const cached =
        await caches.match(
            request.url
        );


    if (!cached) {

        return fetch(request);

    }


    const buffer =
        await cached.arrayBuffer();


    const range =
        request.headers.get("range");


    const match =
        range.match(
            /bytes=(\d+)-(\d*)/
        );


    if (!match) {

        return new Response(buffer);

    }


    const start =
        Number(match[1]);


    let end =
        match[2]
            ? Number(match[2])
            : buffer.byteLength - 1;


    end =
        Math.min(
            end,
            buffer.byteLength - 1
        );


    const chunk =
        buffer.slice(
            start,
            end + 1
        );


    return new Response(
        chunk,
        {

            status: 206,

            headers: {

                "Content-Range":
                    `bytes ${start}-${end}/${buffer.byteLength}`,

                "Accept-Ranges":
                    "bytes",

                "Content-Length":
                    chunk.byteLength.toString(),

                "Content-Type":
                    cached.headers.get(
                        "Content-Type"
                    ) ||
                    "audio/flac"

            }

        }
    );

}