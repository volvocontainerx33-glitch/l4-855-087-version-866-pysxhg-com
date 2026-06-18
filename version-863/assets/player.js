function initMoviePlayer(source) {
  const video = document.getElementById('movieVideo');
  const cover = document.querySelector('[data-play-cover]');
  const starters = Array.from(document.querySelectorAll('[data-start-player]'));
  let ready = false;
  let hls = null;

  if (!video || !source) {
    return;
  }

  const load = function () {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      return;
    }

    video.src = source;
    video.load();
  };

  const start = function () {
    load();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    video.controls = true;

    const playTask = video.play();

    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  };

  if (cover) {
    cover.addEventListener('click', start);
  }

  starters.forEach(function (button) {
    button.addEventListener('click', start);
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });
}
