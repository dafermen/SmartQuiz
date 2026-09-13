import { z } from "zod";

export const supportedQuestionLanguages = ["en", "es"];
export const supportedDifficulties = ["beginner", "intermediate", "advanced"];

const localizedTextSchema = z.union([
  z.string().min(1),
  z.object({
    en: z.string().optional(),
    es: z.string().optional()
  }).passthrough()
]).optional();

const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const questionSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  category: z.string().min(1),
  block_id: z.union([z.number(), z.string()]).optional(),
  block_name: z.string().optional(),
  difficulty: z.enum(supportedDifficulties).optional().default("beginner"),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(8),
  correct_answer: z.number().int().nonnegative().optional(),
  correct_answers: z.array(z.number().int().nonnegative()).optional(),
  explanation: z.string().optional()
}).passthrough().superRefine((question, context) => {
  const answers = question.correct_answers || (
    Number.isInteger(question.correct_answer) ? [question.correct_answer] : []
  );

  if (answers.length === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["correct_answer"],
      message: "Question requires correct_answer or correct_answers."
    });
  }

  answers.forEach((answer) => {
    if (answer >= question.options.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["correct_answer"],
        message: `Answer index ${answer} is outside options length ${question.options.length}.`
      });
    }
  });
});

export const languageQuestionBankSchema = z.object(
  Object.fromEntries(supportedQuestionLanguages.map((language) => [
    language,
    z.array(questionSchema).default([])
  ]))
).partial().passthrough();

const importLanguageQuestionBankSchema = languageQuestionBankSchema.superRefine((bank, context) => {
  const questionCount = supportedQuestionLanguages.reduce((total, language) => (
    total + (Array.isArray(bank[language]) ? bank[language].length : 0)
  ), 0);

  if (questionCount === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Question bank must include at least one question."
    });
  }
});

export const questionBankCustomizationsSchema = z.object({
  customQuestions: languageQuestionBankSchema.optional(),
  questionOverrides: z.object(
    Object.fromEntries(supportedQuestionLanguages.map((language) => [
      language,
      z.record(z.string(), questionSchema).default({})
    ]))
  ).partial().optional(),
  deletedQuestionKeys: z.array(z.string()).optional()
}).partial().passthrough();

export const themeSchema = z.object({
  primary: hexColorSchema,
  secondary: hexColorSchema,
  accent: hexColorSchema,
  background: hexColorSchema,
  surface: hexColorSchema,
  text: hexColorSchema,
  muted: hexColorSchema,
  success: hexColorSchema,
  warning: hexColorSchema,
  danger: hexColorSchema
}).partial().passthrough();

export const profileSchema = z.object({
  appName: z.string().optional(),
  location: z.string().optional(),
  headline: z.string().optional(),
  description: z.string().optional(),
  domain: z.string().optional(),
  passingScore: z.number().min(0).max(100).optional(),
  questionsPerTest: z.number().int().positive().optional(),
  testsPerCategory: z.number().int().positive().optional(),
  categories: z.array(z.object({
    id: z.string().min(1),
    label: localizedTextSchema,
    description: localizedTextSchema
  }).passthrough()).optional()
}).passthrough();

export const questionBankSchema = z.object({
  id: z.string().optional(),
  name: localizedTextSchema.or(z.string().min(1)).optional(),
  description: localizedTextSchema.or(z.string()).optional(),
  baseQuestions: languageQuestionBankSchema.optional(),
  questions: languageQuestionBankSchema.optional(),
  customizations: questionBankCustomizationsSchema.optional(),
  profile: profileSchema.optional(),
  theme: themeSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
}).passthrough().superRefine((bank, context) => {
  const questionMap = bank.baseQuestions || bank.questions;
  const questionCount = supportedQuestionLanguages.reduce((total, language) => (
    total + (Array.isArray(questionMap?.[language]) ? questionMap[language].length : 0)
  ), 0);

  if (questionCount === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["baseQuestions"],
      message: "Question bank must include at least one question."
    });
  }
});

export const questionBankImportSchema = z.union([
  questionBankSchema,
  z.object({ bank: questionBankSchema }).passthrough(),
  importLanguageQuestionBankSchema
]);

export const questionBankCatalogSchema = z.object({
  version: z.number().int().positive(),
  activeBankId: z.string().min(1),
  banks: z.record(z.string(), questionBankSchema)
}).passthrough().superRefine((catalog, context) => {
  if (!catalog.banks[catalog.activeBankId]) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["activeBankId"],
      message: "Active bank id must exist in banks."
    });
  }
});

export const fullBackupSchema = z.object({
  version: z.number().int().positive(),
  type: z.literal("smartquiz-full-backup"),
  exported_at: z.string().optional(),
  catalog: questionBankCatalogSchema,
  scopedData: z.record(z.string(), z.object({
    quiz_attempts: z.array(z.unknown()).nullable().optional(),
    user_quiz_settings: z.unknown().nullable().optional(),
    gamification_profile: z.unknown().nullable().optional(),
    learning_state: z.unknown().nullable().optional()
  }).passthrough()).optional(),
  global: z.object({
    language: z.string().optional(),
    onboarding: z.unknown().nullable().optional(),
    mobile_settings: z.unknown().nullable().optional()
  }).partial().optional()
}).passthrough();

const formatValidationError = (error) => (
  error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`).join("; ")
);

export const parseWithSchema = (schema, payload, label = "payload") => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new Error(`${label} failed validation: ${formatValidationError(result.error)}`);
  }
  return result.data;
};

export const validateQuestionBankImport = (payload) => parseWithSchema(questionBankImportSchema, payload, "question bank import");
export const validateQuestionBankCatalog = (payload) => parseWithSchema(questionBankCatalogSchema, payload, "question bank catalog");
export const validateFullBackup = (payload) => parseWithSchema(fullBackupSchema, payload, "full backup");
