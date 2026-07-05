import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Clock, Loader2, Star, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuestionCard from "../components/quiz/QuestionCard";
import ResultsCard from "../components/quiz/ResultsCard";
import { useLanguage } from "../components/language/LanguageProvider";
import { getQuestionsData } from "../components/data/index";
import { readScopedJson, writeScopedJson } from "../components/data/activeBankStorage";
import { getReviewQuestionKeys, recordQuestionAnswer } from "../components/data/learningStorage";
import { applyQuizGamification } from "../components/gamification/gamification";
import {
  getExamProfile,
  getLocalizedProfileText,
  getPracticeCategoryProfile,
  getQuizSettingsDefaults,
  normalizeCategoryId
} from "../components/profile/examProfileStorage";

/**
 * Returns a random set of stable question keys. Questions may repeat when the
 * source pool is small, which keeps every category at 20-question tests.
 *
 * @param {Array<object>} questionPool
 * @returns {Array<string>}
 */
const buildRandomTestQuestionKeys = (questionPool, questionsPerTest) => {
  if (questionPool.length === 0) return [];

  return Array.from({ length: questionsPerTest }, () => {
    const randomIndex = Math.floor(Math.random() * questionPool.length);
    return questionPool[randomIndex].question_key;
  });
};

/**
 * Resolves a saved test selection against the currently active language.
 *
 * @param {Array<object>} questionPool
 * @param {Array<string>} questionKeys
 * @returns {Array<object>}
 */
const resolveQuestionsByKey = (questionPool, questionKeys) => {
  const questionsByKey = new Map(
    questionPool.map((question) => [question.question_key, question])
  );

  return questionKeys
    .map((questionKey) => questionsByKey.get(questionKey))
    .filter(Boolean);
};

/**
 * Selects questions for the requested category. Mixed practice uses the full
 * bank, while modules keep their specific categories.
 *
 * @param {Array<object>} questions
 * @param {string} category
 * @returns {Array<object>}
 */
const getQuestionsForCategory = (questions, category) => {
  if (category === "practice_quiz") return questions;
  return questions.filter(q => q.category === category);
};

const filterQuestionsForMode = (questions, category, mode) => {
  const categoryQuestions = getQuestionsForCategory(questions, category);

  if (!["favorites", "mistakes"].includes(mode)) {
    return categoryQuestions;
  }

  const reviewKeys = new Set(getReviewQuestionKeys(mode));
  return categoryQuestions.filter((question) => reviewKeys.has(question.question_key));
};

/**
 * Quiz page.
 *
 * Responsibilities:
 * - Reads the requested category from `?category=...`.
 * - Loads the matching localized question set.
 * - Generates randomized tests using the configured exam profile.
 * - Saves completed attempts and increments category counters in localStorage.
 *
 * @returns {JSX.Element}
 */
