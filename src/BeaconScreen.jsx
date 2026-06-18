import { formatTime, timeSince } from "./time.js";

// Pantalla principal: una sola vista pensada para verse desde lejos en la Steam Deck.
export default function BeaconScreen({
  global,
  loading,
  countdown,
  lastFetch,
  muted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
  onRefresh,
  onOpenProjects,
  wakeSupported,
  wakeActive,
  projectCount
}) {
  if (loading || !global) {
    return (
      <div className="beacon" style={{ background: "#111827", color: "#e5e7eb" }}>
        <div className="beacon-big">CARGANDO…</div>
        <div className="beacon-sub">Consultando GitHub Actions</div>
      </div>
    );
  }

  const r = global.result;
  const project = r?.project;
  const run = r?.run;

  return (
    <div
      className="beacon"
      style={{ background: global.bg, color: global.fg }}
    >
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
        <div className="beacon-big">{global.bigText}</div>

        {project && (
          <div className="beacon-project">{project.name}</div>
        )}

        <div className="beacon-meta">
          {project && (
            <span className="repo">
              {project.owner}/{project.repo}
            </span>
          )}
          {run?.name && <span className="wf">workflow: {run.name}</span>}
        </div>

        <div className="beacon-times">
          <span>Última actualización: {formatTime(run?.updated_at)}</span>
          <span>Cambió {timeSince(run?.updated_at)}</span>
        </div>

        {r?.error && <div className="beacon-error">⚠ {r.error}</div>}

        <div className="beacon-links">
          {run?.html_url && (
            <a href={run.html_url} target="_blank" rel="noreferrer">
              Abrir run en GitHub →
            </a>
          )}
          {project?.pagesUrl && (
            <a href={project.pagesUrl} target="_blank" rel="noreferrer">
              Abrir sitio publicado →
            </a>
          )}
        </div>
      </div>

      {/* Pie: contador y estado de servicios */}
      <div className="bottombar">
        <span>Próxima revisión en {countdown} s</span>
        <span className="dot">•</span>
        <span>{projectCount} proyectos</span>
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
