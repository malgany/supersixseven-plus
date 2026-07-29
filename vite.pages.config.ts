import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const projectUrl = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  root: projectUrl("./static-site"),
  base: "/supersixseven-plus/",
  publicDir: projectUrl("./public"),
  plugins: [react()],
  build: {
    outDir: projectUrl("./pages-dist"),
    emptyOutDir: true,
  },
});
