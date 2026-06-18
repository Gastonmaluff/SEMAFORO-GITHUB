import { IDLE_AFTER_MINUTES } from "./projects.js";

// ============================================================
//  MAPEO DE ESTADOS
//  Cada estado define color y texto grande para la pantalla.
// ============================================================

export const STATES = {
  working: {
    state: "working",
    color: "yellow",
    bigText: "TRABAJANDO...",
    bg: "#facc15", // amarillo
    fg: "#1a1a00"
  },
  success: {
    state: "success",
    color: "green",
    bigText: "LISTO PARA REVISAR",
    bg: "#16a34a", // verde
    fg: "#04210f"
  },
  failed: {
    state: "failed",
    color: "red",
    bigText: "FALLÓ EL DEPLOY",
    bg: "#dc2626", // rojo
    fg: "#2a0606"
  },
  action_required: {
    state: "action_required",
    color: "purple",
    bigText: "REQUIERE ACCIÓN",
    bg: "#9333ea", // violeta
    fg: "#1c0633"
  },
  unknown: {
    state: "unknown",
    color: "gray",
    bigText: "SIN DATOS / ERROR",
    bg: "#4b5563", // gris
    fg: "#f3f4f6"
  },
  idle: {
    state: "idle",
    color: "blue",
    bigText: "ESPERANDO TAREA IA",
    bg: "#1e3a8a", // azul
    fg: "#dbeafe"
  }
};

const RUNNING_STATUSES = ["queued", "requested", "waiting", "pending", "in_progress"];
const FAILED_CONCLUSIONS = ["failure", "cancelled", "timed_out"];

// Elige el run relevante entre los recibidos.
// Prioriza el workflow cuyo nombre contenga workflowHint; si no, el más reciente.
export function pickRun(runs, workflowHint) {
  if (!Array.isArray(runs) || runs.length === 0) return null;

  // La API ya devuelve los runs ordenados del más reciente al más viejo.
  if (workflowHint) {
    const hint = workflowHint.toLowerCase();
    const match = runs.find((r) => {
      const name = (r.name || r.display_title || "").toLowerCase();
      const path = (r.path || "").toLowerCase();
      return name.includes(hint) || path.includes(hint);
    });
    if (match) return match;
  }
  return runs[0];
}

// Deriva el estado "crudo" de GitHub (sin aplicar la regla de inactividad).
export function deriveRawState(run) {
  if (!run) return "unknown";

  const status = (run.status || "").toLowerCase();
  const conclusion = (run.conclusion || "").toLowerCase();

  if (RUNNING_STATUSES.includes(status)) return "working";

  if (status === "completed") {
    if (conclusion === "success") return "success";
    if (FAILED_CONCLUSIONS.includes(conclusion)) return "failed";
    if (conclusion === "action_required") return "action_required";
    return "unknown";
  }

  return "unknown";
}

// Marca temporal de la última actividad del run (updated_at, fallback created_at).
export function runActivityMs(run) {
  if (!run) return 0;
  const t = run.updated_at || run.created_at;
  const ms = t ? Date.parse(t) : 0;
  return Number.isNaN(ms) ? 0 : ms;
}

// Construye el resultado por proyecto a partir de los runs y posibles errores.
export function buildProjectResult(project, runs, error, now = Date.now()) {
  if (error) {
    return {
      project,
      run: null,
      rawState: "unknown",
      isRunning: false,
      activityMs: 0,
      ageMs: Infinity,
      error: error.message || String(error)
    };
  }

  const run = pickRun(runs, project.workflowHint);
  const rawState = deriveRawState(run);
  const activityMs = runActivityMs(run);

  return {
    project,
    run,
    rawState,
    isRunning: rawState === "working",
    activityMs,
    ageMs: activityMs ? now - activityMs : Infinity,
    error: null
  };
}

// Regla global: elige el proyecto que manda en la pantalla principal.
export function selectGlobal(results, now = Date.now()) {
  const idleMs = IDLE_AFTER_MINUTES * 60 * 1000;

  // 1. Si algún repo tiene un workflow corriendo, gana el más reciente.
  const running = results.filter((r) => r.isRunning);
  if (running.length > 0) {
    const chosen = mostRecent(running);
    return { ...STATES.working, result: chosen };
  }

  // 2. Sin nada corriendo: el proyecto con actividad terminada más reciente
  //    dentro de la ventana de inactividad.
  const finished = results.filter(
    (r) =>
      r.run &&
      r.activityMs > 0 &&
      now - r.activityMs <= idleMs &&
      ["success", "failed", "action_required"].includes(r.rawState)
  );

  if (finished.length > 0) {
    const chosen = mostRecent(finished);
    const stateDef = STATES[chosen.rawState] || STATES.unknown;
    return { ...stateDef, result: chosen };
  }

  // 3. Hay datos pero ninguna actividad reciente -> azul, esperando.
  const withData = results.filter((r) => r.run);
  if (withData.length > 0) {
    const chosen = mostRecent(withData);
    return { ...STATES.idle, result: chosen };
  }

  // 4. Ningún dato (todos error / sin runs) -> gris.
  return { ...STATES.unknown, result: results[0] || null };
}

function mostRecent(list) {
  return list.reduce((best, r) => (r.activityMs > best.activityMs ? r : best));
}
