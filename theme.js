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
    toggleBtn.title = isDark ? "Switch to light mode (D)" : "Switch to dark mode (D)";
  };

  const toggleTheme = () => {
    const next = getEffectiveTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage errors in private browsing modes
    }
    syncButton();
  };

  syncButton();

  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleTheme);
  }

  document.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key !== "d" && event.key !== "D") return;
    const target = event.target;
    if (
      target &&
      (target.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
    ) {
      return;
    }
    toggleTheme();
  });

  if (mediaQuery && typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", () => {
      if (!getStored()) {
        delete root.dataset.theme;
        syncButton();
      }
    });
  }

  if (typeof console !== "undefined" && typeof console.log === "function") {
    console.log(
      "%cHey! Thanks for poking around.",
      "font-weight:700;font-size:13px;color:#6b4fa8;"
    );
    console.log("Plain HTML, CSS, and JS — zero frameworks. Press D anytime to flip light/dark mode.");
  }
})();
