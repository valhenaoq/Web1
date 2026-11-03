import {
  fetchCharactersByIds,
  fetchCharactersByUrls,
  getCharacters,
  getDashboardStats,
  getEpisodes,
  getLocations,
} from './api.js';
import {
  bindMenu,
  openDetails,
  openRelatedModal,
  renderCharacters,
  renderDashboard,
  renderEpisodes,
  renderLocations,
  renderRelatedCharacters,
  setLoading,
  setLoadMoreState,
  setResourceLoading,
  showError,
  showLoadMoreError,
  showRelatedCharactersError,
  showResourceError,
  updateViewButtons,
} from './ui.js';
import { getFavoriteIds, toggleFavorite } from './storage.js';
import { buscarPorId, contarVivos, filtrarPersonajes } from './logica.js';

const form = document.querySelector('#form-busqueda');
const inputBusqueda = document.querySelector('#busqueda');
const selectEstado = document.querySelector('#filtro-estado');
const grid = document.querySelector('#grilla');
const retryButton = document.querySelector('#reintentar');
const loadMoreButton = document.querySelector('#cargar-mas');
const retryLoadMoreButton = document.querySelector('#reintentar-cargar-mas');
const allButton = document.querySelector('#ver-todos');
const favoritesButton = document.querySelector('#ver-favoritos');
const modal = document.querySelector('#modal');
const episodeForm = document.querySelector('#form-episodios');
const locationForm = document.querySelector('#form-ubicaciones');

const filters = { texto: '', estado: '' };
const episodeFilters = { name: '', episodeCode: '' };
const locationFilters = { name: '', type: '' };
const requestIds = { personajes: 0, episodios: 0, ubicaciones: 0, dashboard: 0, relacionados: 0 };
const pages = { episodios: 1, ubicaciones: 1 };
let view = 'all';
let activeTab = 'personajes';
let characters = [];
let nextCharactersUrl = null;
let relatedUrls = [];

function visibleCharacters(favoriteIds = getFavoriteIds()) {
  const source = view === 'favorites'
    ? characters.filter((character) => favoriteIds.has(character.id))
    : characters;
  return filtrarPersonajes(source, filters);
}

function render(favoriteIds, { append = false, newCharacters = [] } = {}) {
  const visible = visibleCharacters(favoriteIds);
  const charactersToRender = append ? filtrarPersonajes(newCharacters, filters) : visible;
  renderCharacters(charactersToRender, favoriteIds, {
    count: visible.length,
    alive: contarVivos(visible),
    view,
    hasMore: view === 'all' && Boolean(nextCharactersUrl),
    append,
  });
}

async function loadCharacters({ append = false } = {}) {
  const requestId = ++requestIds.personajes;
  if (append) {
    if (view !== 'all' || !nextCharactersUrl) return;
    setLoadMoreState('loading');
    document.querySelector('#error-cargar-mas').classList.add('hidden');
  } else {
    nextCharactersUrl = null;
    setLoading();
  }

  try {
    const favoriteIds = getFavoriteIds();
    let newCharacters = [];
    if (view === 'favorites') {
      characters = await fetchCharactersByIds([...favoriteIds]);
    } else {
      const result = await getCharacters(
        append ? nextCharactersUrl : 1,
        filters.texto,
        filters.estado,
      );
      if (requestId !== requestIds.personajes) return;

      if (append) {
        const existingIds = new Set(characters.map((character) => character.id));
        newCharacters = result.results.filter((character) => !existingIds.has(character.id));
        characters = characters.concat(newCharacters);
      } else {
        characters = result.results;
      }
      nextCharactersUrl = result.info.next;
    }

    if (requestId !== requestIds.personajes) return;
    render(favoriteIds, { append, newCharacters });
  } catch (error) {
    if (requestId !== requestIds.personajes) return;
    const detail = error instanceof Error ? error.message : 'Error desconocido.';
    if (append) {
      showLoadMoreError(`No fue posible cargar más personajes. ${detail}`);
    } else {
      showError(`No fue posible cargar los personajes. ${detail}`);
    }
  }
}

async function loadEpisodes() {
  const requestId = ++requestIds.episodios;
  setResourceLoading('episodios');

  try {
    const result = await getEpisodes(pages.episodios, episodeFilters.name, episodeFilters.episodeCode);
    if (requestId === requestIds.episodios) renderEpisodes(result, pages.episodios);
  } catch (error) {
    if (requestId !== requestIds.episodios) return;
    const detail = error instanceof Error ? error.message : 'Error desconocido.';
    showResourceError('episodios', `No fue posible cargar los episodios. ${detail}`);
  }
}

async function loadLocations() {
  const requestId = ++requestIds.ubicaciones;
  setResourceLoading('ubicaciones');

  try {
    const result = await getLocations(pages.ubicaciones, locationFilters.name, locationFilters.type);
    if (requestId === requestIds.ubicaciones) renderLocations(result, pages.ubicaciones);
  } catch (error) {
    if (requestId !== requestIds.ubicaciones) return;
    const detail = error instanceof Error ? error.message : 'Error desconocido.';
    showResourceError('ubicaciones', `No fue posible cargar las ubicaciones. ${detail}`);
  }
}

async function loadDashboard() {
  const requestId = ++requestIds.dashboard;
  setResourceLoading('dashboard');

  try {
    const stats = await getDashboardStats();
    if (requestId === requestIds.dashboard) renderDashboard(stats);
  } catch (error) {
    if (requestId !== requestIds.dashboard) return;
    const detail = error instanceof Error ? error.message : 'Error desconocido.';
    showResourceError('dashboard', `No fue posible cargar las estadísticas. ${detail}`);
  }
}

