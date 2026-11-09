/* The site remains readable and navigable without JavaScript. */
document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const menu = document.getElementById('primary-nav');
function setMenu(open) {
  menuButton?.setAttribute('aria-expanded', String(open));
  if (menu) menu.dataset.open = String(open);
}
menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header')) setMenu(false);
});

const comparisonTabs = Array.from(document.querySelectorAll('[data-compare]'));
function selectComparison(tab, focus = false) {
  comparisonTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(item.dataset.compare);
    if (panel) panel.hidden = !selected;
  });
  if (focus) tab.focus();
}
comparisonTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectComparison(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % comparisonTabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + comparisonTabs.length) % comparisonTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = comparisonTabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectComparison(comparisonTabs[next], true);
    }
  });
});

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!motionPreference.matches && 'IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      reveal.unobserve(entry.target);
    }
  }), { threshold: 0.06, rootMargin: '0px 0px 40px 0px' });
  document.querySelectorAll('.track-panel,.project-card,.profile,.capabilities,.related,.case-story>section').forEach(item => {
    item.classList.add('reveal');
    reveal.observe(item);
  });
  document.documentElement.classList.add('motion-ok');
  motionPreference.addEventListener('change', event => {
    if (event.matches) document.documentElement.classList.remove('motion-ok');
  });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (target && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target?.focus({ preventScroll: true });
  });
});

function enableProjectSearch() {
  const browser = document.querySelector('[data-project-browser]');
  const form = browser?.querySelector('[data-project-search]');
  const field = form?.querySelector('input[name="q"]');
  const count = browser?.querySelector('[data-project-count]');
  const empty = browser?.querySelector('[data-project-empty]');
  if (!form || !field || !count || !empty) return;

  const clear = form.querySelector('[data-project-clear]');
  const reset = empty.querySelector('[data-project-reset]');
  const cards = Array.from(browser.querySelectorAll('.browse-grid > article.browse-card[data-search]'), card => ({
    card,
    searchable: card.dataset.search.toLowerCase()
  }));
  const views = Array.from(document.querySelectorAll('.browse-views a[href]'), link => ({
    link,
    href: link.getAttribute('href'),
    url: link.href
  }));

  function updateQuery(url, query) {
    if (query && url.searchParams.get('q') !== query) url.searchParams.set('q', query);
    if (!query && url.searchParams.has('q')) url.searchParams.delete('q');
  }

  function filterProjects() {
    const query = field.value.trim();
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    let matches = 0;
    cards.forEach(({ card, searchable }) => {
      const shown = terms.every(term => searchable.includes(term));
      card.hidden = !shown;
      if (shown) matches++;
    });

    const label = cards.length === 1 ? 'project' : 'projects';
    const announcement = query ? `${matches} of ${cards.length} ${label} shown` : `${cards.length} ${label} shown`;
    if (count.textContent !== announcement) count.textContent = announcement;
    empty.hidden = matches !== 0;
    if (clear) clear.hidden = field.value.length === 0;

    const current = new URL(window.location.href);
    updateQuery(current, query);
    if (current.href !== window.location.href) {
      try {
        window.history.replaceState(window.history.state, '', current);
      } catch (error) {
        // A local file preview can restrict History API URL changes.
        if (error.name !== 'SecurityError') throw error;
      }
    }
    views.forEach(({ link, href, url }) => {
      const target = new URL(url);
      updateQuery(target, query);
      link.setAttribute('href', target.href === url ? href : target.href);
    });
  }

  function restoreSearch() {
    field.value = new URL(window.location.href).searchParams.get('q') || '';
    filterProjects();
  }

  function clearSearch() {
    field.value = '';
    filterProjects();
    field.focus();
  }

  field.addEventListener('input', filterProjects);
  form.addEventListener('submit', event => {
    event.preventDefault();
    filterProjects();
  });
  clear?.addEventListener('click', clearSearch);
  reset?.addEventListener('click', clearSearch);
  window.addEventListener('popstate', restoreSearch);
  restoreSearch();
  form.hidden = false;
}

enableProjectSearch();
