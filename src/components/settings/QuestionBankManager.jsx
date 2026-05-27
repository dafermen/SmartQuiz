import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileUp,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2
} from "lucide-react";
import { getQuestionsData } from "@/components/data/index";
import {
  createEmptyQuestionBankCustomizations,
  getQuestionBankCustomizations,
  makeCustomQuestionId,
  makeQuestionKey,
  normalizeQuestionRecord,
  resetQuestionBankCustomizations,
  saveQuestionBankCustomizations
} from "@/components/data/questionBankStorage";
import { useLanguage } from "@/components/language/LanguageProvider";
import { getExamProfile, getLocalizedProfileText } from "@/components/profile/examProfileStorage";

const difficultyOptions = ["beginner", "intermediate", "advanced"];

const emptyForm = {
  id: "",
  category: "module_1",
  difficulty: "beginner",
  tags: "",
  block_id: 1,
  block_name: "General",
  question: "",
  options: ["", "", "", ""],
  correct_answer: 0,
  explanation: ""
};

const getQuestionSourceLabel = (question, t) => {
  if (question.original_source === "base") return t("editedBase");
  if (question.source === "custom") return t("customQuestion");
  return t("baseQuestion");
};

const toEditableForm = (question) => ({
  id: question.id,
  category: question.category,
  difficulty: question.difficulty || "beginner",
  tags: Array.isArray(question.tags) ? question.tags.join(", ") : "",
  block_id: question.block_id,
  block_name: question.block_name,
  question: question.question,
  options: [...question.options, "", "", "", ""].slice(0, 4),
  correct_answer: question.correct_answer,
  explanation: question.explanation
});

const validateQuestionForm = (form) => (
  form.question.trim().length > 0
  && form.block_name.trim().length > 0
  && form.options.every((option) => option.trim().length > 0)
  && form.correct_answer >= 0
  && form.correct_answer <= 3
);

const cloneCustomizations = (customizations) => JSON.parse(JSON.stringify(customizations));

/**
 * Local question bank editor.
 *
 * Supports adding custom questions, editing base questions through local
 * overrides, deleting any visible question locally, and importing/exporting the
 * customization layer without changing the bundled JSON file.
 *
 * @returns {JSX.Element}
 */
