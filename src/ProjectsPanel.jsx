import { PROJECTS } from "./projects.js";

// Vista secundaria: lista de referencia de los proyectos configurados.
// Con la nueva arquitectura el estado vivo lo manda cada repo vía status.json,
// así que acá solo mostramos accesos directos a cada proyecto.
export default function ProjectsPanel({ onBack }) {
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
        {PROJECTS.map((project) => (
          <div className="card" key={project.id} style={{ borderColor: "#334155" }}>
            <div className="card-head" style={{ background: "#1e3a8a", color: "#dbeafe" }}>
              <span className="card-name">{project.name}</span>
            </div>

            <div className="card-body">
              <div className="card-row">
                <span className="k">Repo</span>
                <span className="v">
                  {project.owner}/{project.repo}
                </span>
              </div>
              <div className="card-row">
                <span className="k">Workflow</span>
                <span className="v">{project.workflowHint || "—"}</span>
              </div>
            </div>

            <div className="card-links">
              <a
                href={`https://github.com/${project.owner}/${project.repo}/actions`}
                target="_blank"
                rel="noreferrer"
              >
                GitHub Actions →
              </a>
              {project.pagesUrl && (
                <a href={project.pagesUrl} target="_blank" rel="noreferrer">
                  GitHub Pages →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="panel-foot">
        Los proyectos se configuran en <code>src/projects.js</code>. El estado en vivo
        lo envía cada repo al beacon vía <code>repository_dispatch</code>.
      </div>
    </div>
  );
}
