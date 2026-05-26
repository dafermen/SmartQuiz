export const QUESTION_BANK_CUSTOMIZATIONS_KEY = "smartquiz_question_bank_customizations";

export const SUPPORTED_QUESTION_LANGUAGES = ["en", "es"];

const emptyLanguageMap = () => (
  Object.fromEntries(SUPPORTED_QUESTION_LANGUAGES.map((language) => [language, []]))
);

const emptyOverrideMap = () => (
  Object.fromEntries(SUPPORTED_QUESTION_LANGUAGES.map((language) => [language, {}]))
);

export const createEmptyQuestionBankCustomizations = () => ({
  customQuestions: emptyLanguageMap(),
  questionOverrides: emptyOverrideMap(),
  deletedQuestionKeys: []
});

const canUseLocalStorage = () => typeof window !== "undefined" && window.localStorage;

const normalizeCustomizations = (rawCustomizations = {}) => ({
  customQuestions: {
    ...emptyLanguageMap(),
    ...(rawCustomizations.customQuestions || {})
  },
  questionOverrides: {
    ...emptyOverrideMap(),
    ...(rawCustomizations.questionOverrides || {})
  },
  deletedQuestionKeys: Array.isArray(rawCustomizations.deletedQuestionKeys)
    ? rawCustomizations.deletedQuestionKeys
    : []
});

export const getQuestionBankCustomizations = () => {
  if (!canUseLocalStorage()) return createEmptyQuestionBankCustomizations();

  try {
    const storedValue = localStorage.getItem(QUESTION_BANK_CUSTOMIZATIONS_KEY);
    if (!storedValue) return createEmptyQuestionBankCustomizations();
    return normalizeCustomizations(JSON.parse(storedValue));
  } catch {
    return createEmptyQuestionBankCustomizations();
  }
};

export const saveQuestionBankCustomizations = (customizations) => {
  const normalizedCustomizations = normalizeCustomizations(customizations);

  if (canUseLocalStorage()) {
    localStorage.setItem(
      QUESTION_BANK_CUSTOMIZATIONS_KEY,
      JSON.stringify(normalizedCustomizations)
    );
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("smartquiz-question-bank-updated"));
  }
  return normalizedCustomizations;
};

export const resetQuestionBankCustomizations = () => (
  saveQuestionBankCustomizations(createEmptyQuestionBankCustomizations())
);

export const makeQuestionKey = (language, questionId) => `${language}:${questionId}`;

export const makeCustomQuestionId = () => (
  `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
);

const normalizeTags = (tags, fallbackCategory) => {
  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return String(fallbackCategory || "general")
    .split("_")
    .filter(Boolean);
};

export const normalizeQuestionRecord = (question, language, source = "base") => {
  const id = String(question.id || makeCustomQuestionId());
  const category = question.category || "phishing_awareness";
  const options = Array.isArray(question.options)
    ? question.options.slice(0, 4)
    : ["", "", "", ""];
  const correctAnswer = Number.isInteger(question.correct_answer)
    ? question.correct_answer
    : Number(question.correct_answer) || 0;

  return {
    id,
    category,
    block_id: Number(question.block_id) || 1,
    block_name: question.block_name || "General",
    question: question.question || "",
    options: [...options, "", "", "", ""].slice(0, 4),
    correct_answer: Math.max(0, Math.min(3, correctAnswer)),
    explanation: question.explanation || "",
    difficulty: question.difficulty || "beginner",
    tags: normalizeTags(question.tags, category),
    source,
    question_key: makeQuestionKey(language, id)
  };
};
