import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../language/LanguageProvider";
import { isQuestionFavorite, toggleQuestionFavorite } from "../data/learningStorage";

/**
 * Displays one quiz question and manages local answer feedback.
 *
 * @param {object} props
 * @param {object} props.question - Question record from the active dataset.
 * @param {number} props.questionNumber - One-based question position.
 * @param {number} props.totalQuestions - Number of questions in the current test.
 * @param {(answerResult: object) => void} props.onAnswer - Called when the user
 * moves to the next question.
 * @returns {JSX.Element}
 */
export default function QuestionCard({ 
  question, 
  questionNumber, 
  totalQuestions, 
  onAnswer,
  instantFeedback = true
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [favorite, setFavorite] = useState(() => isQuestionFavorite(question.question_key));
  const { t } = useLanguage();
  const correctAnswers = Array.isArray(question.correct_answers) && question.correct_answers.length > 0
    ? question.correct_answers
    : [question.correct_answer];

  useEffect(() => {
    setFavorite(isQuestionFavorite(question.question_key));
    setSelectedOption(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setImageError(false);
  }, [question.question_key]);

  /**
   * Stores the selected option unless feedback is already visible.
   *
   * @param {number} index - Zero-based option index.
   */
  const handleOptionSelect = (index) => {
    if (showFeedback) return;
    setSelectedOption(index);
  };

  /**
   * Compares the selected option with one or more accepted answers.
   */
  const handleSubmit = () => {
    if (selectedOption === null) return;
    const correct = correctAnswers.includes(selectedOption);

    if (!instantFeedback) {
      onAnswer(buildAnswerResult(correct));
      setSelectedOption(null);
      setImageError(false);
      return;
    }

    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const buildAnswerResult = (correct) => ({
    question_key: question.question_key,
    question_id: question.id,
    category: question.category,
    block_name: question.block_name,
    difficulty: question.difficulty || "beginner",
    tags: question.tags || [],
    question: question.question,
    options: question.options,
    selected_answer: selectedOption,
    correct_answer: question.correct_answer,
    correct_answers: correctAnswers,
    explanation: question.explanation,
    is_correct: correct
  });

  /**
   * Reports the answer result to the parent and resets this card state.
   */
  const handleNext = () => {
    onAnswer(buildAnswerResult(isCorrect));
    setSelectedOption(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setImageError(false);
  };

  const handleToggleFavorite = () => {
    toggleQuestionFavorite(question);
    setFavorite((currentValue) => !currentValue);
  };

  // Prefer bundled images so the app keeps working without network access.
  const imageSource = question.image_path || question.image_url;
  const hasImage = imageSource && !imageError;

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-teal-50 px-4 py-1 text-sm font-semibold text-teal-800 ring-1 ring-teal-100">
                {t("questionOf")} {questionNumber} {t("of")} {totalQuestions}
              </span>
              {question.block_id && (
                <span className="rounded-full bg-slate-100 px-4 py-1 text-sm font-semibold text-slate-700">
                  {question.block_name}
                </span>
              )}
              <span className="rounded-full bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">
                {t(question.difficulty || "beginner")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className={favorite ? "border-amber-200 bg-amber-50 text-amber-700" : ""}
                onClick={handleToggleFavorite}
                title={favorite ? t("removeFavorite") : t("addFavorite")}
              >
                <Star className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
              </Button>
              <span className="hidden text-sm text-slate-500 sm:inline">
                {Math.round((questionNumber / totalQuestions) * 100)}% {t("complete")}
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-teal-500"
              initial={{ width: 0 }}
              animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-950 mb-6 leading-relaxed">
          {question.question}
        </h2>

        {hasImage && (
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-xl overflow-hidden shadow-lg max-w-md w-full bg-gray-100 p-4">
              <img
                src={imageSource}
                alt="Question reference"
                className="w-full h-auto object-contain"
                style={{ maxHeight: "400px" }}
                onError={() => setImageError(true)}
              />
            </div>
          </div>
        )}

        {imageSource && imageError && (
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-xl overflow-hidden shadow-lg max-w-md w-full bg-gray-100 p-4">
              <div className="flex items-center justify-center h-48 text-gray-400">
                <span className="text-center">Image not available</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3 mb-8">
          {question.options.map((option, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: showFeedback ? 1 : 1.02 }}
              whileTap={{ scale: showFeedback ? 1 : 0.98 }}
            >
              <button
                onClick={() => handleOptionSelect(index)}
                disabled={showFeedback}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                  showFeedback
                    ? correctAnswers.includes(index)
                      ? "border-green-500 bg-green-50"
                      : index === selectedOption
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                    : selectedOption === index
                    ? "border-teal-500 bg-teal-50 shadow-sm"
                    : "border-slate-200 hover:border-teal-300 hover:bg-teal-50/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    showFeedback
                      ? correctAnswers.includes(index)
                        ? "bg-green-500 text-white"
                        : index === selectedOption
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 text-gray-600"
                      : selectedOption === index
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1 font-medium text-slate-900">{option}</span>
                  {showFeedback && correctAnswers.includes(index) && (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  )}
                  {showFeedback && index === selectedOption && !correctAnswers.includes(index) && (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-5 rounded-xl mb-6 ${
                isCorrect ? "bg-green-50 border-2 border-green-200" : "bg-amber-50 border-2 border-amber-200"
              }`}
            >
              <h4 className={`font-semibold mb-2 ${isCorrect ? "text-green-900" : "text-amber-950"}`}>
                {isCorrect ? t("correct") : t("learnMore")}
              </h4>
              <p className={`${isCorrect ? "text-green-800" : "text-amber-950"}`}>
                {question.explanation || t("defaultExplanation")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!showFeedback ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-lg shadow-sm rounded-lg"
          >
            {t("submitAnswer")}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-lg shadow-sm rounded-lg"
          >
            {t("nextQuestion")}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
