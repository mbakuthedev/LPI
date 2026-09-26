import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const allowedHosts = ["lpi.onrender.com", ".onrender.com"];

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 5173,
    strictPort: !process.env.PORT,
    allowedHosts,
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 4173,
    allowedHosts,
  },
});

