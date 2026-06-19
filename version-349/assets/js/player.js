(function () {
  var wrap = document.querySelector('.player-wrap');
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-play-overlay]');
  if (!wrap || !video || !overlay) {
    return;
  }

  var source = overlay.getAttribute('data-src');
  var ready = false;

  function bindSource() {
    if (ready || !source) {
      return Promise.resolve();
    }
    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return Promise.resolve();
    }

    video.src = source;
    return Promise.resolve();
  }

  function playVideo() {
    bindSource().then(function () {
      overlay.classList.add('hidden');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    });
  }

  overlay.addEventListener('click', playVideo);
  wrap.addEventListener('click', function (event) {
    if (event.target === video && !ready) {
      playVideo();
    }
  });
})();
