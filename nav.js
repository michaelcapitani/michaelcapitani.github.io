(() => {
  const nav = document.querySelector(".site-nav");
  const progressBar = document.querySelector(".scroll-progress");
  const links = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];
  const sections = links
    .map((link) => {
      const id = link.getAttribute("href").slice(1);
      const target = id ? document.getElementById(id) : null;
      return target ? { link, target } : null;
    })
    .filter(Boolean);

  if (progressBar || sections.length) {
    let activeLink = null;
    let ticking = false;

    const setActive = (nextLink) => {
      if (nextLink === activeLink) return;
      if (activeLink) {
        activeLink.classList.remove("is-active");
        activeLink.removeAttribute("aria-current");
      }
      activeLink = nextLink;
      if (activeLink) {
        activeLink.classList.add("is-active");
        activeLink.setAttribute("aria-current", "location");

        // Gently keep the active link visible on horizontally scrollable mobile nav
        if (nav && nav.scrollWidth > nav.clientWidth + 2) {
          const navRect = nav.getBoundingClientRect();
          const linkRect = activeLink.getBoundingClientRect();
          if (linkRect.left < navRect.left + 8) {
            nav.scrollLeft -= navRect.left - linkRect.left + 12;
          } else if (linkRect.right > navRect.right - 24) {
            nav.scrollLeft += linkRect.right - navRect.right + 28;
          }
        }
      }
    };

    const update = () => {
      ticking = false;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

      if (progressBar) {
        const ratio = Math.min(1, Math.max(0, scrollTop / maxScroll));
        progressBar.style.transform = `scaleX(${ratio.toFixed(4)})`;
      }

      if (!sections.length) return;

      // Near bottom of page: highlight the last section (Contact)
      if (scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 24) {
        setActive(sections[sections.length - 1].link);
        return;
      }

      const threshold = 130;
      let current = null;
      for (let i = 0; i < sections.length; i += 1) {
        const rect = sections[i].target.getBoundingClientRect();
        if (rect.top <= threshold) {
          current = sections[i].link;
        } else {
          break;
        }
      }

      setActive(current);
    };

    const requestUpdate = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    update();
  }

  // Live Ann Arbor local time in footer
  const timeWrap = document.getElementById("local-time-wrap");
  const timeEl = document.getElementById("local-time");
  if (timeWrap && timeEl && typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function") {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Detroit",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      });
      const renderTime = () => {
        timeEl.textContent = formatter.format(new Date());
        timeWrap.hidden = false;
      };
      renderTime();
      setInterval(renderTime, 30000);
    } catch {
      // Leave time hidden if timezone formatting is unavailable
    }
  }
})();
