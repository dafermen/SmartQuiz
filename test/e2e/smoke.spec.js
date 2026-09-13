import { expect, test } from "@playwright/test";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("smartquiz_onboarding", JSON.stringify({ completed: true }));
    localStorage.setItem("smartquiz_language", "en");
  });
});

test("loads the application and its primary study actions", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");

  await expect(page).toHaveTitle(/SmartQuiz/i);
  await expect(page.getByRole("button", { name: /Start Practice/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Study Question Bank/i }).first()).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("opens settings with the question bank administrator", async ({ page }) => {
  await page.goto("/Settings");

  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  await expect(page.getByRole("tab", { name: /Question Banks/i })).toBeVisible();
});

test("serves searchable documentation and returns to the app", async ({ page }) => {
  await page.goto("/docs/");

  await expect(page.getByRole("heading", { name: "SmartQuiz", exact: true })).toBeVisible();
  await expect(page.getByPlaceholder("Buscar docs")).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver a la app" })).toHaveAttribute("href", "/");

  await page.goto("/docs/user-guide.html");
  await expect(page.locator("img.doc-image")).toHaveCount(5);
  await expect(page.locator('img[alt="SmartQuiz desktop home dashboard"]')).toHaveAttribute(
    "src",
    "./images/smartquiz-home-desktop.png"
  );
});

test("exports and restores a complete portable backup", async ({ page }) => {
  await page.goto("/Settings");
  await page.getByRole("button", { name: "Backup", exact: true }).click();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Full Backup", exact: true }).click();
  const download = await downloadPromise;
  const backupPath = await download.path();
  const backup = JSON.parse(await readFile(backupPath, "utf8"));

  expect(download.suggestedFilename()).toMatch(/^smartquiz-full-backup-\d{4}-\d{2}-\d{2}\.json$/);
  expect(backup.type).toBe("smartquiz-full-backup");
  expect(backup.summary.banks).toBeGreaterThan(0);
  expect(backup.summary.questions).toBeGreaterThan(0);

  await page.locator('input[type="file"][accept="application/json,.json"]').setInputFiles({
    name: "smartquiz-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup))
  });

  await expect(page.getByText("Full backup imported successfully.")).toBeVisible();
});
