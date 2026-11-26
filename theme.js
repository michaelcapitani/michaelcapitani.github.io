(() => {
  const root = document.documentElement;
  const toggleBtn = document.getElementById("theme-toggle");
  const mediaQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const STORAGE_KEY = "theme";

  const getStored = () => {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === "dark" || value === "light" ? value : null;
    } catch {
      return null;
    }
  };

  const getEffectiveTheme = () => {
    const explicit = root.dataset.theme;
    if (explicit === "dark" || explicit === "light") return explicit;
    return mediaQuery && mediaQuery.matches ? "dark" : "light";
  };

  const syncButton = () => {
    if (!toggleBtn) return;
    const isDark = getEffectiveTheme() === "dark";
    toggleBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    toggleBtn.setAttribute("aria-pressed", String(isDark));
    toggleBtn.title = isDark ? "Switch to light mode" : "Switch to dark mode";
  };

  syncButton();

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const next = getEffectiveTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore storage errors in private browsing modes
      }
      syncButton();
    });
  }

  if (mediaQuery && typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", () => {
      if (!getStored()) {
        delete root.dataset.theme;
        syncButton();
      }
    });
  }
})();
