import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Save, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "../components/language/LanguageProvider";
import QuestionBankManager from "../components/settings/QuestionBankManager";

/**
 * Settings page.
 *
 * Lets the user configure quiz limits and reset counters while preserving
 * historical quiz attempts.
 *
 * @returns {JSX.Element}
 */
export default function Settings() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
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
   * Loads settings from localStorage or creates default limits/counters.
   */
  const loadSettings = useCallback(() => {
    try {
      const settingsJSON = localStorage.getItem("user_quiz_settings");
      if (settingsJSON) {
        setFormData({
          phishing_awareness_limit: 20,
          malware_basics_limit: 20,
          safe_data_habits_limit: 20,
          practice_quiz_limit: 20,
          phishing_awareness_taken: 0,
          malware_basics_taken: 0,
          safe_data_habits_taken: 0,
          practice_quiz_taken: 0,
          ...JSON.parse(settingsJSON)
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
        setFormData(defaultSettings);
      }
    } catch {
      setMessage({ type: "error", text: t("errorLoadingSettings") });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  /**
   * Updates a numeric limit field and clamps it between 1 and 20.
   *
   * @param {string} field - Setting key to update.
   * @param {string | number} value - Raw input value from the form.
   */
  const handleChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(1, Math.min(20, numValue));
    setFormData(prev => ({ ...prev, [field]: clampedValue }));
  };

  /**
   * Persists the current settings form to localStorage.
   */
  const handleSave = () => {
    setSaving(true);
    setMessage(null);
    
    try {
      localStorage.setItem("user_quiz_settings", JSON.stringify(formData));
      setMessage({ type: "success", text: t("settingsSaved") });
    } catch {
      setMessage({ type: "error", text: t("errorSaving") });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Resets category counters without deleting quiz history.
   */
  const handleReset = () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const updatedSettings = {
        ...formData,
        phishing_awareness_taken: 0,
        malware_basics_taken: 0,
        safe_data_habits_taken: 0,
        practice_quiz_taken: 0
      };
      localStorage.setItem("user_quiz_settings", JSON.stringify(updatedSettings));
      setFormData(updatedSettings);
      setMessage({ type: "success", text: t("counterReset") });
    } catch {
      setMessage({ type: "error", text: t("errorResetting") });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">{t("loadingSettings")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 mb-2">{t("settingsTitle")}</h1>
        <p className="text-slate-600">{t("managePreferences")}</p>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <QuestionBankManager />

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            {t("testLimits")}
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            {t("testLimitsDesc")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phishing_awareness_limit">{t("phishingAwarenessTests")}</Label>
              <Input
                id="phishing_awareness_limit"
                type="number"
                min="1"
                max="20"
                value={formData.phishing_awareness_limit}
                onChange={(e) => handleChange("phishing_awareness_limit", e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-slate-500">
                {t("taken")}: {formData.phishing_awareness_taken}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="malware_basics_limit">{t("malwareBasicsTests")}</Label>
              <Input
                id="malware_basics_limit"
                type="number"
                min="1"
                max="20"
                value={formData.malware_basics_limit}
                onChange={(e) => handleChange("malware_basics_limit", e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-slate-500">
                {t("taken")}: {formData.malware_basics_taken}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="safe_data_habits_limit">{t("safeDataHabitsTests")}</Label>
              <Input
                id="safe_data_habits_limit"
                type="number"
                min="1"
                max="20"
                value={formData.safe_data_habits_limit}
                onChange={(e) => handleChange("safe_data_habits_limit", e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-slate-500">
                {t("taken")}: {formData.safe_data_habits_taken}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="practice_quiz_limit">{t("practiceQuizzes")}</Label>
              <Input
                id="practice_quiz_limit"
                type="number"
                min="1"
                max="20"
                value={formData.practice_quiz_limit}
                onChange={(e) => handleChange("practice_quiz_limit", e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-slate-500">
                {t("taken")}: {formData.practice_quiz_taken}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? t("saving") : t("saveChanges")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            {t("resetTestCounters")}
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            {t("resetCountersDesc")}
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleReset}
            disabled={saving}
            variant="outline"
            className="border-2"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t("resetAllCounters")}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-slate-50 shadow-sm border-l-4 border-l-teal-500">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-3 text-slate-950">{t("aboutTestLimits")}</h3>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-teal-500 flex-shrink-0" />
              <span>{t("limitInfo1")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-teal-500 flex-shrink-0" />
              <span>{t("limitInfo2")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-teal-500 flex-shrink-0" />
              <span>{t("limitInfo3")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-teal-500 flex-shrink-0" />
              <span>{t("limitInfo4")}</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
