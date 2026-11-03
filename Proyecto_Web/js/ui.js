const grid = document.querySelector('#grilla');
const counter = document.querySelector('#contador');
const loading = document.querySelector('#estado-cargando');
const errorPanel = document.querySelector('#estado-error');
const errorMessage = document.querySelector('#mensaje-error');
const loadMoreContainer = document.querySelector('#cargar-mas-contenedor');
const loadMoreButton = document.querySelector('#cargar-mas');
const loadMoreError = document.querySelector('#error-cargar-mas');
const loadMoreErrorMessage = document.querySelector('#mensaje-error-cargar-mas');
const modal = document.querySelector('#modal');
const modalContent = document.querySelector('#modal-contenido');

const stateChips = {
  Alive: { text: 'Vivo', classes: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  Dead: { text: 'Muerto', classes: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  unknown: { text: 'Desconocido', classes: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' },
};

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character]);

function characterCard(character, favorites) {
  const chip = stateChips[character.status] ?? stateChips.unknown;
  const favorite = favorites.has(character.id);
  const name = escapeHTML(character.name);

  return `
    <article class="relative flex min-h-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-300 bg-white p-4 text-slate-900 shadow-[0_4px_12px_rgb(15_23_42_/_10%)] transition-[transform,box-shadow] duration-150 hover:-translate-y-[3px] hover:shadow-[0_10px_20px_rgb(15_23_42_/_14%)] motion-reduce:transition-none dark:border-slate-600 dark:bg-slate-800 dark:text-white">
      <button type="button" data-favorite-id="${character.id}" aria-pressed="${favorite}"
        aria-label="${favorite ? 'Quitar' : 'Agregar'} ${name} ${favorite ? 'de' : 'a'} favoritos"
        class="absolute top-3 right-3 z-10 rounded-full bg-white/80 p-2 text-gray-400 shadow-md transition-colors hover:bg-white hover:text-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 dark:bg-slate-900/80 dark:hover:bg-slate-900 ${favorite ? 'text-red-500' : ''}">
        <span aria-hidden="true">${favorite ? '❤️' : '🤍'}</span>
      </button>

      <img src="${escapeHTML(character.image)}" alt="Retrato de ${name}" loading="lazy"
        class="mx-auto h-48 w-48 max-w-full rounded-full border-[3px] border-slate-300 object-cover dark:border-slate-600">

      <h3 class="mt-4 mb-2 text-center text-xl font-bold [overflow-wrap:anywhere]">${name}</h3>

      <span class="mb-3 self-center rounded-full px-3 py-1 text-xs font-semibold ${chip.classes}">
        ${chip.text}
      </span>

      <ul class="flex-1 space-y-2 leading-[1.6] text-slate-700 [overflow-wrap:anywhere] dark:text-slate-300">
        <li><strong class="text-slate-900 dark:text-white">Especie:</strong> ${escapeHTML(character.species)}</li>
        <li><strong class="text-slate-900 dark:text-white">Origen:</strong> ${escapeHTML(character.origin.name)}</li>
      </ul>

      <button type="button" data-id="${character.id}"
        class="mt-2 min-h-11 w-full cursor-pointer rounded-lg border border-slate-800 bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700">
        Ver detalle
      </button>
    </article>`;
}

export function setLoading() {
  loading.classList.remove('hidden');
  errorPanel.classList.add('hidden');
  grid.classList.add('hidden');
  loadMoreContainer.classList.add('hidden');
  counter.textContent = '';
}

export function showError(message) {
  loading.classList.add('hidden');
  grid.classList.add('hidden');
  loadMoreContainer.classList.add('hidden');
  errorMessage.textContent = message;
  errorPanel.classList.remove('hidden');
  counter.textContent = '';
}

export function setLoadMoreState(state) {
  loadMoreError.classList.add('hidden');
  loadMoreButton.disabled = state === 'loading' || state === 'done';
  loadMoreButton.classList.remove('hidden');
  loadMoreButton.setAttribute('aria-busy', String(state === 'loading'));
  loadMoreButton.innerHTML = state === 'loading'
    ? '<span class="inline-flex items-center gap-2"><span class="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>Cargando...</span>'
    : state === 'done'
      ? 'No hay más personajes'
      : 'Cargar más';
}

export function showLoadMoreError(message) {
  setLoadMoreState('ready');
  loadMoreErrorMessage.textContent = message;
  loadMoreError.classList.remove('hidden');
}

export function renderCharacters(characters, favorites, { count, alive, view, hasMore = false, append = false }) {
  loading.classList.add('hidden');
  errorPanel.classList.add('hidden');
  grid.classList.remove('hidden');
  loadMoreContainer.classList.toggle('hidden', view === 'favorites');

  const cards = characters.map((character) => characterCard(character, favorites)).join('');
  if (append) {
    if (cards) grid.insertAdjacentHTML('beforeend', cards);
  } else {
    grid.innerHTML = cards || `<p class="col-span-full py-10 text-center text-slate-500 dark:text-slate-400">${view === 'favorites' ? 'Aún no tienes personajes favoritos.' : 'Ningún personaje coincide con la búsqueda.'}</p>`;
  }

  counter.textContent = `Mostrando ${count} personajes · ${alive} vivos`;
  setLoadMoreState(hasMore ? 'ready' : 'done');
}

export function updateViewButtons(view) {
  const allButton = document.querySelector('#ver-todos');
  const favoritesButton = document.querySelector('#ver-favoritos');
  const activeClasses = 'border-slate-800 bg-slate-800 text-white';
  const inactiveClasses = 'border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white';

  allButton.setAttribute('aria-pressed', String(view === 'all'));
  favoritesButton.setAttribute('aria-pressed', String(view === 'favorites'));
  allButton.className = `rounded-lg border px-4 py-2 font-semibold hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 ${view === 'all' ? activeClasses : inactiveClasses}`;
  favoritesButton.className = `rounded-lg border px-4 py-2 font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 dark:hover:bg-slate-700 ${view === 'favorites' ? activeClasses : inactiveClasses}`;
}

function detailField(label, value) {
  return `
    <div class="min-w-0 border-b border-slate-200 pb-2 dark:border-slate-700">
      <dt class="text-xs font-semibold uppercase tracking-wider text-slate-400">${label}</dt>
      <dd class="mt-1 text-sm font-bold text-slate-800 [overflow-wrap:anywhere] dark:text-slate-100">${escapeHTML(value)}</dd>
    </div>`;
}

export function openDetails(character) {
  const chip = stateChips[character.status] ?? stateChips.unknown;
  const name = escapeHTML(character.name);

  modalContent.innerHTML = `
    <article class="overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
      <header class="relative bg-slate-900 px-5 py-4 pr-16 text-white dark:bg-indigo-950">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Identificación de personaje / Citizen ID</p>
        <h2 id="modal-titulo" class="mt-1 text-lg font-bold">${name}</h2>
        <form method="dialog" class="absolute top-3 right-3">
          <button type="submit" aria-label="Cerrar identificación"
            class="rounded-full p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <span aria-hidden="true">✕</span>
          </button>
        </form>
      </header>

      <div class="relative grid gap-6 p-5 sm:grid-cols-[minmax(10rem,0.8fr)_1.2fr] sm:items-start">
        <section class="flex flex-col items-center gap-3" aria-label="Fotografía y estado del personaje">
          <img src="${escapeHTML(character.image)}" alt="Fotografía de identificación de ${name}"
            class="h-48 w-48 max-w-full rounded-xl border-4 border-slate-300 object-cover shadow-md dark:border-slate-500">
          <span class="rounded-full px-3 py-1 text-xs font-semibold ${chip.classes}">${chip.text}</span>
        </section>

        <dl class="grid grid-cols-2 gap-x-4 gap-y-3">
          ${detailField('ID', character.id)}
          ${detailField('Nombre', character.name)}
          ${detailField('Especie', character.species)}
          ${detailField('Género', character.gender)}
          ${detailField('Origen', character.origin.name)}
          ${detailField('Ubicación', character.location.name)}
        </dl>

        <svg class="pointer-events-none absolute right-4 bottom-3 size-16 text-slate-300/40 dark:text-slate-600/30" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r="22" stroke="currentColor" stroke-width="3"/>
          <circle cx="32" cy="32" r="8" stroke="currentColor" stroke-width="3"/>
          <path d="M10 32h14m16 0h14M32 10v14m0 16v14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
    </article>`;

  modal.showModal();
}

export function bindMenu() {
  const button = document.querySelector('#btn-menu');
  const menu = document.querySelector('#menu');

  button.addEventListener('click', () => {
    const open = menu.classList.toggle('hidden') === false;
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });

  menu.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;
    menu.classList.add('hidden');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Abrir menú');
  });
}

