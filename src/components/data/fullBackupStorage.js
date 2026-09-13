import { getScopedStorageKeyForBank } from "./activeBankStorage";
import { validateFullBackup } from "./questionBankSchemas";
import {
  QUESTION_BANK_CATALOG_KEY,
  saveQuestionBankCatalog
} from "./questionBankCatalogStorage";

export const FULL_BACKUP_TYPE = "smartquiz-full-backup";
export const MAX_BACKUP_TEXT_LENGTH = 25 * 1024 * 1024;

const scopedRecordNames = [
  "quiz_attempts",
  "user_quiz_settings",
  "gamification_profile",
  "learning_state"
];

const globalRecords = {
  onboarding: "smartquiz_onboarding",
  mobile_settings: "smartquiz_mobile_settings"
};

const readJsonKey = (storage, key, fallback) => {
  try {
    const storedValue = storage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch {
    return fallback;
  }
};

const writeJsonKey = (storage, key, value) => {
  storage.setItem(key, JSON.stringify(value));
};

const getQuestionCount = (catalog) => (
  Object.values(catalog.banks || {}).reduce((total, bank) => (
    total + Object.values(bank.baseQuestions || {}).reduce((bankTotal, questions) => (
      bankTotal + (Array.isArray(questions) ? questions.length : 0)
    ), 0)
    + Object.values(bank.customizations?.customQuestions || {}).reduce((bankTotal, questions) => (
      bankTotal + (Array.isArray(questions) ? questions.length : 0)
    ), 0)
  ), 0)
);

export const buildFullBackup = (
  catalog,
  storage = window.localStorage,
  exportedAt = new Date().toISOString()
) => {
  const scopedData = {};
  Object.values(catalog.banks).forEach((bank) => {
    scopedData[bank.id] = Object.fromEntries(scopedRecordNames.map((name) => [
      name,
      readJsonKey(storage, getScopedStorageKeyForBank(bank.id, name), name === "quiz_attempts" ? [] : null)
    ]));
  });

  return {
    version: 1,
    type: FULL_BACKUP_TYPE,
    exported_at: exportedAt,
    summary: {
      banks: Object.keys(catalog.banks).length,
      questions: getQuestionCount(catalog)
    },
    catalog,
    scopedData,
    global: {
      language: storage.getItem("smartquiz_language") || "en",
      onboarding: readJsonKey(storage, globalRecords.onboarding, null),
      mobile_settings: readJsonKey(storage, globalRecords.mobile_settings, null)
    }
  };
};

export const parseFullBackup = (payload) => {
  if (typeof payload === "string" && payload.length > MAX_BACKUP_TEXT_LENGTH) {
    throw new Error("Full backup exceeds the supported size.");
  }

  const parsedPayload = typeof payload === "string" ? JSON.parse(payload) : payload;
  return validateFullBackup(parsedPayload);
};

export const restoreFullBackup = (
  payload,
  storage = window.localStorage,
  saveCatalog = saveQuestionBankCatalog
) => {
  const backup = parseFullBackup(payload);
  const keysToWrite = [QUESTION_BANK_CATALOG_KEY];

  Object.entries(backup.scopedData || {}).forEach(([bankId, records]) => {
    Object.keys(records || {}).forEach((name) => {
      if (scopedRecordNames.includes(name)) {
        keysToWrite.push(getScopedStorageKeyForBank(bankId, name));
      }
    });
  });
  Object.values(globalRecords).forEach((key) => keysToWrite.push(key));
  keysToWrite.push("smartquiz_language");

  const previousValues = new Map(
    [...new Set(keysToWrite)].map((key) => [key, storage.getItem(key)])
  );

  try {
    const restoredCatalog = saveCatalog(backup.catalog);

    Object.entries(backup.scopedData || {}).forEach(([bankId, records]) => {
      Object.entries(records || {}).forEach(([name, value]) => {
        if (scopedRecordNames.includes(name) && value !== null && value !== undefined) {
          writeJsonKey(storage, getScopedStorageKeyForBank(bankId, name), value);
        }
      });
    });

    if (backup.global?.language) {
      storage.setItem("smartquiz_language", backup.global.language);
    }
    Object.entries(globalRecords).forEach(([name, key]) => {
      const value = backup.global?.[name];
      if (value !== null && value !== undefined) {
        writeJsonKey(storage, key, value);
      }
    });

    return restoredCatalog;
  } catch (error) {
    previousValues.forEach((value, key) => {
      try {
        if (value === null) storage.removeItem(key);
        else storage.setItem(key, value);
      } catch {
        // Best-effort rollback if the device storage itself is unavailable.
      }
    });
    throw error;
  }
};

export const getFullBackupFilename = (date = new Date()) => (
  `smartquiz-full-backup-${date.toISOString().slice(0, 10)}.json`
);
