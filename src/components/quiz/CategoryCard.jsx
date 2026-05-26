import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../language/LanguageProvider";

/**
 * Clickable quiz category card used on Home.
 *
 * @param {object} props
 * @param {string} props.title - Visible category title.
 * @param {string} props.description - Short category description.
 * @param {React.ComponentType} props.icon - Lucide icon component.
 * @param {string} props.color - Tailwind background classes for the card header.
 * @param {"light" | "dark"} props.headerTone - Text tone used over the header.
 * @param {Function} props.onClick - Called when the card is selected.
 * @param {number} props.questionsCount - Number of available questions.
 * @returns {JSX.Element}
 */
export default function CategoryCard({ title, description, icon: Icon, color, headerTone = "dark", onClick, questionsCount }) {
  const { t } = useLanguage();
  const usesLightHeaderText = headerTone === "light";
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-teal-200 hover:shadow-md"
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className={`relative h-28 overflow-hidden bg-gradient-to-br ${color}`}>
            <div className="absolute inset-x-0 bottom-0 h-px bg-white/40" />
            <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
              <Icon className={`w-7 h-7 ${usesLightHeaderText ? "text-white" : "text-slate-950"}`} />
            </div>
            <div className="absolute bottom-4 left-5 right-20">
              <h3 className={`text-xl font-bold leading-tight ${usesLightHeaderText ? "text-white" : "text-slate-950"}`}>{title}</h3>
              <p className={`mt-1 text-sm ${usesLightHeaderText ? "text-white/85" : "text-slate-700"}`}>{questionsCount} {t("questions")}</p>
            </div>
          </div>
          <div className="p-6">
            <p className="mb-5 min-h-20 text-sm leading-6 text-slate-600">{description}</p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 transition-colors group-hover:bg-teal-50 group-hover:text-teal-800">
              <span>{t("startPractice")}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
