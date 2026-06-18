// ============================================================
//  CONFIGURACIÓN DE PROYECTOS
//  Editá este archivo para agregar o quitar repos monitoreados.
//  Solo se admiten repositorios PÚBLICOS (no se usan tokens).
// ============================================================

export const PROJECTS = [
  {
    id: "panel-quintas",
    name: "Panel de Quintas",
    owner: "Gastonmaluff",
    repo: "Panel-de-Quintas-",
    workflowHint: "pages",
    pagesUrl: "https://gastonmaluff.github.io/Panel-de-Quintas-/"
  },
  {
    id: "next-control",
    name: "Next Control",
    owner: "Gastonmaluff",
    repo: "NEXT-CONTROL",
    workflowHint: "pages",
    pagesUrl: "https://gastonmaluff.github.io/NEXT-CONTROL/"
  },
  {
    id: "luca",
    name: "Luca Park",
    owner: "Gastonmaluff",
    repo: "LUCCAPARK-APP",
    workflowHint: "pages",
    pagesUrl: "https://gastonmaluff.github.io/LUCCAPARK-APP/"
  }
];

// Minutos sin actividad tras los cuales la pantalla vuelve a azul ("esperando tarea IA").
export const IDLE_AFTER_MINUTES = 60;

// Cada cuántos segundos se vuelve a leer status.json (archivo estático, sin rate limit).
export const REFRESH_SECONDS = 5;
