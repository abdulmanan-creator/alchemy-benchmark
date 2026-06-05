import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    // Fonts and the React/app code are large; raise the warning ceiling.
    chunkSizeWarningLimit: 1200,
  },
});
