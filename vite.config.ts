import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  publicDir: "assets",
  // Allow non-VITE_ envs that start with APP_
  envPrefix: ["VITE_", "APP_"],
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
