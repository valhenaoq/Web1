const CLAVE_FAVORITOS = "multiverso-favoritos";

export const obtenerFavoritos = () => {
  try {
    const datos = localStorage.getItem(CLAVE_FAVORITOS);
    const favoritos = datos ? JSON.parse(datos) : [];

    return Array.isArray(favoritos)
      ? favoritos.filter(Number.isInteger)
      : [];
  } catch (error) {
    console.error("Error al leer los favoritos:", error);
    return [];
  }
};

const guardarFavoritos = (favoritos) => {
  try {
    localStorage.setItem(
      CLAVE_FAVORITOS,
      JSON.stringify(favoritos)
    );

    return true;
  } catch (error) {
    console.error("Error al guardar los favoritos:", error);
    return false;
  }
};

export const alternarFavorito = (id) => {
  const favoritos = obtenerFavoritos();

  const actualizados = favoritos.includes(id)
    ? favoritos.filter((favoritoId) => favoritoId !== id)
    : [...favoritos, id];

  return guardarFavoritos(actualizados);
};