// ============================================================
//  CONFIGURACIÓN DE PROYECTOS
//  Editá este archivo para agregar o quitar repos monitoreados.
//  Solo se admiten repositorios PÚBLICOS (no se usan tokens).
// ============================================================

export const PROJECTS = [
  {
    id: "paraiso",
    name: "Paraíso Escondido",
    owner: "gastoncema",
    repo: "paraiso-escondido",
    workflowHint: "pages",
    pagesUrl: "https://gastoncema.github.io/paraiso-escondido/"
  },
  {
    id: "luca",
    name: "Luca Park",
    owner: "gastoncema",
    repo: "luca-park",
    workflowHint: "pages",
    pagesUrl: "https://gastoncema.github.io/luca-park/"
  }
];

// Minutos sin actividad tras los cuales la pantalla vuelve a azul ("esperando tarea IA").
export const IDLE_AFTER_MINUTES = 60;

// Cada cuántos segundos se vuelve a consultar la API de GitHub.
export const REFRESH_SECONDS = 30;
