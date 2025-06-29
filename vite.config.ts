
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(async () => {
  const { default: basicSsl } = await import('@vitejs/plugin-basic-ssl');

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      basicSsl(),
      componentTagger(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client/src"),
      },
    },
    optimizeDeps: {
      exclude: ["@babel/traverse"],
    },
  };
});
