# AI Task Beacon 🚦

Semáforo visual para una **Steam Deck** (o cualquier navegador) que muestra de un
vistazo si una tarea de Codex / Claude terminó de hacer **deploy en GitHub Pages**.

- Pantalla completa de color según el estado del último workflow.
- Texto gigante visible desde lejos.
- Se actualiza sola cada 30 segundos.
- Sin servidor, sin backend, sin tokens, sin login.
- Solo lee la **API pública** de GitHub Actions de repos **públicos**.

## Estados

| Color    | Significado          |
| -------- | -------------------- |
| 🔵 Azul    | Esperando tarea IA   |
| 🟡 Amarillo | Trabajando…         |
| 🟢 Verde   | Listo para revisar   |
| 🔴 Rojo    | Falló el deploy      |
| 🟣 Violeta | Requiere acción      |
| ⚪ Gris    | Sin datos / error    |

La pantalla muestra **un solo proyecto a la vez**, según esta prioridad:

1. Si **algún** repo tiene un workflow corriendo → amarillo.
2. Si no, gana el repo con actividad más reciente dentro de los últimos
   `IDLE_AFTER_MINUTES` (60 min): verde si terminó bien, rojo si falló.
3. Si no hubo actividad reciente → azul "esperando tarea IA".

## Requisitos

- Node.js 18 o superior.

## Uso local

```bash
npm install     # instala dependencias
npm run dev     # abre el servidor de desarrollo (http://localhost:5173)
npm run build   # genera la versión de producción en /dist
npm run preview # sirve /dist localmente para probar el build
```

## Configurar proyectos

Editá **`src/projects.js`**. Cada proyecto tiene esta forma:

```js
export const PROJECTS = [
  {
    id: "paraiso",                 // identificador único interno
    name: "Paraíso Escondido",     // nombre visible en pantalla
    owner: "gastoncema",           // dueño del repo en GitHub
    repo: "paraiso-escondido",     // nombre del repo (público)
    workflowHint: "pages",         // prioriza el workflow cuyo nombre lo contenga
    pagesUrl: "https://gastoncema.github.io/paraiso-escondido/" // opcional
  }
];
```

En el mismo archivo podés ajustar:

```js
export const IDLE_AFTER_MINUTES = 60; // minutos hasta volver a azul
export const REFRESH_SECONDS = 30;    // cada cuánto se consulta GitHub
```

> ⚠️ Solo funciona con repos **públicos**. No se usan tokens ni credenciales.
> La API pública de GitHub permite ~60 consultas por hora por IP, suficiente
> para refrescar cada 30 s con unos pocos repos.

## Publicar en GitHub Pages

1. Subí este proyecto a un repo de GitHub.
2. En **Settings → Pages**, en *Build and deployment*, elegí **GitHub Actions**
   como *Source*.
3. Hacé `push` a la rama `main`. El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
   buildea y publica automáticamente.
4. La app queda disponible en:
   `https://USUARIO.github.io/NOMBRE-DEL-REPO/`

> **Importante:** la base del sitio está configurada en
> [`vite.config.js`](vite.config.js) como `base: "/ai-task-beacon/"`.
> Tiene que coincidir **exactamente** con el nombre de tu repositorio.
> Si tu repo se llama distinto (por ejemplo `semaforo-github`), cambiá esa
> línea a `base: "/semaforo-github/"` o el sitio cargará en blanco.

## Abrir en la Steam Deck

1. En la Steam Deck, entrá al **modo escritorio**.
2. Abrí el navegador (Firefox / Chrome) y andá a tu link publicado:
   `https://USUARIO.github.io/ai-task-beacon/`
3. Tocá **"Pantalla completa"** (el botón arriba a la derecha).
4. Listo. La app:
   - mantiene la pantalla despierta con la **Wake Lock API**,
   - se actualiza sola cada 30 s,
   - hace sonar un tono al pasar a **verde** o **rojo**
     (usá 🔊/🔇 para silenciar).

> El primer sonido puede requerir un toque en la pantalla, porque los
> navegadores bloquean el audio hasta que hay una interacción del usuario.

## Cómo se prueba el criterio de éxito

1. Abrís el link en la Steam Deck → queda **azul** si no hay actividad.
2. Le pedís una tarea a Codex/Claude en alguno de tus repos.
3. Cuando GitHub Actions arranca → la pantalla se pone **amarilla**.
4. Si el deploy termina bien → **verde**. Si falla → **roja**.
5. Tras 60 min sin actividad → vuelve a **azul**.

No hace falta tocar la Steam Deck en ningún momento.