export default function Quiz() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const category = normalizeCategoryId(urlParams.get("category") || "module_1");
  const mode = urlParams.get("mode") || "practice";
  const isExamMode = mode === "exam";
  const isReviewMode = ["favorites", "mistakes"].includes(mode);
  const [examProfile, setExamProfile] = useState(getExamProfile);

  const [allQuestions, setAllQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionKeys, setSelectedQuestionKeys] = useState([]);
  const [answerResults, setAnswerResults] = useState([]);
  const [selectedTestNumber, setSelectedTestNumber] = useState(null);
  const [totalTests, setTotalTests] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gamificationResult, setGamificationResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [error, setError] = useState(null);
  const [showTestSelection, setShowTestSelection] = useState(true);

  /**
   * Loads all questions for the active language/category.
   *
   * Inputs:
   * - `language` and `category`.
   *
   * Outputs:
   * - Updates `allQuestions` with category-filtered questions.
   * - Updates `totalTests` using the configured 20-test catalog.
   */
  const loadQuestions = useCallback(() => {
    setLoading(true);
    const questionsData = getQuestionsData();
    const currentQuestions = questionsData[language] || questionsData.en;
    
    const filtered = filterQuestionsForMode(currentQuestions, category, mode);
    
    setAllQuestions(filtered);
    setTotalTests(filtered.length > 0 ? examProfile.testsPerCategory : 0);
    
    setLoading(false);
  }, [category, examProfile, language, mode]);

  /**
   * Checks whether the user can start another test before loading questions.
   *
   * Side effects:
   * - Reads `user_quiz_settings` from localStorage.
   * - Sets `error` when the category limit has been reached.
   */
  const checkLimitAndLoad = useCallback(() => {
    setLoading(true);
    try {
      const settings = {
        ...getQuizSettingsDefaults(examProfile),
        ...readScopedJson("user_quiz_settings", {}, "user_quiz_settings")
      };
      
      const takenField = `${category}_taken`;
      const limitField = `${category}_limit`;
      
      if (!isReviewMode && settings[takenField] >= settings[limitField]) {
        setError(t("testLimitError"));
        setLoading(false);
        return;
      }
      
      loadQuestions();
    } catch {
      setError("Error loading quiz. Please try again.");
      setLoading(false);
    }
  }, [category, examProfile, isReviewMode, loadQuestions, t]);

  useEffect(() => {
    const handleExamProfileUpdate = () => {
      setExamProfile(getExamProfile());
    };

    window.addEventListener("smartquiz-exam-profile-updated", handleExamProfileUpdate);
    return () => window.removeEventListener("smartquiz-exam-profile-updated", handleExamProfileUpdate);
  }, []);

  useEffect(() => {
    checkLimitAndLoad();
  }, [checkLimitAndLoad]);

  useEffect(() => {
    if (selectedTestNumber && !showTestSelection && !showResults) {
      const questionsData = getQuestionsData();
      const currentQuestions = questionsData[language] || questionsData.en;

      const fetchedQuestions = filterQuestionsForMode(currentQuestions, category, mode);
      setAllQuestions(fetchedQuestions);
      setQuestions(resolveQuestionsByKey(fetchedQuestions, selectedQuestionKeys));
    }
  }, [
    language,
    selectedQuestionKeys,
    selectedTestNumber,
    showTestSelection,
    showResults,
    category,
    mode
  ]);

  /**
   * Starts one randomized 20-question test selected by the user.
   *
   * @param {string | number} testNumber - One-based test number from the UI.
   */
  const handleTestSelect = (testNumber) => {
    const questionCount = isReviewMode
      ? Math.min(allQuestions.length, examProfile.questionsPerTest)
      : examProfile.questionsPerTest;
    const questionKeys = buildRandomTestQuestionKeys(allQuestions, questionCount);
    setSelectedTestNumber(parseInt(testNumber));
    setSelectedQuestionKeys(questionKeys);
    setQuestions(resolveQuestionsByKey(allQuestions, questionKeys));
    setAnswerResults([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGamificationResult(null);
    setShowTestSelection(false);
    setStartTime(Date.now());
  };

  /**
   * Receives the result of one question and advances the quiz.
   *
   * @param {object} answerResult - Detailed answer result from the question card.
   */
  const handleAnswer = (answerResult) => {
    const nextAnswerResults = [...answerResults, answerResult];
    recordQuestionAnswer(answerResult);
    setAnswerResults(nextAnswerResults);

    if (answerResult.is_correct) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz(answerResult.is_correct ? score + 1 : score, nextAnswerResults);
    }
  };

  /**
   * Finalizes the quiz and persists the attempt.
   *
   * @param {number} finalScore - Correct answers accumulated for this test.
   * @param {Array<object>} finalAnswerResults - Per-question answer history.
   */
  const finishQuiz = (finalScore, finalAnswerResults) => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const percentage = Math.round((finalScore / questions.length) * 100);
    const passed = percentage >= examProfile.passingScore;

    const attempt = {
      category,
      mode,
      score: finalScore,
      total_questions: questions.length,
      percentage,
      time_taken: timeTaken,
      passed,
      language,
      question_results: finalAnswerResults,
      created_date: new Date().toISOString()
    };

    const attempts = readScopedJson("quiz_attempts", [], "quiz_attempts");
    attempts.push(attempt);
    writeScopedJson("quiz_attempts", attempts);

    const settings = {
      ...getQuizSettingsDefaults(examProfile),
      ...readScopedJson("user_quiz_settings", {}, "user_quiz_settings")
    };
    if (!isReviewMode) {
      const takenField = `${category}_taken`;
      settings[takenField] = settings[takenField] + 1;
      writeScopedJson("user_quiz_settings", settings);
    }

    const nextGamificationResult = applyQuizGamification({
      percentage,
      passed,
      answerResults: finalAnswerResults
    });

    const attemptWithGamification = {
      ...attempt,
      gamification: nextGamificationResult
    };
    attempts[attempts.length - 1] = attemptWithGamification;
    writeScopedJson("quiz_attempts", attempts);

    setScore(finalScore);
    setGamificationResult(nextGamificationResult);
    setShowResults(true);
  };

  /**
   * Resets only the in-memory quiz flow so the user can choose a test again.
   */
  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setGamificationResult(null);
    setShowResults(false);
    setShowTestSelection(true);
    setSelectedTestNumber(null);
    setSelectedQuestionKeys([]);
    setAnswerResults([]);
    setStartTime(null);
  };

  /**
   * Maps the current category code to a translated display name.
   *
   * @returns {string}
   */
  const getCategoryName = () => {
    if (category === "practice_quiz") {
      return getLocalizedProfileText(getPracticeCategoryProfile(language).label, language);
    }

    const categoryProfile = examProfile.categories.find((item) => item.id === category);
    return categoryProfile ? getLocalizedProfileText(categoryProfile.label, language) : t("quiz");
  };

  const getModeLabel = () => {
    if (isExamMode) return t("examSimulator");
    if (mode === "favorites") return t("favoriteQuestions");
    if (mode === "mistakes") return t("missedQuestions");
    return t("practiceMode");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">{t("loadingQuestions")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Home"))}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("backToHome")}
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (totalTests === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950 mb-4">
            {t("noQuestionsAvailable")}
          </h2>
          <p className="text-slate-600 mb-6">
            {t("noQuestionsDesc")}
          </p>
          <Button
            onClick={() => navigate(createPageUrl("Home"))}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
          >
            {t("backToHome")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 md:pb-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Home"))}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("backToHome")}
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">{getCategoryName()}</h1>
      </div>

      {showTestSelection ? (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>{isExamMode ? t("examSimulator") : t("selectTest")}</CardTitle>
            <p className="text-sm text-slate-500">
              {getModeLabel()} - {allQuestions.length} {t("questions")} {t("totalAvailable")}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {isExamMode || isReviewMode ? (
                <Button onClick={() => handleTestSelect(1)} className="h-12 w-full bg-teal-600 text-base font-semibold text-white hover:bg-teal-700">
                  {isExamMode ? <Clock className="mr-2 h-4 w-4" /> : mode === "favorites" ? <Star className="mr-2 h-4 w-4" /> : <TriangleAlert className="mr-2 h-4 w-4" />}
                  {isExamMode ? t("startExamSimulator") : t("startReview")}
                </Button>
              ) : (
                <>
                  <Label htmlFor="test-select" className="text-base font-semibold">
                    {t("chooseTestNumber")}
                  </Label>
                  <Select onValueChange={handleTestSelect}>
                    <SelectTrigger id="test-select" className="h-12 text-lg">
                      <SelectValue placeholder={t("selectTestPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: totalTests }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()} className="text-lg">
                          {t("test")} {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 border-l-4 border-l-teal-500">
              <h3 className="font-semibold text-slate-950 mb-3">{t("testInfo")}</h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-teal-500 flex-shrink-0" />
                  <span>{t("testInfo1Prefix")} {examProfile.questionsPerTest} {t("testInfo1Suffix")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-teal-500 flex-shrink-0" />
                  <span>{t("testInfo2Prefix")} {examProfile.passingScore}% {t("testInfo2Suffix")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-teal-500 flex-shrink-0" />
                  <span>{isExamMode ? t("examSimulatorInfo") : t("testInfo3")}</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : !showResults ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-full font-medium">
              {getModeLabel()} #{selectedTestNumber}
            </div>
            {isExamMode && (
              <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 ring-1 ring-amber-100">
                {t("noImmediateFeedback")}
              </div>
            )}
          </div>
          <QuestionCard
            question={questions[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
            instantFeedback={!isExamMode}
          />
        </div>
      ) : (
        <ResultsCard
          score={score}
          totalQuestions={questions.length}
          percentage={Math.round((score / questions.length) * 100)}
          timeTaken={Math.floor((Date.now() - startTime) / 1000)}
          gamification={gamificationResult}
          passed={score / questions.length * 100 >= examProfile.passingScore}
          passingScore={examProfile.passingScore}
          onRetry={handleRetry}
          onHome={() => navigate(createPageUrl("Home"))}
        />
      )}
    </div>
  );
}
