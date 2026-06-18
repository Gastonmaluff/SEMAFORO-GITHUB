import { useCallback, useEffect, useRef, useState } from "react";
import { REFRESH_SECONDS } from "./projects.js";
import { computeDisplay } from "./status.js";
import { useWakeLock } from "./useWakeLock.js";
import { playSuccess, playFailure, unlockAudio } from "./sound.js";
import BeaconScreen from "./BeaconScreen.jsx";
import ProjectsPanel from "./ProjectsPanel.jsx";

// La app lee un archivo estático publicado en el mismo sitio de GitHub Pages.
// No consulta la API de GitHub desde el frontend => sin rate limit 403.
const STATUS_URL = `${import.meta.env.BASE_URL}status.json`;
const STORAGE_KEY = "beacon:lastStatus";

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [data, setData] = useState(() => loadStored()); // último status.json válido
  const [display, setDisplay] = useState(null);
  const [view, setView] = useState("beacon");
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false); // no se pudo leer status.json
  const [lastFetch, setLastFetch] = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_SECONDS);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const prevColorRef = useRef(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const dataRef = useRef(data);
  dataRef.current = data;

  const { supported: wakeSupported, active: wakeActive } = useWakeLock(true);

  // ---- Lee status.json con cache busting ----
  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${STATUS_URL}?t=${Date.now()}`, {
        cache: "no-store"
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      setData(json);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
      } catch {
        /* almacenamiento no disponible: no es crítico */
      }
      setOffline(false);
      setLastFetch(Date.now());
    } catch {
      // No se pudo leer: mantener el último estado válido y avisar sin pasar a gris.
      setOffline(true);
    } finally {
      setLoading(false);
      setCountdown(REFRESH_SECONDS);
    }
  }, []);

  // ---- Recalcula el display cuando cambian los datos ----
  useEffect(() => {
    if (!data) return;
    const next = computeDisplay(data, Date.now());

    const prev = prevColorRef.current;
    if (prev !== null && next.color !== prev && !mutedRef.current) {
      if (next.color === "green") playSuccess();
      else if (next.color === "red") playFailure();
    }
    prevColorRef.current = next.color;

    setDisplay(next);
  }, [data]);

  // ---- Recalcula periódicamente para aplicar la regla de inactividad ----
  // (aunque status.json no cambie, tras 60 min debe pasar a azul).
  useEffect(() => {
    const id = setInterval(() => {
      if (dataRef.current) setDisplay(computeDisplay(dataRef.current, Date.now()));
    }, 30 * 1000);
    return () => clearInterval(id);
  }, []);

  // ---- Ciclo de actualización cada REFRESH_SECONDS ----
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
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.();
  }, []);

  const handleInteract = useCallback(() => unlockAudio(), []);

  return (
    <div className="app" onPointerDown={handleInteract} onKeyDown={handleInteract}>
      {view === "beacon" ? (
        <BeaconScreen
          display={display}
          data={data}
          loading={loading && !data}
          offline={offline}
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
        />
      ) : (
        <ProjectsPanel onBack={() => setView("beacon")} />
      )}
    </div>
  );
}
