import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    commonjsOptions: {
      esmExternals: true,
    },
  },
  server: {
    proxy: {
      "/api/news": {
        target: "https://data.cityofchicago.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/news/, "/resource/ijzp-q8t2.json"),
      },
      "/api/saved-news": {
        target: "http://localhost:8000", // Replace with your backend server
        changeOrigin: true,
      },
    },
  },
});
