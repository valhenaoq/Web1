const etiquetasEstado = {
  Alive: "Vivo",
  Dead: "Muerto",
  unknown: "Desconocido",
};

const clasesEstado = {
  Alive: "bg-emerald-100 text-emerald-700",
  Dead: "bg-rose-100 text-rose-700",
  unknown: "bg-slate-200 text-slate-600",
};

const escaparHTML = (valor = "") => {
  const caracteres = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return String(valor).replace(/[&<>"']/g, (caracter) => caracteres[caracter]);
};

export const renderizarPersonajes = (personajes) => {
  const contenedor = document.querySelector("#cards-container");

  if (personajes.length === 0) {
    contenedor.innerHTML = `
      <p class="col-span-full rounded-xl bg-white p-6 text-center
                text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        No se encontraron personajes.
      </p>
    `;
    return;
  }

  contenedor.innerHTML = personajes.map((personaje) => {
    const nombre = escaparHTML(personaje.name);
    const especie = escaparHTML(personaje.species);
    const origen = escaparHTML(personaje.origin.name);
    const estado = escaparHTML(
      etiquetasEstado[personaje.status] ?? personaje.status
    );
    const claseEstado =
      clasesEstado[personaje.status] ?? clasesEstado.unknown;
    const imagen = escaparHTML(personaje.image);

    return `
      <article
        class="flex flex-col overflow-hidden rounded-2xl bg-white shadow
               group transition hover:-translate-y-1 hover:shadow-xl
               dark:bg-slate-800"
      >
        <div class="overflow-hidden">
          <img
            src="${imagen}"
            alt="${nombre}"
            loading="lazy"
            class="aspect-square w-full object-cover transition
                   group-hover:scale-105"
          >
        </div>

        <div class="flex flex-1 flex-col gap-2 p-4">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            ${nombre}
          </h3>

          <span class="w-fit rounded-full px-2.5 py-0.5 text-xs
                       font-semibold ${claseEstado}">
            ● ${estado}
          </span>

          <p class="text-sm text-slate-500 dark:text-slate-400">
            ${especie} · ${origen}
          </p>

          <button
            type="button"
            class="btn-detalle mt-auto rounded-lg bg-indigo-600 py-2
                   font-semibold text-white transition hover:bg-indigo-700"
            data-id="${personaje.id}"
          >
            Ver detalle
          </button>
        </div>
      </article>
    `;
  }).join("");
};

export const mostrarEstado = (mensaje) => {
  document.querySelector("#estado-interfaz").textContent = mensaje;
};

export const mostrarDetalle = (personaje) => {
  if (!personaje) return;

  document.querySelector("#modal-nombre").textContent = personaje.name;

  const imagen = document.querySelector("#modal-img");
  imagen.src = personaje.image;
  imagen.alt = personaje.name;

  document.querySelector("#modal-estado").textContent =
    etiquetasEstado[personaje.status] ?? personaje.status;

  document.querySelector("#modal-especie").textContent = personaje.species;
  document.querySelector("#modal-origen").textContent = personaje.origin.name;
  document.querySelector("#modal-ubicacion").textContent =
    personaje.location.name;

  document.querySelector("#modal-detalle").showModal();
};