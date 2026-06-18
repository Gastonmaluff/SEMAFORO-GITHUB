import { STATES } from "./status.js";
import { formatTime, timeSince } from "./time.js";

// Vista secundaria: una card por proyecto con su último estado.
export default function ProjectsPanel({ results, onBack }) {
  return (
    <div className="panel">
      <div className="topbar">
        <button className="btn" onClick={onBack}>
          ← Volver al semáforo
        </button>
        <div className="spacer" />
        <h1 className="panel-title">Proyectos</h1>
      </div>

      <div className="cards">
        {results.map((r) => {
          const def = STATES[r.rawState] || STATES.unknown;
          const { project, run } = r;
          return (
            <div
              className="card"
              key={project.id}
              style={{ borderColor: def.bg }}
            >
              <div className="card-head" style={{ background: def.bg, color: def.fg }}>
                <span className="card-name">{project.name}</span>
                <span className="card-badge">{def.bigText}</span>
              </div>

              <div className="card-body">
                <div className="card-row">
                  <span className="k">Repo</span>
                  <span className="v">
                    {project.owner}/{project.repo}
                  </span>
                </div>
                <div className="card-row">
                  <span className="k">Status</span>
                  <span className="v">{run?.status || (r.error ? "error" : "sin runs")}</span>
                </div>
                <div className="card-row">
                  <span className="k">Conclusión</span>
                  <span className="v">{run?.conclusion || "—"}</span>
                </div>
                <div className="card-row">
                  <span className="k">Workflow</span>
                  <span className="v">{run?.name || "—"}</span>
                </div>
                <div className="card-row">
                  <span className="k">Actualizado</span>
                  <span className="v">
                    {formatTime(run?.updated_at)} ({timeSince(run?.updated_at)})
                  </span>
                </div>
                {r.error && (
                  <div className="card-row">
                    <span className="k">Error</span>
                    <span className="v err">{r.error}</span>
                  </div>
                )}
              </div>

              <div className="card-links">
                {run?.html_url ? (
                  <a href={run.html_url} target="_blank" rel="noreferrer">
                    GitHub →
                  </a>
                ) : (
                  <a
                    href={`https://github.com/${project.owner}/${project.repo}/actions`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub →
                  </a>
                )}
                {project.pagesUrl && (
                  <a href={project.pagesUrl} target="_blank" rel="noreferrer">
                    GitHub Pages →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
