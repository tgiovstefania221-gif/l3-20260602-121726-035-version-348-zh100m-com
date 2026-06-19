(function () {
  var player = document.querySelector('[data-player]');

  if (!player) {
    return;
  }

  var video = player.querySelector('video');
  var button = player.querySelector('[data-play-button]');
  var stream = player.getAttribute('data-stream');
  var ready = false;
  var hls = null;

  function attachStream() {
    if (ready || !video || !stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    ready = true;
  }

  function start(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    attachStream();
    player.classList.add('is-playing');

    var playTask = video.play();

    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  player.addEventListener('click', function (event) {
    if (event.target === video || event.target.closest('[data-play-button]')) {
      start(event);
    }
  });

  video.addEventListener('play', function () {
    player.classList.add('is-playing');
  });

  video.addEventListener('ended', function () {
    player.classList.remove('is-playing');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
