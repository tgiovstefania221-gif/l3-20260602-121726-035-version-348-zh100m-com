(function () {
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector("[data-play-overlay]");

    if (!video) {
        return;
    }

    var streamUrl = video.getAttribute("data-stream");
    var hlsInstance = null;
    var attached = false;

    function attachStream() {
        if (attached || !streamUrl) {
            return Promise.resolve();
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return new Promise(function (resolve) {
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function () {
                    resolve();
                });
            });
        }

        video.src = streamUrl;
        return Promise.resolve();
    }

    function beginPlay() {
        attachStream().then(function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        });
    }

    if (overlay) {
        overlay.addEventListener("click", beginPlay);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            beginPlay();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}());
