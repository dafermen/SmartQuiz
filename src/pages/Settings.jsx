import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings as SettingsIcon, Save, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "../components/language/LanguageProvider";
import QuestionBankManager from "../components/settings/QuestionBankManager";
import ThemeStudio from "../components/settings/ThemeStudio";
import {
  getExamProfile,
  getLocalizedProfileText,
  getPracticeCategoryProfile,
  getQuizSettingsDefaults,
  resetExamProfile,
  saveExamProfile
} from "../components/profile/examProfileStorage";

/**
 * Settings page.
 *
 * Lets the user configure the reusable exam profile, quiz limits, counters,
 * and the local question bank while preserving historical quiz attempts.
 *
 * @returns {JSX.Element}
 */
export default function Settings() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [examProfileForm, setExamProfileForm] = useState(getExamProfile);
  const [formData, setFormData] = useState(getQuizSettingsDefaults(examProfileForm));

  /**
   * Loads settings from localStorage or creates default limits/counters.
   */
  const loadSettings = useCallback(() => {
    try {
      const currentProfile = getExamProfile();
      const defaultSettings = getQuizSettingsDefaults(currentProfile);
      const settingsJSON = localStorage.getItem("user_quiz_settings");
      const nextSettings = settingsJSON
        ? { ...defaultSettings, ...JSON.parse(settingsJSON) }
        : defaultSettings;

      if (!settingsJSON) {
        localStorage.setItem("user_quiz_settings", JSON.stringify(nextSettings));
      }

      setExamProfileForm(currentProfile);
      setFormData(nextSettings);
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
   * Updates a numeric limit field and clamps it between 1 and 100.
   *
   * @param {string} field - Setting key to update.
   * @param {string | number} value - Raw input value from the form.
   */
  const handleChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(1, Math.min(100, numValue));
    setFormData(prev => ({ ...prev, [field]: clampedValue }));
  };

  const handleProfileChange = (field, value) => {
    const numericFields = ["passingScore", "questionsPerTest", "testsPerCategory"];
    setExamProfileForm((currentProfile) => ({
      ...currentProfile,
      [field]: numericFields.includes(field) ? Number(value) : value
    }));
  };

  const handleCategoryProfileChange = (categoryId, field, language, value) => {
    setExamProfileForm((currentProfile) => ({
      ...currentProfile,
      categories: currentProfile.categories.map((category) => (
        category.id === categoryId
          ? {
            ...category,
            [field]: {
              ...category[field],
              [language]: value
            }
          }
          : category
      ))
    }));
  };

  const handleSaveExamProfile = () => {
    setSaving(true);
    setMessage(null);

    try {
      const savedProfile = saveExamProfile(examProfileForm);
      const nextSettings = {
        ...getQuizSettingsDefaults(savedProfile),
        ...formData
      };

      localStorage.setItem("user_quiz_settings", JSON.stringify(nextSettings));
      setExamProfileForm(savedProfile);
      setFormData(nextSettings);
      setMessage({ type: "success", text: t("examProfileSaved") });
    } catch {
      setMessage({ type: "error", text: t("errorSaving") });
    } finally {
      setSaving(false);
    }
  };

  const handleResetExamProfile = () => {
    const confirmed = window.confirm(t("resetExamProfileConfirm"));
    if (!confirmed) return;

    const resetProfile = resetExamProfile();
    const nextSettings = {
      ...getQuizSettingsDefaults(resetProfile),
      ...formData
    };

    localStorage.setItem("user_quiz_settings", JSON.stringify(nextSettings));
    setExamProfileForm(resetProfile);
    setFormData(nextSettings);
    setMessage({ type: "success", text: t("examProfileReset") });
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
      const resetTakenCounters = Object.keys(formData)
        .filter((key) => key.endsWith("_taken"))
        .reduce((resetFields, key) => ({ ...resetFields, [key]: 0 }), {});
      const updatedSettings = {
        ...formData,
        ...resetTakenCounters
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

  const limitCategories = [...examProfileForm.categories, getPracticeCategoryProfile()];

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

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            {t("examProfile")}
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            {t("examProfileDesc")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("appNameLabel")}</Label>
              <Input
                value={examProfileForm.appName}
                onChange={(event) => handleProfileChange("appName", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("domainLabel")}</Label>
              <Input
                value={examProfileForm.domain}
                onChange={(event) => handleProfileChange("domain", event.target.value)}
                placeholder="cybersecurity, medical, language, cloud"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("locationLabel")}</Label>
              <Input
                value={examProfileForm.location}
                onChange={(event) => handleProfileChange("location", event.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("passingScore")}</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={examProfileForm.passingScore}
                  onChange={(event) => handleProfileChange("passingScore", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("questionsPerTest")}</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={examProfileForm.questionsPerTest}
                  onChange={(event) => handleProfileChange("questionsPerTest", event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>{t("headlineLabel")}</Label>
            <Textarea
              value={examProfileForm.headline}
              onChange={(event) => handleProfileChange("headline", event.target.value)}
              rows={2}
            />
          </div>

          <div className="grid gap-2">
            <Label>{t("descriptionLabel")}</Label>
            <Textarea
              value={examProfileForm.description}
              onChange={(event) => handleProfileChange("description", event.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-950">{t("moduleLabels")}</h3>
              <p className="mt-1 text-sm text-slate-500">{t("moduleLabelsDesc")}</p>
            </div>
            <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-950">
              {t("settingsLanguageScope")}
            </div>
            {examProfileForm.categories.map((category, index) => (
              <div key={category.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-500">
                  {t("module")} {index + 1}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("english")} {t("category")}</Label>
                    <Input
                      value={category.label.en}
                      onChange={(event) => handleCategoryProfileChange(category.id, "label", "en", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("spanish")} {t("category")}</Label>
                    <Input
                      value={category.label.es}
                      onChange={(event) => handleCategoryProfileChange(category.id, "label", "es", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t("english")} {t("descriptionLabel")}</Label>
                    <Textarea
                      value={category.description.en}
                      onChange={(event) => handleCategoryProfileChange(category.id, "description", "en", event.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t("spanish")} {t("descriptionLabel")}</Label>
                    <Textarea
                      value={category.description.es}
                      onChange={(event) => handleCategoryProfileChange(category.id, "description", "es", event.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={handleSaveExamProfile}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {t("saveExamProfile")}
            </Button>
            <Button
              onClick={handleResetExamProfile}
              disabled={saving}
              variant="outline"
              className="border-2"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t("resetExamProfile")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ThemeStudio />

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
            {limitCategories.map((category) => (
              <div key={category.id} className="space-y-2">
                <Label htmlFor={`${category.id}_limit`}>
                  {getLocalizedProfileText(category.label, language)}
                </Label>
                <Input
                  id={`${category.id}_limit`}
                  type="number"
                  min="1"
                  max="100"
                  value={formData[`${category.id}_limit`] || examProfileForm.testsPerCategory}
                  onChange={(event) => handleChange(`${category.id}_limit`, event.target.value)}
                  className="text-lg"
                />
                <p className="text-sm text-slate-500">
                  {t("taken")}: {formData[`${category.id}_taken`] || 0}
                </p>
              </div>
            ))}
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
