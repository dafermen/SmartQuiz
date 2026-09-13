import { describe, expect, it, vi } from "vitest";
import {
  activateQuestionBank,
  addQuestionBank,
  deleteQuestionBank,
  parseQuestionBankImport
} from "@/components/data/questionBankCatalogStorage";
import {
  getScopedStorageKeyForBank,
  readScopedJson,
  writeScopedJson
} from "@/components/data/activeBankStorage";
import {
  clearMistake,
  getLearningState,
  getReviewQuestionKeys,
  recordQuestionAnswer,
  toggleQuestionFavorite
} from "@/components/data/learningStorage";

const bank = (id) => ({
  id,
  name: id,
  baseQuestions: {
    en: [{
      id: `${id}-1`,
      category: "module_1",
      question: `${id} question?`,
      options: ["Yes", "No"],
      correct_answer: 0
    }],
    es: []
  }
});

describe("bank-scoped storage", () => {
  it("sanitizes storage keys", () => {
    expect(getScopedStorageKeyForBank("bank / unsafe", "progress"))
      .toBe("smartquiz_bank_bank___unsafe_progress");
  });

  it("keeps progress isolated when the active bank changes", () => {
    addQuestionBank(bank("alpha"));
    writeScopedJson("quiz_attempts", [{ score: 90 }]);

    addQuestionBank(bank("beta"));
    writeScopedJson("quiz_attempts", [{ score: 40 }]);

    activateQuestionBank("alpha");
    expect(readScopedJson("quiz_attempts", [])).toEqual([{ score: 90 }]);

    activateQuestionBank("beta");
    expect(readScopedJson("quiz_attempts", [])).toEqual([{ score: 40 }]);
  });

  it("deletes a local bank while preserving the bundled catalog", () => {
    addQuestionBank(bank("only-local"));
    const result = deleteQuestionBank("only-local");
    expect(result.banks["only-local"]).toBeUndefined();
    expect(result.banks["cybersecurity-awareness"]).toBeDefined();
  });

  it("parses JSON strings and rejects malformed imports", () => {
    const parsed = parseQuestionBankImport(JSON.stringify(bank("imported")));
    expect(parsed.id).toBe("imported");
    expect(parsed.baseQuestions.en).toHaveLength(1);
    expect(() => parseQuestionBankImport("{invalid json"))
      .toThrow();
  });
});

describe("learning state", () => {
  it("stores favorites and mistake history in the active bank", () => {
    const eventSpy = vi.spyOn(window, "dispatchEvent");
    const question = {
      id: "q1",
      question_key: "en:q1",
      category: "module_1",
      block_name: "General",
      difficulty: "beginner",
      question: "Question?"
    };

    toggleQuestionFavorite(question);
    expect(getReviewQuestionKeys("favorites")).toEqual(["en:q1"]);

    recordQuestionAnswer({
      ...question,
      question_id: "q1",
      is_correct: false,
      selected_answer: 1,
      correct_answer: 0
    });
    expect(getReviewQuestionKeys("mistakes")).toEqual(["en:q1"]);
    expect(getLearningState().questionStats["en:q1"]).toMatchObject({
      attempts: 1,
      correct: 0,
      incorrect: 1
    });

    clearMistake("en:q1");
    expect(getReviewQuestionKeys("mistakes")).toEqual([]);
    expect(eventSpy).toHaveBeenCalled();
  });
});
