import { H as Hls } from './hls-vendor.js';

const video = document.getElementById('movie-player');
const startButton = document.querySelector('[data-player-start]');
const source = video ? video.dataset.src : '';
let initialized = false;

function initializePlayer() {
  if (!video || !source || initialized) {
    return;
  }
  initialized = true;

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hls.loadSource(source);
    hls.attachMedia(video);
  } else {
    video.src = source;
  }

  video.controls = true;
  video.play().catch(function () {
    video.controls = true;
  });

  if (startButton) {
    startButton.classList.add('hidden');
  }
}

if (startButton) {
  startButton.addEventListener('click', initializePlayer);
}

if (video) {
  video.addEventListener('click', function () {
    if (!initialized) {
      initializePlayer();
    }
  });
}
