/* =========================================================
   CONFIGURACIÓN DEL ÁLBUM
   ========================================================= */

const album = {

    title: "Daft pink",

    artist: "Daft Punk",

    year: "2026",

    cover: "portada.jpg",

    songs: [

        {
            title: "get lucky",
            file: "music/Get Lucky (feat. Pharrell Williams & Nile Rodgers) - Radio Edit.mp3"
        },
        {
            title: "Instant Crush",
            file: "music/Instant Crush (feat. Julian Casablancas).mp3"
        },
        {
            title: "Lose yourself no la de eminem",
            file: "music/Lose Yourself to Dance (feat. Pharrell Williams).mp3"
        },
        {
            title: "One more time",
            file: "music/One More Time.mp3"
        }
    ]

};


/* =========================================================
   ELEMENTOS
   ========================================================= */

const audio =
    document.getElementById("audio");

const cover =
    document.getElementById("cover");

const albumTitle =
    document.getElementById("albumTitle");

const artist =
    document.getElementById("artist");

const albumYear =
    document.getElementById("albumYear");

const trackTitle =
    document.getElementById("trackTitle");

const trackArtist =
    document.getElementById("trackArtist");

const trackNumber =
    document.getElementById("trackNumber");

const playlist =
    document.getElementById("playlist");

const trackCount =
    document.getElementById("trackCount");

const playButton =
    document.getElementById("play");

const previousButton =
    document.getElementById("previous");

const nextButton =
    document.getElementById("next");

const shuffleButton =
    document.getElementById("shuffle");

const repeatButton =
    document.getElementById("repeat");

const progress =
    document.getElementById("progress");

const volume =
    document.getElementById("volume");

const currentTime =
    document.getElementById("currentTime");

const duration =
    document.getElementById("duration");

const connectionStatus =
    document.getElementById("connectionStatus");

const installButton =
    document.getElementById("installButton");


/* =========================================================
   ESTADO
   ========================================================= */

let currentTrack = 0;

let isPlaying = false;

let shuffle = false;

let repeat = false;

let deferredInstallPrompt = null;


/* =========================================================
   CONFIGURACIÓN INICIAL
   ========================================================= */

albumTitle.textContent = album.title;

artist.textContent = album.artist;

albumYear.textContent = album.year;

cover.src = album.cover;

trackArtist.textContent = album.artist;

trackCount.textContent =
    `${album.songs.length} canciones`;


/* =========================================================
   FORMATO DE TIEMPO
   ========================================================= */

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60);

    return `${minutes}:${String(secs).padStart(2, "0")}`;
}


/* =========================================================
   CREAR PLAYLIST
   ========================================================= */

function renderPlaylist() {

    playlist.innerHTML = "";

    album.songs.forEach((song, index) => {

        const track =
            document.createElement("div");

        track.className =
            "track";

        if (index === currentTrack) {
            track.classList.add("active");
        }


        track.innerHTML = `

            <span class="track-number">
                ${String(index + 1).padStart(2, "0")}
            </span>

            <span class="track-name">
                ${song.title}
            </span>

            <span
                class="track-length"
                id="length-${index}">
                —
            </span>

        `;


        track.addEventListener(
            "click",
            () => {

                loadTrack(index);

                play();

            }
        );


        playlist.appendChild(track);

    });


    loadDurations();

}


/* =========================================================
   CARGAR CANCIÓN
   ========================================================= */

function loadTrack(index) {

    if (
        index < 0 ||
        index >= album.songs.length
    ) {
        return;
    }


    currentTrack = index;

    const song =
        album.songs[currentTrack];


    audio.src = song.file;

    audio.load();


    trackTitle.textContent =
        song.title;

    trackNumber.textContent =
        String(currentTrack + 1)
            .padStart(2, "0");


    progress.value = 0;

    currentTime.textContent =
        "0:00";


    duration.textContent =
        "0:00";


    renderPlaylist();


    saveState();


    updateMediaSession();

}


/* =========================================================
   REPRODUCIR
   ========================================================= */

async function play() {

    try {

        await audio.play();

        isPlaying = true;

        playButton.textContent = "Ⅱ";

        document.body.classList.add("playing");

        updateMediaSession();


    } catch (error) {

        console.error(
            "No se pudo reproducir:",
            error
        );

    }

}


/* =========================================================
   PAUSA
   ========================================================= */

function pause() {

    audio.pause();

    isPlaying = false;

    playButton.textContent = "▶";

    document.body.classList.remove("playing");

}


/* =========================================================
   PLAY / PAUSE
   ========================================================= */

playButton.addEventListener(
    "click",
    () => {

        if (isPlaying) {
            pause();
        } else {
            play();
        }

    }
);


/* =========================================================
   SIGUIENTE
   ========================================================= */

function nextTrack() {

    let nextIndex;


    if (shuffle && album.songs.length > 1) {

        do {

            nextIndex =
                Math.floor(
                    Math.random() *
                    album.songs.length
                );

        } while (
            nextIndex === currentTrack
        );

    } else {

        nextIndex =
            currentTrack + 1;

        if (
            nextIndex >=
            album.songs.length
        ) {
            nextIndex = 0;
        }

    }


    loadTrack(nextIndex);

    play();

}


nextButton.addEventListener(
    "click",
    nextTrack
);


/* =========================================================
   ANTERIOR
   ========================================================= */

previousButton.addEventListener(
    "click",
    () => {

        if (audio.currentTime > 5) {

            audio.currentTime = 0;

            return;

        }


        let previous =
            currentTrack - 1;


        if (previous < 0) {

            previous =
                album.songs.length - 1;

        }


        loadTrack(previous);

        play();

    }
);


/* =========================================================
   SHUFFLE
   ========================================================= */

