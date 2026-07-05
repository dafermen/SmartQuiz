import cybersecurityAwarenessQuestions from "./cybersecurityAwarenessQuestions.json";
import comptiaSecurity701Questions from "./comptiaSecurity701Questions.json";
import usCitizenship2025Questions from "./usCitizenship2025Questions.json";

export const QUESTION_BANK_CATALOG_KEY = "smartquiz_question_bank_catalog";
export const DEFAULT_QUESTION_BANK_ID = "cybersecurity-awareness";

const supportedLanguages = ["en", "es"];

const defaultTheme = {
  primary: "#0f9f8f",
  secondary: "#162033",
  accent: "#f4b84a",
  background: "#f5f7fb",
  surface: "#ffffff",
  text: "#162033",
  muted: "#64748b",
  success: "#16a34a",
  warning: "#f59e0b",
  danger: "#dc2626"
};

const citizenshipTheme = {
  primary: "#1d4ed8",
  secondary: "#991b1b",
  accent: "#f8fafc",
  background: "#f8fafc",
  surface: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  success: "#15803d",
  warning: "#b45309",
  danger: "#b91c1c"
};

const securityPlusTheme = {
  primary: "#2563eb",
  secondary: "#111827",
  accent: "#22c55e",
  background: "#f8fafc",
  surface: "#ffffff",
  text: "#111827",
  muted: "#64748b",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626"
};

const defaultProfile = {
  appName: "SmartQuiz",
  location: "Open exam practice platform",
  headline: "Build exam-ready\nknowledge checks",
  description: "A generic quiz platform for official exams, language learning, technical interviews, corporate training, citizenship prep, child education, and security awareness.",
  domain: "cybersecurity",
  passingScore: 70,
  questionsPerTest: 20,
  testsPerCategory: 20,
  categories: [
    {
      id: "module_1",
      icon: "ScanSearch",
      color: "from-primary to-secondary",
      headerTone: "light",
      label: { en: "Phishing Awareness", es: "Deteccion de phishing" },
      description: {
        en: "Practice recognizing suspicious messages, fake links, urgent requests, and social engineering patterns.",
        es: "Practica como reconocer mensajes sospechosos, enlaces falsos, urgencia artificial e ingenieria social."
      }
    },
    {
      id: "module_2",
      icon: "ShieldCheck",
      color: "from-secondary to-primary",
      headerTone: "light",
      label: { en: "Malware Basics", es: "Conceptos de malware" },
      description: {
        en: "Review safe everyday choices around downloads, attachments, pop-ups, and device behavior.",
        es: "Repasa decisiones seguras sobre descargas, adjuntos, ventanas emergentes y comportamiento del dispositivo."
      }
    },
    {
      id: "module_3",
      icon: "BookOpen",
      color: "from-accent to-primary",
      headerTone: "light",
      label: { en: "Safe Data Habits", es: "Habitos de datos seguros" },
      description: {
        en: "Strengthen password, privacy, verification, and reporting habits for non-technical users.",
        es: "Refuerza contrasenas, privacidad, verificacion y reporte para usuarios finales."
      }
    }
  ]
};

const citizenshipProfile = {
  ...defaultProfile,
  appName: "US Citizenship Quiz",
  location: "Naturalization civics practice",
  headline: "Practice for the\nUS citizenship exam",
  description: "A reusable local bank for civics, history, government, geography, rights, responsibilities, and interview preparation.",
  domain: "us-citizenship",
  passingScore: 80,
  questionsPerTest: 10,
  categories: [
    {
      ...defaultProfile.categories[0],
      label: { en: "Government", es: "Gobierno" },
      description: {
        en: "Practice questions about the Constitution, branches of government, elections, and public officials.",
        es: "Practica preguntas sobre la Constitucion, ramas del gobierno, elecciones y funcionarios publicos."
      }
    },
    {
      ...defaultProfile.categories[1],
      label: { en: "History", es: "Historia" },
      description: {
        en: "Review colonial history, independence, major wars, civil rights, and national milestones.",
        es: "Repasa historia colonial, independencia, guerras importantes, derechos civiles e hitos nacionales."
      }
    },
    {
      ...defaultProfile.categories[2],
      label: { en: "Symbols and Holidays", es: "Simbolos y dias feriados" },
      description: {
        en: "Study national symbols, patriotic songs, national holidays, and commemorations.",
        es: "Estudia simbolos nacionales, canciones patrioticas, dias feriados y conmemoraciones."
      }
    }
  ]
};

