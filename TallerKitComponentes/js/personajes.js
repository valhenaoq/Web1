const API_URL = "https://rickandmortyapi.com/api/character";
const cardList = document.querySelector("#cards");
const catalogMessage = document.querySelector("#estado-catalogo");
const catalogError = document.querySelector("#error-catalogo");
const catalogCount = document.querySelector("#contador-personajes");
const moreButton = document.querySelector("#cargar-mas");
const filterForm = document.querySelector("#filtros-form");
const modal = document.querySelector("#modal-personaje");
const closeButton = document.querySelector("#cerrar-modal");
const closeIconButton = document.querySelector("#cerrar-modal-icono");
const retryDetailButton = document.querySelector("#reintentar-detalle");

let nextPageUrl = null;
let lastRequestedPage = null;
let lastCharacterId = null;
let openingButton = null;
let catalogController = null;
let detailController = null;
let catalogRequestId = 0;

function isObject(value) {
    return typeof value === "object" && value !== null;
}

function isCharacterSummary(value) {
    return isObject(value)
        && Number.isInteger(value.id)
        && typeof value.name === "string"
        && typeof value.status === "string"
        && typeof value.species === "string"
        && typeof value.image === "string";
}

function isCharacterDetail(value) {
    return isCharacterSummary(value)
        && typeof value.gender === "string"
        && isObject(value.origin)
        && typeof value.origin.name === "string"
        && isObject(value.location)
        && typeof value.location.name === "string"
        && Array.isArray(value.episode)
        && value.episode.every((episode) => typeof episode === "string");
}

function getStatusClass(status) {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "alive") return "status-badge--alive";
    if (normalizedStatus === "dead") return "status-badge--dead";
    return "status-badge--unknown";
}

function getStatusLabel(status) {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "alive") return "Alive";
    if (normalizedStatus === "dead") return "Dead";
    return "Unknown";
}

function getStatusThemeClasses(status) {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "alive") {
        return "border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300";
    }
    if (normalizedStatus === "dead") {
        return "border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300";
    }
    return "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

function createStatusBadge(status) {
    const badge = document.createElement("span");
    badge.className = `status-badge ${getStatusClass(status)} ${getStatusThemeClasses(status)}`;
    badge.textContent = getStatusLabel(status);
    return badge;
}

function createCharacterCard(character, index) {
    const article = document.createElement("article");
    article.className = "card border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900";
    article.style.setProperty("--card-delay", `${Math.min(index % 12, 8) * 35}ms`);

    const imageWrap = document.createElement("div");
    imageWrap.className = "card__image-wrap";

    const image = document.createElement("img");
    image.className = "card__image";
    image.src = character.image;
    image.alt = `Retrato de ${character.name}`;
    image.width = 300;
    image.height = 300;
    image.loading = "lazy";
    imageWrap.append(image);

    const content = document.createElement("div");
    content.className = "card__content";

    const name = document.createElement("h3");
    name.className = "card__name text-slate-900 dark:text-slate-100";
    name.textContent = character.name;

    const secondary = document.createElement("p");
    secondary.className = "card__secondary";
    secondary.textContent = character.species;

    const detailButton = document.createElement("button");
    detailButton.className = "card__button";
    detailButton.type = "button";
    detailButton.textContent = "Ver detalle";
    detailButton.setAttribute("aria-label", `Ver detalle de ${character.name}`);
    detailButton.dataset.characterId = String(character.id);

    content.append(name, createStatusBadge(character.status), secondary, detailButton);
    article.append(imageWrap, content);
    return article;
}

function createCatalogUrl() {
    const params = new URLSearchParams();
    const status = filterForm.elements.status.value;
    const species = filterForm.elements.species.value.trim();
    const gender = filterForm.elements.gender.value;

    if (status) params.set("status", status);
    if (species) params.set("species", species);
    if (gender) params.set("gender", gender);

    const query = params.toString();
    return query ? `${API_URL}/?${query}` : `${API_URL}/`;
}

