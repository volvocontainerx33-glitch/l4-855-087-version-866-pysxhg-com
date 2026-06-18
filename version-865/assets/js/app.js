(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function initMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
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

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('form.site-search'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input) {
          return;
        }
        var q = input.value.trim();
        if (!q) {
          event.preventDefault();
          window.location.href = './search.html';
          return;
        }
      });
    });
  }

  function normalize(text) {
    return (text || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function initFilters() {
    var filterList = document.querySelector('.filter-list');
    var input = document.querySelector('.filter-input');
    var select = document.querySelector('.filter-select');
    if (!filterList || (!input && !select)) {
      return;
    }
    var cards = Array.prototype.slice.call(filterList.children);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (input && q) {
      input.value = q;
    }

    function matches(card, term, year) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-tags')
      ].join(' '));
      var cardYear = card.getAttribute('data-year') || '';
      var okTerm = !term || haystack.indexOf(term) !== -1;
      var okYear = !year || cardYear === year;
      return okTerm && okYear;
    }

    function apply() {
      var term = normalize(input ? input.value : '');
      var year = select ? select.value : '';
      cards.forEach(function (card) {
        card.style.display = matches(card, term, year) ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (select) {
      select.addEventListener('change', apply);
    }
    apply();
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchForms();
    initFilters();
  });
})();
