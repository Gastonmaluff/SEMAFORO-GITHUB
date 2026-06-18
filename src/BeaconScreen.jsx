import { formatTime, timeSince } from "./time.js";

// Pantalla principal: una sola vista pensada para verse desde lejos en la Steam Deck.
// Recibe el estado ya resuelto desde status.json.
export default function BeaconScreen({
  display,
  data,
  loading,
  offline,
  countdown,
  lastFetch,
  muted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
  onRefresh,
  onOpenProjects,
  wakeSupported,
  wakeActive
}) {
  if (loading || !display) {
    return (
      <div className="beacon" style={{ background: "#111827", color: "#e5e7eb" }}>
        <div className="beacon-big">CARGANDO…</div>
        <div className="beacon-sub">Leyendo status.json</div>
      </div>
    );
  }

  const project = data?.project;
  const repo = data?.repo;
  const message = data?.message;
  const runUrl = data?.runUrl;
  const pagesUrl = data?.pagesUrl;
  const updatedAt = data?.updatedAt;

  return (
    <div className="beacon" style={{ background: display.bg, color: display.fg }}>
      {/* Barra superior de controles */}
      <div className="topbar">
        <button className="btn" onClick={onOpenProjects}>
          Ver proyectos
        </button>
        <div className="spacer" />
        <button className="btn" onClick={onToggleMute} title="Silenciar sonido">
          {muted ? "🔇 Silencio" : "🔊 Sonido"}
        </button>
        <button className="btn" onClick={onRefresh} title="Actualizar ahora">
          ↻ Actualizar
        </button>
        <button className="btn" onClick={onToggleFullscreen}>
          {isFullscreen ? "⤢ Salir" : "⤢ Pantalla completa"}
        </button>
      </div>

      {/* Núcleo: estado gigante */}
      <div className="beacon-core">
        <div className="beacon-big">{display.bigText}</div>

        {project && <div className="beacon-project">{project}</div>}

        <div className="beacon-meta">
          {repo && <span className="repo">{repo}</span>}
          {message && <span className="wf">{message}</span>}
        </div>

        <div className="beacon-times">
          <span>Última actualización: {formatTime(updatedAt)}</span>
          <span>Cambió {timeSince(updatedAt)}</span>
        </div>

        {display.idleOverridden && (
          <div className="beacon-note">
            Sin actividad reciente — esperando una nueva tarea.
          </div>
        )}

        {offline && (
          <div className="beacon-error">
            ⚠ No se pudo leer status.json. Mostrando el último estado conocido.
          </div>
        )}

        <div className="beacon-links">
          {runUrl && (
            <a href={runUrl} target="_blank" rel="noreferrer">
              Abrir run en GitHub →
            </a>
          )}
          {pagesUrl && (
            <a href={pagesUrl} target="_blank" rel="noreferrer">
              Abrir sitio publicado →
            </a>
          )}
        </div>
      </div>

      {/* Pie: contador y estado de servicios */}
      <div className="bottombar">
        <span>Próxima revisión en {countdown} s</span>
        <span className="dot">•</span>
        <span>Datos: {lastFetch ? formatTime(new Date(lastFetch).toISOString()) : "—"}</span>
        <span className="dot">•</span>
        <span>
          Wake Lock:{" "}
          {!wakeSupported ? "no disponible" : wakeActive ? "activo" : "inactivo"}
        </span>
      </div>
    </div>
  );
}
