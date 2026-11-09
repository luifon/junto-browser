import { copyFile, mkdir, rm } from "node:fs/promises";
import { build } from "esbuild";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await build({
  entryPoints: ["src/background.ts", "src/offscreen.ts"],
  outdir: "dist",
  bundle: true,
  format: "esm",
  target: "chrome120",
  sourcemap: false,
  logLevel: "info",
});
await copyFile("src/manifest.json", "dist/manifest.json");
await copyFile("src/offscreen.html", "dist/offscreen.html");
