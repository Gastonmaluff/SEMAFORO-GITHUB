# AI Task Beacon 🚦

Semáforo visual para una **Steam Deck** (o cualquier navegador) que muestra de un
vistazo si una tarea de Codex / Claude terminó de hacer **deploy en GitHub Pages**.

- Pantalla completa de color según el estado del último deploy.
- Texto gigante visible desde lejos.
- Sin servidor, sin backend, **sin tokens en el frontend**.
- **Sin rate limit**: la app lee un archivo estático, no la API de GitHub.

## Estados

| Color    | Estado            | Texto                |
| -------- | ----------------- | -------------------- |
| 🔵 Azul    | `idle`            | ESPERANDO TAREA IA   |
| 🟡 Amarillo | `working`        | TRABAJANDO…          |
| 🟢 Verde   | `success`         | LISTO PARA REVISAR   |
| 🔴 Rojo    | `failed`          | FALLÓ EL DEPLOY      |
| 🟣 Violeta | `action_required` | REQUIERE ACCIÓN      |
| ⚪ Gris    | `unknown`         | SIN DATOS / ERROR    |

---

## 🆕 Arquitectura (push, no polling a la API)

Antes la app consultaba la API pública de GitHub Actions cada 30 s y eso disparaba
**rate limit 403** (la API pública permite ~60 req/h por IP). Ahora:

```
  Tu repo (Luca Park, etc.)                Repo del beacon
  ┌─────────────────────────┐             ┌────────────────────────────┐
  │ Workflow de deploy       │             │ update-status.yml          │
  │  ├─ arranca  ──────────► repository_dispatch ──► escribe status.json│
  │  ├─ success  ──────────► (beacon-status)     ──► commit + redeploy  │
  │  └─ failed   ──────────►                      └────────────────────┘
  └─────────────────────────┘                          │
                                                        ▼
                                            GitHub Pages publica /status.json
                                                        │
                                                        ▼
                              Steam Deck lee ./status.json?t=… cada 5 s
```

- Cada repo monitoreado **avisa** al beacon vía `repository_dispatch` cuando su
  deploy arranca / termina / falla.
- El workflow [`update-status.yml`](.github/workflows/update-status.yml) del beacon
  escribe `public/status.json`, lo commitea y **republica** GitHub Pages.
- La app publicada solo lee `./status.json?t=${Date.now()}` (cache busting) cada
  **5 segundos**. Es un archivo estático servido por Pages → **descargas ilimitadas,
  cero rate limit, cero tokens en el navegador**.

### Comportamiento del frontend

- Si `status.json` tiene más de `IDLE_AFTER_MINUTES` (60 min) y **no** está en
  `working`, la pantalla vuelve a **azul** aunque el último estado haya sido success
  o failed (evita quedar verde todo el día por un deploy viejo).
- Si **no se puede leer** `status.json`, mantiene el último estado válido guardado en
  `localStorage` y muestra un aviso chico; **no** salta a gris de inmediato.
- Hace sonar un tono al pasar a **verde** o **rojo** (botón 🔊/🔇 para silenciar).
- Mantiene la pantalla despierta con la **Wake Lock API** y tiene botón de pantalla
  completa.

---

## Uso local

```bash
npm install     # instala dependencias
npm run dev     # http://localhost:5173 (lee public/status.json)
npm run build   # genera /dist
npm run preview # sirve /dist para probar el build
```

Para probar estados en local, editá `public/status.json` y poné, por ejemplo,
`"status": "working"`.

## Configurar proyectos (vista "Ver proyectos")

La lista de referencia que aparece en **"Ver proyectos"** se edita en
[`src/projects.js`](src/projects.js). También ahí ajustás:

```js
export const IDLE_AFTER_MINUTES = 60; // minutos hasta volver a azul
export const REFRESH_SECONDS = 5;     // cada cuánto se lee status.json
```

---

## Publicar el beacon en GitHub Pages

1. Subí este repo a GitHub.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. `push` a `main`: el workflow [`deploy.yml`](.github/workflows/deploy.yml) buildea y
   publica.
4. Queda en: `https://USUARIO.github.io/NOMBRE-DEL-REPO/`

> La `base` en [`vite.config.js`](vite.config.js) debe coincidir **exactamente** con el
> nombre del repo. En este proyecto está como `base: "/SEMAFORO-GITHUB/"`.

---

## 🔑 Configurar el token (secret) para que los repos avisen al beacon

Los otros repos necesitan permiso para mandarle `repository_dispatch` al beacon.

1. Creá un **Personal Access Token**:
   - Clásico: scope **`repo`**, o
   - Fine-grained: acceso **solo al repo del beacon**, permiso
     **Contents: Read and write** (alcanza para disparar `repository_dispatch`).
2. En **cada repo monitoreado** → **Settings → Secrets and variables → Actions →
   New repository secret**, creá:

   | Secret              | Valor                                |
   | ------------------- | ------------------------------------ |
   | `BEACON_REPO_TOKEN` | el PAT que creaste                   |
   | `BEACON_OWNER`      | `Gastonmaluff`                       |
   | `BEACON_REPO`       | `SEMAFORO-GITHUB`                    |

> El token vive **solo en los secrets de GitHub Actions**, nunca en el frontend ni en
> el repo.

---

## 📌 Agregar el bloque `notify-beacon` en cada repo

1. Copiá [`notify-beacon.example.yml`](notify-beacon.example.yml) a tu repo como
   `.github/workflows/notify-beacon.yml`.
2. Editá dos cosas:
   - En `workflows: ["Deploy to GitHub Pages"]`, poné el **name exacto** del workflow
     de deploy de ese repo (la línea `name:` de su YAML).
   - En `env:`, ajustá `PROJECT_NAME` y `PAGES_URL` para ese proyecto.
3. Asegurate de tener cargados los 3 secrets de arriba.

A partir de ahí, cada vez que ese repo despliegue:

- al **arrancar** → el beacon se pone 🟡 amarillo,
- al **terminar bien** → 🟢 verde,
- al **fallar** → 🔴 rojo.

> El bloque usa el evento `workflow_run` (`requested` / `completed`), así que **no hay
> que modificar** tu workflow de deploy: solo lo escucha.

---

## 🎮 Abrir en la Steam Deck

1. Modo escritorio → navegador (Firefox / Chrome).
2. Entrá a tu link publicado, por ejemplo:
   `https://gastonmaluff.github.io/SEMAFORO-GITHUB/`
3. Tocá **"Pantalla completa"**.
4. Listo: se actualiza sola cada 5 s, mantiene la pantalla despierta y suena al pasar
   a verde / rojo.

> El primer sonido puede requerir un toque en pantalla (los navegadores bloquean el
> audio hasta una interacción del usuario).

---

## ¿Por qué ya no hay rate limit?

| Antes                              | Ahora                                   |
| ---------------------------------- | --------------------------------------- |
| El frontend pegaba a `api.github.com` cada 30 s | El frontend lee un **archivo estático** |
| ~120 req/h por Steam Deck → **403** | Descargas de GitHub Pages **ilimitadas** |
| Token expuesto si querías más cuota | **Cero tokens** en el navegador          |
| La Deck consultaba *todos* los repos | Los repos **avisan** solo cuando cambian |

El único uso de la API de GitHub queda del lado de los **workflows** (con el token en
secrets), nunca en el navegador de la Steam Deck.
