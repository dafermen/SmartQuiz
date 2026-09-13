import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  validateFullBackup,
  validateQuestionBankCatalog,
  validateQuestionBankImport
} from "@/components/data/questionBankSchemas";

const createQuestion = (overrides = {}) => ({
  id: "question-1",
  category: "module_1",
  question: "Which option is correct?",
  options: ["Correct", "Incorrect"],
  correct_answer: 0,
  explanation: "The first option is correct.",
  ...overrides
});

describe("question bank schemas", () => {
  it("accepts supported import shapes", () => {
    expect(validateQuestionBankImport({ en: [createQuestion()], es: [] }).en).toHaveLength(1);
    expect(validateQuestionBankImport({
      bank: {
        id: "sample",
        name: "Sample",
        baseQuestions: { en: [createQuestion()], es: [] }
      }
    }).bank.id).toBe("sample");
  });

  it("rejects missing questions and out-of-range answers", () => {
    expect(() => validateQuestionBankImport({ en: [], es: [] })).toThrow(/failed validation/i);
    expect(() => validateQuestionBankImport({
      en: [createQuestion({ correct_answer: 2 })],
      es: []
    })).toThrow(/failed validation/i);
  });

  it("requires the active catalog bank to exist", () => {
    expect(() => validateQuestionBankCatalog({
      version: 1,
      activeBankId: "missing",
      banks: {
        sample: {
          id: "sample",
          baseQuestions: { en: [createQuestion()], es: [] }
        }
      }
    })).toThrow(/active bank id/i);
  });

  it("rejects backups with a different type", () => {
    expect(() => validateFullBackup({
      version: 1,
      type: "unknown-backup",
      catalog: {
        version: 1,
        activeBankId: "sample",
        banks: {
          sample: {
            id: "sample",
            baseQuestions: { en: [createQuestion()], es: [] }
          }
        }
      }
    })).toThrow(/full backup failed validation/i);
  });

  it("accepts every valid generated answer index", () => {
    fc.assert(fc.property(
      fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 8 }),
      fc.integer({ min: 0, max: 7 }),
      (options, answer) => {
        fc.pre(answer < options.length);
        const parsed = validateQuestionBankImport({
          en: [createQuestion({ options, correct_answer: answer })],
          es: []
        });
        expect(parsed.en[0].correct_answer).toBe(answer);
      }
    ));
  });

  it("rejects every generated answer index beyond its options", () => {
    fc.assert(fc.property(
      fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 8 }),
      fc.integer({ min: 0, max: 20 }),
      (options, offset) => {
        expect(() => validateQuestionBankImport({
          en: [createQuestion({ options, correct_answer: options.length + offset })],
          es: []
        })).toThrow(/failed validation/i);
      }
    ));
  });
});
