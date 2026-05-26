import React, { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, Clock, Layers3, Target, TrendingUp, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "../components/language/LanguageProvider";
import { getGamificationProfile, getLevelProgress } from "../components/gamification/gamification";
import {
  getExamProfile,
  getLocalizedProfileText,
  getPracticeCategoryProfile
} from "../components/profile/examProfileStorage";

/**
 * Progress page.
 *
 * Reads saved quiz attempts and converts them into summary metrics, a score
 * chart, and a recent-attempts list.
 *
 * @returns {JSX.Element}
 */
export default function Progress() {
  const [attempts, setAttempts] = useState([]);
  const [categoryPerformance, setCategoryPerformance] = useState([]);
  const [questionPerformance, setQuestionPerformance] = useState([]);
  const [gamificationProfile, setGamificationProfile] = useState(getGamificationProfile);
  const [examProfile, setExamProfile] = useState(getExamProfile);
  const [stats, setStats] = useState({
    total: 0,
    passed: 0,
    passRate: 0,
    bestScore: 0,
    avgTime: 0
  });
  const { t, language } = useLanguage();

  const buildCategoryPerformance = (loadedAttempts) => {
    const categoryMap = new Map();

    loadedAttempts.forEach((attempt) => {
      const current = categoryMap.get(attempt.category) || {
        category: attempt.category,
        attempts: 0,
        correct: 0,
        total: 0
      };

      current.attempts += 1;
      current.correct += Number(attempt.score) || 0;
      current.total += Number(attempt.total_questions) || 0;
      categoryMap.set(attempt.category, current);
    });

    return Array.from(categoryMap.values())
      .map((item) => ({
        ...item,
        accuracy: item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0
      }))
      .sort((a, b) => b.attempts - a.attempts);
  };

  const buildQuestionPerformance = (loadedAttempts) => {
    const questionMap = new Map();

    loadedAttempts.forEach((attempt) => {
      (attempt.question_results || []).forEach((result) => {
        const key = result.question_key || result.question_id;
        if (!key) return;

        const current = questionMap.get(key) || {
          question_key: key,
          question: result.question,
          category: result.category,
          difficulty: result.difficulty || "beginner",
          tags: result.tags || [],
          attempts: 0,
          correct: 0
        };

        current.attempts += 1;
        current.correct += result.is_correct ? 1 : 0;
        questionMap.set(key, current);
      });
    });

    return Array.from(questionMap.values())
      .map((item) => ({
        ...item,
        accuracy: item.attempts > 0 ? Math.round((item.correct / item.attempts) * 100) : 0
      }))
      .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
      .slice(0, 8);
  };

  /**
   * Loads attempts and calculates aggregate progress metrics.
   *
   * Reads:
   * - `quiz_attempts` from localStorage.
   */
  const loadData = useCallback(() => {
    const attemptsJSON = localStorage.getItem("quiz_attempts") || "[]";
    const loadedAttempts = JSON.parse(attemptsJSON);
    const currentGamificationProfile = getGamificationProfile();
    const currentExamProfile = getExamProfile();
    
    setAttempts(loadedAttempts.slice(0, 10).reverse());
    setCategoryPerformance(buildCategoryPerformance(loadedAttempts));
    setQuestionPerformance(buildQuestionPerformance(loadedAttempts));
    setGamificationProfile(currentGamificationProfile);
    setExamProfile(currentExamProfile);

    if (loadedAttempts.length > 0) {
      const passedCount = loadedAttempts.filter(a => a.passed).length;
      const bestScore = Math.max(...loadedAttempts.map(a => a.percentage));
      const avgTime = loadedAttempts.reduce((sum, a) => sum + a.time_taken, 0) / loadedAttempts.length;

      setStats({
        total: loadedAttempts.length,
        passed: passedCount,
        passRate: Math.round((passedCount / loadedAttempts.length) * 100),
        bestScore: Math.round(bestScore),
        avgTime: Math.round(avgTime)
      });
    } else {
      setStats({
        total: 0,
        passed: 0,
        passRate: 0,
        bestScore: 0,
        avgTime: 0
      });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const chartData = attempts.map((attempt, index) => ({
    name: `Test ${attempts.length - index}`,
    score: attempt.percentage
  }));
  const levelProgress = getLevelProgress(gamificationProfile.totalXp);

  /**
   * Converts a saved category code into a localized label.
   *
   * @param {string} category
   * @returns {string}
   */
  const getCategoryName = (category) => {
    if (category === "practice_quiz") {
      return getLocalizedProfileText(getPracticeCategoryProfile(language).label, language);
    }

    const categoryProfile = examProfile.categories.find((item) => item.id === category);
    return categoryProfile ? getLocalizedProfileText(categoryProfile.label, language) : category;
  };

  /**
   * Formats seconds as a short minutes/seconds string.
   *
   * @param {number} seconds
   * @returns {string}
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 mb-2">{t("yourProgress")}</h1>
        <p className="text-slate-600">{t("trackYourLearning")}</p>
      </div>

      {attempts.length === 0 ? (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg text-slate-600 text-center">
              {t("noAttemptsYet")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-5">
            <Card className="rounded-2xl border border-slate-200 bg-[#162033] text-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {t("totalTests")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 bg-teal-700 text-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  {t("passRate")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats.passRate}%</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t("bestScore")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats.bestScore}%</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t("avgTime")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{formatTime(stats.avgTime)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>{t("scoreTrend")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 rounded-2xl border border-teal-100 bg-teal-50/70 p-5">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-800">{t("learningLevel")}</p>
                    <p className="text-2xl font-bold text-slate-950">
                      {t("level")} {gamificationProfile.level}
                    </p>
                  </div>
                  <Badge className="w-fit bg-white text-teal-800 ring-1 ring-teal-100">
                    {gamificationProfile.totalXp} XP
                  </Badge>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: `${levelProgress.percentage}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-slate-600">
                  {levelProgress.currentLevelXp}/{levelProgress.xpForNextLevel} XP
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="score"
                    fill="#0f9f8f"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers3 className="h-5 w-5 text-teal-700" />
                  {t("categoryStats")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryPerformance.map((category) => (
                    <div key={category.category} className="rounded-xl bg-slate-50 p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">
                            {getCategoryName(category.category)}
                          </p>
                          <p className="text-sm text-slate-500">
                            {category.attempts} {t("attempts")} • {category.correct}/{category.total}
                          </p>
                        </div>
                        <Badge className={category.accuracy >= 70 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"}>
                          {category.accuracy}%
                        </Badge>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{ width: `${category.accuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  {t("questionsToReview")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {questionPerformance.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    {t("questionStatsNeedNewAttempts")}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questionPerformance.map((question) => (
                      <div key={question.question_key} className="rounded-xl border border-slate-200 p-4">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{getCategoryName(question.category)}</Badge>
                          <Badge variant="outline">{t(question.difficulty)}</Badge>
                          <Badge className={question.accuracy >= 70 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"}>
                            {question.accuracy}%
                          </Badge>
                        </div>
                        <p className="line-clamp-2 font-medium text-slate-950">{question.question}</p>
                        <p className="mt-2 text-sm text-slate-500">
                          {question.correct}/{question.attempts} {t("correctAnswers")}
                        </p>
                        {question.tags?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {question.tags.slice(0, 4).map((tag) => (
                              <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>{t("recentAttempts")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attempts.map((attempt, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-950">
                          {getCategoryName(attempt.category)}
                        </h3>
                        <Badge
                          variant={attempt.passed ? "default" : "secondary"}
                          className={
                            attempt.passed
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {attempt.passed ? t("passed") : t("failed")}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {new Date(attempt.created_date).toLocaleDateString()} •{" "}
                        {formatTime(attempt.time_taken)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-slate-950">
                        {attempt.percentage}%
                      </p>
                      <p className="text-sm text-slate-500">
                        {attempt.score}/{attempt.total_questions}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
