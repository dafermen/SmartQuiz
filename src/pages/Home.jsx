import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShieldCheck, ScanSearch, Award, BookOpen, Lock, Globe2, ArrowRight, CheckCircle2, Layers3 } from "lucide-react";
import CategoryCard from "../components/quiz/CategoryCard";
import TestLimitBadge from "../components/quiz/TestLimitBadge";
import { useLanguage } from "../components/language/LanguageProvider";
import { getQuestionsData } from "../components/data/index";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const [stats, setStats] = useState({ total: 0, passed: 0, avgScore: 0 });
  const [questionCounts, setQuestionCounts] = useState({
    phishing_awareness: 0,
    malware_basics: 0,
    safe_data_habits: 0,
    practice_quiz: 0,
  });
  const [userSettings, setUserSettings] = useState({
    phishing_awareness_limit: 20,
    malware_basics_limit: 20,
    safe_data_habits_limit: 20,
    practice_quiz_limit: 20,
    phishing_awareness_taken: 0,
    malware_basics_taken: 0,
    safe_data_habits_taken: 0,
    practice_quiz_taken: 0
  });

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
    const attemptsJSON = localStorage.getItem("quiz_attempts") || "[]";
    const attempts = JSON.parse(attemptsJSON);
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
    
    const counts = {
      phishing_awareness: currentQuestions.filter(q => q.category === "phishing_awareness").length,
      malware_basics: currentQuestions.filter(q => q.category === "malware_basics").length,
      safe_data_habits: currentQuestions.filter(q => q.category === "safe_data_habits").length,
      practice_quiz: currentQuestions.length,
    };
    setQuestionCounts(counts);
  }, [language]);

  /**
   * Loads quiz limits and counters, creating defaults when missing.
   */
  const loadUserSettings = useCallback(() => {
    const settingsJSON = localStorage.getItem("user_quiz_settings");
    if (settingsJSON) {
      const savedSettings = JSON.parse(settingsJSON);
      setUserSettings({
        phishing_awareness_limit: 20,
        malware_basics_limit: 20,
        safe_data_habits_limit: 20,
        practice_quiz_limit: 20,
        phishing_awareness_taken: 0,
        malware_basics_taken: 0,
        safe_data_habits_taken: 0,
        practice_quiz_taken: 0,
        ...savedSettings
      });
    } else {
      const defaultSettings = {
        phishing_awareness_limit: 20,
        malware_basics_limit: 20,
        safe_data_habits_limit: 20,
        practice_quiz_limit: 20,
        phishing_awareness_taken: 0,
        malware_basics_taken: 0,
        safe_data_habits_taken: 0,
        practice_quiz_taken: 0
      };
      localStorage.setItem("user_quiz_settings", JSON.stringify(defaultSettings));
      setUserSettings(defaultSettings);
    }
  }, []);

  const loadData = useCallback(() => {
    loadStats();
    loadQuestionCounts();
    loadUserSettings();
  }, [loadStats, loadQuestionCounts, loadUserSettings]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Opens the quiz for a category when the configured limit allows it.
   *
   * @param {string} category - Category code, for example `phishing_awareness`.
   */
  const handleCategoryClick = (category) => {
    const fieldName = `${category}_taken`;
    const limitName = `${category}_limit`;
    
    if (userSettings[fieldName] >= userSettings[limitName]) {
      return;
    }
    
    navigate(createPageUrl("Quiz") + "?category=" + category);
  };

  /**
   * Returns a localized category title.
   *
   * @param {string} category
   * @returns {string}
   */
  const getCategoryTitle = (category) => {
    if (category === "phishing_awareness") return t("phishing_awareness");
    if (category === "malware_basics") return t("malware_basics");
    if (category === "safe_data_habits") return t("safe_data_habits");
    return t("practiceQuiz");
  };

  /**
   * Returns localized helper text for a category.
   *
   * @param {string} category
   * @returns {string}
   */
  const getCategoryDescription = (category) => {
    if (category === "phishing_awareness") return t("phishing_awarenessDesc");
    if (category === "malware_basics") return t("malware_basicsDesc");
    if (category === "safe_data_habits") return t("safe_data_habitsDesc");
    return t("practiceQuizDesc");
  };

  const categories = [
    {
      title: getCategoryTitle("phishing_awareness"),
      description: getCategoryDescription("phishing_awareness"),
      icon: ScanSearch,
      color: "from-teal-500 to-cyan-600",
      headerTone: "light",
      category: "phishing_awareness",
      count: questionCounts.phishing_awareness,
      taken: userSettings.phishing_awareness_taken,
      limit: userSettings.phishing_awareness_limit
    },
    {
      title: getCategoryTitle("malware_basics"),
      description: getCategoryDescription("malware_basics"),
      icon: ShieldCheck,
      color: "from-slate-800 to-blue-900",
      headerTone: "light",
      category: "malware_basics",
      count: questionCounts.malware_basics,
      taken: userSettings.malware_basics_taken,
      limit: userSettings.malware_basics_limit
    },
    {
      title: getCategoryTitle("safe_data_habits"),
      description: getCategoryDescription("safe_data_habits"),
      icon: BookOpen,
      color: "from-emerald-500 to-teal-700",
      headerTone: "light",
      category: "safe_data_habits",
      count: questionCounts.safe_data_habits,
      taken: userSettings.safe_data_habits_taken,
      limit: userSettings.safe_data_habits_limit
    },
    {
      title: getCategoryTitle("practice_quiz"),
      description: getCategoryDescription("practice_quiz"),
      icon: Award,
      color: "from-amber-400 to-orange-500",
      headerTone: "light",
      category: "practice_quiz",
      count: questionCounts.practice_quiz,
      taken: userSettings.practice_quiz_taken,
      limit: userSettings.practice_quiz_limit
    }
  ];

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Hero Section */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative p-6 md:p-10">
            <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0f9f8f,#2563eb,#f4b84a)]" />
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800">
              <Globe2 className="h-4 w-4" />
              <span>{t("location")}</span>
            </div>
            <h1 className="max-w-3xl whitespace-pre-line text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-6xl">
              {t("masterYourLicense")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              {t("comprehensivePrep")}
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

          <div className="border-t border-slate-200 bg-[#162033] p-6 text-white lg:border-l lg:border-t-0 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">Live demo</p>
                <h2 className="mt-2 text-2xl font-bold">Cybersecurity awareness</h2>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <ShieldCheck className="h-6 w-6 text-teal-200" />
              </div>
            </div>
            <div className="space-y-3">
              {[
                t("phishing_awareness"),
                t("malware_basics"),
                t("safe_data_habits")
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
