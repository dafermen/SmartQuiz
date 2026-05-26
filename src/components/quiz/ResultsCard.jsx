
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Clock, Sparkles, Star, Target, TrendingUp, Trophy, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../language/LanguageProvider";

const confettiPieces = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: (index % 8) * 0.08,
  color: ["#14b8a6", "#22c55e", "#f59e0b", "#38bdf8", "#a78bfa"][index % 5],
  size: 7 + (index % 4) * 2
}));

function CelebrationConfetti({ active }) {
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.span
          key={piece.id}
          className="absolute top-0 rounded-sm"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size * 1.6,
            backgroundColor: piece.color
          }}
          initial={{ opacity: 0, y: -24, rotate: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: [0, 80, 170, 260], rotate: 240 }}
          transition={{ duration: 2.2, delay: piece.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/**
 * Final quiz result summary.
 *
 * @param {object} props
 * @param {number} props.score - Correct answers.
 * @param {number} props.totalQuestions - Total questions in the test.
 * @param {number} props.percentage - Rounded score percentage.
 * @param {number} props.timeTaken - Elapsed time in seconds.
 * @param {object | null} props.gamification - XP and level result for this attempt.
 * @param {Function} props.onRetry - Starts a new quiz flow.
 * @param {Function} props.onHome - Navigates back to Home.
 * @returns {JSX.Element}
 */
export default function ResultsCard({ 
  score, 
  totalQuestions, 
  percentage, 
  timeTaken,
  gamification,
  onRetry, 
  onHome 
}) {
  const { t } = useLanguage();
  const passed = percentage >= 70;
  const excellent = percentage >= 90;
  const perfect = percentage === 100;
  const shouldCelebrate = passed || gamification?.leveledUp || excellent;
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  const headline = perfect
    ? t("perfectResultTitle")
    : excellent
    ? t("excellentResultTitle")
    : passed
    ? t("passedResultTitle")
    : t("reviewResultTitle");
  const subheadline = perfect
    ? t("perfectResultDesc")
    : excellent
    ? t("excellentResultDesc")
    : passed
    ? t("passedResultDesc")
    : t("reviewResultDesc");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className={`h-32 ${
          passed 
            ? "bg-teal-600" 
            : "bg-amber-500"
        } relative`}>
          <CelebrationConfetti active={shouldCelebrate} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy className="w-20 h-20 text-white/25" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-1">
                {percentage}%
              </h2>
              <p className="text-white/90 font-medium">
                {passed ? t("youPassed") : t("keepPracticing")}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="mb-6 text-center"
          >
            <div className="mb-3 flex justify-center">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                passed ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"
              }`}>
                {perfect ? <Star className="h-7 w-7" /> : passed ? <Sparkles className="h-7 w-7" /> : <Target className="h-7 w-7" />}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-950">{headline}</h3>
            <p className="mt-2 text-slate-600">{subheadline}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-teal-700" />
                <span className="text-sm font-medium text-slate-600">{t("score")}</span>
              </div>
              <p className="text-3xl font-bold text-slate-950">
                {score}/{totalQuestions}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-teal-700" />
                <span className="text-sm font-medium text-slate-600">{t("time")}</span>
              </div>
              <p className="text-3xl font-bold text-slate-950">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-teal-700" />
                <span className="text-sm font-medium text-slate-600">{t("status")}</span>
              </div>
              <p className="text-2xl font-bold text-slate-950">
                {passed ? t("passed") : t("keepPracticing")}
              </p>
            </div>
          </div>

          {gamification && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              className="mb-6 rounded-2xl border border-teal-100 bg-teal-50/70 p-5"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-teal-800">{t("xpEarned")}</p>
                    <p className="text-3xl font-bold text-slate-950">+{gamification.earnedXp} XP</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-white text-teal-800 ring-1 ring-teal-100">
                    <Award className="mr-1 h-3.5 w-3.5" />
                    {t("level")} {gamification.level}
                  </Badge>
                  {gamification.leveledUp && (
                    <Badge className="bg-amber-100 text-amber-900">
                      {t("levelUp")}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <div className="mb-1 flex justify-between text-xs font-medium text-slate-600">
                  <span>{t("levelProgress")}</span>
                  <span>
                    {gamification.levelProgress.currentLevelXp}/{gamification.levelProgress.xpForNextLevel} XP
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <motion.div
                    className="h-full rounded-full bg-teal-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${gamification.levelProgress.percentage}%` }}
                    transition={{ delay: 0.35, duration: 0.8 }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {gamification.breakdown.map((item) => (
                  <span key={item.key} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-teal-100">
                    {t(item.key)} +{item.xp}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {passed ? (
            <div className="bg-green-50 border-2 border-green-200 p-5 rounded-xl mb-6">
              <p className="text-green-900 font-medium">
                {t("congratulations")}
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-xl mb-6">
              <p className="text-amber-950 font-medium">
                {t("needToPass")}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={onRetry}
              className="flex-1 h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg"
            >
              {t("tryAgain")}
            </Button>
            <Button
              onClick={onHome}
              variant="outline"
              className="flex-1 h-12 border-2 border-slate-200 font-semibold text-slate-800 hover:bg-slate-50"
            >
              {t("backToHome")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
