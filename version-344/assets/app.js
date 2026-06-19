(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        schedule();
      });
    }

    showSlide(0);
    schedule();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var region = filterPanel.querySelector('[data-filter-region]');
    var type = filterPanel.querySelector('[data-filter-type]');
    var year = filterPanel.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        var ok = true;

        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }

        if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) {
          ok = false;
        }

        if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
          ok = false;
        }

        if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
      });
    }

    [input, region, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });
  }

  var resultBox = document.querySelector('[data-search-results]');

  if (resultBox && window.SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var searchInput = document.getElementById('searchPageInput');

    if (searchInput) {
      searchInput.value = query;
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderSearch(keyword) {
      var normalized = String(keyword || '').trim().toLowerCase();
      var results = window.SEARCH_INDEX.filter(function (item) {
        if (!normalized) {
          return true;
        }

        return [
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          (item.tags || []).join(' '),
          item.oneLine
        ].join(' ').toLowerCase().indexOf(normalized) !== -1;
      }).slice(0, 120);

      if (!results.length) {
        resultBox.innerHTML = '<div class="search-empty">未找到相关影片</div>';
        return;
      }

      resultBox.innerHTML = results.map(function (item) {
        return '<article class="movie-card">' +
          '<a class="card-media" href="' + escapeHtml(item.url) + '" aria-label="观看' + escapeHtml(item.title) + '">' +
          '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="region-badge">' + escapeHtml(item.region) + '</span>' +
          '<span class="year-badge">' + escapeHtml(item.year) + '</span>' +
          '<span class="card-play" aria-hidden="true"></span>' +
          '</a>' +
          '<div class="card-body">' +
          '<h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>' +
          '<p>' + escapeHtml(item.oneLine) + '</p>' +
          '<div class="card-meta"><span>' + escapeHtml(item.genre) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');
    }

    renderSearch(query);

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        renderSearch(searchInput.value);
      });
    }
  }
})();
