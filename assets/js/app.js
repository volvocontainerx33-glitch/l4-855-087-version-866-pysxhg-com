
(function () {
  function getBasePath() {
    return document.body ? document.body.getAttribute('data-base') || '' : '';
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initSiteSearchForms() {
    var forms = document.querySelectorAll('[data-site-search]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        if (!query) {
          return;
        }
        window.location.href = getBasePath() + 'search.html?q=' + encodeURIComponent(query);
      });
    });
  }

  function initHeroCarousel() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5500);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    show(0);
    restart();
  }

  function initImageFallbacks() {
    var images = document.querySelectorAll('[data-cover]');
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing-image');
        var parent = image.parentElement;
        if (parent) {
          parent.classList.add('is-missing-image');
        }
      }, { once: true });
    });
  }

  function initCatalogFilters() {
    var page = document.querySelector('[data-catalog-page]');
    if (!page) {
      return;
    }
    var input = page.querySelector('[data-filter-input]');
    var selects = Array.prototype.slice.call(page.querySelectorAll('[data-filter-field]'));
    var reset = page.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(page.querySelectorAll('[data-card]'));
    var count = page.querySelector('[data-result-count]');

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var activeFilters = {};
      selects.forEach(function (select) {
        activeFilters[select.getAttribute('data-filter-field')] = select.value;
      });
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        Object.keys(activeFilters).forEach(function (field) {
          var value = activeFilters[field];
          if (value && String(card.getAttribute('data-' + field) || '') !== value) {
            matched = false;
          }
        });
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = String(visible);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        selects.forEach(function (select) {
          select.value = '';
        });
        applyFilters();
      });
    }
    applyFilters();
  }

  function createResultCard(movie) {
    var base = getBasePath();
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag-chip">' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card movie-card--search">' +
      '  <a class="poster" data-title="' + escapeHtml(movie.title) + '" href="' + base + movie.url + '">' +
      '    <img src="' + base + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-cover>' +
      '    <span class="play-badge">▶</span><span class="poster-gradient"></span>' +
      '  </a>' +
      '  <div class="movie-card__body">' +
      '    <div class="movie-card__meta"><span>' + escapeHtml(movie.categoryLabel) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
      '    <h3><a href="' + base + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '    <p>' + escapeHtml(movie.oneLine || '') + '</p>' +
      '    <div class="movie-card__tags">' + tags + '</div>' +
      '  </div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var input = document.querySelector('[data-search-page-input]');
    var button = document.querySelector('[data-search-page-button]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-result-count]');
    if (!input || !button || !results || !count || !window.MOVIE_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function render() {
      var query = input.value.trim().toLowerCase();
      var matched = window.MOVIE_DATA.filter(function (movie) {
        if (!query) {
          return true;
        }
        var text = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.categoryLabel,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();
        return text.indexOf(query) !== -1;
      }).slice(0, 120);
      count.textContent = String(matched.length);
      results.innerHTML = matched.map(createResultCard).join('');
      initImageFallbacks();
    }

    button.addEventListener('click', render);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        render();
      }
    });
    render();
  }

  function initPlayers() {
    var players = document.querySelectorAll('[data-player]');
    players.forEach(function (wrapper) {
      var video = wrapper.querySelector('video');
      var button = wrapper.querySelector('[data-play-button]');
      var status = wrapper.querySelector('[data-player-status]');
      var src = wrapper.getAttribute('data-video-url');
      var hlsInstance = null;
      var ready = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function playVideo() {
        if (!video || !src) {
          setStatus('未找到可用播放源。');
          return;
        }
        if (ready) {
          video.play().catch(function () {
            setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
          });
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          ready = true;
          setStatus('正在使用浏览器原生 HLS 播放。');
          video.play().catch(function () {
            setStatus('请再次点击播放按钮开始播放。');
          });
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            ready = true;
            setStatus('HLS 清单已加载，正在播放。');
            video.play().catch(function () {
              setStatus('请再次点击播放按钮开始播放。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setStatus('播放源暂时不可用，请刷新或稍后重试。');
              if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
              }
              ready = false;
            }
          });
          return;
        }
        setStatus('当前浏览器不支持 HLS 播放，请更换支持的浏览器。');
      }

      if (button) {
        button.addEventListener('click', function () {
          button.classList.add('is-hidden');
          playVideo();
        });
      }
      if (video) {
        video.addEventListener('play', function () {
          if (button) {
            button.classList.add('is-hidden');
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSiteSearchForms();
    initHeroCarousel();
    initImageFallbacks();
    initCatalogFilters();
    initSearchPage();
    initPlayers();
  });
})();
