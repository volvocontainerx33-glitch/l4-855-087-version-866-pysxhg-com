(function() {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        showSlide(dotIndex);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var pageFilter = document.querySelector("[data-page-filter]");
  var searchInput = document.querySelector("[data-search-input]");
  var categorySelect = document.querySelector("[data-category-select]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
  var emptyState = document.querySelector("[data-empty-state]");

  function getQueryValue() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function applyFilter() {
    var term = "";
    var category = "all";

    if (pageFilter) {
      term = pageFilter.value.trim().toLowerCase();
    }

    if (searchInput) {
      term = searchInput.value.trim().toLowerCase();
    }

    if (categorySelect) {
      category = categorySelect.value;
    }

    var visible = 0;

    cards.forEach(function(card) {
      var matchesTerm = !term || (card.dataset.search || "").indexOf(term) !== -1;
      var matchesCategory = category === "all" || card.dataset.category === category;
      var show = matchesTerm && matchesCategory;
      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  if (searchInput) {
    searchInput.value = getQueryValue();
    searchInput.addEventListener("input", applyFilter);
  }

  if (pageFilter) {
    pageFilter.addEventListener("input", applyFilter);
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", applyFilter);
  }

  if (cards.length && (searchInput || pageFilter || categorySelect)) {
    applyFilter();
  }
}());
