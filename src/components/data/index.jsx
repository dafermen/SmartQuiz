import cybersecurityAwarenessQuestions from "./cybersecurityAwarenessQuestions.json";
import {
  getQuestionBankCustomizations,
  makeQuestionKey,
  normalizeQuestionRecord,
  SUPPORTED_QUESTION_LANGUAGES
} from "./questionBankStorage";

const normalizeQuestionBank = (bank) => (
  Object.fromEntries(
    SUPPORTED_QUESTION_LANGUAGES.map((language) => [
      language,
      (bank[language] || bank.en).map((question) => ({
        ...normalizeQuestionRecord(question, language, "base"),
        id: question.id,
        question_key: makeQuestionKey(language, question.id)
      }))
    ])
  )
);

const applyQuestionBankCustomizations = (baseBank, customizations) => (
  Object.fromEntries(
    SUPPORTED_QUESTION_LANGUAGES.map((language) => {
      const deletedKeys = new Set(customizations.deletedQuestionKeys);
      const overrides = customizations.questionOverrides[language] || {};
      const customQuestions = customizations.customQuestions[language] || [];

      const baseQuestions = (baseBank[language] || [])
        .filter((question) => !deletedKeys.has(question.question_key))
        .map((question) => {
          const override = overrides[question.id];
          if (!override) return question;

          return {
            ...question,
            ...normalizeQuestionRecord(override, language, "custom"),
            id: question.id,
            source: "custom",
            original_source: "base",
            question_key: question.question_key
          };
        });

      const normalizedCustomQuestions = customQuestions
        .filter((question) => !deletedKeys.has(makeQuestionKey(language, question.id)))
        .map((question) => normalizeQuestionRecord(question, language, "custom"));

      return [language, [...baseQuestions, ...normalizedCustomQuestions]];
    })
  )
);

/**
 * Returns the active sample question bank.
 *
 * Swap this import for any other JSON file that follows the same schema to
 * turn SmartQuiz into an exam prep, language, interview, or training app.
 *
 * @returns {{en: Array<object>, es: Array<object>}} Localized question groups.
 */
export const getQuestionsData = () => (
  applyQuestionBankCustomizations(
    normalizeQuestionBank(cybersecurityAwarenessQuestions),
    getQuestionBankCustomizations()
  )
);

/**
 * Placeholder for optional video lessons.
 *
 * @returns {Array<object>} Video records with title, category, and url.
 */
export const getVideosData = () => [];
