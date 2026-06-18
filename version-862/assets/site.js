(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });
    start();
  }

  function setupSearch() {
    var root = document.querySelector("[data-search-page]");
    if (!root) {
      return;
    }
    var input = document.getElementById("searchInput");
    var year = document.getElementById("yearFilter");
    var region = document.getElementById("regionFilter");
    var clear = document.getElementById("clearSearch");
    var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
    }
    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }
    function filter() {
      var keyword = normalize(input && input.value);
      var selectedYear = normalize(year && year.value);
      var selectedRegion = normalize(region && region.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.year
        ].join(" "));
        var okKeyword = !keyword || haystack.indexOf(keyword) >= 0;
        var okYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
        var okRegion = !selectedRegion || normalize(card.dataset.region) === selectedRegion;
        card.classList.toggle("is-hidden", !(okKeyword && okYear && okRegion));
      });
    }
    [input, year, region].forEach(function (el) {
      if (el) {
        el.addEventListener("input", filter);
        el.addEventListener("change", filter);
      }
    });
    if (clear) {
      clear.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (year) {
          year.value = "";
        }
        if (region) {
          region.value = "";
        }
        filter();
      });
    }
    filter();
  }

  window.initMoviePlayer = function (url) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playerOverlay");
    var initialized = false;
    if (!video || !url) {
      return;
    }
    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }
    function attach() {
      if (initialized) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }
    function play() {
      attach();
      hideOverlay();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", hideOverlay);
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
