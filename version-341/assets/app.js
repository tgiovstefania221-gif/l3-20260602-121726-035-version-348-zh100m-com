(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var heroIndex = 0;
    var timer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === heroIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === heroIndex);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        stopHero();
        timer = window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5000);
    }

    function stopHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showHero(index);
            startHero();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            showHero(heroIndex - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showHero(heroIndex + 1);
            startHero();
        });
    }

    startHero();

    var searchInput = document.querySelector("[data-search-input]");
    var yearFilter = document.querySelector("[data-filter-year]");
    var regionFilter = document.querySelector("[data-filter-region]");
    var typeFilter = document.querySelector("[data-filter-type]");
    var categoryFilter = document.querySelector("[data-filter-category]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var emptyState = document.querySelector("[data-empty-state]");

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setInitialSearch() {
        if (!searchInput) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
            searchInput.value = q;
        }
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }
        var q = normalize(searchInput && searchInput.value);
        var year = normalize(yearFilter && yearFilter.value);
        var region = normalize(regionFilter && regionFilter.value);
        var type = normalize(typeFilter && typeFilter.value);
        var category = normalize(categoryFilter && categoryFilter.value);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type"),
                card.getAttribute("data-category"),
                card.getAttribute("data-tags")
            ].join(" "));
            var matched = true;

            if (q && haystack.indexOf(q) === -1) {
                matched = false;
            }
            if (year && normalize(card.getAttribute("data-year")) !== year) {
                matched = false;
            }
            if (region && normalize(card.getAttribute("data-region")) !== region) {
                matched = false;
            }
            if (type && normalize(card.getAttribute("data-type")) !== type) {
                matched = false;
            }
            if (category && normalize(card.getAttribute("data-category")) !== category) {
                matched = false;
            }

            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    [searchInput, yearFilter, regionFilter, typeFilter, categoryFilter].forEach(function (control) {
        if (control) {
            control.addEventListener("input", filterCards);
            control.addEventListener("change", filterCards);
        }
    });

    setInitialSearch();
    filterCards();

    var backTop = document.querySelector("[data-back-top]");
    if (backTop) {
        window.addEventListener("scroll", function () {
            backTop.classList.toggle("is-visible", window.scrollY > 500);
        });
        backTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}());
