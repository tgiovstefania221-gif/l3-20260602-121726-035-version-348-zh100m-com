const nav = document.getElementById("siteNav");
const menuButton = document.querySelector("[data-menu-toggle]");

if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
        nav.classList.toggle("is-open");
    });
}

const slides = Array.from(document.querySelectorAll(".hero-slide"));
const dots = Array.from(document.querySelectorAll(".hero-dot"));
let heroIndex = 0;
let heroTimer = null;

function setHero(index) {
    if (!slides.length) {
        return;
    }

    heroIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, current) => {
        slide.classList.toggle("is-active", current === heroIndex);
    });
    dots.forEach((dot, current) => {
        dot.classList.toggle("is-active", current === heroIndex);
    });
}

function startHero() {
    if (slides.length < 2) {
        return;
    }

    heroTimer = window.setInterval(() => {
        setHero(heroIndex + 1);
    }, 5200);
}

dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        window.clearInterval(heroTimer);
        setHero(index);
        startHero();
    });
});

setHero(0);
startHero();

const filterInput = document.querySelector("[data-filter-input]");
const yearSelect = document.querySelector("[data-year-filter]");
const sortSelect = document.querySelector("[data-sort-select]");
const cardGrid = document.querySelector("[data-card-grid]");

function cards() {
    return Array.from(document.querySelectorAll(".movie-card"));
}

function applyFilters() {
    const keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
    const year = yearSelect ? yearSelect.value : "";

    cards().forEach((card) => {
        const title = (card.dataset.title || "").toLowerCase();
        const genre = (card.dataset.genre || "").toLowerCase();
        const region = (card.dataset.region || "").toLowerCase();
        const cardYear = card.dataset.year || "";
        const textMatch = !keyword || title.includes(keyword) || genre.includes(keyword) || region.includes(keyword);
        const yearMatch = !year || cardYear === year;
        card.style.display = textMatch && yearMatch ? "" : "none";
    });
}

function applySort() {
    if (!cardGrid || !sortSelect) {
        return;
    }

    const value = sortSelect.value;
    const ordered = cards().sort((a, b) => {
        const ay = Number(a.dataset.year || 0);
        const by = Number(b.dataset.year || 0);
        const at = a.dataset.title || "";
        const bt = b.dataset.title || "";

        if (value === "year-asc") {
            return ay - by;
        }
        if (value === "title") {
            return at.localeCompare(bt, "zh-Hans-CN");
        }
        return by - ay;
    });

    ordered.forEach((card) => cardGrid.appendChild(card));
    applyFilters();
}

if (filterInput) {
    filterInput.addEventListener("input", applyFilters);
}

if (yearSelect) {
    yearSelect.addEventListener("change", applyFilters);
}

if (sortSelect) {
    sortSelect.addEventListener("change", applySort);
}

const searchForm = document.querySelector("[data-search-form]");
if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = searchForm.querySelector("input");
        const query = input ? input.value.trim() : "";
        const target = query ? `search.html?q=${encodeURIComponent(query)}` : "search.html";
        window.location.href = target;
    });
}

if (filterInput) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query) {
        filterInput.value = query;
        applyFilters();
    }
}