function showCatalogError(message, retryUrl, append) {
    catalogError.replaceChildren();

    const text = document.createElement("p");
    text.textContent = message;

    const retryButton = document.createElement("button");
    retryButton.className = "button button--retry";
    retryButton.type = "button";
    retryButton.textContent = "Reintentar";
    retryButton.addEventListener("click", () => loadPage(retryUrl, append));

    catalogError.append(text, retryButton);
    catalogError.hidden = false;
}

async function loadPage(url, append) {
    catalogController?.abort();
    catalogController = new AbortController();
    const requestId = ++catalogRequestId;
    lastRequestedPage = { url, append };
    moreButton.disabled = true;
    catalogError.hidden = true;
    catalogMessage.hidden = false;
    catalogMessage.textContent = append
        ? "Cargando más personajes…"
        : "Buscando personajes en la base de datos…";
    cardList.setAttribute("aria-busy", "true");

    if (!append) {
        cardList.replaceChildren();
        catalogCount.textContent = "";
        nextPageUrl = null;
        moreButton.hidden = true;
    }

    try {
        const response = await fetch(url, { signal: catalogController.signal });
        let payload;

        try {
            payload = await response.json();
        } catch {
            throw new Error("La API devolvió una respuesta que no es JSON válido.");
        }

        if (response.status === 404 && isObject(payload) && typeof payload.error === "string") {
            nextPageUrl = null;
            catalogCount.textContent = "0 resultados";
            catalogMessage.textContent = "No encontramos personajes con esos filtros.";
            moreButton.hidden = true;
            return;
        }

        if (!response.ok) {
            throw new Error(`La API respondió con el estado HTTP ${response.status}.`);
        }

        if (!isObject(payload)
            || !isObject(payload.info)
            || !Array.isArray(payload.results)
            || !(payload.info.next === null || typeof payload.info.next === "string")
            || !payload.results.every(isCharacterSummary)) {
            throw new Error("La API devolvió datos de personajes con un formato inesperado.");
        }

        const fragment = document.createDocumentFragment();
        payload.results.forEach((character, index) => {
            fragment.append(createCharacterCard(character, index));
        });
        cardList.append(fragment);

        nextPageUrl = payload.info.next;
        catalogCount.textContent = `${payload.info.count} registros`;
        catalogMessage.textContent = append
            ? `${cardList.children.length} personajes cargados.`
            : `${payload.results.length} personajes encontrados.`;
        moreButton.hidden = !nextPageUrl;
    } catch (error) {
        if (error.name === "AbortError" || requestId !== catalogRequestId) return;

        catalogMessage.textContent = append
            ? "No se pudieron cargar más personajes."
            : "No se pudo conectar con la base de datos.";
        showCatalogError(
            `Error al consultar los personajes: ${error.message}`,
            url,
            append,
        );
        if (append) moreButton.hidden = !nextPageUrl;
    } finally {
        if (requestId === catalogRequestId) {
            moreButton.disabled = false;
            cardList.setAttribute("aria-busy", "false");
        }
    }
}

function resetModal() {
    const avatar = document.querySelector("#modal-imagen");
    const status = document.querySelector("#modal-status");
    const details = document.querySelector("#modal-detalles");
    const message = document.querySelector("#modal-mensaje");
    const error = document.querySelector("#error-modal");

    document.querySelector("#modal-nombre").textContent = "Cargando personaje…";
    avatar.hidden = true;
    avatar.removeAttribute("src");
    avatar.alt = "";
    status.hidden = true;
    status.textContent = "";
    status.className = "status-badge";
    details.hidden = true;
    error.hidden = true;
    message.hidden = false;
    message.textContent = "Consultando el registro del personaje…";
    modal.setAttribute("aria-busy", "true");
}

