(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.hero-thumb'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    thumbs.forEach(function (thumb, thumbIndex) {
      thumb.classList.toggle('active', thumbIndex === current);
    });
  }

  thumbs.forEach(function (thumb, index) {
    thumb.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var searchPageInput = document.querySelector('[data-search-input]');
  var typeSelect = document.querySelector('[data-type-select]');
  var yearSelect = document.querySelector('[data-year-select]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var emptyMessage = document.querySelector('.empty-message');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applySearch() {
    var query = normalize(searchPageInput ? searchPageInput.value : '');
    var typeValue = normalize(typeSelect ? typeSelect.value : '');
    var yearValue = normalize(yearSelect ? yearSelect.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-tags')
      ].join(' '));
      var year = normalize(card.getAttribute('data-year'));
      var genre = normalize(card.getAttribute('data-genre'));
      var queryMatch = !query || text.indexOf(query) !== -1;
      var typeMatch = !typeValue || genre.indexOf(typeValue) !== -1 || text.indexOf(typeValue) !== -1;
      var yearMatch = !yearValue || year === yearValue;
      var shouldShow = queryMatch && typeMatch && yearMatch;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyMessage) {
      emptyMessage.style.display = visible ? 'none' : 'block';
    }
  }

  if (searchPageInput || typeSelect || yearSelect) {
    var params = new URLSearchParams(window.location.search);
    var queryParam = params.get('q');
    if (queryParam && searchPageInput) {
      searchPageInput.value = queryParam;
    }
    [searchPageInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applySearch);
        control.addEventListener('change', applySearch);
      }
    });
    applySearch();
  }

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  if (filterButtons.length) {
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = normalize(button.getAttribute('data-filter'));
        filterButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        cards.forEach(function (card) {
          var cardText = normalize(card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags'));
          card.style.display = value === 'all' || cardText.indexOf(value) !== -1 ? '' : 'none';
        });
      });
    });
  }
})();
