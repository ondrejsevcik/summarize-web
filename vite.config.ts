import path from "path";
import { defineConfig } from "vite";
import browserExtension from "vite-plugin-web-extension";

function root(...paths: string[]): string {
  return path.resolve(__dirname, ...paths);
}

// Inspired by https://github.com/aklinker1/vite-plugin-web-extension/tree/main/packages/demo-vanilla
export default defineConfig({
  root: "src",
  build: {
    outDir: root("dist"),
    emptyOutDir: true,
  },
  plugins: [
    browserExtension({
      manifest: "manifest.json",
      // additionalInputs: ["popup.html"],
      watchFilePaths: [root("src/manifest.json")],
      browser: process.env.TARGET || "chrome",
    }),
  ],
});
