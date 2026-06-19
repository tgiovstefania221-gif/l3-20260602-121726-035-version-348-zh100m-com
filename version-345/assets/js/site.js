(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
    forms.forEach(function (form) {
      var scopeSelector = form.getAttribute('data-filter-form');
      var scope = document.querySelector(scopeSelector);
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var search = form.querySelector('[name="q"]');
      var year = form.querySelector('[name="year"]');
      var type = form.querySelector('[name="type"]');
      var sort = form.querySelector('[name="sort"]');
      var empty = document.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      if (search && params.get('q')) {
        search.value = params.get('q');
      }

      function apply() {
        var q = normalize(search && search.value);
        var y = normalize(year && year.value);
        var t = normalize(type && type.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category'),
            card.getAttribute('data-tags')
          ].join(' '));
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (y && normalize(card.getAttribute('data-year')) !== y) {
            ok = false;
          }
          if (t && normalize(card.getAttribute('data-type')) !== t) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      function sortCards() {
        if (!sort) {
          return;
        }
        var mode = sort.value;
        var sorted = cards.slice().sort(function (a, b) {
          var ay = parseInt(a.getAttribute('data-year'), 10) || 0;
          var by = parseInt(b.getAttribute('data-year'), 10) || 0;
          var at = a.getAttribute('data-title') || '';
          var bt = b.getAttribute('data-title') || '';
          if (mode === 'year-asc') {
            return ay - by;
          }
          if (mode === 'title') {
            return at.localeCompare(bt, 'zh-Hans-CN');
          }
          return by - ay;
        });
        sorted.forEach(function (card) {
          scope.appendChild(card);
        });
      }

      ['input', 'change'].forEach(function (eventName) {
        form.addEventListener(eventName, function () {
          sortCards();
          apply();
        });
      });
      sortCards();
      apply();
    });
  }

  function setupPlayer() {
    var root = document.querySelector('[data-player-root]');
    if (!root) {
      return;
    }
    var video = root.querySelector('video');
    var overlay = root.querySelector('.play-overlay');
    var src = root.getAttribute('data-video-url');
    var started = false;
    var hlsInstance = null;

    function attach() {
      if (!video || !src || started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function begin() {
      attach();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', begin);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          begin();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
