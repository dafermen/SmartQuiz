import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShieldCheck, ScanSearch, Award, BookOpen, Lock, Globe2, ArrowRight, CheckCircle2, Layers3, Clock, Star, TriangleAlert } from "lucide-react";
import CategoryCard from "../components/quiz/CategoryCard";
import TestLimitBadge from "../components/quiz/TestLimitBadge";
import { useLanguage } from "../components/language/LanguageProvider";
import { getQuestionsData } from "../components/data/index";
import { readScopedJson, writeScopedJson } from "../components/data/activeBankStorage";
import { getLearningState } from "../components/data/learningStorage";
import {
  getExamProfile,
  getLocalizedProfileText,
  getPracticeCategoryProfile,
  getQuizSettingsDefaults
} from "../components/profile/examProfileStorage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const categoryIconMap = {
  Award,
  BookOpen,
  Layers3,
  ScanSearch,
  ShieldCheck
};

/**
 * Home page.
 *
 * Shows the user's summary stats, study entry point, and available quiz
 * modules for the active question bank.
 *
 * @returns {JSX.Element}
 */
export default function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [examProfile, setExamProfile] = useState(getExamProfile);
  const [stats, setStats] = useState({ total: 0, passed: 0, avgScore: 0 });
  const [learningState, setLearningState] = useState(getLearningState);
  const [questionCounts, setQuestionCounts] = useState({});
  const [userSettings, setUserSettings] = useState(getQuizSettingsDefaults(examProfile));

  /**
   * Builds the summary cards from saved quiz attempts.
   *
   * Reads:
   * - `quiz_attempts` from localStorage.
   *
   * Writes:
   * - `stats` React state.
   */
  const loadStats = useCallback(() => {
    const attempts = readScopedJson("quiz_attempts", [], "quiz_attempts");
    const total = attempts.length;
    const passed = attempts.filter(a => a.passed).length;
    const avgScore = total > 0
      ? attempts.reduce((sum, a) => sum + a.percentage, 0) / total
      : 0;
    setStats({ total, passed, avgScore: Math.round(avgScore) });
  }, []);

  /**
   * Counts available questions per category for the active language.
   */
  const loadQuestionCounts = useCallback(() => {
    const questionsData = getQuestionsData();
    const currentQuestions = questionsData[language] || questionsData.en;
    
    const counts = examProfile.categories.reduce((categoryCounts, category) => ({
      ...categoryCounts,
      [category.id]: currentQuestions.filter(q => q.category === category.id).length
    }), {
      practice_quiz: currentQuestions.length
    });
    setQuestionCounts(counts);
  }, [examProfile, language]);

  /**
   * Loads quiz limits and counters, creating defaults when missing.
   */
  const loadUserSettings = useCallback(() => {
    const defaultSettings = getQuizSettingsDefaults(examProfile);
    const savedSettings = readScopedJson("user_quiz_settings", null, "user_quiz_settings");
    if (savedSettings) {
      setUserSettings({
        ...defaultSettings,
        ...savedSettings
      });
    } else {
      writeScopedJson("user_quiz_settings", defaultSettings);
      setUserSettings(defaultSettings);
    }
  }, [examProfile]);

  const loadData = useCallback(() => {
    loadStats();
    loadQuestionCounts();
    loadUserSettings();
    setLearningState(getLearningState());
  }, [loadStats, loadQuestionCounts, loadUserSettings]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleExamProfileUpdate = () => {
      setExamProfile(getExamProfile());
    };

    window.addEventListener("smartquiz-exam-profile-updated", handleExamProfileUpdate);
    window.addEventListener("smartquiz-question-bank-catalog-updated", handleExamProfileUpdate);
    return () => {
      window.removeEventListener("smartquiz-exam-profile-updated", handleExamProfileUpdate);
      window.removeEventListener("smartquiz-question-bank-catalog-updated", handleExamProfileUpdate);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("smartquiz-question-bank-updated", loadQuestionCounts);
    window.addEventListener("smartquiz-question-bank-catalog-updated", loadData);
    window.addEventListener("smartquiz-learning-state-updated", loadData);
    return () => {
      window.removeEventListener("smartquiz-question-bank-updated", loadQuestionCounts);
      window.removeEventListener("smartquiz-question-bank-catalog-updated", loadData);
      window.removeEventListener("smartquiz-learning-state-updated", loadData);
    };
  }, [loadData, loadQuestionCounts]);

  /**
   * Opens the quiz for a category when the configured limit allows it.
   *
   * @param {string} category - Category code, for example `module_1`.
   */
  const handleCategoryClick = (category) => {
    const fieldName = `${category}_taken`;
    const limitName = `${category}_limit`;
    
    if (userSettings[fieldName] >= userSettings[limitName]) {
      return;
    }
    
    navigate(createPageUrl("Quiz") + "?category=" + category);
  };

  const practiceProfile = getPracticeCategoryProfile(language);
  const favoriteCount = Object.keys(learningState.favorites || {}).length;
  const mistakeCount = Object.keys(learningState.mistakes || {}).length;
  const categories = [
    ...examProfile.categories,
    practiceProfile
  ].map((category) => ({
    title: getLocalizedProfileText(category.label, language),
    description: getLocalizedProfileText(category.description, language),
    icon: categoryIconMap[category.icon] || BookOpen,
    color: category.color,
    headerTone: category.headerTone,
    category: category.id,
    count: questionCounts[category.id] || 0,
    taken: userSettings[`${category.id}_taken`] || 0,
    limit: userSettings[`${category.id}_limit`] || examProfile.testsPerCategory
  }));

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Hero Section */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative p-6 md:p-10">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800">
              <Globe2 className="h-4 w-4" />
              <span>{examProfile.location}</span>
            </div>
            <h1 className="max-w-3xl whitespace-pre-line text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-6xl">
              {examProfile.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              {examProfile.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => navigate(createPageUrl("Quiz") + "?category=practice_quiz")}
                className="h-12 rounded-lg bg-teal-600 px-5 text-base font-semibold text-white shadow-sm hover:bg-teal-700"
              >
                {t("startPractice")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => navigate(createPageUrl("Theory"))}
                variant="outline"
                className="h-12 rounded-lg border-slate-200 bg-white px-5 text-base font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                {t("studyTheory")}
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-950">{questionCounts.practice_quiz}</p>
                <p className="text-sm text-slate-500">{t("topics")}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-950">{stats.total}</p>
                <p className="text-sm text-slate-500">{t("testsTaken")}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-950">{stats.avgScore}%</p>
                <p className="text-sm text-slate-500">{t("avgScore")}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-secondary p-6 text-white lg:border-l lg:border-t-0 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Live demo</p>
                <h2 className="mt-2 text-2xl font-bold">{examProfile.appName}</h2>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <ShieldCheck className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="space-y-3">
              {[
                ...examProfile.categories.map((category) => getLocalizedProfileText(category.label, language))
              ].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-lg bg-white/8 p-4 ring-1 ring-white/10">
                  <span className="font-medium text-white/90">{item}</span>
                  <CheckCircle2 className="h-5 w-5 text-teal-200" />
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-lg bg-white p-5 text-slate-950">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <Layers3 className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">{t("chooseYourTest")}</p>
                  <p className="text-2xl font-bold">{categories.length} {t("modules")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Study Theory Card */}
      <Card 
        className="cursor-pointer rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        onClick={() => navigate(createPageUrl("Theory"))}
      >
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-950">{t("studyTheory")}</h3>
                  <p className="text-sm text-slate-500">{questionCounts.practice_quiz} {t("topics")} {t("totalAvailable")}</p>
                </div>
              </div>
              <p className="text-slate-600 mb-4 leading-relaxed">
                {t("theoryDesc")}
              </p>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg">
                {t("startPractice")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          onClick={() => navigate(createPageUrl("Quiz") + "?category=practice_quiz&mode=exam")}
        >
          <CardContent className="p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
              <Clock className="h-5 w-5 text-blue-700" />
            </div>
            <h3 className="font-bold text-slate-950">{t("examSimulator")}</h3>
            <p className="mt-1 text-sm text-slate-500">{t("examSimulatorShort")}</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          onClick={() => navigate(createPageUrl("Quiz") + "?category=practice_quiz&mode=mistakes")}
        >
          <CardContent className="p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50">
              <TriangleAlert className="h-5 w-5 text-amber-700" />
            </div>
            <h3 className="font-bold text-slate-950">{t("missedQuestions")}</h3>
            <p className="mt-1 text-sm text-slate-500">{mistakeCount} {t("questions")}</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          onClick={() => navigate(createPageUrl("Quiz") + "?category=practice_quiz&mode=favorites")}
        >
          <CardContent className="p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50">
              <Star className="h-5 w-5 text-amber-700" />
            </div>
            <h3 className="font-bold text-slate-950">{t("favoriteQuestions")}</h3>
            <p className="mt-1 text-sm text-slate-500">{favoriteCount} {t("questions")}</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          onClick={() => navigate(createPageUrl("Flashcards"))}
        >
          <CardContent className="p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50">
              <BookOpen className="h-5 w-5 text-teal-700" />
            </div>
            <h3 className="font-bold text-slate-950">{t("flashcards")}</h3>
            <p className="mt-1 text-sm text-slate-500">{t("flashcardsShort")}</p>
          </CardContent>
        </Card>
      </div>

      {/*
        Optional media lessons can be added later as a separate module. The
        current template focuses on JSON-backed study and quiz workflows.
      */}

      {/* Categories */}
      <div>
        <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-950">{t("chooseYourTest")}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((category) => {
            const isLocked = category.taken >= category.limit;
            return (
              <div key={category.category} className="relative">
                {isLocked && (
                  <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Lock className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-semibold">{t("limitReached")}</p>
                      <p className="text-sm">{t("adjustInSettings")}</p>
                    </div>
                  </div>
                )}
                <CategoryCard
                  title={category.title}
                  description={category.description}
                  icon={category.icon}
                  color={category.color}
                  headerTone={category.headerTone}
                  questionsCount={category.count}
                  onClick={() => handleCategoryClick(category.category)}
                />
                <div className="mt-3 flex justify-center">
                  <TestLimitBadge taken={category.taken} limit={category.limit} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100">
            <Award className="w-6 h-6 text-amber-700" />
          </div>
          <h2 className="text-2xl font-bold text-slate-950">{t("nycDrivingTips")}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-slate-950">{t("queensSpecificRules")}</h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-teal-500 flex-shrink-0" />
                <span>{t("tip1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-teal-500 flex-shrink-0" />
                <span>{t("tip2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-teal-500 flex-shrink-0" />
                <span>{t("tip3")}</span>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-slate-950">{t("testDayEssentials")}</h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                <span>{t("tip4")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                <span>{t("tip5")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                <span>{t("tip6")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
