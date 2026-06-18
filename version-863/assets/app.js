(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', menu.classList.contains('is-open'));
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const show = function (next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  const grids = Array.from(document.querySelectorAll('[data-card-grid]'));

  grids.forEach(function (grid) {
    const search = document.querySelector('[data-card-search]');
    const selects = Array.from(document.querySelectorAll('[data-filter-field]'));
    const cards = Array.from(grid.querySelectorAll('.movie-card'));

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');

    if (q && search) {
      search.value = q;
    }

    const apply = function () {
      const text = search ? search.value.trim().toLowerCase() : '';
      const filters = selects.map(function (select) {
        return {
          field: select.getAttribute('data-filter-field'),
          value: select.value
        };
      });

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.year,
          card.dataset.tags,
          card.textContent
        ].join(' ').toLowerCase();

        const textMatch = !text || haystack.includes(text);
        const selectMatch = filters.every(function (filter) {
          return !filter.value || (card.dataset[filter.field] || '') === filter.value;
        });

        card.classList.toggle('is-hidden', !(textMatch && selectMatch));
      });
    };

    if (search) {
      search.addEventListener('input', apply);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });

    apply();
  });
})();