const resourceViews = {
  episodios: {
    loading: document.querySelector('#episodios-cargando'),
    error: document.querySelector('#episodios-error'),
    message: document.querySelector('#episodios-error-mensaje'),
    content: document.querySelector('#episodios-grilla'),
    pagination: document.querySelector('#episodios-paginacion'),
  },
  ubicaciones: {
    loading: document.querySelector('#ubicaciones-cargando'),
    error: document.querySelector('#ubicaciones-error'),
    message: document.querySelector('#ubicaciones-error-mensaje'),
    content: document.querySelector('#ubicaciones-grilla'),
    pagination: document.querySelector('#ubicaciones-paginacion'),
  },
  dashboard: {
    loading: document.querySelector('#dashboard-cargando'),
    error: document.querySelector('#dashboard-error'),
    message: document.querySelector('#dashboard-error-mensaje'),
    content: document.querySelector('#dashboard-contenido'),
  },
};

export function setResourceLoading(resource) {
  const view = resourceViews[resource];
  view.loading.classList.remove('hidden');
  view.error.classList.add('hidden');
  view.content.classList.add('hidden');
  view.pagination?.classList.add('hidden');
}

export function showResourceError(resource, message) {
  const view = resourceViews[resource];
  view.loading.classList.add('hidden');
  view.content.classList.add('hidden');
  view.pagination?.classList.add('hidden');
  view.message.textContent = message;
  view.error.classList.remove('hidden');
}

