import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// La base debe coincidir con el nombre del repositorio en GitHub Pages.
// La app se publica en https://gastonmaluff.github.io/SEMAFORO-GITHUB/
export default defineConfig({
  plugins: [react()],
  base: "/SEMAFORO-GITHUB/"
});
