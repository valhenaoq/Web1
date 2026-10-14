// js/app.js
// RENDER + EVENTOS: el único módulo que toca el DOM.
import { personajes } from './datos.js';
import { filtrarPersonajes, contarVivos, buscarPorId } from './logica.js';

/* ---------- Estado de la UI ---------- */
const filtros = { texto: '', estado: '' };

/* ---------- Referencias al DOM ---------- */
const form = document.querySelector('#form-busqueda');
const inputBusqueda = document.querySelector('#busqueda');
const selectEstado = document.querySelector('#filtro-estado');
const grilla = document.querySelector('#grilla');
const contador = document.querySelector('#contador');
const modal = document.querySelector('#modal');
const modalContenido = document.querySelector('#modal-contenido');
const btnMenu = document.querySelector('#btn-menu');
const menu = document.querySelector('#menu');

/* ---------- Diccionario de estados ---------- */
// Clases completas y literales: Tailwind v4 solo genera las que encuentra escritas enteras.
const ESTADOS = {
  Alive: {
    texto: 'Vivo',
    clases: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  },
  Dead: {
    texto: 'Muerto',
    clases: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  },
  unknown: {
    texto: 'Desconocido',
    clases: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  },
};

const chipDe = (status) => ESTADOS[status] ?? ESTADOS.unknown;

/* ---------- Plantillas ---------- */
function tarjetaHTML(p) {
  const chip = chipDe(p.status);

  return `
    <article class="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl shadow-md overflow-hidden p-4 flex flex-col">
      <img src="${p.image}" alt="${p.name}" loading="lazy"
        class="w-48 h-48 object-cover rounded-full mx-auto">

      <h3 class="text-xl font-bold text-center mt-4 mb-2">${p.name}</h3>

      <span class="self-center mb-3 px-3 py-1 rounded-full text-xs font-semibold ${chip.clases}">
        ${chip.texto}
      </span>

      <ul class="space-y-2 text-slate-700 dark:text-slate-300 flex-1">
        <li><strong>Especie:</strong> ${p.species}</li>
        <li><strong>Origen:</strong> ${p.origin.name}</li>
      </ul>

      <button type="button" data-id="${p.id}"
        class="mt-4 w-full bg-slate-900 text-white py-2 px-4 rounded-lg hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500">
        Ver detalle
      </button>
    </article>`;
}

const filaDetalle = (etiqueta, valor) => `
  <dt class="text-slate-500 dark:text-slate-400">${etiqueta}</dt>
  <dd class="text-slate-900 dark:text-white font-medium">${valor}</dd>`;

/* ---------- Render ---------- */
function render() {
  const visibles = filtrarPersonajes(personajes, filtros);

  grilla.innerHTML = visibles.length
    ? visibles.map(tarjetaHTML).join('')
    : `<p class="col-span-full text-center text-slate-500 dark:text-slate-400 py-10">
         Ningún personaje coincide con la búsqueda.
       </p>`;

  contador.textContent =
    `Mostrando ${visibles.length} de ${personajes.length} personajes · ${contarVivos(visibles)} vivos`;
}

/* ---------- Modal de detalle ---------- */
function abrirDetalle(personaje) {
  const {
    name,
    image,
    status,
    species,
    type,
    gender,
    origin: { name: origen },
    location: { name: ubicacion },
  } = personaje;

  modalContenido.innerHTML = `
    <h2 id="modal-titulo" class="text-2xl font-bold mb-4 text-center">${name}</h2>

    <img src="${image}" alt="${name}"
      class="w-40 h-40 object-cover rounded-full mx-auto mb-6">

    <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
      ${filaDetalle('Estado', chipDe(status).texto)}
      ${filaDetalle('Especie', species)}
      ${filaDetalle('Tipo', type || 'Sin especificar')}
      ${filaDetalle('Género', gender)}
      ${filaDetalle('Origen', origen)}
      ${filaDetalle('Ubicación', ubicacion)}
    </dl>`;

  modal.showModal();
}

/* ---------- Eventos ---------- */

// Búsqueda en vivo
inputBusqueda.addEventListener('input', (e) => {
  filtros.texto = e.target.value;
  render();
});

// Filtro de estado
selectEstado.addEventListener('change', (e) => {
  filtros.estado = e.target.value;
  render();
});

// Enter no recarga la página
form.addEventListener('submit', (e) => {
  e.preventDefault();
});

// Botón "Limpiar": el evento reset ocurre antes de que se vacíen los campos,
// así que se reinicia el estado directamente.
form.addEventListener('reset', () => {
  filtros.texto = '';
  filtros.estado = '';
  render();
});

// Delegación de eventos: un solo listener en la grilla sobrevive a cada innerHTML.
grilla.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-id]');
  if (!boton) return;

  const personaje = buscarPorId(personajes, boton.dataset.id);
  if (personaje) abrirDetalle(personaje);
});

// Cerrar con clic en el fondo oscuro (backdrop)
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.close();
});
// Esc y el botón "Cerrar" (form method="dialog") funcionan de forma nativa.

// Menú hamburguesa
btnMenu.addEventListener('click', () => {
  const abierto = !menu.classList.toggle('hidden'); // toggle devuelve true si quedó oculto
  btnMenu.setAttribute('aria-expanded', String(abierto));
  btnMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
});

// Al elegir una opción en celular, el menú se cierra
menu.addEventListener('click', (e) => {
  if (!e.target.closest('a')) return;
  menu.classList.add('hidden');
  btnMenu.setAttribute('aria-expanded', 'false');
  btnMenu.setAttribute('aria-label', 'Abrir menú');
});

/* ---------- Primer render ---------- */
render();