(function () {
    document.querySelectorAll('[data-player]').forEach(function (playerCard) {
        const video = playerCard.querySelector('video[data-video-src]');
        const playButton = playerCard.querySelector('[data-play-button]');
        let hlsInstance = null;
        let isReady = false;

        if (!video) {
            return;
        }

        function attachSource() {
            if (isReady) {
                return;
            }

            const source = video.dataset.videoSrc;
            if (!source) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                isReady = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                isReady = true;
                return;
            }

            video.src = source;
            isReady = true;
        }

        function playVideo() {
            attachSource();
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    playerCard.classList.remove('is-playing');
                });
            }
        }

        if (playButton) {
            playButton.addEventListener('click', function () {
                playerCard.classList.add('is-playing');
                playVideo();
            });
        }

        video.addEventListener('play', function () {
            playerCard.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                playerCard.classList.remove('is-playing');
            }
        });

        video.addEventListener('ended', function () {
            playerCard.classList.remove('is-playing');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