async function loadCharacterDetail(characterId) {
    detailController?.abort();
    detailController = new AbortController();
    resetModal();

    try {
        const response = await fetch(`${API_URL}/${characterId}`, {
            signal: detailController.signal,
        });
        if (!response.ok) {
            throw new Error(`La API respondió con el estado HTTP ${response.status}.`);
        }

        let character;
        try {
            character = await response.json();
        } catch {
            throw new Error("La API devolvió una respuesta que no es JSON válido.");
        }

        if (!isCharacterDetail(character)) {
            throw new Error("La API devolvió un detalle de personaje con un formato inesperado.");
        }
        if (!modal.open || character.id !== lastCharacterId) return;

        const avatar = document.querySelector("#modal-imagen");
        const status = document.querySelector("#modal-status");

        document.querySelector("#modal-nombre").textContent = character.name;
        avatar.src = character.image;
        avatar.alt = `Retrato de ${character.name}`;
        avatar.hidden = false;
        status.textContent = getStatusLabel(character.status);
        status.className = `status-badge ${getStatusClass(character.status)} ${getStatusThemeClasses(character.status)}`;
        status.hidden = false;

        document.querySelector("#modal-especie").textContent = character.species;
        document.querySelector("#modal-genero").textContent = character.gender;
        document.querySelector("#modal-origen").textContent = character.origin.name;
        document.querySelector("#modal-ubicacion").textContent = character.location.name;
        document.querySelector("#modal-episodios").textContent = String(character.episode.length);

        document.querySelector("#modal-mensaje").hidden = true;
        document.querySelector("#modal-detalles").hidden = false;
    } catch (error) {
        if (error.name === "AbortError") return;

        const errorContainer = document.querySelector("#error-modal");
        document.querySelector("#error-modal-texto").textContent =
            `No se pudo cargar el detalle: ${error.message}`;
        document.querySelector("#modal-mensaje").hidden = true;
        errorContainer.hidden = false;
    } finally {
        if (modal.open && characterId === lastCharacterId) {
            modal.setAttribute("aria-busy", "false");
        }
    }
}

function openModal(characterId, trigger) {
    if (modal.open) return;

    lastCharacterId = characterId;
    openingButton = trigger;
    modal.classList.remove("is-closing");
    resetModal();
    modal.showModal();
    closeIconButton.focus();
    loadCharacterDetail(characterId);
}

function closeModal() {
    if (!modal.open || modal.classList.contains("is-closing")) return;
    modal.classList.add("is-closing");
    window.setTimeout(() => {
        if (modal.open && modal.classList.contains("is-closing")) finishModalClose();
    }, 250);
}

function finishModalClose() {
    if (modal.open) modal.close();
    modal.classList.remove("is-closing");
    detailController?.abort();
    if (openingButton?.isConnected) openingButton.focus({ preventScroll: true });
    openingButton = null;
    lastCharacterId = null;
}

modal.addEventListener("animationend", (event) => {
    if (event.target === modal && event.animationName === "modal-exit") {
        finishModalClose();
    }
});

modal.addEventListener("close", finishModalClose);

modal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeModal();
});

modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
    if (!modal.open) return;

    if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = [...modal.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter((element) => !element.hidden && element.getClientRects().length > 0);

    if (focusableElements.length === 0) {
        event.preventDefault();
        closeIconButton.focus();
        return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const focusIsOutside = !modal.contains(document.activeElement);

    if (event.shiftKey && (document.activeElement === firstElement || focusIsOutside)) {
        event.preventDefault();
        lastElement.focus();
    } else if (!event.shiftKey && (document.activeElement === lastElement || focusIsOutside)) {
        event.preventDefault();
        firstElement.focus();
    }
});

cardList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-character-id]");
    if (!button || !cardList.contains(button)) return;
    openModal(Number(button.dataset.characterId), button);
});

filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loadPage(createCatalogUrl(), false);
});

moreButton.addEventListener("click", () => {
    if (nextPageUrl) loadPage(nextPageUrl, true);
});

closeButton.addEventListener("click", closeModal);
closeIconButton.addEventListener("click", closeModal);
retryDetailButton.addEventListener("click", () => {
    if (lastCharacterId !== null) loadCharacterDetail(lastCharacterId);
});

loadPage(createCatalogUrl(), false);
