import { useCallback, useEffect, useRef, useState } from "react";
import { PROJECTS, REFRESH_SECONDS } from "./projects.js";
import { fetchAll } from "./github.js";
import { buildProjectResult, selectGlobal } from "./status.js";
import { useWakeLock } from "./useWakeLock.js";
import { playSuccess, playFailure, unlockAudio } from "./sound.js";
import BeaconScreen from "./BeaconScreen.jsx";
import ProjectsPanel from "./ProjectsPanel.jsx";

export default function App() {
  const [results, setResults] = useState([]); // resultados por proyecto
  const [global, setGlobal] = useState(null); // estado elegido para la pantalla
  const [view, setView] = useState("beacon"); // "beacon" | "projects"
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_SECONDS);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const prevColorRef = useRef(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const { supported: wakeSupported, active: wakeActive } = useWakeLock(true);

  // ---- Consulta a GitHub ----
  const refresh = useCallback(async () => {
    const settled = await fetchAll(PROJECTS);
    const now = Date.now();
    const built = settled.map((s) =>
      buildProjectResult(s.project, s.runs, s.error, now)
    );
    const chosen = selectGlobal(built, now);

    // Sonido al cambiar a verde o rojo.
    const prev = prevColorRef.current;
    if (prev !== null && chosen.color !== prev && !mutedRef.current) {
      if (chosen.color === "green") playSuccess();
      else if (chosen.color === "red") playFailure();
    }
    prevColorRef.current = chosen.color;

    setResults(built);
    setGlobal(chosen);
    setLastFetch(now);
    setLoading(false);
    setCountdown(REFRESH_SECONDS);
  }, []);

  // ---- Ciclo de actualización automática ----
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_SECONDS * 1000);
    return () => clearInterval(id);
  }, [refresh]);

  // ---- Contador "próxima revisión en X s" ----
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ---- Pantalla completa ----
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  }, []);

  // Desbloquea el audio en la primera interacción del usuario.
  const handleInteract = useCallback(() => unlockAudio(), []);

  return (
    <div className="app" onPointerDown={handleInteract} onKeyDown={handleInteract}>
      {view === "beacon" ? (
        <BeaconScreen
          global={global}
          loading={loading}
          countdown={countdown}
          lastFetch={lastFetch}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onRefresh={refresh}
          onOpenProjects={() => setView("projects")}
          wakeSupported={wakeSupported}
          wakeActive={wakeActive}
          projectCount={PROJECTS.length}
        />
      ) : (
        <ProjectsPanel results={results} onBack={() => setView("beacon")} />
      )}
    </div>
  );
}