shuffleButton.addEventListener(
    "click",
    () => {

        shuffle = !shuffle;

        shuffleButton.classList.toggle(
            "active",
            shuffle
        );

    }
);


/* =========================================================
   REPEAT
   ========================================================= */

repeatButton.addEventListener(
    "click",
    () => {

        repeat = !repeat;

        repeatButton.classList.toggle(
            "active",
            repeat
        );

    }
);


/* =========================================================
   FIN DE CANCIÓN
   ========================================================= */

audio.addEventListener(
    "ended",
    () => {

        if (repeat) {

            audio.currentTime = 0;

            play();

        } else {

            nextTrack();

        }

    }
);


/* =========================================================
   PROGRESO
   ========================================================= */

audio.addEventListener(
    "timeupdate",
    () => {

        if (!audio.duration) {
            return;
        }


        const percentage =
            (audio.currentTime /
                audio.duration) * 100;


        progress.value =
            percentage;


        currentTime.textContent =
            formatTime(
                audio.currentTime
            );


        saveState();

    }
);


audio.addEventListener(
    "loadedmetadata",
    () => {

        duration.textContent =
            formatTime(audio.duration);

    }
);


/* =========================================================
   MOVER LA BARRA
   ========================================================= */

progress.addEventListener(
    "input",
    () => {

        if (!audio.duration) {
            return;
        }


        audio.currentTime =
            (progress.value / 100) *
            audio.duration;

    }
);


/* =========================================================
   VOLUMEN
   ========================================================= */

const savedVolume =
    localStorage.getItem("album-volume");


if (savedVolume !== null) {

    volume.value =
        savedVolume;

}


audio.volume =
    Number(volume.value);


volume.addEventListener(
    "input",
    () => {

        audio.volume =
            Number(volume.value);

        localStorage.setItem(
            "album-volume",
            volume.value
        );

    }
);


/* =========================================================
   DURACIONES DE LAS CANCIONES
   ========================================================= */

function loadDurations() {

    album.songs.forEach(
        (song, index) => {

            const tempAudio =
                new Audio();

            tempAudio.src =
                song.file;

            tempAudio.preload =
                "metadata";


            tempAudio.addEventListener(
                "loadedmetadata",
                () => {

                    const element =
                        document.getElementById(
                            `length-${index}`
                        );


                    if (element) {

                        element.textContent =
                            formatTime(
                                tempAudio.duration
                            );

                    }

                }
            );

        }
    );

}


/* =========================================================
   GUARDAR ESTADO
   ========================================================= */

function saveState() {

    localStorage.setItem(
        "album-track",
        currentTrack
    );


    localStorage.setItem(
        "album-position",
        audio.currentTime || 0
    );

}


/* =========================================================
   RESTAURAR ESTADO
   ========================================================= */

function restoreState() {

    const savedTrack =
        localStorage.getItem(
            "album-track"
        );


    const savedPosition =
        localStorage.getItem(
            "album-position"
        );


    if (savedTrack !== null) {

        const index =
            Number(savedTrack);


        if (
            index >= 0 &&
            index < album.songs.length
        ) {

            currentTrack = index;

        }

    }


    loadTrack(currentTrack);


    audio.addEventListener(
        "loadedmetadata",
        () => {

            if (savedPosition !== null) {

                audio.currentTime =
                    Number(savedPosition);

            }

        },
        { once: true }
    );

}


/* =========================================================
   MEDIA SESSION
   CONTROLES DE AUDÍFONOS / PANTALLA BLOQUEADA
   ========================================================= */

function updateMediaSession() {

    if (
        !("mediaSession" in navigator)
    ) {
        return;
    }


    const song =
        album.songs[currentTrack];


    navigator.mediaSession.metadata =
        new MediaMetadata({

            title: song.title,

            artist: album.artist,

            album: album.title,

            artwork: [

                {
                    src: album.cover,
                    sizes: "512x512",
                    type: "image/jpeg"
                }

            ]

        });

}


if ("mediaSession" in navigator) {

    navigator.mediaSession.setActionHandler(
        "play",
        play
    );

    navigator.mediaSession.setActionHandler(
        "pause",
        pause
    );

    navigator.mediaSession.setActionHandler(
        "nexttrack",
        nextTrack
    );

    navigator.mediaSession.setActionHandler(
        "previoustrack",
        () => {

            previousButton.click();

        }
    );

}


/* =========================================================
   ESTADO ONLINE / OFFLINE
   ========================================================= */

function updateConnectionStatus() {

    if (navigator.onLine) {

        connectionStatus.textContent =
            "ONLINE";

    } else {

        connectionStatus.textContent =
            "OFFLINE";

    }

}


window.addEventListener(
    "online",
    updateConnectionStatus
);


window.addEventListener(
    "offline",
    updateConnectionStatus
);


updateConnectionStatus();


/* =========================================================
   INSTALACIÓN PWA
   ========================================================= */

window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();

        deferredInstallPrompt =
            event;

        installButton.classList.remove(
            "hidden"
        );

    }
);


installButton.addEventListener(
    "click",
    async () => {

        if (!deferredInstallPrompt) {
            return;
        }


        deferredInstallPrompt.prompt();


        await deferredInstallPrompt.userChoice;


        deferredInstallPrompt = null;


        installButton.classList.add(
            "hidden"
        );

    }
);


/* =========================================================
   SERVICE WORKER
   ========================================================= */

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register("sw.js")
                .then(() => {

                    console.log(
                        "Service Worker activo"
                    );

                })
                .catch(error => {

                    console.error(
                        "Error Service Worker:",
                        error
                    );

                });

        }
    );

}


/* =========================================================
   INICIAR
   ========================================================= */

restoreState();