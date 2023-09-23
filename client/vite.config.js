import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
import tsconfigPaths from "vite-tsconfig-paths";
import checker from "vite-plugin-checker";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    plugins: [
      react(),
      eslint(),
      checker({
        typescript: true,
        eslint: {
          lintCommand: `eslint "./src/**/*.{ts,tsx}`,
          dev: {
            logLevel: ["error"],
          },
        },
      }),
      tsconfigPaths(),
    ],
    server: {
      port: 3000,
    },
  };
});
