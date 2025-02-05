import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    // Enable manifest generation
    manifest: true,
    // Add content hash to file names
    rollupOptions: {
      output: {
        entryFileNames: "[name].[hash].js",
        chunkFileNames: "[name].[hash].js",
        assetFileNames: "[name].[hash].[ext]"
      }
    }
  },
  optimizeDeps: {
    include: ["@mui/material/Tooltip", "@emotion/styled"]
  },
  server: {
    fs: {
      strict: false
    },
    middlewareMode: false
  }
});
