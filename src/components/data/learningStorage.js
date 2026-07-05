import { readScopedJson, writeScopedJson } from "./activeBankStorage";

const LEARNING_STATE_KEY = "learning_state";
const ONBOARDING_KEY = "smartquiz_onboarding";
const MOBILE_SETTINGS_KEY = "smartquiz_mobile_settings";

const createEmptyLearningState = () => ({
  version: 1,
  favorites: {},
  mistakes: {},
  questionStats: {}
});

const canUseLocalStorage = () => typeof window !== "undefined" && window.localStorage;

const normalizeLearningState = (state = {}) => ({
  ...createEmptyLearningState(),
  ...state,
  favorites: state.favorites || {},
  mistakes: state.mistakes || {},
  questionStats: state.questionStats || {}
});

export const getLearningState = () => (
  normalizeLearningState(readScopedJson(LEARNING_STATE_KEY, createEmptyLearningState(), LEARNING_STATE_KEY))
);

export const saveLearningState = (state) => {
  const normalizedState = normalizeLearningState(state);
  writeScopedJson(LEARNING_STATE_KEY, normalizedState);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("smartquiz-learning-state-updated"));
  }
  return normalizedState;
};

export const isQuestionFavorite = (questionKey) => Boolean(getLearningState().favorites[questionKey]);

export const toggleQuestionFavorite = (question) => {
  const state = getLearningState();
  const questionKey = question.question_key;
  const nextFavorites = { ...state.favorites };

  if (nextFavorites[questionKey]) {
    delete nextFavorites[questionKey];
  } else {
    nextFavorites[questionKey] = {
      question_key: questionKey,
      question_id: question.id,
      category: question.category,
      block_name: question.block_name,
      difficulty: question.difficulty || "beginner",
      question: question.question,
      saved_at: new Date().toISOString()
    };
  }

  return saveLearningState({ ...state, favorites: nextFavorites });
};

export const recordQuestionAnswer = (answerResult) => {
  const state = getLearningState();
  const questionKey = answerResult.question_key || answerResult.question_id;
  if (!questionKey) return state;

  const currentStats = state.questionStats[questionKey] || {
    question_key: questionKey,
    question: answerResult.question,
    category: answerResult.category,
    block_name: answerResult.block_name,
    difficulty: answerResult.difficulty || "beginner",
    tags: answerResult.tags || [],
    attempts: 0,
    correct: 0,
    incorrect: 0,
    last_answered_at: null
  };

  const nextStats = {
    ...currentStats,
    question: answerResult.question || currentStats.question,
    category: answerResult.category || currentStats.category,
    block_name: answerResult.block_name || currentStats.block_name,
    difficulty: answerResult.difficulty || currentStats.difficulty,
    tags: answerResult.tags || currentStats.tags,
    attempts: currentStats.attempts + 1,
    correct: currentStats.correct + (answerResult.is_correct ? 1 : 0),
    incorrect: currentStats.incorrect + (answerResult.is_correct ? 0 : 1),
    last_answered_at: new Date().toISOString()
  };

  const nextMistakes = { ...state.mistakes };
  if (answerResult.is_correct) {
    if (nextStats.incorrect === 0) {
      delete nextMistakes[questionKey];
    }
  } else {
    nextMistakes[questionKey] = {
      question_key: questionKey,
      question_id: answerResult.question_id,
      category: answerResult.category,
      block_name: answerResult.block_name,
      difficulty: answerResult.difficulty || "beginner",
      tags: answerResult.tags || [],
      question: answerResult.question,
      selected_answer: answerResult.selected_answer,
      correct_answer: answerResult.correct_answer,
      last_missed_at: new Date().toISOString(),
      misses: (nextMistakes[questionKey]?.misses || 0) + 1
    };
  }

  return saveLearningState({
    ...state,
    mistakes: nextMistakes,
    questionStats: {
      ...state.questionStats,
      [questionKey]: nextStats
    }
  });
};

export const clearMistake = (questionKey) => {
  const state = getLearningState();
  const nextMistakes = { ...state.mistakes };
  delete nextMistakes[questionKey];
  return saveLearningState({ ...state, mistakes: nextMistakes });
};

export const getReviewQuestionKeys = (mode = "mistakes") => {
  const state = getLearningState();
  const source = mode === "favorites" ? state.favorites : state.mistakes;
  return Object.keys(source);
};

export const getOnboardingState = () => {
  if (!canUseLocalStorage()) return { completed: false };
  try {
    return JSON.parse(localStorage.getItem(ONBOARDING_KEY) || "{\"completed\":false}");
  } catch {
    return { completed: false };
  }
};

export const saveOnboardingState = (state) => {
  if (!canUseLocalStorage()) return state;
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("smartquiz-onboarding-updated"));
  return state;
};

export const getMobileSettings = () => {
  if (!canUseLocalStorage()) {
    return { dailyGoal: 10, remindersEnabled: false, reminderHour: 19 };
  }
  try {
    return {
      dailyGoal: 10,
      remindersEnabled: false,
      reminderHour: 19,
      ...JSON.parse(localStorage.getItem(MOBILE_SETTINGS_KEY) || "{}")
    };
  } catch {
    return { dailyGoal: 10, remindersEnabled: false, reminderHour: 19 };
  }
};

export const saveMobileSettings = (settings) => {
  if (!canUseLocalStorage()) return settings;
  const nextSettings = { ...getMobileSettings(), ...settings };
  localStorage.setItem(MOBILE_SETTINGS_KEY, JSON.stringify(nextSettings));
  window.dispatchEvent(new Event("smartquiz-mobile-settings-updated"));
  return nextSettings;
};
