import {
  obtenerPersonajes,
  obtenerPersonajesPorIds,
} from "./api.js";

import {
  obtenerFavoritos,
  alternarFavorito,
} from "./storage.js";

import {
  renderizarPersonajes,
  mostrarDetalle,
  mostrarEstado,
} from "./ui.js";

// Elementos que ya existen en index.html.
const formulario = document.querySelector('form[role="search"]');
const busqueda = document.querySelector("#busqueda");
const filtroEstado = document.querySelector("#filtro-estado");
const contenedor = document.querySelector("#cards-container");
const modal = document.querySelector("#modal-detalle");
const btnMenu = document.querySelector("#btn-menu");
const menu = document.querySelector("#menu");
const btnFavoritos = document.querySelector("#btn-favoritos");

// Estado actual de la aplicación.
let personajes = [];
let soloFavoritos = false;
let temporizadorBusqueda;

// Mostrar tarjetas y actualizar el contador.
const dibujarPersonajes = () => {
  renderizarPersonajes(personajes, obtenerFavoritos());
  mostrarEstado(`${personajes.length} personaje(s) encontrado(s).`);
};

// Consultar la API con los filtros seleccionados.
const cargarPersonajes = async () => {
  mostrarEstado("Cargando personajes…");
  contenedor.setAttribute("aria-busy", "true");

  try {
    personajes = await obtenerPersonajes({
      nombre: busqueda.value,
      estado: filtroEstado.value,
    });

    dibujarPersonajes();
  } catch (error) {
    console.error("Error al cargar personajes:", error);

    personajes = [];
    renderizarPersonajes(personajes);

    mostrarEstado(
      "No se pudieron cargar los personajes. Comprueba tu conexión e inténtalo de nuevo.",
      "error"
    );
  } finally {
    contenedor.setAttribute("aria-busy", "false");
  }
};

// Recuperar los favoritos guardados y aplicar los filtros actuales.
const cargarFavoritos = async () => {
  mostrarEstado("Cargando favoritos…");
  contenedor.setAttribute("aria-busy", "true");

  try {
    const ids = obtenerFavoritos();
    const guardados = await obtenerPersonajesPorIds(ids);

    const texto = busqueda.value.trim().toLowerCase();
    const estado = filtroEstado.value;

    personajes = guardados.filter((personaje) => {
      const coincideNombre = personaje.name.toLowerCase().includes(texto);

      const coincideEstado =
        !estado || personaje.status.toLowerCase() === estado;

      return coincideNombre && coincideEstado;
    });

    dibujarPersonajes();
  } catch (error) {
    console.error("Error al cargar favoritos:", error);

    personajes = [];
    renderizarPersonajes(personajes);

    mostrarEstado(
      "No se pudieron cargar los favoritos. Comprueba tu conexión.",
      "error"
    );
  } finally {
    contenedor.setAttribute("aria-busy", "false");
  }
};

// Elegir qué listado mostrar.
const actualizarVista = async () => {
  if (soloFavoritos) {
    await cargarFavoritos();
  } else {
    await cargarPersonajes();
  }
};

// Evitar que el formulario recargue la página.
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  actualizarVista();
});

// Búsqueda en tiempo real con una pequeña espera.
busqueda.addEventListener("input", () => {
  clearTimeout(temporizadorBusqueda);

  temporizadorBusqueda = setTimeout(() => {
    actualizarVista();
  }, 350);
});

// Aplicar el filtro cuando cambia el selector.
filtroEstado.addEventListener("change", actualizarVista);

// Alternar entre todos los personajes y los favoritos.
btnFavoritos.addEventListener("click", async () => {
  soloFavoritos = !soloFavoritos;

  btnFavoritos.setAttribute("aria-pressed", String(soloFavoritos));
  btnFavoritos.textContent = soloFavoritos
    ? "Ver todos"
    : "Favoritos";

  await actualizarVista();
});

// Gestionar los botones de todas las tarjetas.
// La delegación permite seguir funcionando después de renderizar de nuevo.
contenedor.addEventListener("click", async (evento) => {
  const boton = evento.target.closest("button[data-id]");

  if (!boton) return;

  const id = Number(boton.dataset.id);
  const personaje = personajes.find((item) => item.id === id);

  if (boton.classList.contains("btn-detalle")) {
    mostrarDetalle(personaje);
    return;
  }

  if (boton.dataset.accion === "favorito") {
    const guardado = alternarFavorito(id);

    if (!guardado) {
      mostrarEstado(
        "No se pudo guardar el favorito. Comprueba los permisos del navegador.",
        "error"
      );
      return;
    }

    await actualizarVista();
  }
});

// Cerrar el modal al hacer clic en su fondo.
modal.addEventListener("click", (evento) => {
  if (evento.target === modal) {
    modal.close();
  }
});

// Mantener el funcionamiento del menú móvil.
btnMenu.addEventListener("click", () => {
  menu.classList.toggle("hidden");

  const abierto = !menu.classList.contains("hidden");
  btnMenu.setAttribute("aria-expanded", String(abierto));
});

// Primera consulta a la API.
actualizarVista();