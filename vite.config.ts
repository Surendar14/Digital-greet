import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    assetsInlineLimit: 8192,
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ["framer-motion"],
          react: ["react", "react-dom"]
        }
      }
    }
  }
});