export default function QuestionBankManager() {
  const { t, language } = useLanguage();
  const [examProfile, setExamProfile] = useState(getExamProfile);
  const [activeLanguage, setActiveLanguage] = useState(language);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [customizations, setCustomizations] = useState(getQuestionBankCustomizations);
  const [form, setForm] = useState(emptyForm);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [message, setMessage] = useState(null);
  const [importText, setImportText] = useState("");

  const questions = getQuestionsData()[activeLanguage] || [];
  const categoryOptions = examProfile.categories.map((category) => category.id);

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 250);

    return () => window.clearTimeout(debounceTimer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeLanguage, sourceFilter, categoryFilter, debouncedSearchTerm, pageSize]);

  useEffect(() => {
    const handleExamProfileUpdate = () => {
      setExamProfile(getExamProfile());
    };

    window.addEventListener("smartquiz-exam-profile-updated", handleExamProfileUpdate);
    return () => window.removeEventListener("smartquiz-exam-profile-updated", handleExamProfileUpdate);
  }, []);

  const getCategoryLabel = (categoryId) => {
    const categoryProfile = examProfile.categories.find((category) => category.id === categoryId);
    return categoryProfile ? getLocalizedProfileText(categoryProfile.label, language) : t(categoryId);
  };

  const normalizedSearchTerm = debouncedSearchTerm.trim().toLowerCase();
  const filteredQuestions = questions.filter((question) => {
    const sourceMatches = sourceFilter === "all"
      || (sourceFilter === "base" && question.source === "base")
      || (sourceFilter === "custom" && question.source === "custom");
    const categoryMatches = categoryFilter === "all" || question.category === categoryFilter;
    const searchMatches = normalizedSearchTerm.length === 0
      || [
        question.question,
        question.block_name,
        question.explanation,
        question.difficulty,
        ...(question.tags || []),
        ...(question.options || [])
      ].some((value) => String(value || "").toLowerCase().includes(normalizedSearchTerm));

    return sourceMatches && categoryMatches && searchMatches;
  });

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredQuestions.length);
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  const setAndPersistCustomizations = (nextCustomizations) => {
    const savedCustomizations = saveQuestionBankCustomizations(nextCustomizations);
    setCustomizations(savedCustomizations);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 3500);
  };

  const handleFormChange = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleOptionChange = (index, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      options: currentForm.options.map((option, optionIndex) => (
        optionIndex === index ? value : option
      ))
    }));
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setForm(toEditableForm(question));
    setMessage(null);
    setIsEditorOpen(true);
  };

  const handleNewQuestion = () => {
    setEditingQuestion(null);
    setForm(emptyForm);
    setMessage(null);
    setIsEditorOpen(true);
  };

  const handleCancel = () => {
    setEditingQuestion(null);
    setForm(emptyForm);
    setMessage(null);
    setIsEditorOpen(false);
  };

  const handleDuplicate = (question) => {
    setEditingQuestion(null);
    setForm({
      ...toEditableForm(question),
      id: "",
      question: `${question.question} (copy)`
    });
    setMessage(null);
    setIsEditorOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!validateQuestionForm(form)) {
      showMessage("error", t("questionValidationError"));
      return;
    }

    const normalizedQuestion = normalizeQuestionRecord(
      {
        ...form,
        id: editingQuestion?.id || form.id || makeCustomQuestionId()
      },
      activeLanguage,
      "custom"
    );

    const nextCustomizations = cloneCustomizations(customizations);

    if (editingQuestion?.source === "base" || editingQuestion?.original_source === "base") {
      nextCustomizations.questionOverrides[activeLanguage][editingQuestion.id] = normalizedQuestion;
    } else {
      const currentQuestions = nextCustomizations.customQuestions[activeLanguage] || [];
      const questionExists = currentQuestions.some((question) => question.id === normalizedQuestion.id);
      nextCustomizations.customQuestions[activeLanguage] = questionExists
        ? currentQuestions.map((question) => (
          question.id === normalizedQuestion.id ? normalizedQuestion : question
        ))
        : [...currentQuestions, normalizedQuestion];
    }

    setAndPersistCustomizations(nextCustomizations);
    setEditingQuestion(null);
    setForm(emptyForm);
    setIsEditorOpen(false);
    showMessage("success", t("questionBankSaved"));
  };

  const handleDeleteQuestion = (question) => {
    const confirmed = window.confirm(t("deleteQuestionConfirm"));
    if (!confirmed) return;

    const nextCustomizations = cloneCustomizations(customizations);

    if (question.source === "base" || question.original_source === "base") {
      const key = question.question_key || makeQuestionKey(activeLanguage, question.id);
      nextCustomizations.deletedQuestionKeys = Array.from(
        new Set([...nextCustomizations.deletedQuestionKeys, key])
      );
      delete nextCustomizations.questionOverrides[activeLanguage][question.id];
    } else {
      nextCustomizations.customQuestions[activeLanguage] = (
        nextCustomizations.customQuestions[activeLanguage] || []
      ).filter((customQuestion) => customQuestion.id !== question.id);
    }

    setAndPersistCustomizations(nextCustomizations);
    showMessage("success", t("questionBankDeleted"));
  };

  const handleExport = () => {
    const exportPayload = {
      version: 1,
      exported_at: new Date().toISOString(),
      customizations
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "smartquiz-question-bank.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const parsedPayload = JSON.parse(importText);
      const importedCustomizations = parsedPayload.customizations
        ? parsedPayload.customizations
        : {
          ...createEmptyQuestionBankCustomizations(),
          customQuestions: {
            en: Array.isArray(parsedPayload.en) ? parsedPayload.en : [],
            es: Array.isArray(parsedPayload.es) ? parsedPayload.es : []
          }
        };

      setAndPersistCustomizations(importedCustomizations);
      setImportText("");
      showMessage("success", t("questionBankImported"));
    } catch {
      showMessage("error", t("questionBankImportError"));
    }
  };

  const handleResetBank = () => {
    const confirmed = window.confirm(t("resetQuestionBankConfirm"));
    if (!confirmed) return;

    const resetCustomizations = resetQuestionBankCustomizations();
    setCustomizations(resetCustomizations);
    setEditingQuestion(null);
    setForm(emptyForm);
    setIsEditorOpen(false);
    showMessage("success", t("questionBankReset"));
  };

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          {t("questionBankManager")}
        </CardTitle>
        <p className="text-sm text-slate-500">{t("questionBankDesc")}</p>
      </CardHeader>

      <CardContent className="space-y-8">
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3 md:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-9"
              placeholder={t("searchQuestions")}
            />
          </div>

          <Select value={activeLanguage} onValueChange={setActiveLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t("english")}</SelectItem>
              <SelectItem value="es">{t("spanish")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCategories")}</SelectItem>
              {categoryOptions.map((category) => (
                <SelectItem key={category} value={category}>
                  {getCategoryLabel(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allQuestions")}</SelectItem>
              <SelectItem value="base">{t("baseQuestions")}</SelectItem>
              <SelectItem value="custom">{t("customQuestions")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-slate-950">{t("questions")}</h3>
              <p className="text-sm text-slate-500">
                {filteredQuestions.length} {t("totalAvailable")}
              </p>
            </div>
            <Button variant="outline" className="rounded-lg" onClick={handleNewQuestion}>
              <Plus className="mr-2 h-4 w-4" />
              {t("newQuestion")}
            </Button>
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-slate-200 md:block">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[42%]">{t("questionText")}</TableHead>
                  <TableHead>{t("category")}</TableHead>
                  <TableHead>{t("difficulty")}</TableHead>
                  <TableHead>{t("topicName")}</TableHead>
                  <TableHead>{t("source")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedQuestions.map((question) => (
                  <TableRow key={question.question_key}>
                    <TableCell>
                      <p className="line-clamp-2 font-medium text-slate-950">
                        {question.question}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                        {question.explanation}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-teal-50 text-teal-800 ring-1 ring-teal-100">
                        {getCategoryLabel(question.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{t(question.difficulty || "beginner")}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-slate-600">
                      {question.block_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getQuestionSourceLabel(question, t)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="outline" onClick={() => handleEdit(question)} title={t("edit")}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => handleDuplicate(question)} title={t("duplicate")}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteQuestion(question)}
                          title={t("delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {paginatedQuestions.map((question) => (
              <div
                key={question.question_key}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className="bg-teal-50 text-teal-800 ring-1 ring-teal-100">
                    {getCategoryLabel(question.category)}
                  </Badge>
                  <Badge variant="outline">{t(question.difficulty || "beginner")}</Badge>
                  <Badge variant="outline">{getQuestionSourceLabel(question, t)}</Badge>
                  <Badge variant="outline">{question.block_name}</Badge>
                </div>
                {question.tags?.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {question.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="line-clamp-3 font-medium text-slate-950">{question.question}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(question)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t("edit")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDuplicate(question)}>
                    <Copy className="mr-2 h-4 w-4" />
                    {t("duplicate")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteQuestion(question)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("delete")}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {paginatedQuestions.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              {t("noQuestionsFound")}
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              {filteredQuestions.length === 0
                ? `0 ${t("of")} 0`
                : `${t("showing")} ${startIndex + 1} ${t("to")} ${endIndex} ${t("of")} ${filteredQuestions.length}`}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-[150px] bg-white">
                  <SelectValue aria-label={t("rowsPerPage")} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} {t("per")} {t("page").toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                {t("previous")}
              </Button>
              <span className="min-w-[86px] text-center text-sm text-slate-600">
                {t("page")} {safeCurrentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                {t("next")}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Sheet
          open={isEditorOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleCancel();
              return;
            }
            setIsEditorOpen(true);
          }}
        >
          <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
            <SheetHeader>
              <SheetTitle>
                {editingQuestion ? t("editQuestion") : t("addQuestion")}
              </SheetTitle>
              <SheetDescription>{t("questionEditorDesc")}</SheetDescription>
            </SheetHeader>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <Label>{t("category")}</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => handleFormChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {getCategoryLabel(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
                <div className="grid gap-2">
                  <Label>{t("difficulty")}</Label>
                  <Select
                    value={form.difficulty}
                    onValueChange={(value) => handleFormChange("difficulty", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyOptions.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {t(difficulty)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{t("tags")}</Label>
                  <Input
                    value={form.tags}
                    onChange={(event) => handleFormChange("tags", event.target.value)}
                    placeholder={t("tagsPlaceholder")}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[0.4fr_1fr]">
                <div className="grid gap-2">
                  <Label>{t("topicId")}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.block_id}
                    onChange={(event) => handleFormChange("block_id", Number(event.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("topicName")}</Label>
                  <Input
                    value={form.block_name}
                    onChange={(event) => handleFormChange("block_name", event.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>{t("questionText")}</Label>
                <Textarea
                  value={form.question}
                  onChange={(event) => handleFormChange("question", event.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid gap-3">
                <Label>{t("answerOptions")}</Label>
                {form.options.map((option, index) => (
                  <div key={index} className="grid gap-2 md:grid-cols-[1fr_9rem]">
                    <Input
                      value={option}
                      onChange={(event) => handleOptionChange(index, event.target.value)}
                      placeholder={`${t("option")} ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant={form.correct_answer === index ? "default" : "outline"}
                      className={form.correct_answer === index ? "bg-teal-600 hover:bg-teal-700" : ""}
                      onClick={() => handleFormChange("correct_answer", index)}
                    >
                      {t("correctAnswer")}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid gap-2">
                <Label>{t("explanation")}</Label>
                <Textarea
                  value={form.explanation}
                  onChange={(event) => handleFormChange("explanation", event.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={handleSaveQuestion} className="bg-teal-600 hover:bg-teal-700">
                <Save className="mr-2 h-4 w-4" />
                {editingQuestion ? t("updateQuestion") : t("saveQuestion")}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-950">{t("importExport")}</h3>
            <p className="text-sm text-slate-600">{t("importExportDesc")}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                {t("exportJson")}
              </Button>
              <Button
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
                onClick={handleResetBank}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {t("resetQuestionBank")}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>{t("pasteJson")}</Label>
            <Textarea
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              rows={5}
              placeholder='{"customizations": {...}}'
            />
            <Button onClick={handleImport} disabled={!importText.trim()}>
              <FileUp className="mr-2 h-4 w-4" />
              {t("importQuestions")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
