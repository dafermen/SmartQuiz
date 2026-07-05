import Layout from "./Layout.jsx";
import { lazy, Suspense } from "react";

import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';

const Home = lazy(() => import("./Home"));
const Quiz = lazy(() => import("./Quiz"));
const Progress = lazy(() => import("./Progress"));
const Settings = lazy(() => import("./Settings"));
const Theory = lazy(() => import("./Theory"));
const Flashcards = lazy(() => import("./Flashcards"));

const PAGES = {
    
    Home: Home,
    
    Quiz: Quiz,
    
    Progress: Progress,
    
    Settings: Settings,
    
    Theory: Theory,

    Flashcards: Flashcards,

}

/**
 * Loading indicator shown while a lazy route bundle is downloading.
 *
 * @returns {JSX.Element}
 */
function PageLoading() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    );
}

/**
 * Resolves the route path to a known page name.
 *
 * @param {string} url - Current pathname.
 * @returns {string} Matching page name, or `Home` when unknown.
 */
function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

/**
 * Renders the route tree inside the Router context.
 *
 * @returns {JSX.Element}
 */
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Suspense fallback={<PageLoading />}>
                <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/Home" element={<Home />} />

                    <Route path="/Quiz" element={<Quiz />} />

                    <Route path="/Progress" element={<Progress />} />

                    <Route path="/Settings" element={<Settings />} />

                    <Route path="/Theory" element={<Theory />} />

                    <Route path="/Flashcards" element={<Flashcards />} />

                    <Route path="/VideoLessons" element={<Navigate to="/Home" replace />} />
                </Routes>
            </Suspense>
        </Layout>
    );
}

export default function Pages() {
    const routerBasename = import.meta.env.BASE_URL === "/"
        ? undefined
        : import.meta.env.BASE_URL.replace(/\/$/, "");

    return (
        <Router basename={routerBasename}>
            <PagesContent />
        </Router>
    );
}
