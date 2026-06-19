(function () {
  const root = document.body.dataset.root || '';

  const menuButton = document.querySelector('.mobile-menu-button');
  const mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const index = Number(dot.dataset.slide || 0);
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  const filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    const input = filterBar.querySelector('.page-filter');
    const yearButtons = Array.from(filterBar.querySelectorAll('[data-year-filter]'));
    const cards = Array.from(document.querySelectorAll('[data-card-list] .movie-card'));
    let activeYear = 'all';

    function applyPageFilter() {
      const query = (input ? input.value : '').trim().toLowerCase();
      cards.forEach(function (card) {
        const searchable = [
          card.dataset.title || '',
          card.dataset.year || '',
          card.dataset.region || '',
          card.dataset.category || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        const yearMatch = activeYear === 'all' || card.dataset.year === activeYear;
        const textMatch = !query || searchable.includes(query);
        card.style.display = yearMatch && textMatch ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', applyPageFilter);
    }

    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.dataset.yearFilter || 'all';
        yearButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyPageFilter();
      });
    });
  }

  const searchPage = document.querySelector('[data-search-page]');
  if (searchPage && Array.isArray(window.MOVIE_SEARCH_INDEX)) {
    const queryInput = document.getElementById('global-search-input');
    const categorySelect = document.getElementById('category-select');
    const yearInput = document.getElementById('year-input');
    const button = document.getElementById('run-search');
    const results = document.getElementById('search-results');
    const count = document.getElementById('search-count');
    const params = new URLSearchParams(window.location.search);

    if (queryInput) {
      queryInput.value = params.get('q') || params.get('keyword') || '';
    }
    if (categorySelect) {
      categorySelect.value = params.get('category') || '';
    }
    if (yearInput) {
      yearInput.value = params.get('year') || '';
    }

    function cardTemplate(movie) {
      const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span class="tag">' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '  <a class="movie-poster" href="' + root + movie.url + '">',
        '    <img src="' + root + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="movie-score">' + escapeHtml(movie.score) + '</span>',
        '    <span class="movie-play">播放</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="movie-meta-row">',
        '      <span>' + escapeHtml(String(movie.year)) + '</span>',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(movie.type) + '</span>',
        '    </div>',
        '    <h3><a href="' + root + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="movie-tags">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('\n');
    }

    function escapeHtml(text) {
      return String(text || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        }[char];
      });
    }

    function runSearch() {
      const query = (queryInput ? queryInput.value : '').trim().toLowerCase();
      const category = categorySelect ? categorySelect.value : '';
      const year = yearInput ? String(yearInput.value || '').trim() : '';
      const filtered = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        const text = [
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        const queryMatch = !query || text.includes(query);
        const categoryMatch = !category || movie.category === category;
        const yearMatch = !year || String(movie.year) === year;
        return queryMatch && categoryMatch && yearMatch;
      }).slice(0, 120);
      if (count) {
        count.textContent = '找到 ' + filtered.length + ' 条结果（最多显示 120 条）。';
      }
      if (results) {
        results.innerHTML = filtered.map(cardTemplate).join('\n');
      }
    }

    if (button) {
      button.addEventListener('click', runSearch);
    }
    [queryInput, categorySelect, yearInput].forEach(function (element) {
      if (element) {
        element.addEventListener('change', runSearch);
        element.addEventListener('keyup', function (event) {
          if (event.key === 'Enter') {
            runSearch();
          }
        });
      }
    });
    runSearch();
  }
})();
