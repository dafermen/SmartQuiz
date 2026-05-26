export const GAMIFICATION_PROFILE_KEY = "smartquiz_gamification_profile";

const XP_PER_LEVEL = 250;

const emptyProfile = {
  totalXp: 0,
  level: 1,
  completedQuizzes: 0,
  passedQuizzes: 0,
  perfectScores: 0,
  updatedAt: null
};

const canUseLocalStorage = () => typeof window !== "undefined" && window.localStorage;

export const getLevelFromXp = (xp) => Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;

export const getLevelProgress = (xp) => {
  const currentLevelXp = Math.max(0, xp) % XP_PER_LEVEL;
  return {
    currentLevelXp,
    xpForNextLevel: XP_PER_LEVEL,
    percentage: Math.round((currentLevelXp / XP_PER_LEVEL) * 100)
  };
};

export const getGamificationProfile = () => {
  if (!canUseLocalStorage()) return emptyProfile;

  try {
    const storedValue = localStorage.getItem(GAMIFICATION_PROFILE_KEY);
    if (!storedValue) return emptyProfile;
    const parsedProfile = JSON.parse(storedValue);
    const totalXp = Number(parsedProfile.totalXp) || 0;

    return {
      ...emptyProfile,
      ...parsedProfile,
      totalXp,
      level: getLevelFromXp(totalXp)
    };
  } catch {
    return emptyProfile;
  }
};

export const calculateQuizXp = ({ percentage, passed, answerResults = [] }) => {
  const correctAnswers = answerResults.filter((answer) => answer.is_correct);
  const advancedCorrect = correctAnswers.filter((answer) => answer.difficulty === "advanced").length;
  const intermediateCorrect = correctAnswers.filter((answer) => answer.difficulty === "intermediate").length;

  const breakdown = [
    { key: "completedQuizXp", xp: 10 },
    { key: "correctAnswersXp", xp: correctAnswers.length * 2 },
    { key: "intermediateBonusXp", xp: intermediateCorrect * 1 },
    { key: "advancedBonusXp", xp: advancedCorrect * 3 },
    { key: "passingBonusXp", xp: passed ? 25 : 0 },
    { key: "highScoreBonusXp", xp: percentage >= 90 ? 15 : 0 },
    { key: "perfectScoreBonusXp", xp: percentage === 100 ? 35 : 0 }
  ].filter((item) => item.xp > 0);

  return {
    earnedXp: breakdown.reduce((sum, item) => sum + item.xp, 0),
    breakdown
  };
};

export const applyQuizGamification = ({ percentage, passed, answerResults }) => {
  const previousProfile = getGamificationProfile();
  const previousLevel = previousProfile.level;
  const xpResult = calculateQuizXp({ percentage, passed, answerResults });
  const totalXp = previousProfile.totalXp + xpResult.earnedXp;
  const nextLevel = getLevelFromXp(totalXp);

  const nextProfile = {
    ...previousProfile,
    totalXp,
    level: nextLevel,
    completedQuizzes: previousProfile.completedQuizzes + 1,
    passedQuizzes: previousProfile.passedQuizzes + (passed ? 1 : 0),
    perfectScores: previousProfile.perfectScores + (percentage === 100 ? 1 : 0),
    updatedAt: new Date().toISOString()
  };

  if (canUseLocalStorage()) {
    localStorage.setItem(GAMIFICATION_PROFILE_KEY, JSON.stringify(nextProfile));
  }

  return {
    ...xpResult,
    previousLevel,
    level: nextLevel,
    leveledUp: nextLevel > previousLevel,
    totalXp,
    levelProgress: getLevelProgress(totalXp)
  };
};
