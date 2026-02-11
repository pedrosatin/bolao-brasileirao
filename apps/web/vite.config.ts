import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      input: {
        main: new URL('./index.html', import.meta.url).pathname,
        rankings: new URL('./rankings.html', import.meta.url).pathname,
        history: new URL('./history.html', import.meta.url).pathname,
      }
    }
  }
});
