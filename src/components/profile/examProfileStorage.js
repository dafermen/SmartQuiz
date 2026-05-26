export const EXAM_PROFILE_KEY = "smartquiz_exam_profile";

export const defaultExamProfile = {
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
      id: "phishing_awareness",
      icon: "ScanSearch",
      color: "from-teal-500 to-cyan-600",
      headerTone: "light",
      label: {
        en: "Phishing Awareness",
        es: "Deteccion de phishing"
      },
      description: {
        en: "Practice recognizing suspicious messages, fake links, urgent requests, and social engineering patterns.",
        es: "Practica como reconocer mensajes sospechosos, enlaces falsos, urgencia artificial e ingenieria social."
      }
    },
    {
      id: "malware_basics",
      icon: "ShieldCheck",
      color: "from-slate-800 to-blue-900",
      headerTone: "light",
      label: {
        en: "Malware Basics",
        es: "Conceptos de malware"
      },
      description: {
        en: "Review safe everyday choices around downloads, attachments, pop-ups, and device behavior.",
        es: "Repasa decisiones seguras sobre descargas, adjuntos, ventanas emergentes y comportamiento del dispositivo."
      }
    },
    {
      id: "safe_data_habits",
      icon: "BookOpen",
      color: "from-emerald-500 to-teal-700",
      headerTone: "light",
      label: {
        en: "Safe Data Habits",
        es: "Habitos de datos seguros"
      },
      description: {
        en: "Strengthen password, privacy, verification, and reporting habits for non-technical users.",
        es: "Refuerza contrasenas, privacidad, verificacion y reporte para usuarios finales."
      }
    }
  ]
};

const canUseLocalStorage = () => typeof window !== "undefined" && window.localStorage;

const clampNumber = (value, min, max, fallback) => {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsedValue)));
};

const normalizeLocalizedText = (value, fallback) => ({
  en: value?.en || fallback.en,
  es: value?.es || fallback.es
});

export const normalizeExamProfile = (profile = {}) => ({
  ...defaultExamProfile,
  ...profile,
  appName: profile.appName || defaultExamProfile.appName,
  location: profile.location || defaultExamProfile.location,
  headline: profile.headline || defaultExamProfile.headline,
  description: profile.description || defaultExamProfile.description,
  domain: profile.domain || defaultExamProfile.domain,
  passingScore: clampNumber(profile.passingScore, 1, 100, defaultExamProfile.passingScore),
  questionsPerTest: clampNumber(profile.questionsPerTest, 1, 100, defaultExamProfile.questionsPerTest),
  testsPerCategory: clampNumber(profile.testsPerCategory, 1, 100, defaultExamProfile.testsPerCategory),
  categories: defaultExamProfile.categories.map((defaultCategory) => {
    const savedCategory = (profile.categories || []).find((category) => category.id === defaultCategory.id) || {};

    return {
      ...defaultCategory,
      ...savedCategory,
      id: defaultCategory.id,
      label: normalizeLocalizedText(savedCategory.label, defaultCategory.label),
      description: normalizeLocalizedText(savedCategory.description, defaultCategory.description)
    };
  })
});

export const getExamProfile = () => {
  if (!canUseLocalStorage()) return defaultExamProfile;

  try {
    const storedValue = localStorage.getItem(EXAM_PROFILE_KEY);
    if (!storedValue) return defaultExamProfile;
    return normalizeExamProfile(JSON.parse(storedValue));
  } catch {
    return defaultExamProfile;
  }
};

export const saveExamProfile = (profile) => {
  const normalizedProfile = normalizeExamProfile(profile);

  if (canUseLocalStorage()) {
    localStorage.setItem(EXAM_PROFILE_KEY, JSON.stringify(normalizedProfile));
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("smartquiz-exam-profile-updated"));
  }

  return normalizedProfile;
};

export const resetExamProfile = () => saveExamProfile(defaultExamProfile);

export const getLocalizedProfileText = (value, language) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] || value.en || "";
};

export const getPracticeCategoryProfile = (language) => ({
  id: "practice_quiz",
  icon: "Award",
  color: "from-amber-400 to-orange-500",
  headerTone: "light",
  label: {
    en: "Mixed Practice",
    es: "Practica mixta"
  },
  description: {
    en: "A randomized practice quiz across the full sample question bank.",
    es: "Examen aleatorio con preguntas de todo el banco de ejemplo."
  },
  localizedLabel: language === "es" ? "Practica mixta" : "Mixed Practice"
});

export const getQuizSettingsDefaults = (profile = defaultExamProfile) => {
  const normalizedProfile = normalizeExamProfile(profile);
  const categoryIds = [
    ...normalizedProfile.categories.map((category) => category.id),
    "practice_quiz"
  ];

  return categoryIds.reduce((settings, categoryId) => ({
    ...settings,
    [`${categoryId}_limit`]: normalizedProfile.testsPerCategory,
    [`${categoryId}_taken`]: 0
  }), {});
};
