import { H as Hls } from "./hls-vendor-dru42stk.js";

const players = Array.from(document.querySelectorAll(".video-player"));

players.forEach((player) => {
    const video = player.querySelector("video");
    const overlay = player.querySelector(".play-overlay");
    const stream = player.dataset.stream;
    let started = false;
    let hls = null;

    function attach() {
        if (!video || !stream) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            return;
        }

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
        }
    }

    function start() {
        if (!video || !stream) {
            return;
        }

        if (!started) {
            started = true;
            attach();
            video.controls = true;
        }

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        const playRequest = video.play();
        if (playRequest && typeof playRequest.catch === "function") {
            playRequest.catch(() => {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", start);
    }

    if (video) {
        video.addEventListener("click", () => {
            if (!started) {
                start();
            }
        });
    }

    window.addEventListener("pagehide", () => {
        if (hls) {
            hls.destroy();
        }
    });
});
