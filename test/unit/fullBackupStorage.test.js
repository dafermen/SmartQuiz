import { describe, expect, it } from "vitest";
import {
  buildFullBackup,
  FULL_BACKUP_TYPE,
  getFullBackupFilename,
  parseFullBackup,
  restoreFullBackup
} from "@/components/data/fullBackupStorage";
import { getScopedStorageKeyForBank } from "@/components/data/activeBankStorage";
import { QUESTION_BANK_CATALOG_KEY } from "@/components/data/questionBankCatalogStorage";

const sampleCatalog = {
  version: 1,
  activeBankId: "portable-bank",
  banks: {
    "portable-bank": {
      id: "portable-bank",
      name: "Portable Bank",
      baseQuestions: {
        en: [{
          id: "portable-1",
          category: "module_1",
          question: "Portable question?",
          options: ["Yes", "No"],
          correct_answer: 0
        }],
        es: []
      }
    }
  }
};

describe("full backups", () => {
  it("captures catalog, scoped progress, preferences and a summary", () => {
    localStorage.setItem(
      getScopedStorageKeyForBank("portable-bank", "quiz_attempts"),
      JSON.stringify([{ percentage: 90 }])
    );
    localStorage.setItem("smartquiz_language", "es");
    localStorage.setItem("smartquiz_mobile_settings", JSON.stringify({ dailyGoal: 12 }));

    const backup = buildFullBackup(
      sampleCatalog,
      localStorage,
      "2026-09-10T12:00:00.000Z"
    );

    expect(backup.type).toBe(FULL_BACKUP_TYPE);
    expect(backup.summary).toEqual({ banks: 1, questions: 1 });
    expect(backup.scopedData["portable-bank"].quiz_attempts).toEqual([{ percentage: 90 }]);
    expect(backup.global.language).toBe("es");
    expect(backup.global.mobile_settings).toEqual({ dailyGoal: 12 });
    expect(parseFullBackup(JSON.stringify(backup)).catalog.activeBankId).toBe("portable-bank");
  });

  it("restores validated data into a fresh device storage", () => {
    const backup = buildFullBackup(sampleCatalog, localStorage);
    backup.global.language = "es";
    backup.scopedData["portable-bank"].learning_state = { favorites: { q1: true } };
    localStorage.clear();

    const restored = restoreFullBackup(backup, localStorage, (catalog) => {
      localStorage.setItem(QUESTION_BANK_CATALOG_KEY, JSON.stringify(catalog));
      return catalog;
    });

    expect(restored.activeBankId).toBe("portable-bank");
    expect(localStorage.getItem("smartquiz_language")).toBe("es");
    expect(JSON.parse(localStorage.getItem(
      getScopedStorageKeyForBank("portable-bank", "learning_state")
    ))).toEqual({ favorites: { q1: true } });
  });

  it("validates before replacing any local data", () => {
    localStorage.setItem("smartquiz_language", "es");

    expect(() => restoreFullBackup({ type: "not-smartquiz" }, localStorage))
      .toThrow(/failed validation/i);
    expect(localStorage.getItem("smartquiz_language")).toBe("es");
  });

  it("creates a predictable portable filename", () => {
    expect(getFullBackupFilename(new Date("2026-09-10T12:00:00.000Z")))
      .toBe("smartquiz-full-backup-2026-09-10.json");
  });
});