const securityPlusProfile = {
  ...defaultProfile,
  appName: "Security+ SY0-701 Prep",
  location: "CompTIA Security+ practice bank",
  headline: "Prepare for\nSecurity+ SY0-701",
  description: "Scenario-based practice for security concepts, threats, architecture, operations, risk, governance, and compliance.",
  domain: "comptia-security-plus-sy0-701",
  passingScore: 80,
  questionsPerTest: 15,
  categories: [
    {
      ...defaultProfile.categories[0],
      icon: "ShieldCheck",
      label: { en: "Concepts and Threats", es: "Conceptos y amenazas" },
      description: {
        en: "Practice security fundamentals, common attacks, vulnerabilities, identity, and access control.",
        es: "Practica fundamentos de seguridad, ataques comunes, vulnerabilidades, identidad y control de acceso."
      }
    },
    {
      ...defaultProfile.categories[1],
      icon: "Layers3",
      label: { en: "Architecture and Operations", es: "Arquitectura y operaciones" },
      description: {
        en: "Review secure architecture, cryptography, PKI, monitoring, incident response, and recovery.",
        es: "Repasa arquitectura segura, criptografia, PKI, monitoreo, respuesta a incidentes y recuperacion."
      }
    },
    {
      ...defaultProfile.categories[2],
      icon: "BookOpen",
      label: { en: "Governance and Risk", es: "Gobernanza y riesgo" },
      description: {
        en: "Study risk management, compliance, privacy, audits, policies, and security awareness.",
        es: "Estudia gestion de riesgos, cumplimiento, privacidad, auditorias, politicas y concientizacion."
      }
    }
  ]
};

const emptyLanguageMap = () => Object.fromEntries(supportedLanguages.map((language) => [language, []]));
const emptyOverrideMap = () => Object.fromEntries(supportedLanguages.map((language) => [language, {}]));

export const createEmptyQuestionBankCustomizations = () => ({
  customQuestions: emptyLanguageMap(),
  questionOverrides: emptyOverrideMap(),
  deletedQuestionKeys: []
});

const canUseLocalStorage = () => typeof window !== "undefined" && window.localStorage;

const clone = (value) => JSON.parse(JSON.stringify(value));

const normalizeLanguageBank = (questions = {}) => (
  Object.fromEntries(
    supportedLanguages.map((language) => [
      language,
      Array.isArray(questions[language]) ? questions[language] : []
    ])
  )
);

const normalizeCustomizations = (customizations = {}) => ({
  customQuestions: {
    ...emptyLanguageMap(),
    ...(customizations.customQuestions || {})
  },
  questionOverrides: {
    ...emptyOverrideMap(),
    ...(customizations.questionOverrides || {})
  },
  deletedQuestionKeys: Array.isArray(customizations.deletedQuestionKeys)
    ? customizations.deletedQuestionKeys
    : []
});

