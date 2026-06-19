document.addEventListener("DOMContentLoaded", function () {
  initializeMobileNavigation();
  initializeMovieCardFilters();
});

function initializeMobileNavigation() {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", function () {
    panel.classList.toggle("is-open");
    toggle.textContent = panel.classList.contains("is-open") ? "×" : "☰";
  });
}

function initializeMovieCardFilters() {
  var keywordInput = document.querySelector("[data-filter-input]");
  var regionSelect = document.querySelector("[data-region-filter]");
  var yearSelect = document.querySelector("[data-year-filter]");
  var countLabel = document.querySelector("[data-filter-count]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

  if (!cards.length || (!keywordInput && !regionSelect && !yearSelect)) {
    return;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilters() {
    var keyword = normalize(keywordInput ? keywordInput.value : "");
    var region = normalize(regionSelect ? regionSelect.value : "");
    var year = normalize(yearSelect ? yearSelect.value : "");
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].map(normalize).join(" ");

      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesRegion = !region || normalize(card.dataset.region) === region;
      var matchesYear = !year || normalize(card.dataset.year) === year;
      var isVisible = matchesKeyword && matchesRegion && matchesYear;

      card.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (countLabel) {
      countLabel.textContent = "已显示 " + visibleCount + " 部";
    }
  }

  [keywordInput, regionSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  applyFilters();
}
