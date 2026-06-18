import { IDLE_AFTER_MINUTES } from "./projects.js";

// ============================================================
//  MAPEO DE ESTADOS
//  La app ya no consulta la API de GitHub: lee status.json.
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
  idle: {
    state: "idle",
    color: "blue",
    bigText: "ESPERANDO TAREA IA",
    bg: "#1e3a8a", // azul
    fg: "#dbeafe"
  },
  unknown: {
    state: "unknown",
    color: "gray",
    bigText: "SIN DATOS / ERROR",
    bg: "#4b5563", // gris
    fg: "#f3f4f6"
  }
};

// Convierte el contenido de status.json en lo que se muestra en pantalla,
// aplicando la regla de inactividad (más de IDLE_AFTER_MINUTES => azul).
export function computeDisplay(data, now = Date.now()) {
  if (!data || typeof data !== "object" || !data.status) {
    return { ...STATES.unknown, data: data || null, idleOverridden: false };
  }

  const base = STATES[data.status] || STATES.unknown;

  // "working" siempre se muestra tal cual (hay algo corriendo).
  if (data.status === "working") {
    return { ...base, data, idleOverridden: false };
  }

  // Para estados terminados: si el dato es viejo, mostrar azul "esperando".
  const ts = data.updatedAt ? Date.parse(data.updatedAt) : NaN;
  if (!Number.isNaN(ts)) {
    const ageMs = now - ts;
    if (ageMs > IDLE_AFTER_MINUTES * 60 * 1000) {
      return { ...STATES.idle, data, idleOverridden: true };
    }
  }

  return { ...base, data, idleOverridden: false };
}
