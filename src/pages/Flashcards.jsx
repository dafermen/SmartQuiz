import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Star, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPageUrl } from "@/utils";
import { getQuestionsData } from "@/components/data/index";
import { getReviewQuestionKeys, isQuestionFavorite, toggleQuestionFavorite } from "@/components/data/learningStorage";
import { useLanguage } from "@/components/language/LanguageProvider";

const getFilteredQuestions = (questions, mode) => {
  if (mode === "all") return questions;
  const keys = new Set(getReviewQuestionKeys(mode));
  return questions.filter((question) => keys.has(question.question_key));
};

export default function Flashcards() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [mode, setMode] = useState("all");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [favoriteTick, setFavoriteTick] = useState(0);

  const questions = useMemo(() => {
    void favoriteTick;
    const data = getQuestionsData();
    return getFilteredQuestions(data[language] || data.en || [], mode);
  }, [favoriteTick, language, mode]);

  const safeIndex = Math.min(index, Math.max(questions.length - 1, 0));
  const question = questions[safeIndex];

  const move = (direction) => {
    setRevealed(false);
    setIndex((currentIndex) => {
      if (questions.length === 0) return 0;
      return (currentIndex + direction + questions.length) % questions.length;
    });
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setIndex(0);
    setRevealed(false);
  };

  const handleFavorite = () => {
    if (!question) return;
    toggleQuestionFavorite(question);
    setFavoriteTick((tick) => tick + 1);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-20 md:pb-8">
      <Button variant="ghost" onClick={() => navigate(createPageUrl("Home"))}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("backToHome")}
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">{t("flashcards")}</h1>
          <p className="text-slate-600">{t("flashcardsDesc")}</p>
        </div>
        <Select value={mode} onValueChange={handleModeChange}>
          <SelectTrigger className="w-full bg-white sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allQuestions")}</SelectItem>
            <SelectItem value="favorites">{t("favoriteQuestions")}</SelectItem>
            <SelectItem value="mistakes">{t("missedQuestions")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {questions.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-slate-300 bg-white shadow-sm">
          <CardContent className="p-10 text-center text-slate-600">
            {t("noFlashcards")}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 md:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{safeIndex + 1} / {questions.length}</Badge>
                  <Badge variant="outline">{question.block_name}</Badge>
                  <Badge variant="outline">{t(question.difficulty || "beginner")}</Badge>
                  {mode === "mistakes" && (
                    <Badge className="bg-amber-100 text-amber-900">
                      <TriangleAlert className="mr-1 h-3.5 w-3.5" />
                      {t("missedQuestions")}
                    </Badge>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className={isQuestionFavorite(question.question_key) ? "border-amber-200 bg-amber-50 text-amber-700" : ""}
                  onClick={handleFavorite}
                  title={t("favoriteQuestions")}
                >
                  <Star className={`h-4 w-4 ${isQuestionFavorite(question.question_key) ? "fill-current" : ""}`} />
                </Button>
              </div>

              <button
                type="button"
                onClick={() => setRevealed((currentValue) => !currentValue)}
                className="min-h-[280px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left transition hover:bg-slate-100"
              >
                <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {revealed ? t("answer") : t("questionText")}
                </p>
                <p className="text-2xl font-bold leading-relaxed text-slate-950">
                  {revealed
                    ? question.options[question.correct_answer]
                    : question.question}
                </p>
                {revealed && (
                  <p className="mt-5 rounded-xl bg-white p-4 text-base leading-7 text-slate-700 ring-1 ring-slate-200">
                    {question.explanation || t("defaultExplanation")}
                  </p>
                )}
              </button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => move(-1)}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t("previous")}
            </Button>
            <Button variant="outline" onClick={() => setRevealed((currentValue) => !currentValue)}>
              <RotateCcw className="mr-1 h-4 w-4" />
              {revealed ? t("questionText") : t("answer")}
            </Button>
            <Button variant="outline" onClick={() => move(1)}>
              {t("next")}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
