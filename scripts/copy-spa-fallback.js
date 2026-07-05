import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const indexPath = resolve("dist", "index.html");
const fallbackPath = resolve("dist", "404.html");

if (existsSync(indexPath)) {
  copyFileSync(indexPath, fallbackPath);
  console.log("Created dist/404.html for GitHub Pages SPA fallback.");
}
