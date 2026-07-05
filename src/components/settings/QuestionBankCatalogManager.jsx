import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUpDown,
  CheckCircle2,
  Copy,
  Database,
  Download,
  FileArchive,
  FileUp,
  Plus,
  Search,
  Sparkles,
  Trash2
} from "lucide-react";
import { useLanguage } from "@/components/language/LanguageProvider";
import { getScopedStorageKeyForBank } from "@/components/data/activeBankStorage";
import {
  activateQuestionBank,
  addCitizenshipStarterBank,
  addQuestionBank,
  deleteQuestionBank,
  duplicateQuestionBank,
  getQuestionBankCatalog,
  parseQuestionBankImport,
  saveQuestionBankCatalog
} from "@/components/data/questionBankCatalogStorage";

const emptyForm = {
  name: "",
  description: "",
  template: "general"
};

const bankTemplates = {
  general: {
    domain: "general-practice",
    passingScore: 70,
    questionsPerTest: 20,
    theme: {
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
    }
  },
  certification: {
    domain: "certification-prep",
    passingScore: 80,
    questionsPerTest: 15,
    theme: {
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
    }
  },
  citizenship: {
    domain: "citizenship-practice",
    passingScore: 80,
    questionsPerTest: 10,
    theme: {
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
    }
  }
};

const countQuestions = (bank) => (
  Object.values(bank.baseQuestions || {}).reduce((total, questions) => (
    total + (Array.isArray(questions) ? questions.length : 0)
  ), 0)
  + Object.values(bank.customizations?.customQuestions || {}).reduce((total, questions) => (
    total + (Array.isArray(questions) ? questions.length : 0)
  ), 0)
);

const countLanguages = (bank) => (
  Object.values(bank.baseQuestions || {}).filter((questions) => Array.isArray(questions) && questions.length > 0).length
);

const readJsonKey = (key, fallback) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch {
    return fallback;
  }
};

const writeJsonKey = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getBankStats = (bank) => {
  const attempts = readJsonKey(getScopedStorageKeyForBank(bank.id, "quiz_attempts"), []);
  const passed = attempts.filter((attempt) => attempt.passed).length;
  const bestScore = attempts.length > 0
    ? Math.max(...attempts.map((attempt) => Number(attempt.percentage) || 0))
    : 0;

  return {
    attempts: attempts.length,
    passRate: attempts.length > 0 ? Math.round((passed / attempts.length) * 100) : 0,
    bestScore
  };
};

const getTopicStats = (bank) => {
  const topics = {};

  Object.values(bank.baseQuestions || {}).forEach((questions) => {
    (questions || []).forEach((question) => {
      const key = question.block_name || question.category || "General";
      topics[key] = (topics[key] || 0) + 1;
    });
  });

  return Object.entries(topics)
    .map(([topic, questions]) => ({ topic, questions }))
    .sort((a, b) => b.questions - a.questions)
    .slice(0, 4);
};

const downloadJson = (payload, filename) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const readFileAsText = (file) => (
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsText(file);
  })
);

const buildFullBackup = (catalog) => {
  const scopedData = {};
  Object.values(catalog.banks).forEach((bank) => {
    scopedData[bank.id] = {
      quiz_attempts: readJsonKey(getScopedStorageKeyForBank(bank.id, "quiz_attempts"), []),
      user_quiz_settings: readJsonKey(getScopedStorageKeyForBank(bank.id, "user_quiz_settings"), null),
      gamification_profile: readJsonKey(getScopedStorageKeyForBank(bank.id, "gamification_profile"), null),
      learning_state: readJsonKey(getScopedStorageKeyForBank(bank.id, "learning_state"), null)
    };
  });

  return {
    version: 1,
    type: "smartquiz-full-backup",
    exported_at: new Date().toISOString(),
    catalog,
    scopedData,
    global: {
      language: localStorage.getItem("smartquiz_language") || "en",
      onboarding: readJsonKey("smartquiz_onboarding", null),
      mobile_settings: readJsonKey("smartquiz_mobile_settings", null)
    }
  };
};

