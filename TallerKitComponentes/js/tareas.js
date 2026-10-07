// js/tareas.js — lógica pura de la lista de tareas
export function crearTarea(texto) {
  return { id: Date.now(), texto: texto, completada: false };
}

export function alternarTarea(tareas, id) {
  // map crea un array nuevo cambiando solo la tarea con ese id
  return tareas.map((t) =>
    t.id === id ? { ...t, completada: !t.completada } : t
  );
}

export function eliminarTarea(tareas, id) {
  return tareas.filter((t) => t.id !== id);
}

export function filtrarTareas(tareas, filtro) {
  if (filtro === "pendientes") return tareas.filter((t) => !t.completada);
  if (filtro === "completadas") return tareas.filter((t) => t.completada);
  return tareas; // "todas"
}

export function contarPendientes(tareas) {
  return tareas.filter((t) => !t.completada).length;
}