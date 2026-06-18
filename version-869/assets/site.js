(function() {
  function queryAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function() {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = queryAll('[data-hero-slide]', hero);
    var dots = queryAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function getQueryValue() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function filterCards(term, year) {
    var normalizedTerm = normalize(term);
    var normalizedYear = normalize(year);
    queryAll('[data-movie-card]').forEach(function(card) {
      var searchable = normalize(card.getAttribute('data-search'));
      var matchesTerm = !normalizedTerm || searchable.indexOf(normalizedTerm) !== -1;
      var matchesYear = !normalizedYear || searchable.indexOf(normalizedYear) !== -1;
      card.classList.toggle('hidden-by-filter', !(matchesTerm && matchesYear));
    });
  }

  function initSearchFilters() {
    var searchInput = document.querySelector('[data-search-input]');
    var localInput = document.querySelector('[data-local-search]');
    var select = document.querySelector('[data-filter-select]');
    var current = getQueryValue();

    if (searchInput) {
      searchInput.value = current;
      filterCards(current, '');
      searchInput.addEventListener('input', function() {
        filterCards(searchInput.value, select ? select.value : '');
      });
    }

    if (localInput) {
      localInput.addEventListener('input', function() {
        filterCards(localInput.value, select ? select.value : '');
      });
    }

    if (select) {
      select.addEventListener('change', function() {
        filterCards(localInput ? localInput.value : current, select.value);
      });
    }
  }

  window.bindMoviePlayer = function(streamUrl) {
    var video = document.getElementById('movie-video');
    var cover = document.querySelector('[data-player-cover]');
    var buttons = queryAll('[data-play-button]');
    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      video.setAttribute('data-ready', '1');
    }

    function playMovie() {
      attachStream();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function() {});
      }
    }

    buttons.forEach(function(button) {
      button.addEventListener('click', playMovie);
    });

    if (cover) {
      cover.addEventListener('click', playMovie);
    }

    video.addEventListener('click', function() {
      if (video.paused) {
        playMovie();
      }
    });

    attachStream();
  };

  document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initHero();
    initSearchFilters();
  });
})();