async function loadRelatedCharacters() {
  const requestId = ++requestIds.relacionados;
  const container = document.querySelector('#modal-relacionados');
  const errorPanel = document.querySelector('#modal-relacionados-error');
  errorPanel.classList.add('hidden');
  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="py-8 text-center" role="status">
      <span class="mx-auto mb-3 block size-10 animate-spin rounded-full border-4 border-slate-300 border-t-green-800" aria-hidden="true"></span>
      Cargando personajes...
    </div>`;

  try {
    const related = await fetchCharactersByUrls(relatedUrls);
    if (requestId === requestIds.relacionados) renderRelatedCharacters(related);
  } catch (error) {
    if (requestId !== requestIds.relacionados) return;
    const detail = error instanceof Error ? error.message : 'Error desconocido.';
    showRelatedCharactersError(`No fue posible cargar estos personajes. ${detail}`);
  }
}

function setTab(tab) {
  if (tab === activeTab) return;
  activeTab = tab;

  for (const button of document.querySelectorAll('[data-tab]')) {
    const selected = button.dataset.tab === tab;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    button.className = selected
      ? 'border-b-2 border-green-700 px-4 py-3 text-sm font-semibold text-green-800 dark:text-green-300'
      : 'border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white';
  }

  for (const panel of document.querySelectorAll('[data-panel]')) {
    panel.hidden = panel.dataset.panel !== tab;
    panel.classList.toggle('hidden', panel.hidden);
  }

  if (tab === 'episodios') loadEpisodes();
  if (tab === 'ubicaciones') loadLocations();
  if (tab === 'dashboard') loadDashboard();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  filters.texto = inputBusqueda.value.trim();
  filters.estado = selectEstado.value;
  loadCharacters();
});

form.addEventListener('reset', () => {
  filters.texto = '';
  filters.estado = '';
  loadCharacters();
});

allButton.addEventListener('click', () => {
  view = 'all';
  updateViewButtons(view);
  loadCharacters();
});

favoritesButton.addEventListener('click', () => {
  view = 'favorites';
  updateViewButtons(view);
  loadCharacters();
});

retryButton.addEventListener('click', loadCharacters);
loadMoreButton.addEventListener('click', () => loadCharacters({ append: true }));
retryLoadMoreButton.addEventListener('click', () => loadCharacters({ append: true }));

grid.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.dataset.favoriteId) {
    try {
      const favoriteIds = toggleFavorite(button.dataset.favoriteId);
      render(favoriteIds);
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Error desconocido.';
      showError(`No fue posible guardar los favoritos. ${detail}`);
    }
    return;
  }

  if (button.dataset.id) {
    const character = buscarPorId(characters, button.dataset.id);
    if (character) openDetails(character);
  }
});

episodeForm.addEventListener('submit', (event) => {
  event.preventDefault();
  episodeFilters.name = document.querySelector('#buscar-episodio').value.trim();
  episodeFilters.episodeCode = document.querySelector('#temporada-episodio').value;
  pages.episodios = 1;
  loadEpisodes();
});

locationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  locationFilters.name = document.querySelector('#buscar-ubicacion').value.trim();
  locationFilters.type = document.querySelector('#tipo-ubicacion').value.trim();
  pages.ubicaciones = 1;
  loadLocations();
});

document.addEventListener('click', (event) => {
  const retry = event.target.closest('[data-retry]');
  if (retry) {
    if (retry.dataset.retry === 'episodios') loadEpisodes();
    if (retry.dataset.retry === 'ubicaciones') loadLocations();
    if (retry.dataset.retry === 'dashboard') loadDashboard();
    return;
  }

  const pagination = event.target.closest('[data-resource][data-page]');
  if (pagination && !pagination.disabled) {
    const resource = pagination.dataset.resource;
    pages[resource] = Number(pagination.dataset.page);
    if (resource === 'episodios') loadEpisodes();
    if (resource === 'ubicaciones') loadLocations();
  }
});

document.querySelector('#episodios-grilla').addEventListener('click', handleRelatedClick);
document.querySelector('#ubicaciones-grilla').addEventListener('click', handleRelatedClick);

function handleRelatedClick(event) {
  const button = event.target.closest('[data-related]');
  if (!button) return;

  try {
    relatedUrls = JSON.parse(button.dataset.urls);
    if (!Array.isArray(relatedUrls)) throw new Error('La lista de personajes no es válida.');
    openRelatedModal(button.dataset.title);
    loadRelatedCharacters();
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Error desconocido.';
    showResourceError(button.dataset.related === 'episode' ? 'episodios' : 'ubicaciones', `No fue posible abrir los personajes relacionados. ${detail}`);
  }
}

modal.addEventListener('click', (event) => {
  if (event.target === modal) modal.close();
  if (event.target.closest('#reintentar-relacionados')) loadRelatedCharacters();
});

document.querySelector('#tabs-principales').addEventListener('click', (event) => {
  const button = event.target.closest('[data-tab]');
  if (button) setTab(button.dataset.tab);
});

document.querySelector('#tabs-principales').addEventListener('keydown', (event) => {
  const tabButtons = [...document.querySelectorAll('[data-tab]')];
  const currentIndex = tabButtons.indexOf(document.activeElement);
  const nextIndex = event.key === 'ArrowRight'
    ? (currentIndex + 1) % tabButtons.length
    : event.key === 'ArrowLeft'
      ? (currentIndex - 1 + tabButtons.length) % tabButtons.length
      : -1;

  if (nextIndex < 0) return;
  event.preventDefault();
  tabButtons[nextIndex].focus();
  setTab(tabButtons[nextIndex].dataset.tab);
});

bindMenu();
updateViewButtons(view);
document.querySelectorAll('[data-tab]').forEach((button) => {
  button.tabIndex = button.dataset.tab === activeTab ? 0 : -1;
});
loadCharacters();
