import React, { useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getMobileSettings, getOnboardingState, saveMobileSettings, saveOnboardingState } from "@/components/data/learningStorage";
import { useLanguage } from "@/components/language/LanguageProvider";

export default function Onboarding() {
  const { t, language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(() => !getOnboardingState().completed);
  const [settings, setSettings] = useState(getMobileSettings);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const finish = () => {
    setLanguage(selectedLanguage);
    saveMobileSettings(settings);
    saveOnboardingState({
      completed: true,
      completed_at: new Date().toISOString()
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("welcomeTitle")}</DialogTitle>
          <DialogDescription>{t("welcomeDesc")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>{t("language")}</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t("english")}</SelectItem>
                <SelectItem value="es">{t("spanish")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>{t("dailyGoal")}</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={settings.dailyGoal}
              onChange={(event) => setSettings((currentSettings) => ({
                ...currentSettings,
                dailyGoal: Math.max(1, Math.min(100, Number(event.target.value) || 10))
              }))}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
                <Bell className="h-5 w-5 text-teal-700" />
              </div>
              <div>
                <p className="font-semibold text-slate-950">{t("dailyReminder")}</p>
                <p className="text-sm text-slate-500">{t("dailyReminderDesc")}</p>
              </div>
            </div>
            <Switch
              checked={settings.remindersEnabled}
              onCheckedChange={(checked) => setSettings((currentSettings) => ({
                ...currentSettings,
                remindersEnabled: checked
              }))}
            />
          </div>

          {settings.remindersEnabled && (
            <div className="grid gap-2">
              <Label>{t("reminderHour")}</Label>
              <Input
                type="number"
                min="0"
                max="23"
                value={settings.reminderHour}
                onChange={(event) => setSettings((currentSettings) => ({
                  ...currentSettings,
                  reminderHour: Math.max(0, Math.min(23, Number(event.target.value) || 19))
                }))}
              />
            </div>
          )}
        </div>

        <Button onClick={finish} className="mt-2 bg-teal-600 text-white hover:bg-teal-700">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {t("startSmartQuiz")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
