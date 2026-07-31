import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  supportedQuestionLanguages,
  validateFullBackup,
  validateQuestionBankImport
} from "../src/components/data/questionBankSchemas.js";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const dataDir = join(rootDir, "src", "components", "data");

const bundledBanks = [
  "cybersecurityAwarenessQuestions.json",
  "usCitizenship2025Questions.json",
  "comptiaSecurity701Questions.json"
];

const readJson = (relativePath) => JSON.parse(readFileSync(join(dataDir, relativePath), "utf8"));

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const assertUniqueQuestionIds = (bank, filename) => {
  supportedQuestionLanguages.forEach((language) => {
    const ids = new Set();
    (bank[language] || []).forEach((question) => {
      const id = String(question.id);
      assert(!ids.has(id), `${filename}:${language} has duplicate question id ${id}`);
      ids.add(id);
    });
  });
};

const assertAnswerInvariants = (bank, filename) => {
  supportedQuestionLanguages.forEach((language) => {
    (bank[language] || []).forEach((question) => {
      const answers = Array.isArray(question.correct_answers)
        ? question.correct_answers
        : [question.correct_answer];
      answers.forEach((answer) => {
        assert(Number.isInteger(answer), `${filename}:${language}:${question.id} answer index must be an integer`);
        assert(answer >= 0 && answer < question.options.length, `${filename}:${language}:${question.id} answer index is outside options`);
      });
    });
  });
};

const validateBundledBanks = () => {
  bundledBanks.forEach((filename) => {
    const bank = readJson(filename);
    validateQuestionBankImport(bank);
    assertUniqueQuestionIds(bank, filename);
    assertAnswerInvariants(bank, filename);
  });
};

const validateImportShapes = () => {
  const sampleQuestion = {
    id: "sample-001",
    category: "module_1",
    block_id: 1,
    block_name: "Sample",
    difficulty: "beginner",
    tags: ["sample"],
    question: "What is the safest answer?",
    options: ["A", "B", "C", "D"],
    correct_answer: 0,
    explanation: "A is correct."
  };

  validateQuestionBankImport({ en: [sampleQuestion], es: [] });
  validateQuestionBankImport({
    bank: {
      id: "sample-bank",
      name: { en: "Sample", es: "Ejemplo" },
      description: { en: "Sample bank", es: "Banco de ejemplo" },
      baseQuestions: { en: [sampleQuestion], es: [] }
    }
  });

  assert(
    (() => {
      try {
        validateQuestionBankImport({ en: [{ ...sampleQuestion, correct_answer: 8 }] });
        return false;
      } catch {
        return true;
      }
    })(),
    "Invalid answer indexes must be rejected"
  );
};

const validateBackupShape = () => {
  const sampleQuestion = {
    id: "backup-001",
    category: "module_1",
    question: "Backup question?",
    options: ["Yes", "No"],
    correct_answer: 0
  };
  const catalog = {
    version: 1,
    activeBankId: "backup-bank",
    banks: {
      "backup-bank": {
        id: "backup-bank",
        name: "Backup Bank",
        baseQuestions: { en: [sampleQuestion], es: [] }
      }
    }
  };

  validateFullBackup({
    version: 1,
    type: "smartquiz-full-backup",
    exported_at: new Date("2026-07-31T00:00:00.000Z").toISOString(),
    catalog,
    scopedData: {
      "backup-bank": {
        quiz_attempts: [],
        user_quiz_settings: null,
        gamification_profile: null,
        learning_state: null
      }
    },
    global: { language: "en" }
  });
};

try {
  validateBundledBanks();
  validateImportShapes();
  validateBackupShape();
  console.log("Schema validation passed.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
