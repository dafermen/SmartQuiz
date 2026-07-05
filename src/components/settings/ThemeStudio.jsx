import React, { useEffect, useState } from "react";
import { Palette, RotateCcw, Save, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/language/LanguageProvider";
import {
  getTheme,
  normalizeTheme,
  resetTheme,
  saveTheme,
  themePresets
} from "@/components/theme/themeStorage";

const colorFields = [
  { key: "primary", labelKey: "primaryColor" },
  { key: "secondary", labelKey: "secondaryColor" },
  { key: "accent", labelKey: "accentColor" },
  { key: "background", labelKey: "backgroundColor" },
  { key: "surface", labelKey: "surfaceColor" },
  { key: "text", labelKey: "textColor" },
  { key: "muted", labelKey: "mutedColor" },
  { key: "success", labelKey: "successColor" },
  { key: "warning", labelKey: "warningColor" },
  { key: "danger", labelKey: "dangerColor" }
];

/**
 * Theme editor for organizations that want to match SmartQuiz to brand colors.
 *
 * Colors are stored locally and applied through CSS variables, keeping the app
 * static-hosting friendly while still allowing visual customization.
 *
 * @returns {JSX.Element}
 */
export default function ThemeStudio() {
  const { t } = useLanguage();
  const [themeForm, setThemeForm] = useState(getTheme);
  const [message, setMessage] = useState(null);
  const previewTheme = normalizeTheme(themeForm);

  useEffect(() => {
    const handleThemeUpdate = () => setThemeForm(getTheme());
    window.addEventListener("smartquiz-theme-updated", handleThemeUpdate);
    window.addEventListener("smartquiz-question-bank-catalog-updated", handleThemeUpdate);
    return () => {
      window.removeEventListener("smartquiz-theme-updated", handleThemeUpdate);
      window.removeEventListener("smartquiz-question-bank-catalog-updated", handleThemeUpdate);
    };
  }, []);

  const updateColor = (key, value) => {
    setThemeForm((currentTheme) => ({
      ...currentTheme,
      [key]: value
    }));
  };

  const applyPreset = (preset) => {
    setThemeForm(normalizeTheme(preset.colors));
    setMessage(null);
  };

  const handleSave = () => {
    const savedTheme = saveTheme(themeForm);
    setThemeForm(savedTheme);
    setMessage({ type: "success", text: t("themeSaved") });
  };

  const handleReset = () => {
    const resetColors = resetTheme();
    setThemeForm(resetColors);
    setMessage({ type: "success", text: t("themeReset") });
  };

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          {t("themeStudio")}
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">{t("themeStudioDesc")}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Label>{t("themePresets")}</Label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {themePresets.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant="outline"
                className="h-auto justify-start rounded-lg border-slate-200 p-3 text-left"
                onClick={() => applyPreset(preset)}
              >
                <span className="flex items-center gap-2">
                  <span className="flex -space-x-1">
                    {["primary", "secondary", "accent"].map((key) => (
                      <span
                        key={key}
                        className="h-5 w-5 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: preset.colors[key] }}
                      />
                    ))}
                  </span>
                  <span>{t(preset.labelKey)}</span>
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {colorFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={`theme-${field.key}`}>{t(field.labelKey)}</Label>
                <div className="flex gap-2">
                  <Input
                    id={`theme-${field.key}`}
                    type="color"
                    value={previewTheme[field.key]}
                    onChange={(event) => updateColor(field.key, event.target.value)}
                    className="h-10 w-14 shrink-0 cursor-pointer p-1"
                  />
                  <Input
                    value={themeForm[field.key]}
                    onChange={(event) => updateColor(field.key, event.target.value)}
                    placeholder="#000000"
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 p-4" style={{ backgroundColor: previewTheme.background }}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: previewTheme.text }}>{t("livePreview")}</p>
                <p className="text-xs" style={{ color: previewTheme.muted }}>{t("themePreviewDesc")}</p>
              </div>
              <Badge style={{ backgroundColor: previewTheme.accent, color: previewTheme.text }}>
                {t("level")} 4
              </Badge>
            </div>

            <div className="rounded-xl border p-5 shadow-sm" style={{ backgroundColor: previewTheme.surface, borderColor: previewTheme.primary }}>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg text-white" style={{ backgroundColor: previewTheme.secondary }}>
                  <Sparkles className="h-5 w-5" style={{ color: previewTheme.accent }} />
                </div>
                <div>
                  <p className="text-lg font-bold" style={{ color: previewTheme.text }}>{t("sampleModule")}</p>
                  <p className="text-sm" style={{ color: previewTheme.muted }}>{t("sampleModuleDesc")}</p>
                </div>
              </div>

              <div className="mb-4 h-2 overflow-hidden rounded-full" style={{ backgroundColor: previewTheme.background }}>
                <div className="h-full w-2/3 rounded-full" style={{ backgroundColor: previewTheme.primary }} />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" className="rounded-lg text-white" style={{ backgroundColor: previewTheme.primary }}>
                  {t("startPractice")}
                </Button>
                <Button type="button" variant="outline" className="rounded-lg" style={{ borderColor: previewTheme.primary, color: previewTheme.text }}>
                  {t("studyTheory")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSave} className="rounded-lg">
            <Save className="h-4 w-4" />
            {t("saveTheme")}
          </Button>
          <Button onClick={handleReset} variant="outline" className="rounded-lg border-2">
            <RotateCcw className="h-4 w-4" />
            {t("resetTheme")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
