export const registerServiceWorker = () => {
  if (!import.meta.env.PROD) return;
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline support is progressive; native Capacitor builds do not need it.
    });
  });
};
