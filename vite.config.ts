import { defineConfig } from "vite";

export default defineConfig({
  assetsInclude: ["**/*.webp", "**/*.png", "**/*.json"],
  server: {
    port: 3000,
  },
});
