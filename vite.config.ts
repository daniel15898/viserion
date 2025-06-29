import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@config": path.resolve(__dirname, "./src/config"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@router": path.resolve(__dirname, "./src/router"),
      "@pages": path.resolve(__dirname, "./src/pages"),
    },
  },
});
