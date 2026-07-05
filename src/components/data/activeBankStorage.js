import { DEFAULT_QUESTION_BANK_ID, getActiveQuestionBank } from "./questionBankCatalogStorage";

const canUseLocalStorage = () => typeof window !== "undefined" && window.localStorage;

const sanitizeBankId = (bankId) => String(bankId || DEFAULT_QUESTION_BANK_ID).replace(/[^a-zA-Z0-9_-]/g, "_");

export const getActiveBankId = () => getActiveQuestionBank()?.id || DEFAULT_QUESTION_BANK_ID;

export const getScopedStorageKeyForBank = (bankId, name) => (
  `smartquiz_bank_${sanitizeBankId(bankId)}_${name}`
);

export const getScopedStorageKey = (name) => (
  getScopedStorageKeyForBank(getActiveBankId(), name)
);

export const readScopedJson = (name, fallback, legacyKey = null) => {
  if (!canUseLocalStorage()) return fallback;

  try {
    const scopedKey = getScopedStorageKey(name);
    const scopedValue = localStorage.getItem(scopedKey);
    if (scopedValue) return JSON.parse(scopedValue);

    if (legacyKey && getActiveBankId() === DEFAULT_QUESTION_BANK_ID) {
      const legacyValue = localStorage.getItem(legacyKey);
      if (legacyValue) {
        localStorage.setItem(scopedKey, legacyValue);
        return JSON.parse(legacyValue);
      }
    }
  } catch {
    return fallback;
  }

  return fallback;
};

export const writeScopedJson = (name, value) => {
  if (canUseLocalStorage()) {
    localStorage.setItem(getScopedStorageKey(name), JSON.stringify(value));
  }

  return value;
};