const createQuestionBank = ({
  id,
  name,
  description,
  baseQuestions,
  customizations,
  profile,
  theme
}) => ({
  id,
  name,
  description,
  baseQuestions: normalizeLanguageBank(baseQuestions),
  customizations: normalizeCustomizations(customizations),
  profile: profile || defaultProfile,
  theme: theme || defaultTheme,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const createDefaultCatalog = () => ({
  version: 1,
  activeBankId: DEFAULT_QUESTION_BANK_ID,
  banks: {
    [DEFAULT_QUESTION_BANK_ID]: createQuestionBank({
      id: DEFAULT_QUESTION_BANK_ID,
      name: {
        en: "Cybersecurity Awareness",
        es: "Concientizacion de ciberseguridad"
      },
      description: {
        en: "Bundled sample bank for phishing, malware, passwords, privacy, and safe reporting.",
        es: "Banco de ejemplo incluido para phishing, malware, contrasenas, privacidad y reporte seguro."
      },
      baseQuestions: cybersecurityAwarenessQuestions,
      customizations: createEmptyQuestionBankCustomizations(),
      profile: defaultProfile,
      theme: defaultTheme
    }),
    "us-citizenship-2025": createQuestionBank({
      id: "us-citizenship-2025",
      name: {
        en: "US Citizenship 2025",
        es: "Ciudadania estadounidense 2025"
      },
      description: {
        en: "USCIS 2025 civics question bank with 128 questions in English and Spanish.",
        es: "Banco USCIS 2025 de civismo con 128 preguntas en ingles y espanol."
      },
      baseQuestions: usCitizenship2025Questions,
      customizations: createEmptyQuestionBankCustomizations(),
      profile: citizenshipProfile,
      theme: citizenshipTheme
    }),
    "comptia-security-plus-sy0-701": createQuestionBank({
      id: "comptia-security-plus-sy0-701",
      name: {
        en: "CompTIA Security+ SY0-701",
        es: "CompTIA Security+ SY0-701"
      },
      description: {
        en: "Original bilingual practice bank aligned to CompTIA Security+ SY0-701 study domains.",
        es: "Banco bilingue original de practica alineado a dominios de estudio de CompTIA Security+ SY0-701."
      },
      baseQuestions: comptiaSecurity701Questions,
      customizations: createEmptyQuestionBankCustomizations(),
      profile: securityPlusProfile,
      theme: securityPlusTheme
    })
  }
});

const normalizeCatalog = (catalog = {}) => {
  const defaultCatalog = createDefaultCatalog();
  const rawBanks = catalog.banks && typeof catalog.banks === "object"
    ? { ...defaultCatalog.banks, ...catalog.banks }
    : defaultCatalog.banks;
  const banks = Object.fromEntries(
    Object.entries(rawBanks).map(([bankId, bank]) => {
      const defaultBank = defaultCatalog.banks[bankId];
      const localizedName = defaultBank && typeof bank.name === "string" ? defaultBank.name : bank.name;
      const localizedDescription = defaultBank && typeof bank.description === "string"
        ? defaultBank.description
        : bank.description;

      return [
        bankId,
        {
          ...createQuestionBank({
            id: bank.id || bankId,
            name: localizedName || "Untitled Bank",
            description: localizedDescription || "",
            baseQuestions: bank.baseQuestions || bank.questions || {},
            customizations: bank.customizations || createEmptyQuestionBankCustomizations(),
            profile: bank.profile || defaultProfile,
            theme: bank.theme || defaultTheme
          }),
          createdAt: bank.createdAt || new Date().toISOString(),
          updatedAt: bank.updatedAt || new Date().toISOString()
        }
      ];
    })
  );
  const activeBankId = banks[catalog.activeBankId]
    ? catalog.activeBankId
    : Object.keys(banks)[0] || DEFAULT_QUESTION_BANK_ID;

  return {
    version: 1,
    activeBankId,
    banks
  };
};

const readLegacyJson = (key, fallback) => {
  if (!canUseLocalStorage()) return fallback;
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch {
    return fallback;
  }
};

const migrateLegacyState = (catalog) => {
  if (!canUseLocalStorage()) return catalog;
  const defaultBank = catalog.banks[DEFAULT_QUESTION_BANK_ID];
  if (!defaultBank || defaultBank.migratedFromLegacy) return catalog;

  const legacyCustomizations = readLegacyJson("smartquiz_question_bank_customizations", null);
  const legacyProfile = readLegacyJson("smartquiz_exam_profile", null);
  const legacyTheme = readLegacyJson("smartquiz_theme", null);
  if (!legacyCustomizations && !legacyProfile && !legacyTheme) return catalog;

  return {
    ...catalog,
    banks: {
      ...catalog.banks,
      [DEFAULT_QUESTION_BANK_ID]: {
        ...defaultBank,
        customizations: legacyCustomizations
          ? normalizeCustomizations(legacyCustomizations)
          : defaultBank.customizations,
        profile: legacyProfile || defaultBank.profile,
        theme: legacyTheme || defaultBank.theme,
        migratedFromLegacy: true,
        updatedAt: new Date().toISOString()
      }
    }
  };
};

export const getQuestionBankCatalog = () => {
  if (!canUseLocalStorage()) return createDefaultCatalog();

  try {
    const storedValue = localStorage.getItem(QUESTION_BANK_CATALOG_KEY);
    const catalog = storedValue
      ? normalizeCatalog(JSON.parse(storedValue))
      : createDefaultCatalog();
    const migratedCatalog = migrateLegacyState(catalog);

    if (!storedValue || migratedCatalog !== catalog) {
      localStorage.setItem(QUESTION_BANK_CATALOG_KEY, JSON.stringify(migratedCatalog));
    }

    return migratedCatalog;
  } catch {
    return createDefaultCatalog();
  }
};

export const saveQuestionBankCatalog = (catalog, eventName = "smartquiz-question-bank-catalog-updated") => {
  const normalizedCatalog = normalizeCatalog(catalog);

  if (canUseLocalStorage()) {
    localStorage.setItem(QUESTION_BANK_CATALOG_KEY, JSON.stringify(normalizedCatalog));
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(eventName));

    if (eventName === "smartquiz-question-bank-catalog-updated") {
      window.dispatchEvent(new Event("smartquiz-question-bank-updated"));
      window.dispatchEvent(new Event("smartquiz-exam-profile-updated"));
      window.dispatchEvent(new Event("smartquiz-theme-updated"));
    }
  }

  return normalizedCatalog;
};

export const getActiveQuestionBank = () => {
  const catalog = getQuestionBankCatalog();
  return catalog.banks[catalog.activeBankId] || Object.values(catalog.banks)[0];
};

export const getActiveQuestionBankBase = () => getActiveQuestionBank().baseQuestions;

export const persistActiveQuestionBankSlice = (sliceName, value, eventName) => {
  const catalog = getQuestionBankCatalog();
  const activeBank = getActiveQuestionBank();
  const nextCatalog = {
    ...catalog,
    banks: {
      ...catalog.banks,
      [activeBank.id]: {
        ...activeBank,
        [sliceName]: value,
        updatedAt: new Date().toISOString()
      }
    }
  };

  return saveQuestionBankCatalog(nextCatalog, eventName).banks[activeBank.id][sliceName];
};

export const activateQuestionBank = (bankId) => {
  const catalog = getQuestionBankCatalog();
  if (!catalog.banks[bankId]) return catalog;

  const nextCatalog = saveQuestionBankCatalog({
    ...catalog,
    activeBankId: bankId
  });

  return nextCatalog;
};

const getDefaultBankName = (name) => {
  if (typeof name === "string") return name;
  return name?.en || name?.es || "bank";
};

export const makeQuestionBankId = (name = "bank") => (
  `${getDefaultBankName(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "bank"}-${Date.now()}`
);

export const addQuestionBank = (bank) => {
  const catalog = getQuestionBankCatalog();
  const id = bank.id || makeQuestionBankId(bank.name);
  const nextBank = createQuestionBank({
    ...bank,
    id,
    baseQuestions: bank.baseQuestions || bank.questions || emptyLanguageMap(),
    customizations: bank.customizations || createEmptyQuestionBankCustomizations(),
    profile: bank.profile || {
      ...defaultProfile,
      appName: getDefaultBankName(bank.name) || defaultProfile.appName,
      domain: id
    },
    theme: bank.theme || defaultTheme
  });

  return saveQuestionBankCatalog({
    ...catalog,
    activeBankId: id,
    banks: {
      ...catalog.banks,
      [id]: nextBank
    }
  });
};

export const duplicateQuestionBank = (bankId) => {
  const catalog = getQuestionBankCatalog();
  const bank = catalog.banks[bankId];
  if (!bank) return catalog;

  const copiedName = typeof bank.name === "string"
    ? `${bank.name} Copy`
    : {
      en: `${bank.name?.en || "Question Bank"} Copy`,
      es: `${bank.name?.es || bank.name?.en || "Base de preguntas"} copia`
    };

  return addQuestionBank({
    ...clone(bank),
    id: makeQuestionBankId(`${getDefaultBankName(bank.name)}-copy`),
    name: copiedName
  });
};

export const deleteQuestionBank = (bankId) => {
  const catalog = getQuestionBankCatalog();
  const bankIds = Object.keys(catalog.banks);
  if (bankIds.length <= 1 || !catalog.banks[bankId]) return catalog;

  const banks = { ...catalog.banks };
  delete banks[bankId];
  const activeBankId = catalog.activeBankId === bankId ? Object.keys(banks)[0] : catalog.activeBankId;

  return saveQuestionBankCatalog({ ...catalog, activeBankId, banks });
};

export const addCitizenshipStarterBank = () => (
  addQuestionBank({
    id: "us-citizenship-2025",
    name: {
      en: "US Citizenship 2025",
      es: "Ciudadania estadounidense 2025"
    },
    description: {
      en: "USCIS 2025 civics question bank with 128 questions in English and Spanish.",
      es: "Banco USCIS 2025 de civismo con 128 preguntas en ingles y espanol."
    },
    baseQuestions: usCitizenship2025Questions,
    customizations: createEmptyQuestionBankCustomizations(),
    profile: citizenshipProfile,
    theme: citizenshipTheme
  })
);

export const parseQuestionBankImport = (payload) => {
  const parsedPayload = typeof payload === "string" ? JSON.parse(payload) : payload;
  const bankPayload = parsedPayload.bank || parsedPayload;
  const questions = bankPayload.baseQuestions || bankPayload.questions || (
    Array.isArray(bankPayload.en) || Array.isArray(bankPayload.es)
      ? { en: bankPayload.en || [], es: bankPayload.es || [] }
      : emptyLanguageMap()
  );

  return {
    id: bankPayload.id,
    name: bankPayload.name || "Imported Question Bank",
    description: bankPayload.description || "",
    baseQuestions: questions,
    customizations: bankPayload.customizations || createEmptyQuestionBankCustomizations(),
    profile: bankPayload.profile,
    theme: bankPayload.theme
  };
};
