import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "path";

const resolvePackage = createRequire(import.meta.url).resolve;
const promotionAssets = {
  "ocr/promotion-worker.js": "tesseract.js/dist/worker.min.js",
  "ocr/tesseract-core-lstm.wasm.js": "tesseract.js-core/tesseract-core-lstm.wasm.js",
  "ocr/por.traineddata.gz": "@tesseract.js-data/por/4.0.0_best_int/por.traineddata.gz",
};

const emitPromotionAssets: Plugin = {
  name: "promotion-ocr-assets",
  generateBundle() {
    for (const [fileName, source] of Object.entries(promotionAssets)) {
      this.emitFile({ type: "asset", fileName, source: readFileSync(resolvePackage(source)) });
    }
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 8080,
  },
  plugins: [react(), emitPromotionAssets],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        promotions: path.resolve(__dirname, "painel-promocoes.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
