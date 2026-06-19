import { H as Hls } from "./hls-vendor-dru42stk.js";

document.addEventListener("DOMContentLoaded", function () {
  var shell = document.querySelector("[data-player]");

  if (!shell) {
    return;
  }

  var video = shell.querySelector("video");
  var playButton = shell.querySelector("[data-play-button]");
  var status = shell.querySelector("[data-player-status]");
  var source = shell.dataset.videoSrc;
  var hlsInstance = null;
  var hasStarted = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message || "";
    }
  }

  function hideOverlay() {
    if (playButton) {
      playButton.classList.add("is-hidden");
    }
  }

  function attachNativeHls() {
    video.src = source;
    video.addEventListener("loadedmetadata", function () {
      video.play().catch(function () {
        setStatus("浏览器阻止了自动播放，请再次点击播放按钮。 ");
        if (playButton) {
          playButton.classList.remove("is-hidden");
        }
      });
    }, { once: true });
  }

  function attachHlsJs() {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus("播放源已加载，正在播放。 ");
      video.play().catch(function () {
        setStatus("浏览器阻止了自动播放，请再次点击播放按钮。 ");
        if (playButton) {
          playButton.classList.remove("is-hidden");
        }
      });
    });

    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setStatus("网络加载异常，正在重试播放源。 ");
        hlsInstance.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setStatus("媒体解码异常，正在尝试恢复。 ");
        hlsInstance.recoverMediaError();
      } else {
        setStatus("当前播放源暂时无法播放，请稍后重试。 ");
        hlsInstance.destroy();
      }
    });
  }

  function startPlayback() {
    if (!source || !video) {
      setStatus("未找到播放源。 ");
      return;
    }

    hideOverlay();
    setStatus("正在加载播放源... ");
    video.controls = true;

    if (!hasStarted) {
      hasStarted = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        attachNativeHls();
      } else if (Hls.isSupported()) {
        attachHlsJs();
      } else {
        setStatus("当前浏览器不支持 HLS 播放。 ");
      }
    } else {
      video.play().catch(function () {
        setStatus("请再次点击视频区域继续播放。 ");
      });
    }
  }

  if (playButton) {
    playButton.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
});