const restoreFullBackup = (backup) => {
  if (backup.type !== "smartquiz-full-backup" || !backup.catalog) {
    throw new Error("Invalid full backup");
  }

  const restoredCatalog = saveQuestionBankCatalog(backup.catalog);
  Object.entries(backup.scopedData || {}).forEach(([bankId, records]) => {
    Object.entries(records || {}).forEach(([name, value]) => {
      if (value !== null && value !== undefined) {
        writeJsonKey(getScopedStorageKeyForBank(bankId, name), value);
      }
    });
  });

  if (backup.global?.language) {
    localStorage.setItem("smartquiz_language", backup.global.language);
  }
  if (backup.global?.onboarding) {
    writeJsonKey("smartquiz_onboarding", backup.global.onboarding);
  }
  if (backup.global?.mobile_settings) {
    writeJsonKey("smartquiz_mobile_settings", backup.global.mobile_settings);
  }

  return restoredCatalog;
};

/**
 * Compact table-based manager for local JSON question banks.
 *
 * @returns {JSX.Element}
 */
export default function QuestionBankCatalogManager() {
  const { t, language } = useLanguage();
  const [catalog, setCatalog] = useState(getQuestionBankCatalog);
  const [form, setForm] = useState(emptyForm);
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const fileInputRef = useRef(null);
  const backupFileInputRef = useRef(null);

  const banks = useMemo(() => Object.values(catalog.banks), [catalog]);
  const activeBank = catalog.banks[catalog.activeBankId] || banks[0];
  const getLocalizedValue = useCallback((value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[language] || value.en || value.es || "";
  }, [language]);
  const getBankName = useCallback((bank) => getLocalizedValue(bank.name) || t("untitledBank"), [getLocalizedValue, t]);
  const getBankDescription = useCallback((bank) => getLocalizedValue(bank.description), [getLocalizedValue]);

  useEffect(() => {
    const handleCatalogUpdate = () => setCatalog(getQuestionBankCatalog());
    window.addEventListener("smartquiz-question-bank-catalog-updated", handleCatalogUpdate);
    return () => window.removeEventListener("smartquiz-question-bank-catalog-updated", handleCatalogUpdate);
  }, []);

  const rows = useMemo(() => (
    banks.map((bank) => ({
      bank,
      name: getBankName(bank),
      description: getBankDescription(bank),
      questions: countQuestions(bank),
      languages: countLanguages(bank),
      stats: getBankStats(bank),
      topics: getTopicStats(bank),
      active: bank.id === catalog.activeBankId,
      updatedAt: bank.updatedAt || bank.createdAt
    }))
  ), [banks, catalog.activeBankId, getBankDescription, getBankName]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const visibleRows = normalizedSearch
      ? rows.filter((row) => [
        row.name,
        row.description,
        row.bank.profile?.domain,
        row.bank.id
      ].some((value) => String(value || "").toLowerCase().includes(normalizedSearch)))
      : rows;

    return [...visibleRows].sort((a, b) => {
      const first = sortBy === "attempts" ? a.stats.attempts : a[sortBy];
      const second = sortBy === "attempts" ? b.stats.attempts : b[sortBy];
      const direction = sortDirection === "asc" ? 1 : -1;

      if (typeof first === "number" && typeof second === "number") {
        return (first - second) * direction;
      }

      return String(first || "").localeCompare(String(second || "")) * direction;
    });
  }, [rows, searchTerm, sortBy, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageRows = filteredRows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 3500);
  };

  const changeSort = (key) => {
    if (sortBy === key) {
      setSortDirection((direction) => direction === "asc" ? "desc" : "asc");
      return;
    }
    setSortBy(key);
    setSortDirection(key === "name" ? "asc" : "desc");
  };

  const handleActivate = (bankId) => {
    setCatalog(activateQuestionBank(bankId));
    showMessage("success", t("questionBankActivated"));
  };

  const handleCreate = () => {
    if (!form.name.trim()) {
      showMessage("error", t("questionBankNameRequired"));
      return;
    }

    const selectedTemplate = bankTemplates[form.template] || bankTemplates.general;

    setCatalog(addQuestionBank({
      name: form.name.trim(),
      description: form.description.trim(),
      profile: {
        appName: form.name.trim(),
        location: selectedTemplate.domain,
        headline: form.name.trim(),
        description: form.description.trim(),
        domain: selectedTemplate.domain,
        passingScore: selectedTemplate.passingScore,
        questionsPerTest: selectedTemplate.questionsPerTest,
        testsPerCategory: 20,
        categories: [
          {
            id: "module_1",
            icon: "BookOpen",
            color: "from-primary to-secondary",
            headerTone: "light",
            label: { en: "Module 1", es: "Modulo 1" },
            description: { en: "First topic group.", es: "Primer grupo de temas." }
          },
          {
            id: "module_2",
            icon: "ShieldCheck",
            color: "from-secondary to-primary",
            headerTone: "light",
            label: { en: "Module 2", es: "Modulo 2" },
            description: { en: "Second topic group.", es: "Segundo grupo de temas." }
          },
          {
            id: "module_3",
            icon: "Layers3",
            color: "from-accent to-primary",
            headerTone: "light",
            label: { en: "Module 3", es: "Modulo 3" },
            description: { en: "Third topic group.", es: "Tercer grupo de temas." }
          }
        ]
      },
      theme: selectedTemplate.theme
    }));
    setForm(emptyForm);
    setCreateOpen(false);
    showMessage("success", t("questionBankCreated"));
  };

  const handleDuplicate = (bankId) => {
    setCatalog(duplicateQuestionBank(bankId));
    showMessage("success", t("questionBankDuplicated"));
  };

  const handleDelete = (bankId) => {
    const confirmed = window.confirm(t("deleteQuestionBankConfirm"));
    if (!confirmed) return;

    setCatalog(deleteQuestionBank(bankId));
    showMessage("success", t("questionBankRemoved"));
  };

  const handleAddCitizenship = () => {
    setCatalog(addCitizenshipStarterBank());
    showMessage("success", t("citizenshipBankCreated"));
  };

  const importBankFromText = (text) => {
    const parsedBank = parseQuestionBankImport(text);
    setCatalog(addQuestionBank(parsedBank));
    setImportText("");
    setImportOpen(false);
    showMessage("success", t("questionBankImported"));
  };

  const handleImport = () => {
    try {
      importBankFromText(importText);
    } catch {
      showMessage("error", t("questionBankImportError"));
    }
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      importBankFromText(await readFileAsText(file));
    } catch {
      showMessage("error", t("questionBankImportError"));
    } finally {
      event.target.value = "";
    }
  };

  const handleExportActive = () => {
    downloadJson({
      version: 1,
      exported_at: new Date().toISOString(),
      bank: activeBank
    }, `${getBankName(activeBank).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "smartquiz-bank"}.json`);
  };

  const handleExportFullBackup = () => {
    downloadJson(
      buildFullBackup(catalog),
      `smartquiz-full-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
  };

  const handleImportFullBackupFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const restoredCatalog = restoreFullBackup(JSON.parse(await readFileAsText(file)));
      setCatalog(restoredCatalog);
      setExportOpen(false);
      showMessage("success", t("fullBackupImported"));
    } catch {
      showMessage("error", t("fullBackupImportError"));
    } finally {
      event.target.value = "";
    }
  };

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {t("questionBanks")}
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">{t("questionBanksDesc")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("createBank")}
            </Button>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <FileUp className="h-4 w-4" />
              {t("importBank")}
            </Button>
            <Button variant="outline" onClick={() => setExportOpen(true)}>
              <FileArchive className="h-4 w-4" />
              {t("backup")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3 lg:grid-cols-[1fr_12rem_10rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
              placeholder={t("searchBanks")}
            />
          </div>
          <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} {t("per")} {t("page").toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleAddCitizenship}>
            <Sparkles className="h-4 w-4" />
            {t("addCitizenshipBank")}
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>
                  <Button variant="ghost" className="h-8 px-1" onClick={() => changeSort("name")}>
                    {t("bankName")} <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">{t("topicStats")}</TableHead>
                <TableHead>
                  <Button variant="ghost" className="h-8 px-1" onClick={() => changeSort("questions")}>
                    {t("questions")} <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="h-8 px-1" onClick={() => changeSort("attempts")}>
                    {t("attempts")} <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">{t("bestScore")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((row) => (
                <TableRow key={row.bank.id}>
                  <TableCell className="min-w-[260px]">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-950">{row.name}</span>
                        {row.active && (
                          <Badge className="gap-1 bg-primary text-primary-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {t("active")}
                          </Badge>
                        )}
                      </div>
                      <p className="line-clamp-2 text-xs text-slate-500">
                        {row.description || t("noDescription")}
                      </p>
                      <div className="mt-1 flex gap-1">
                        {["primary", "secondary", "accent"].map((key) => (
                          <span
                            key={key}
                            className="h-4 w-4 rounded-full border border-white shadow-sm ring-1 ring-slate-200"
                            style={{ backgroundColor: row.bank.theme?.[key] }}
                          />
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-[260px] lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {row.topics.length > 0 ? row.topics.map((topic) => (
                        <Badge key={topic.topic} variant="outline" className="max-w-full truncate">
                          {topic.topic}: {topic.questions}
                        </Badge>
                      )) : (
                        <span className="text-sm text-slate-500">{t("noTopicStats")}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{row.questions}</div>
                    <div className="text-xs text-slate-500">{row.languages} {t("languages")}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{row.stats.attempts}</div>
                    <div className="text-xs text-slate-500">{row.stats.passRate}% {t("passRate")}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{row.stats.bestScore}%</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant={row.active ? "secondary" : "default"}
                        onClick={() => handleActivate(row.bank.id)}
                        disabled={row.active}
                      >
                        {t("activate")}
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleDuplicate(row.bank.id)} title={t("duplicate")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(row.bank.id)}
                        disabled={banks.length <= 1}
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

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            {filteredRows.length === 0
              ? `0 ${t("of")} 0`
              : `${t("showing")} ${(safeCurrentPage - 1) * pageSize + 1} ${t("to")} ${Math.min(safeCurrentPage * pageSize, filteredRows.length)} ${t("of")} ${filteredRows.length}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              {t("previous")}
            </Button>
            <span className="min-w-20 text-center text-sm text-slate-600">
              {t("page")} {safeCurrentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("createQuestionBank")}</DialogTitle>
            <DialogDescription>{t("createQuestionBankDesc")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>{t("bankName")}</Label>
              <Input
                value={form.name}
                onChange={(event) => setForm((currentForm) => ({ ...currentForm, name: event.target.value }))}
                placeholder="US Citizenship, AWS Cloud Practitioner..."
              />
            </div>
            <div className="space-y-2">
              <Label>{t("descriptionLabel")}</Label>
              <Textarea
                value={form.description}
                onChange={(event) => setForm((currentForm) => ({ ...currentForm, description: event.target.value }))}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("bankTemplate")}</Label>
              <Select
                value={form.template}
                onValueChange={(value) => setForm((currentForm) => ({ ...currentForm, template: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t("generalTemplate")}</SelectItem>
                  <SelectItem value="certification">{t("certificationTemplate")}</SelectItem>
                  <SelectItem value="citizenship">{t("citizenshipTemplate")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleCreate}>{t("createBank")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("importBank")}</DialogTitle>
            <DialogDescription>{t("importBankDesc")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportFile}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <FileUp className="h-4 w-4" />
              {t("selectJsonFile")}
            </Button>
            <div className="space-y-2">
              <Label>{t("pasteJson")}</Label>
              <Textarea
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                rows={8}
                placeholder='{"name":"US Citizenship","questions":{"en":[],"es":[]},"theme":{...}}'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleImport} disabled={!importText.trim()}>{t("importBank")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("backupAndExport")}</DialogTitle>
            <DialogDescription>{t("backupAndExportDesc")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Button variant="outline" onClick={handleExportActive}>
              <Download className="h-4 w-4" />
              {t("exportActiveBank")}
            </Button>
            <Button variant="outline" onClick={handleExportFullBackup}>
              <FileArchive className="h-4 w-4" />
              {t("exportFullBackup")}
            </Button>
            <input
              ref={backupFileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportFullBackupFile}
            />
            <Button variant="outline" onClick={() => backupFileInputRef.current?.click()}>
              <FileUp className="h-4 w-4" />
              {t("importFullBackup")}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setExportOpen(false)}>{t("close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
