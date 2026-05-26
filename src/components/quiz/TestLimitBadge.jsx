import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "../language/LanguageProvider";

/**
 * Shows how many tests remain before the configured limit is reached.
 *
 * @param {object} props
 * @param {number} props.taken - Tests already taken for the category.
 * @param {number} props.limit - Configured maximum tests for the category.
 * @returns {JSX.Element}
 */
export default function TestLimitBadge({ taken, limit }) {
  const { t } = useLanguage();
  const remaining = limit - taken;
  const percentage = (taken / limit) * 100;

  /**
   * Chooses badge severity based on percentage of limit used.
   *
   * @returns {string} Tailwind class list.
   */
  const getColor = () => {
    if (percentage >= 90) return "bg-red-100 text-red-800 border-red-200";
    if (percentage >= 70) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  if (remaining <= 0) {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        {t("limitReached")}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={`border ${getColor()}`}>
      {remaining} / {limit} {t("remaining")}
    </Badge>
  );
}
