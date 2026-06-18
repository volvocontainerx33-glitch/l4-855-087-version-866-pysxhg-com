(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (menuButton && nav) {
      menuButton.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var value = input ? input.value.trim() : "";
        if (value) {
          window.location.href = "./search.html?q=" + encodeURIComponent(value);
        }
      });
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var filterInputs = document.querySelectorAll("[data-filter-input]");
    filterInputs.forEach(function (input) {
      if (query && input.hasAttribute("data-fill-query")) {
        input.value = query;
      }
      var run = function () {
        var target = input.getAttribute("data-filter-input") || "[data-filter-card]";
        var cards = document.querySelectorAll(target);
        var empty = document.querySelector("[data-no-results]");
        var needle = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var matched = !needle || haystack.indexOf(needle) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };
      input.addEventListener("input", run);
      run();
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var active = 0;
      var show = function (index) {
        active = index % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      if (slides.length > 1) {
        setInterval(function () {
          show(active + 1);
        }, 5200);
      }
    }
  });

  window.initMoviePlayer = function (src) {
    ready(function () {
      var video = document.getElementById("movie-player");
      var overlay = document.getElementById("play-overlay");
      if (!video || !src) {
        return;
      }
      var attached = false;
      var hlsInstance = null;
      var attach = function () {
        if (attached) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = src;
        }
        attached = true;
      };
      var play = function () {
        attach();
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      };
      if (overlay) {
        overlay.addEventListener("click", play);
      }
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };
})();
