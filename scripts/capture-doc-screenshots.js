import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium, devices } from "@playwright/test";

const baseUrl = process.env.SMARTQUIZ_BASE_URL || "http://127.0.0.1:5172";
const outputDir = path.resolve(process.cwd(), "docs", "images");

const captures = [
  { name: "smartquiz-home-desktop.png", path: "/", viewport: { width: 1440, height: 1000 } },
  { name: "smartquiz-banks-desktop.png", path: "/Settings", viewport: { width: 1440, height: 1000 } },
  { name: "smartquiz-progress-desktop.png", path: "/Progress", viewport: { width: 1440, height: 1000 } },
  { name: "smartquiz-home-mobile.png", path: "/", device: devices["Pixel 7"] },
  { name: "smartquiz-quiz-mobile.png", path: "/Quiz", device: devices["Pixel 7"] }
];

async function verifyServer() {
  const response = await fetch(baseUrl);
  if (!response.ok) {
    throw new Error(`SmartQuiz is not available at ${baseUrl} (${response.status}).`);
  }
}

async function capture(browser, definition) {
  const contextOptions = definition.device
    ? { ...definition.device, reducedMotion: "reduce", locale: "es-ES" }
    : { viewport: definition.viewport, reducedMotion: "reduce", locale: "es-ES" };
  const context = await browser.newContext(contextOptions);

  await context.addInitScript((captureName) => {
    localStorage.setItem("smartquiz_onboarding", JSON.stringify({ completed: true }));
    localStorage.setItem("smartquiz_language", "es");

    if (captureName === "smartquiz-progress-desktop.png") {
      const scores = [65, 75, 70, 85, 80, 90];
      const attempts = scores.map((percentage, index) => ({
        category: index % 2 === 0 ? "module_1" : "module_2",
        mode: "practice",
        score: Math.round(percentage / 10),
        total_questions: 10,
        percentage,
        time_taken: 310 - (index * 18),
        passed: percentage >= 70,
        language: "es",
        question_results: [
          {
            question_key: `demo-${index}-phishing`,
            question: "Como reconocer un mensaje de phishing?",
            category: "module_1",
            difficulty: "beginner",
            tags: ["Phishing"],
            is_correct: percentage >= 70
          },
          {
            question_key: `demo-${index}-passwords`,
            question: "Que practica protege mejor una contrasena?",
            category: "module_2",
            difficulty: "intermediate",
            tags: ["Passwords"],
            is_correct: percentage >= 80
          }
        ],
        created_date: new Date(Date.now() - ((scores.length - index) * 86400000)).toISOString()
      }));

      localStorage.setItem("smartquiz_bank_cybersecurity-awareness_quiz_attempts", JSON.stringify(attempts));
      localStorage.setItem("smartquiz_bank_cybersecurity-awareness_gamification_profile", JSON.stringify({
        totalXp: 420,
        level: 2,
        completedQuizzes: 6,
        passedQuizzes: 5,
        perfectScores: 0,
        updatedAt: new Date().toISOString()
      }));
      localStorage.setItem("smartquiz_bank_cybersecurity-awareness_learning_state", JSON.stringify({
        version: 1,
        favorites: { favoriteDemo: { question_key: "favoriteDemo" } },
        mistakes: { mistakeDemo: { question_key: "mistakeDemo" } },
        questionStats: {
          phishing: { attempts: 6, correct: 5, incorrect: 1, difficulty: "beginner", tags: ["Phishing"] },
          passwords: { attempts: 6, correct: 4, incorrect: 2, difficulty: "intermediate", tags: ["Passwords"] },
          malware: { attempts: 4, correct: 2, incorrect: 2, difficulty: "advanced", tags: ["Malware"] }
        }
      }));
    }
  }, definition.name);

  const page = await context.newPage();
  await page.goto(new URL(definition.path, baseUrl).toString(), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: path.join(outputDir, definition.name),
    animations: "disabled",
    fullPage: false
  });
  await context.close();
}

await verifyServer();
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch();
try {
  for (const definition of captures) {
    await capture(browser, definition);
  }
} finally {
  await browser.close();
}

console.log(`Captured ${captures.length} SmartQuiz screenshots in docs/images.`);
