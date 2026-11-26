(() => {
  const main = document.getElementById("main-content");
  if (!main) return;

  const supportsUntilFound = "onbeforematch" in document.body;

  // Fallback for browsers without hidden="until-found" support
  if (!supportsUntilFound) {
    main.querySelectorAll('[hidden="until-found"]').forEach((el) => {
      el.hidden = true;
    });
  }

  const setExpanded = (button, next) => {
    const targetId = button.getAttribute("aria-controls");
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;

    const swapId = button.dataset.swapTarget;
    const swapTarget = swapId ? document.getElementById(swapId) : null;
    const hint = button.querySelector(".expand-hint[data-open][data-closed]");

    button.setAttribute("aria-expanded", String(next));
    if (next) {
      target.removeAttribute("hidden");
    } else if (supportsUntilFound) {
      target.setAttribute("hidden", "until-found");
    } else {
      target.hidden = true;
    }

    if (swapTarget) {
      swapTarget.hidden = next;
    }
    if (hint) {
      hint.textContent = next ? hint.dataset.open : hint.dataset.closed;
    }
  };

  const expandPanelById = (panelId) => {
    if (!panelId) return;
    const btn = main.querySelector(`.expand-trigger[aria-controls="${CSS.escape(panelId)}"]`);
    if (btn && btn.getAttribute("aria-expanded") !== "true") {
      setExpanded(btn, true);
    }
  };

  const expandAncestors = (el) => {
    let cur = el;
    while (cur && cur !== main) {
      if (cur.hasAttribute("hidden") && cur.id) {
        expandPanelById(cur.id);
      }
      cur = cur.parentElement;
    }
  };

  main.addEventListener("click", (event) => {
    const button = event.target.closest(".expand-trigger");
    if (!button) return;
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    setExpanded(button, !isExpanded);
  });

  // Sync trigger state when Cmd+F expands a hidden="until-found" panel
  main.addEventListener("beforematch", (event) => {
    const panel = event.target && event.target.id ? event.target : null;
    if (panel) {
      expandPanelById(panel.id);
    }
  });

  // Deep-linking: expand collapsed panels targeted by URL hash (e.g., #project-volumetric-display)
  const openHashTarget = () => {
    const rawHash = window.location.hash;
    if (!rawHash || rawHash.length < 2) return;
    const id = decodeURIComponent(rawHash.slice(1));
    const target = document.getElementById(id);
    if (!target || !main.contains(target)) return;

    expandAncestors(target);

    if (target.hasAttribute("hidden")) {
      expandPanelById(target.id);
    } else if (/^(project-|leadership-)/.test(id)) {
      const trigger = target.querySelector(".expand-trigger[aria-controls]");
      if (trigger && trigger.getAttribute("aria-expanded") !== "true") {
        setExpanded(trigger, true);
      }
    }

    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "auto", block: "start" });
    });
  };

  if (window.location.hash) {
    openHashTarget();
  }
  window.addEventListener("hashchange", openHashTarget);

  // Inject subtle copy-link button on every project card
  const linkIconSvg =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>' +
    '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>' +
    "</svg>";

  const checkIconSvg =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="20 6 9 17 4 12"/>' +
    "</svg>";

  const copyText = async (text) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fallback below
      }
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  };

  main.querySelectorAll("article.project-card[id]").forEach((card) => {
    const headerRow = card.querySelector(".entry-header-row");
    if (!headerRow) return;

    const titleEl = card.querySelector("h4 span");
    const titleText = titleEl ? titleEl.textContent.trim() : "project";

    let docLinks = headerRow.querySelector(".doc-links");
    if (!docLinks) {
      docLinks = document.createElement("div");
      docLinks.className = "doc-links";
      headerRow.appendChild(docLinks);
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-link-btn";
    btn.setAttribute("aria-label", `Copy link to ${titleText}`);
    btn.title = "Copy direct link";
    btn.innerHTML = linkIconSvg;

    let resetTimer = null;
    btn.addEventListener("click", async () => {
      const url = `${window.location.origin}${window.location.pathname}#${card.id}`;
      const ok = await copyText(url);
      if (!ok) return;

      btn.classList.add("is-copied");
      btn.innerHTML = `${checkIconSvg}<span>Copied</span>`;
      btn.setAttribute("aria-label", `Copied link to ${titleText}`);

      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        btn.classList.remove("is-copied");
        btn.innerHTML = linkIconSvg;
        btn.setAttribute("aria-label", `Copy link to ${titleText}`);
      }, 1800);
    });

    docLinks.appendChild(btn);
  });

  // Future-proof video auto-pause: only one video plays at a time, and pause if scrolled offscreen
  document.addEventListener(
    "play",
    (event) => {
      if (!(event.target instanceof HTMLVideoElement)) return;
      document.querySelectorAll("video").forEach((video) => {
        if (video !== event.target && !video.paused) {
          video.pause();
        }
      });
    },
    true
  );

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && entry.target instanceof HTMLVideoElement && !entry.target.paused) {
            entry.target.pause();
          }
        });
      },
      { threshold: 0 }
    );

    const observeVideos = (root) => {
      root.querySelectorAll("video").forEach((video) => videoObserver.observe(video));
    };

    observeVideos(document);

    // Observe any videos added dynamically in the future
    if ("MutationObserver" in window) {
      new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          m.addedNodes.forEach((node) => {
            if (node instanceof HTMLVideoElement) {
              videoObserver.observe(node);
            } else if (node instanceof Element) {
              observeVideos(node);
            }
          });
        });
      }).observe(main, { childList: true, subtree: true });
    }
  }

  const duckBtn = document.getElementById("duck-trigger");
  const duckMsg = document.getElementById("duck-msg");
  if (duckBtn && duckMsg) {
    duckBtn.addEventListener("click", () => {
      const next = duckMsg.hidden;
      duckMsg.hidden = !next;
      duckBtn.setAttribute("aria-expanded", String(next));
    });
  }
})();
