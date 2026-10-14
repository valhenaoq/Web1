// js/logica.js
// LÓGICA: funciones puras. Reciben datos y devuelven datos nuevos.
// Sin efectos secundarios y sin acceso al DOM ni a objetos globales del navegador.

/**
 * Filtra por nombre (insensible a mayúsculas y espacios) y por estado.
 * @param {Array} lista
 * @param {{ texto: string, estado: string }} filtros
 * @returns {Array} nueva lista (no muta la original)
 */
export function filtrarPersonajes(lista, { texto = '', estado = '' } = {}) {
  const termino = texto.trim().toLowerCase();

  return lista
    .filter((p) => p.name.toLowerCase().includes(termino))
    .filter((p) => estado === '' || p.status.toLowerCase() === estado);
}

/**
 * Cuenta cuántos personajes están vivos.
 * @param {Array} lista
 * @returns {number}
 */
export function contarVivos(lista) {
  return lista.reduce((total, p) => (p.status === 'Alive' ? total + 1 : total), 0);
}

/**
 * Busca un personaje por id. El id puede llegar como string desde data-id.
 * @param {Array} lista
 * @param {number|string} id
 * @returns {Object|undefined}
 */
export function buscarPorId(lista, id) {
  return lista.find((p) => p.id === Number(id));
}