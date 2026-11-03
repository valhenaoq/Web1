const FAVORITES_KEY = 'rick-morty-favorites';

export function getFavoriteIds() {
  const storedValue = localStorage.getItem(FAVORITES_KEY);
  if (storedValue === null) return new Set();

  let ids;
  try {
    ids = JSON.parse(storedValue);
  } catch {
    throw new Error('Los favoritos guardados están dañados. Borra la clave rick-morty-favorites del almacenamiento local e inténtalo de nuevo.');
  }

  if (!Array.isArray(ids) || !ids.every((id) => Number.isInteger(id) && id > 0)) {
    throw new Error('El formato de los favoritos guardados no es válido.');
  }

  return new Set(ids);
}

export function toggleFavorite(id) {
  const characterId = Number(id);
  if (!Number.isInteger(characterId) || characterId < 1) {
    throw new Error('No se puede guardar un identificador de personaje no válido.');
  }

  const favorites = getFavoriteIds();
  if (favorites.has(characterId)) {
    favorites.delete(characterId);
  } else {
    favorites.add(characterId);
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  return favorites;
}
