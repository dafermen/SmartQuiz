import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, ArrowLeft, Library } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "../components/language/LanguageProvider";
import { getQuestionsData } from "../components/data/index";
import TheoryCard from "../components/theory/TheoryCard";
import { getExamProfile, getLocalizedProfileText } from "../components/profile/examProfileStorage";

/**
 * Theory page.
 *
 * Reuses quiz questions as study material, showing each question with its
 * explanation and optional reference image.
 *
 * @returns {JSX.Element}
 */
export default function Theory() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [examProfile, setExamProfile] = useState(getExamProfile);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBlock, setSelectedBlock] = useState("all");
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const questionsData = getQuestionsData();
    const currentQuestions = questionsData[language] || questionsData.en;
    setQuestions(currentQuestions);
  }, [language]);

  useEffect(() => {
    const handleExamProfileUpdate = () => {
      setExamProfile(getExamProfile());
    };

    window.addEventListener("smartquiz-exam-profile-updated", handleExamProfileUpdate);
    return () => window.removeEventListener("smartquiz-exam-profile-updated", handleExamProfileUpdate);
  }, []);

  const filteredQuestions = questions.filter((question) => {
    const matchesCategory = selectedCategory === "all" || question.category === selectedCategory;
    const matchesBlock = selectedBlock === "all" || question.block_id === Number(selectedBlock);
    return matchesCategory && matchesBlock;
  });

  const blocks = Array.from(
    questions.reduce((blockMap, question) => {
      if (question.block_id && !blockMap.has(question.block_id)) {
        blockMap.set(question.block_id, question.block_name);
      }
      return blockMap;
    }, new Map())
  )
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.id - b.id);

  const categories = [
    { value: "all", label: t("allCategories") },
    ...examProfile.categories.map((category) => ({
      value: category.id,
      label: getLocalizedProfileText(category.label, language)
    }))
  ];

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <div className="relative z-10">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Home"))}
            className="mb-4 text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToHome")}
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50">
              <Library className="w-6 h-6 text-teal-700" />
            </div>
            <span className="font-semibold text-lg text-teal-800">{t("studyMaterial")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-slate-950">
            {t("studyTheory")}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
            {t("theoryDesc")}
          </p>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-[#0f9f8f]" />
          <div>
            <p className="text-2xl font-bold text-slate-950">{filteredQuestions.length}</p>
            <p className="text-sm text-slate-500">{t("topics")}</p>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder={t("filterByCategory")} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedBlock} onValueChange={setSelectedBlock}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder={t("filterByBlock")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allBlocks")}</SelectItem>
              {blocks.map((block) => (
                <SelectItem key={block.id} value={block.id.toString()}>
                  {t("block")} {block.id}: {block.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Theory Cards */}
      <div className="space-y-6">
        {filteredQuestions.map((question, index) => (
          <TheoryCard 
            key={question.question_key || question.id} 
            question={question} 
            index={index + 1}
            examProfile={examProfile}
          />
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <Card className="border-none shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg text-gray-600 text-center">
              {t("noQuestionsAvailable")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
