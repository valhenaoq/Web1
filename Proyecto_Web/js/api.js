const API_BASE_URL = 'https://rickandmortyapi.com/api';

async function readResponse(response) {
  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new Error('La API devolvió una respuesta que no se pudo interpretar.');
  }

  if (!response.ok) {
    throw new Error(payload.error || `La API respondió con el estado ${response.status}.`);
  }

  return payload;
}

export async function fetchCharacters({ texto = '', estado = '' } = {}) {
  const url = new URL(`${API_BASE_URL}/character/`);
  if (texto) url.searchParams.set('name', texto);
  if (estado) url.searchParams.set('status', estado);

  const response = await fetch(url);
  const payload = await readResponse(response);

  if (!Array.isArray(payload.results)) {
    throw new Error('La API no devolvió una lista de personajes válida.');
  }

  return payload.results;
}

export async function fetchCharactersByIds(ids) {
  if (!ids.length) return [];

  const response = await fetch(`${API_BASE_URL}/character/${ids.join(',')}`);
  const payload = await readResponse(response);
  const characters = Array.isArray(payload) ? payload : [payload];

  if (!characters.every((character) => Number.isInteger(character.id))) {
    throw new Error('La API no devolvió personajes favoritos válidos.');
  }

  return characters;
}

async function fetchResourcePage(resource, page, filters = {}) {
  let url;
  if (typeof page === 'string') {
    url = new URL(page);
    const resourcePath = new URL(`${API_BASE_URL}/${resource}/`).pathname;
    if (url.origin !== new URL(API_BASE_URL).origin || !url.pathname.startsWith(resourcePath)) {
      throw new Error(`La URL de la siguiente página de ${resource} no es válida.`);
    }
  } else {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('El número de página debe ser un entero positivo.');
    }
    url = new URL(`${API_BASE_URL}/${resource}/`);
    url.searchParams.set('page', String(page));
    for (const [key, value] of Object.entries(filters)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url);
  if (response.status === 404) {
    let errorPayload;
    try {
      errorPayload = await response.json();
    } catch {
      throw new Error('La API devolvió una respuesta que no se pudo interpretar.');
    }

    if (errorPayload.error === 'There is nothing here') {
      return { info: { count: 0, pages: 0, next: null, prev: null }, results: [] };
    }

    throw new Error(errorPayload.error || `La API respondió con el estado ${response.status}.`);
  }

  const payload = await readResponse(response);
  if (!payload.info || !Array.isArray(payload.results)) {
    throw new Error(`La API no devolvió una lista de ${resource} válida.`);
  }

  return payload;
}

export async function getCharacters(page = 1, name = '', status = '') {
  return fetchResourcePage('character', page, { name, status });
}

export async function getEpisodes(page = 1, name = '', episodeCode = '') {
  return fetchResourcePage('episode', page, { name, episode: episodeCode });
}

export async function getLocations(page = 1, name = '', type = '') {
  return fetchResourcePage('location', page, { name, type });
}

export async function fetchCharactersByUrls(urls) {
  const ids = urls.map((resourceUrl) => {
    const id = Number(new URL(resourceUrl).pathname.split('/').filter(Boolean).at(-1));
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('La API devolvió una URL de personaje no válida.');
    }
    return id;
  });

  return fetchCharactersByIds(ids);
}

async function fetchCount(resource, filters = {}) {
  const payload = await fetchResourcePage(resource, 1, filters);
  return payload.info.count;
}

export async function getDashboardStats() {
  const [
    characters,
    episodes,
    locations,
    alive,
    dead,
    unknownStatus,
    humans,
    aliens,
    male,
    female,
    genderless,
    unknownGender,
  ] = await Promise.all([
    fetchCount('character'),
    fetchCount('episode'),
    fetchCount('location'),
    fetchCount('character', { status: 'alive' }),
    fetchCount('character', { status: 'dead' }),
    fetchCount('character', { status: 'unknown' }),
    fetchCount('character', { species: 'human' }),
    fetchCount('character', { species: 'alien' }),
    fetchCount('character', { gender: 'male' }),
    fetchCount('character', { gender: 'female' }),
    fetchCount('character', { gender: 'genderless' }),
    fetchCount('character', { gender: 'unknown' }),
  ]);

  return {
    totals: { characters, episodes, locations },
    status: { Alive: alive, Dead: dead, unknown: unknownStatus },
    species: { Human: humans, Alien: aliens },
    gender: { Male: male, Female: female, Genderless: genderless, unknown: unknownGender },
  };
}
