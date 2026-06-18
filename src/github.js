// ============================================================
//  CLIENTE DE LA API PÚBLICA DE GITHUB ACTIONS
//  Sin tokens, sin credenciales. Solo repos públicos.
// ============================================================

const API = "https://api.github.com";

// Consulta los workflow runs recientes de un repo.
export async function fetchRuns(project) {
  const url = `${API}/repos/${project.owner}/${project.repo}/actions/runs?per_page=10`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json"
    }
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    if (res.status === 403) detail = "Límite de la API de GitHub alcanzado (403)";
    if (res.status === 404) detail = "Repo no encontrado o privado (404)";
    throw new Error(detail);
  }

  const data = await res.json();
  return Array.isArray(data.workflow_runs) ? data.workflow_runs : [];
}

// Consulta todos los proyectos en paralelo. Nunca lanza: devuelve { runs, error }.
export async function fetchAll(projects) {
  const settled = await Promise.all(
    projects.map(async (project) => {
      try {
        const runs = await fetchRuns(project);
        return { project, runs, error: null };
      } catch (error) {
        return { project, runs: [], error };
      }
    })
  );
  return settled;
}