function renderPagination(container, info, page, resource) {
  const pages = Math.max(1, info.pages);
  container.classList.remove('hidden');
  container.innerHTML = `
    <button type="button" data-resource="${resource}" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}
      class="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-800 enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
      Anterior
    </button>
    <p class="text-sm text-slate-600 dark:text-slate-300">Página ${page} de ${pages} · ${info.count} resultados</p>
    <button type="button" data-resource="${resource}" data-page="${page + 1}" ${page >= pages ? 'disabled' : ''}
      class="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-800 enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
      Siguiente
    </button>`;
}

export function renderEpisodes(payload, page) {
  const view = resourceViews.episodios;
  view.loading.classList.add('hidden');
  view.error.classList.add('hidden');
  view.content.classList.remove('hidden');
  view.content.innerHTML = payload.results.length
    ? payload.results.map((episode) => `
      <article class="flex flex-col rounded-xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-600 dark:bg-slate-800">
        <p class="text-xs font-semibold uppercase tracking-wider text-green-800 dark:text-green-300">${escapeHTML(episode.episode)}</p>
        <h3 class="mt-2 text-lg font-bold text-slate-900 dark:text-white">${escapeHTML(episode.name)}</h3>
        <p class="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-300">Fecha de emisión: ${escapeHTML(episode.air_date)}</p>
        <button type="button" data-related="episode" data-urls="${escapeHTML(JSON.stringify(episode.characters))}" data-title="${escapeHTML(episode.name)}"
          class="mt-5 min-h-11 rounded-lg bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700">
          Ver personajes (${episode.characters.length})
        </button>
      </article>`).join('')
    : '<p class="col-span-full py-10 text-center text-slate-500">No se encontraron episodios con esos filtros.</p>';
  renderPagination(view.pagination, payload.info, page, 'episodios');
}

export function renderLocations(payload, page) {
  const view = resourceViews.ubicaciones;
  view.loading.classList.add('hidden');
  view.error.classList.add('hidden');
  view.content.classList.remove('hidden');
  view.content.innerHTML = payload.results.length
    ? payload.results.map((location) => `
      <article class="flex flex-col rounded-xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-600 dark:bg-slate-800">
        <p class="text-xs font-semibold uppercase tracking-wider text-green-800 dark:text-green-300">${escapeHTML(location.type)}</p>
        <h3 class="mt-2 text-lg font-bold text-slate-900 dark:text-white">${escapeHTML(location.name)}</h3>
        <dl class="mt-4 flex-1 space-y-2 text-sm">
          <div><dt class="inline font-semibold text-slate-500 dark:text-slate-400">Dimensión: </dt><dd class="inline text-slate-800 dark:text-slate-200">${escapeHTML(location.dimension)}</dd></div>
          <div><dt class="inline font-semibold text-slate-500 dark:text-slate-400">Residentes: </dt><dd class="inline text-slate-800 dark:text-slate-200">${location.residents.length}</dd></div>
        </dl>
        <button type="button" data-related="location" data-urls="${escapeHTML(JSON.stringify(location.residents))}" data-title="${escapeHTML(location.name)}"
          class="mt-5 min-h-11 rounded-lg bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700">
          Ver residentes (${location.residents.length})
        </button>
      </article>`).join('')
    : '<p class="col-span-full py-10 text-center text-slate-500">No se encontraron ubicaciones con esos filtros.</p>';
  renderPagination(view.pagination, payload.info, page, 'ubicaciones');
}

