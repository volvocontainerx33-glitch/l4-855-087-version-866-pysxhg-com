
(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  var panels = document.querySelectorAll('[data-filter-panel]');
  panels.forEach(function (panel) {
    var scope = panel.closest('main') || document;
    var input = panel.querySelector('[data-filter-search]');
    var genre = panel.querySelector('[data-filter-genre]');
    var year = panel.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var g = genre ? genre.value : '';
      var y = year ? year.value : '';

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardGenre = card.getAttribute('data-genre') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var ok = true;

        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (g && cardGenre.indexOf(g) === -1) {
          ok = false;
        }
        if (y && cardYear !== y) {
          ok = false;
        }

        card.classList.toggle('hidden-card', !ok);
      });
    }

    [input, genre, year].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
  });
})();
