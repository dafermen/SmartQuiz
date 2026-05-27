import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../language/LanguageProvider";
import { getLocalizedProfileText } from "../profile/examProfileStorage";

/**
 * Presents one question as study/theory content.
 *
 * @param {object} props
 * @param {object} props.question - Question record with question, category,
 * explanation, and optional image fields.
 * @param {number} props.index - One-based display index.
 * @returns {JSX.Element}
 */
export default function TheoryCard({ question, index, examProfile }) {
  const [showImage, setShowImage] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { t, language } = useLanguage();

  // Prefer bundled images so the app keeps working without network access.
  const imageSource = question.image_path || question.image_url;
  const hasImage = imageSource && imageSource.trim() !== '';

  /**
   * Builds the localized visual badge for the question category.
   *
   * @returns {JSX.Element}
   */
  const getCategoryBadge = () => {
    const colors = {
      module_1: "bg-teal-50 text-teal-800 ring-1 ring-teal-100",
      module_2: "bg-slate-100 text-slate-800",
      module_3: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
    };
    
    const categoryProfile = examProfile?.categories.find((category) => category.id === question.category);
    const label = categoryProfile ? getLocalizedProfileText(categoryProfile.label, language) : t(question.category);

    return (
      <Badge className={colors[question.category] || "bg-slate-100 text-slate-700"}>
        {label}
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-teal-200 hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">

                {getCategoryBadge()}
                {question.block_id && (
                  <Badge className="bg-slate-100 text-slate-700">
                    {question.block_name}
                  </Badge>
                )}
                <Badge className="bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100">
                  {t(question.difficulty || "beginner")}
                </Badge>
              </div>
              <CardTitle className="text-2xl text-slate-950 leading-relaxed">
                {question.question}
              </CardTitle>
              {question.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {question.tags.slice(0, 5).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Image - Only show if image exists */}
          {hasImage && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {t("referenceImage")}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImage(!showImage)}
                  className="text-slate-700 hover:bg-teal-50 hover:text-teal-800"
                >
                  {showImage ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      {t("hideImage")}
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      {t("showImage")}
                    </>
                  )}
                </Button>
              </div>
              
              <AnimatePresence>
                {showImage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    {!imageError ? (
                      <div className="rounded-xl overflow-hidden shadow-lg bg-gray-100 p-4">
                        <img
                          src={imageSource}
                          alt="Question reference"
                          className="w-full h-auto object-contain"
                          style={{ maxHeight: "400px" }}
                          onError={() => setImageError(true)}
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl overflow-hidden shadow-lg bg-gray-100 p-4">
                        <div className="flex items-center justify-center h-48 text-gray-400">
                          <span className="text-center">Image not available</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Theory/Explanation */}
          {question.explanation && (
            <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 border-l-4 border-l-teal-500">
              <h4 className="font-semibold text-slate-950 mb-3 text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {t("theory")}:
              </h4>
              <p className="text-slate-700 leading-relaxed text-base">
                {question.explanation}
              </p>
            </div>
          )}

          {!question.explanation && (
            <div className="p-6 rounded-xl bg-gray-50 border-2 border-gray-200">
              <p className="text-gray-600 italic text-center">
                {t("noTheoryAvailable")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