function metricCard(label, value) {
  return `<article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">${label}</p>
    <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">${value.toLocaleString('es')}</p>
  </article>`;
}

function renderDistribution(title, entries, total) {
  const denominator = entries.reduce((sum, [, count]) => sum + count, 0) || total;
  const colors = [
    'accent-green-600 dark:accent-green-500',
    'accent-red-600 dark:accent-red-500',
    'accent-slate-500 dark:accent-slate-400',
    'accent-indigo-500 dark:accent-indigo-400',
  ];

  return `<section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <h3 class="mb-5 text-lg font-bold">${title}</h3>
    <div class="space-y-4">${entries.map(([label, count], index) => {
      const percent = denominator ? (count / denominator) * 100 : 0;
      return `<div>
        <div class="mb-1 flex justify-between gap-3 text-sm">
          <span class="font-medium">${label}</span>
          <span class="text-slate-500 dark:text-slate-400">${count.toLocaleString('es')} · ${percent.toFixed(1)}%</span>
        </div>
        <progress class="h-2.5 w-full overflow-hidden rounded-full ${colors[index % colors.length]}" aria-label="${label}" value="${percent.toFixed(1)}" max="100">
          ${percent.toFixed(1)}%
        </progress>
      </div>`;
    }).join('')}</div>
  </section>`;
}

export function renderDashboard(stats) {
  const view = resourceViews.dashboard;
  view.loading.classList.add('hidden');
  view.error.classList.add('hidden');
  view.content.classList.remove('hidden');
  view.content.innerHTML = `
    <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      ${metricCard('Personajes', stats.totals.characters)}
      ${metricCard('Episodios', stats.totals.episodes)}
      ${metricCard('Ubicaciones', stats.totals.locations)}
    </div>
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
      ${renderDistribution('Estado vital', Object.entries(stats.status), stats.totals.characters)}
      ${renderDistribution('Especies', Object.entries(stats.species), stats.totals.characters)}
      ${renderDistribution('Distribución por género', Object.entries(stats.gender), stats.totals.characters)}
    </div>`;
}

export function openRelatedModal(title) {
  modalContent.innerHTML = `
    <article class="overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
      <header class="bg-slate-900 px-5 py-4 text-white dark:bg-indigo-950">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Archivo de la Ciudadela</p>
        <h2 id="modal-titulo" class="mt-1 text-lg font-bold">${escapeHTML(title)}</h2>
      </header>
      <div id="modal-relacionados" class="p-5" aria-live="polite">
        <div class="py-8 text-center" role="status">
          <span class="mx-auto mb-3 block size-10 animate-spin rounded-full border-4 border-slate-300 border-t-green-800" aria-hidden="true"></span>
          Cargando personajes...
        </div>
      </div>
      <div id="modal-relacionados-error" class="hidden p-5 text-center" role="alert">
        <p id="modal-relacionados-mensaje" class="mb-4 text-red-800 dark:text-red-200"></p>
        <button type="button" id="reintentar-relacionados" class="rounded-lg bg-slate-800 px-5 py-2 font-semibold text-white">Reintentar</button>
      </div>
    </article>`;
  modal.showModal();
}

export function renderRelatedCharacters(characters) {
  const container = document.querySelector('#modal-relacionados');
  document.querySelector('#modal-relacionados-error').classList.add('hidden');
  container.classList.remove('hidden');
  container.innerHTML = characters.length
    ? `<div class="grid max-h-[60vh] grid-cols-2 gap-4 overflow-y-auto sm:grid-cols-3">${characters.map((character) => `
      <article class="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <img src="${escapeHTML(character.image)}" alt="Retrato de ${escapeHTML(character.name)}" loading="lazy"
          class="mx-auto mb-3 aspect-square w-full rounded-lg border-2 border-slate-300 object-cover dark:border-slate-600">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">${escapeHTML(character.name)}</h3>
      </article>`).join('')}</div>`
    : '<p class="py-8 text-center text-slate-500 dark:text-slate-400">No hay personajes asociados.</p>';
}

export function showRelatedCharactersError(message) {
  document.querySelector('#modal-relacionados').classList.add('hidden');
  document.querySelector('#modal-relacionados-mensaje').textContent = message;
  document.querySelector('#modal-relacionados-error').classList.remove('hidden');
}
