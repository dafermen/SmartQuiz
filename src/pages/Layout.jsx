
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, BookOpen, BarChart3, ShieldCheck, Settings, Globe2, Check, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageProvider, useLanguage } from "@/components/language/LanguageProvider";
import { getExamProfile } from "@/components/profile/examProfileStorage";

/**
 * Inner layout that can read language and router context.
 *
 * @param {{children: React.ReactNode}} props
 * @returns {JSX.Element}
 */
function LayoutContent({ children }) {
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [examProfile, setExamProfile] = useState(getExamProfile);

  const navItems = [
    { name: t("home"), path: createPageUrl("Home"), icon: Home },
    { name: t("theory"), path: createPageUrl("Theory"), icon: BookOpen },
    { name: t("quiz"), path: createPageUrl("Quiz"), icon: BookOpen },
    { name: t("progress"), path: createPageUrl("Progress"), icon: BarChart3 },
    { name: t("settings"), path: createPageUrl("Settings"), icon: Settings },
  ];

  // Close menu on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleExamProfileUpdate = () => {
      setExamProfile(getExamProfile());
    };

    window.addEventListener("smartquiz-exam-profile-updated", handleExamProfileUpdate);
    return () => window.removeEventListener("smartquiz-exam-profile-updated", handleExamProfileUpdate);
  }, []);

  useEffect(() => {
    document.title = examProfile.appName;
  }, [examProfile.appName]);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#162033] flex flex-col">
      <style>{`
        :root {
          --primary: #0f9f8f;
          --secondary: #162033;
          --accent: #f4b84a;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 bg-white/88 backdrop-blur-xl border-b border-slate-200/80 z-50 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Hamburger Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="h-10 w-10 relative z-50 flex-shrink-0 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>

            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 flex-shrink-0">
              <div className="w-11 h-11 bg-[#162033] rounded-lg flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-6 h-6 text-[#52d3c4]" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold tracking-tight text-slate-950">{examProfile.appName}</h1>
                <p className="text-xs text-slate-500">{examProfile.location}</p>
              </div>
            </Link>

            {/* Right Side Controls */}
            <div className="flex items-center gap-2 md:gap-3 ml-auto">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 min-w-20 flex-shrink-0 gap-2 rounded-lg border-slate-200 bg-white px-3 font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                    aria-label={t("language")}
                  >
                    <Globe2 className="w-4 h-4" />
                    <span className="text-sm">{language.toUpperCase()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-36">
                  <DropdownMenuItem onClick={() => setLanguage("en")} className={`gap-2 ${language === "en" ? "bg-teal-50 text-teal-900" : ""}`}>
                    <span className="w-7 font-semibold">EN</span>
                    <span>{t("english")}</span>
                    {language === "en" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("es")} className={`gap-2 ${language === "es" ? "bg-teal-50 text-teal-900" : ""}`}>
                    <span className="w-7 font-semibold">ES</span>
                    <span>{t("spanish")}</span>
                    {language === "es" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Side Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-40"
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Drawer Header */}
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
                  
                  <div className="w-12 h-12 bg-[#162033] rounded-lg flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-7 h-7 text-[#52d3c4]" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-950">{examProfile.appName}</h2>
                    <p className="text-xs text-slate-500">{examProfile.location}</p>
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        location.pathname === item.path
                          ? "bg-[#162033] text-white shadow-lg"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-base">{item.name}</span>
                    </Link>
                  ))}
                </nav>

                {/* Drawer Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    © 2025 {examProfile.appName}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-500">
                © 2025 {examProfile.appName}. All rights reserved.
              </p>
            </div>

            <div className="text-center md:text-right">
              <p className="text-sm text-slate-500 inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-600" />
                {t("contact")}: <a href="https://github.com/" className="font-medium text-teal-700 hover:text-teal-900">GitHub-ready template</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Global app shell.
 *
 * Wraps every page with app-level providers and renders the shared header,
 * side drawer, content area, and footer.
 *
 * @param {{children: React.ReactNode, currentPageName?: string}} props
 * @returns {JSX.Element}
 */
export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <LayoutContent currentPageName={currentPageName}>
        {children}
      </LayoutContent>
    </LanguageProvider>
  );
}
