import { describe, expect, it } from "vitest";
import {
  getLocalizedProfileText,
  getQuizSettingsDefaults,
  normalizeExamProfile
} from "@/components/profile/examProfileStorage";
import { getDefaultTheme, normalizeTheme } from "@/components/theme/themeStorage";

describe("exam profile", () => {
  it("clamps numeric settings and preserves required categories", () => {
    const profile = normalizeExamProfile({
      passingScore: 500,
      questionsPerTest: 0,
      testsPerCategory: "12",
      categories: []
    });

    expect(profile.passingScore).toBe(100);
    expect(profile.questionsPerTest).toBe(1);
    expect(profile.testsPerCategory).toBe(12);
    expect(profile.categories).toHaveLength(3);
  });

  it("uses localized text fallbacks and creates limits", () => {
    expect(getLocalizedProfileText({ en: "English" }, "es")).toBe("English");
    const settings = getQuizSettingsDefaults(normalizeExamProfile({ testsPerCategory: 7 }));
    expect(settings.module_1_limit).toBe(7);
    expect(settings.practice_quiz_taken).toBe(0);
  });
});

describe("themes", () => {
  it("normalizes colors and rejects invalid values through fallbacks", () => {
    const defaults = getDefaultTheme();
    const theme = normalizeTheme({ primary: "#ABCDEF", danger: "red" });

    expect(theme.primary).toBe("#abcdef");
    expect(theme.danger).toBe(defaults.danger);
    expect(Object.keys(theme)).toEqual(Object.keys(defaults));
  });
});
