# Explorador interactivo de Rick and Morty

Aplicación web responsiva para buscar personajes de **Rick and Morty**, consultar sus detalles y guardar favoritos. El proyecto utiliza HTML semántico, Tailwind CSS 4 y módulos JavaScript ES6, sin frameworks de interfaz.

## Contenido

- [API utilizada](#api-utilizada)
- [Tecnologías y estructura](#tecnologías-y-estructura)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Uso de la aplicación](#uso-de-la-aplicación)
- [Bitácora del proyecto](#bitácora-del-proyecto)

## API utilizada

- **Nombre:** The Rick and Morty API.
- **Documentación:** [rickandmortyapi.com/documentation](https://rickandmortyapi.com/documentation).
- **Endpoint base:** `https://rickandmortyapi.com/api`.
- **Recursos consultados:** `GET /character/`, `GET /episode/` y `GET /location/`.
- **Búsqueda y filtros:** parámetros opcionales `name` y `status`; por ejemplo, `/character/?name=Morty&status=alive`.
- **Episodios:** filtros `name` y `episode` (código o temporada, por ejemplo `S01`); cada resultado incluye su fecha de emisión y las URLs de sus personajes.
- **Ubicaciones:** filtros `name` y `type`; cada resultado incluye dimensión y URLs de residentes.
- **Favoritos:** `GET /character/{id1},{id2},...` recupera por identificador los personajes guardados.
- **Dashboard:** consulta `info.count` en los tres recursos y en filtros de estado, especie y género para calcular métricas globales.

La respuesta de búsqueda es un objeto paginado con la forma `info` y `results`. `info` incluye datos de paginación (`count`, `pages`, `next`, `prev`) y `results` es una lista de personajes. Cada elemento contiene, entre otros, esta estructura:

```json
{
  "id": 2,
  "name": "Morty Smith",
  "status": "Alive",
  "species": "Human",
  "type": "",
  "gender": "Male",
  "origin": { "name": "unknown", "url": "" },
  "location": { "name": "Citadel of Ricks", "url": "" },
  "image": "https://rickandmortyapi.com/api/character/avatar/2.jpeg"
}
```

La API devuelve hasta 20 resultados por página. Las respuestas HTTP fallidas y los problemas de red se muestran en la interfaz con una opción para reintentar.

## Tecnologías y estructura

```text
Proyecto_Web/
├── Index.html
├── package.json
├── src/
│   └── input.css        # Entrada de Tailwind CSS 4 para el CLI
├── css/
│   └── tailwind.css     # Hoja generada por Tailwind CLI
└── js/
    ├── api.js           # Peticiones fetch, filtros y métricas globales
    ├── main.js          # Estado, eventos, navegación y coordinación
    ├── logica.js        # Funciones puras para personajes
    ├── storage.js       # Persistencia de favoritos en localStorage
    └── ui.js            # Renderizado, estados, tarjetas y modales
```

Los estilos de la interfaz están expresados en clases utilitarias de Tailwind. `src/input.css` solo importa Tailwind y define los archivos fuente que debe escanear el CLI; no se carga en el navegador. `css/tailwind.css` es el CSS compilado que usa la página.

## Instalación y ejecución

Se requiere Node.js y npm. Desde la carpeta `Proyecto_Web`:

```bash
npm install
npm run build:css
```

Para recompilar automáticamente las utilidades CSS durante el desarrollo:

```bash
npm run watch:css
```

En otra terminal, inicia un servidor HTTP local en la misma carpeta:

```bash
python -m http.server 8000
```

Abre [http://localhost:8000/Index.html](http://localhost:8000/Index.html). No abras `Index.html` directamente como archivo: los módulos ES6 y las peticiones `fetch` necesitan servirse mediante HTTP.

## Uso de la aplicación

1. En **Personajes**, busca por nombre y estado, usa **Cargar más** para añadir páginas de resultados, consulta el carnet de identificación o marca personajes como favoritos con el corazón de cada tarjeta.
2. Alterna entre **Todos** y **Favoritos**. Los favoritos se persisten en `localStorage` y se recuperan desde la API.
3. En **Episodios**, busca por nombre o temporada, pagina los resultados y abre **Ver personajes** para consultar el reparto.
4. En **Ubicaciones**, filtra por nombre o tipo, pagina los resultados y abre **Ver residentes** para consultar sus habitantes.
5. En **Dashboard**, consulta los totales y la distribución de personajes por estado vital, especie y género.
6. Las vistas muestran un indicador mientras consultan la API, resultados cuando la respuesta es exitosa y un mensaje accesible con **Reintentar** si ocurre un error.

La preferencia se guarda con la clave `rick-morty-favorites` como una lista JSON de identificadores. Si los datos guardados no se pueden leer o escribir, se informa el error en la interfaz.

## Bitácora del proyecto

Consulta la [Bitácora de Semana 8](../Semana8/BIT%C3%81CORA.docx), alojada en la carpeta `Semana8` del repositorio.
