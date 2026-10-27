const API_URL = "https://rickandmortyapi.com/api/character";

export const obtenerPersonajes = async ({
  nombre = "",
  estado = "",
} = {}) => {
  const parametros = new URLSearchParams();

  if (nombre.trim()) {
    parametros.set("name", nombre.trim());
  }

  if (estado) {
    parametros.set("status", estado);
  }

  const consulta = parametros.toString();
  const url = consulta ? `${API_URL}/?${consulta}` : API_URL;

  const respuesta = await fetch(url);

  // Una búsqueda sin coincidencias no debe tratarse como fallo de red.
  if (respuesta.status === 404) {
    return [];
  }

  if (!respuesta.ok) {
    throw new Error(`Error HTTP: ${respuesta.status}`);
  }

  const datos = await respuesta.json();

  return datos.results;
};

export const obtenerPersonajesPorIds = async (ids) => {
  if (ids.length === 0) {
    return [];
  }

  const url = `${API_URL}/${ids.join(",")}`;
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(`Error HTTP: ${respuesta.status}`);
  }

  const datos = await respuesta.json();

  return Array.isArray(datos) ? datos : [datos];
};