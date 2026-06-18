import { useEffect, useRef, useState } from "react";

// Mantiene la pantalla despierta usando Wake Lock API si está disponible.
// Reintenta automáticamente cuando la pestaña vuelve a estar visible.
export function useWakeLock(enabled = true) {
  const lockRef = useRef(null);
  const [supported] = useState(() => "wakeLock" in navigator);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled || !supported) return;

    let cancelled = false;

    async function request() {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          lock.release();
          return;
        }
        lockRef.current = lock;
        setActive(true);
        lock.addEventListener("release", () => setActive(false));
      } catch {
        setActive(false);
      }
    }

    function onVisible() {
      if (document.visibilityState === "visible" && !lockRef.current) {
        request();
      }
    }

    request();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      if (lockRef.current) {
        lockRef.current.release().catch(() => {});
        lockRef.current = null;
      }
    };
  }, [enabled, supported]);

  return { supported, active };
}
