import {
  renderizarPersonajes,
  mostrarDetalle,
  mostrarEstado,
} from "./ui.js";

// 1. Datos iniciales: los ocho personajes de la Semana 6.
const personajes = [
  {
    id: 1,
    name: "Rick Sanchez",
    status: "Alive",
    species: "Human",
    image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
    origin: { name: "Earth (C-137)" },
    location: { name: "Citadel of Ricks" },
  },
  {
    id: 2,
    name: "Morty Smith",
    status: "Alive",
    species: "Human",
    image: "https://rickandmortyapi.com/api/character/avatar/2.jpeg",
    origin: { name: "unknown" },
    location: { name: "Citadel of Ricks" },
  },
  {
    id: 3,
    name: "Summer Smith",
    status: "Alive",
    species: "Human",
    image: "https://rickandmortyapi.com/api/character/avatar/3.jpeg",
    origin: { name: "Earth (Replacement Dimension)" },
    location: { name: "Earth (Replacement Dimension)" },
  },
  {
    id: 4,
    name: "Beth Smith",
    status: "Alive",
    species: "Human",
    image: "https://rickandmortyapi.com/api/character/avatar/4.jpeg",
    origin: { name: "Earth (Replacement Dimension)" },
    location: { name: "Earth (Replacement Dimension)" },
  },
  {
    id: 5,
    name: "Jerry Smith",
    status: "Alive",
    species: "Human",
    image: "https://rickandmortyapi.com/api/character/avatar/5.jpeg",
    origin: { name: "Earth (Replacement Dimension)" },
    location: { name: "Earth (Replacement Dimension)" },
  },
  {
    id: 6,
    name: "Abadango Cluster Princess",
    status: "Alive",
    species: "Alien",
    image: "https://rickandmortyapi.com/api/character/avatar/6.jpeg",
    origin: { name: "Abadango" },
    location: { name: "Abadango" },
  },
  {
    id: 7,
    name: "Abradolf Lincler",
    status: "unknown",
    species: "Human (Genetic experiment)",
    image: "https://rickandmortyapi.com/api/character/avatar/7.jpeg",
    origin: { name: "Earth (Replacement Dimension)" },
    location: { name: "Testicle Monster Dimension" },
  },
  {
    id: 8,
    name: "Adjudicator Rick",
    status: "Dead",
    species: "Human",
    image: "https://rickandmortyapi.com/api/character/avatar/8.jpeg",
    origin: { name: "unknown" },
    location: { name: "Citadel of Ricks" },
  },
];

// 2. Referencias a los elementos que ya existen en index.html.
const formulario = document.querySelector('form[role="search"]');
const busqueda = document.querySelector("#busqueda");
const filtroEstado = document.querySelector("#filtro-estado");
const contenedor = document.querySelector("#cards-container");
const modal = document.querySelector("#modal-detalle");
const btnMenu = document.querySelector("#btn-menu");
const menu = document.querySelector("#menu");

// 3. Filtrar por nombre y estado.
const obtenerPersonajesFiltrados = () => {
  const texto = busqueda.value.trim().toLowerCase();
  const estadoSeleccionado = filtroEstado.value;

  return personajes.filter((personaje) => {
    const coincideNombre = personaje.name.toLowerCase().includes(texto);

    const coincideEstado =
      estadoSeleccionado === "" ||
      personaje.status.toLowerCase() === estadoSeleccionado;

    return coincideNombre && coincideEstado;
  });
};

// 4. Actualizar las tarjetas y el contador.
const actualizarVista = () => {
  const resultados = obtenerPersonajesFiltrados();

  renderizarPersonajes(resultados);

  mostrarEstado(
    `${resultados.length} personaje(s) encontrado(s).`
  );
};

// 5. Evitar que el formulario recargue la página.
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  actualizarVista();
});

// 6. Buscar mientras se escribe.
busqueda.addEventListener("input", actualizarVista);

// 7. Actualizar los resultados cuando cambia el filtro.
filtroEstado.addEventListener("change", actualizarVista);

// 8. Abrir el modal usando delegación de eventos.
// El listener permanece activo aunque se regeneren las tarjetas.
contenedor.addEventListener("click", (evento) => {
  const boton = evento.target.closest(".btn-detalle");

  if (!boton) return;

  const id = Number(boton.dataset.id);
  const personaje = personajes.find((item) => item.id === id);

  mostrarDetalle(personaje);
});

// 9. Cerrar el modal al hacer clic en el fondo oscuro.
modal.addEventListener("click", (evento) => {
  if (evento.target === modal) {
    modal.close();
  }
});

// 10. Conservar el funcionamiento del menú móvil.
btnMenu.addEventListener("click", () => {
  menu.classList.toggle("hidden");

  const abierto = !menu.classList.contains("hidden");

  btnMenu.setAttribute("aria-expanded", String(abierto));
});

// 11. Mostrar las tarjetas al cargar la página.
actualizarVista();