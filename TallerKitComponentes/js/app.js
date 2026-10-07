// js/app.js — interfaz: DOM y eventos
import {
  crearTarea, alternarTarea, eliminarTarea,
  filtrarTareas, contarPendientes,
} from "./tareas.js";

// --- Estado de la aplicación ---
let tareas = [];
let filtroActual = "todas";

// --- Referencias al DOM ---
const formulario = document.querySelector("form");
const campoTexto = document.querySelector("input[type='text']");
const lista = document.querySelector("#lista");
const contador = document.querySelector("#contador");
const botonesFiltro = document.querySelectorAll(".filtro");

// --- Render: pinta el estado actual en pantalla ---
function render() {
  const visibles = filtrarTareas(tareas, filtroActual);

  lista.innerHTML = visibles.map((t) => `
    <li class="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
      <input type="checkbox" data-id="${t.id}" ${t.completada ? "checked" : ""}>
      <span class="${t.completada ? "line-through text-slate-400" : ""}">
        ${t.texto}
      </span>
      <button data-borrar="${t.id}" class="ml-auto text-red-500">✕</button>
    </li>
  `).join("");

  contador.textContent = `${contarPendientes(tareas)} tarea(s) pendiente(s)`;
}

// --- Eventos ---
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const texto = campoTexto.value.trim();
  if (texto === "") return;              // ignora entradas vacías
  tareas = [...tareas, crearTarea(texto)];
  campoTexto.value = "";
  render();
});

// Delegación: UN listener en la lista atiende checkboxes y botones
lista.addEventListener("click", (evento) => {
  const idAlternar = evento.target.dataset.id;
  const idBorrar = evento.target.dataset.borrar;
  if (idAlternar) tareas = alternarTarea(tareas, Number(idAlternar));
  if (idBorrar) tareas = eliminarTarea(tareas, Number(idBorrar));
  if (idAlternar || idBorrar) render();
});

botonesFiltro.forEach((boton) => {
  boton.addEventListener("click", () => {
    filtroActual = boton.dataset.filtro;   // "todas" | "pendientes" | "completadas"
    render();
  });
});

render();  // primer pintado