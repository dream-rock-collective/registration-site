import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist-preview",
    rollupOptions: { input: "preview.html" },
  },
});
