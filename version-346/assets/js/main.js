(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function auto() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                auto();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                auto();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
                auto();
            });
        });

        show(0);
        auto();
    });

    document.querySelectorAll('[data-scroll-row]').forEach(function (row) {
        var section = row.closest('.section');
        if (!section) {
            return;
        }
        var left = section.querySelector('[data-scroll-left]');
        var right = section.querySelector('[data-scroll-right]');
        if (left) {
            left.addEventListener('click', function () {
                row.scrollBy({ left: -420, behavior: 'smooth' });
            });
        }
        if (right) {
            right.addEventListener('click', function () {
                row.scrollBy({ left: 420, behavior: 'smooth' });
            });
        }
    });

    function applyFilters(root) {
        var input = root.querySelector('[data-filter-input]');
        var select = root.querySelector('[data-year-select]');
        var items = Array.prototype.slice.call(root.querySelectorAll('[data-filter-item]'));
        var params = new URLSearchParams(window.location.search);
        if (input && params.get('q') && !input.value) {
            input.value = params.get('q');
        }
        if (!items.length || (!input && !select)) {
            return;
        }

        function update() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var year = select ? select.value : '';
            items.forEach(function (item) {
                var haystack = [
                    item.getAttribute('data-title') || '',
                    item.getAttribute('data-year') || '',
                    item.getAttribute('data-region') || '',
                    item.getAttribute('data-genre') || ''
                ].join(' ').toLowerCase();
                var itemYear = item.getAttribute('data-year') || '';
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedYear = !year || itemYear === year;
                item.classList.toggle('is-hidden', !(matchedQuery && matchedYear));
            });
        }

        if (input) {
            input.addEventListener('input', update);
        }
        if (select) {
            select.addEventListener('change', update);
        }
        update();
    }

    applyFilters(document);

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.play-overlay');
        var stream = player.getAttribute('data-stream');
        var hls = null;
        var loaded = false;

        function start() {
            if (!video || !stream) {
                return;
            }
            if (button) {
                button.hidden = true;
            }
            if (!loaded) {
                loaded = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                        hls.loadSource(stream);
                        video.play().catch(function () {
                            if (button) {
                                button.hidden = false;
                            }
                        });
                    });
                } else {
                    video.src = stream;
                    video.play().catch(function () {
                        if (button) {
                            button.hidden = false;
                        }
                    });
                }
            } else {
                video.play().catch(function () {
                    if (button) {
                        button.hidden = false;
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        video.addEventListener('play', function () {
            if (button) {
                button.hidden = true;
            }
        });

        video.addEventListener('error', function () {
            if (button && !video.currentTime) {
                button.hidden = false;
            }
        });

        player.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                start();
            }
        });
    });
})();
