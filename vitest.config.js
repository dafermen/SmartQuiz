import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src")
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.js"],
    include: ["test/unit/**/*.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "coverage",
      include: [
        "src/components/data/activeBankStorage.js",
        "src/components/data/fullBackupStorage.js",
        "src/components/data/learningStorage.js",
        "src/components/data/questionBankSchemas.js",
        "src/components/data/questionBankStorage.js",
        "src/components/gamification/gamification.js",
        "src/components/profile/examProfileStorage.js",
        "src/components/theme/themeStorage.js"
      ],
      thresholds: {
        lines: 60,
        functions: 65,
        statements: 58,
        branches: 52
      }
    }
  }
});
