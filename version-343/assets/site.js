(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var current = 0;
            var timer = null;
            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }
            function play() {
                clearInterval(timer);
                timer = setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    play();
                });
            });
            show(0);
            play();
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        searchInputs.forEach(function (input) {
            var scopeSelector = input.getAttribute("data-search-scope") || "body";
            var scope = document.querySelector(scopeSelector) || document.body;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            input.addEventListener("input", function () {
                var words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
                    var matched = words.every(function (word) {
                        return haystack.indexOf(word) !== -1;
                    });
                    card.classList.toggle("is-hidden-by-search", !matched);
                });
            });
        });
    });
})();

function initMoviePlayer(source) {
    var video = document.getElementById("movie-video");
    var cover = document.getElementById("player-cover");
    var starters = Array.prototype.slice.call(document.querySelectorAll("[data-player-start]"));
    var started = false;
    var attached = false;
    var hls = null;

    if (!video || !source) {
        return;
    }

    function attachSource() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }
        video.src = source;
    }

    function startPlayback() {
        if (started) {
            return;
        }
        started = true;
        attachSource();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {
                video.controls = true;
            });
        }
    }

    starters.forEach(function (button) {
        button.addEventListener("click", startPlayback);
    });

    video.addEventListener("click", function () {
        if (!started) {
            startPlayback();
        }
    });

    video.addEventListener("error", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
        attached = false;
    });
}
