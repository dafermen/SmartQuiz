import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  makeQuestionKey,
  normalizeQuestionRecord
} from "@/components/data/questionBankStorage";

describe("question normalization", () => {
  it("normalizes legacy categories, tags, options and answer indexes", () => {
    const normalized = normalizeQuestionRecord({
      id: 42,
      category: "phishing_awareness",
      question: "Example?",
      options: ["A", "B"],
      correct_answer: 99,
      tags: " phishing, email "
    }, "es");

    expect(normalized.id).toBe("42");
    expect(normalized.category).toBe("module_1");
    expect(normalized.options).toEqual(["A", "B", "", ""]);
    expect(normalized.correct_answer).toBe(3);
    expect(normalized.correct_answers).toEqual([3]);
    expect(normalized.tags).toEqual(["phishing", "email"]);
    expect(normalized.question_key).toBe("es:42");
  });

  it("creates stable language-scoped keys", () => {
    expect(makeQuestionKey("en", "same-id")).toBe("en:same-id");
    expect(makeQuestionKey("es", "same-id")).toBe("es:same-id");
  });

  it("always produces a four-option record with a bounded answer", () => {
    fc.assert(fc.property(
      fc.array(fc.string(), { maxLength: 12 }),
      fc.integer({ min: -1000, max: 1000 }),
      (options, correctAnswer) => {
        const normalized = normalizeQuestionRecord({
          id: "generated",
          question: "Generated question",
          options,
          correct_answer: correctAnswer
        }, "en");

        expect(normalized.options).toHaveLength(4);
        expect(normalized.correct_answer).toBeGreaterThanOrEqual(0);
        expect(normalized.correct_answer).toBeLessThanOrEqual(3);
        expect(normalized.question_key).toBe("en:generated");
      }
    ));
  });
});
