(function () {
    const menuButton = document.querySelector('.menu-toggle');
    const mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            const expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            mobilePanel.hidden = expanded;
            menuButton.textContent = expanded ? '☰' : '×';
        });
    }

    document.querySelectorAll('.global-search-form').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = form.querySelector('input[name="q"]');
            const query = input ? input.value.trim() : '';
            if (query) {
                window.location.href = './search.html?q=' + encodeURIComponent(query);
            } else {
                window.location.href = './search.html';
            }
        });
    });

    const slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        const slides = Array.from(slider.querySelectorAll('.hero-slide'));
        const dots = Array.from(slider.querySelectorAll('.hero-dot'));
        let current = 0;
        let timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                const index = Number(dot.dataset.slide || 0);
                showSlide(index);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        const searchInput = root.querySelector('[data-filter-search]');
        const yearSelect = root.querySelector('[data-filter-year]');
        const typeSelect = root.querySelector('[data-filter-type]');
        const resetButton = root.querySelector('[data-filter-reset]');
        const countNode = root.querySelector('[data-filter-count]');
        const cards = Array.from(root.querySelectorAll('[data-movie-card]'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function cardMatches(card, query, year, type) {
            const haystack = [
                card.dataset.title,
                card.dataset.year,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.category,
                card.textContent
            ].map(normalize).join(' ');

            const queryOk = !query || haystack.includes(query);
            const yearOk = !year || card.dataset.year === year;
            const typeOk = !type || card.dataset.type === type;
            return queryOk && yearOk && typeOk;
        }

        function applyFilters() {
            const query = normalize(searchInput ? searchInput.value : '');
            const year = yearSelect ? yearSelect.value : '';
            const type = typeSelect ? typeSelect.value : '';
            let visible = 0;

            cards.forEach(function (card) {
                const matched = cardMatches(card, query, year, type);
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = String(visible);
            }
        }

        [searchInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                applyFilters();
            });
        }

        applyFilters();
    });

    const searchForm = document.getElementById('search-page-form');
    const searchInput = document.getElementById('search-page-input');
    const searchStatus = document.getElementById('search-status');
    const searchResults = document.getElementById('search-results');

    function movieCardHtml(movie) {
        const safe = function (value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };

        return `
                <article class="movie-card">
                    <a class="card-poster" href="${safe(movie.url)}" aria-label="观看 ${safe(movie.title)}">
                        <img src="${safe(movie.poster)}" alt="${safe(movie.title)}" loading="lazy">
                        <span class="year-badge">${safe(movie.year)}</span>
                        <span class="play-badge">▶</span>
                    </a>
                    <div class="card-body">
                        <div class="card-meta">
                            <span>${safe(movie.type)}</span>
                            <span>${safe(movie.region)}</span>
                        </div>
                        <h3><a href="${safe(movie.url)}">${safe(movie.title)}</a></h3>
                        <p>${safe(movie.intro)}</p>
                        <div class="tag-row"><span>${safe(movie.category)}</span><span>${safe(movie.genre)}</span></div>
                    </div>
                </article>`;
    }

    function runSearch(query) {
        if (!searchResults || !searchStatus || !window.MOVIE_INDEX) {
            return;
        }

        const normalized = String(query || '').trim().toLowerCase();
        if (!normalized) {
            searchResults.innerHTML = '';
            searchStatus.textContent = '请输入关键词开始搜索。';
            return;
        }

        const results = window.MOVIE_INDEX.filter(function (movie) {
            return [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.tags,
                movie.category,
                movie.intro
            ].join(' ').toLowerCase().includes(normalized);
        });

        searchStatus.textContent = '找到 ' + results.length + ' 部相关影片。';
        searchResults.innerHTML = results.slice(0, 240).map(movieCardHtml).join('');
    }

    if (searchForm && searchInput) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';
        searchInput.value = initialQuery;
        runSearch(initialQuery);

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const query = searchInput.value.trim();
            const nextUrl = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
            window.history.replaceState({}, '', nextUrl);
            runSearch(query);
        });

        searchInput.addEventListener('input', function () {
            runSearch(searchInput.value);
        });
    }
})();
