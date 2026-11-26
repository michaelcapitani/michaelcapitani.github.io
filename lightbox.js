(() => {
  const dialog = document.getElementById("image-lightbox");
  const zoomWrap = dialog ? dialog.querySelector(".lightbox-zoom-wrap") : null;
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxCounter = document.getElementById("lightbox-counter");
  const closeBtn = dialog ? dialog.querySelector(".lightbox-close") : null;
  const prevBtn = dialog ? dialog.querySelector(".lightbox-prev") : null;
  const nextBtn = dialog ? dialog.querySelector(".lightbox-next") : null;

  if (!dialog || !lightboxImg || !lightboxCaption || typeof dialog.showModal !== "function") {
    return;
  }

  let currentGallery = [];
  let currentIndex = 0;
  let lastTrigger = null;
  let pointerDownOnBackdrop = false;
  let touchStartX = 0;
  let touchStartY = 0;

  const isVisibleInFlow = (el) => {
    let cur = el;
    while (cur && cur !== document.body) {
      if (cur.hasAttribute("hidden")) return false;
      cur = cur.parentElement;
    }
    return true;
  };

  const pauseAllVideos = () => {
    document.querySelectorAll("video").forEach((video) => {
      if (!video.paused) video.pause();
    });
  };

  const resetZoom = () => {
    if (!zoomWrap) return;
    zoomWrap.classList.remove("is-zoomed");
    zoomWrap.scrollLeft = 0;
    zoomWrap.scrollTop = 0;
    lightboxImg.style.width = "";
    lightboxImg.style.height = "";
    lightboxImg.title = "Click to zoom";
  };

  const toggleZoom = (event) => {
    if (!zoomWrap) return;
    if (zoomWrap.classList.contains("is-zoomed")) {
      resetZoom();
      return;
    }

    const rect = lightboxImg.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const rx = event ? Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) : 0.5;
    const ry = event ? Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)) : 0.5;

    const targetWidth = Math.round(rect.width * 2);
    const targetHeight = Math.round(rect.height * 2);

    lightboxImg.style.width = `${targetWidth}px`;
    lightboxImg.style.height = `${targetHeight}px`;
    zoomWrap.classList.add("is-zoomed");
    lightboxImg.title = "Click to reset zoom";

    zoomWrap.scrollLeft = Math.max(0, targetWidth * rx - zoomWrap.clientWidth / 2);
    zoomWrap.scrollTop = Math.max(0, targetHeight * ry - zoomWrap.clientHeight / 2);
  };

  const getGalleryGroup = (img) => {
    const scope =
      img.closest("article.project-card, article.entry, .course-groups") ||
      img.closest(".media-gallery");
    if (!scope) return [img];
    const items = Array.from(scope.querySelectorAll(".media-item img")).filter(isVisibleInFlow);
    return items.length ? items : [img];
  };

  const renderSlide = (index) => {
    if (!currentGallery.length) return;
    resetZoom();
    currentIndex = (index + currentGallery.length) % currentGallery.length;
    const img = currentGallery[currentIndex];
    const trigger = img.closest(".media-trigger");
    if (trigger) {
      lastTrigger = trigger;
    }

    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || "";
    lightboxImg.classList.toggle("media-diagram", img.classList.contains("media-diagram"));

    const figure = img.closest("figure");
    const figcaption = figure ? figure.querySelector("figcaption") : null;
    lightboxCaption.textContent = figcaption ? figcaption.textContent.trim() : img.alt || "";
    lightboxCaption.hidden = !lightboxCaption.textContent;

    const multi = currentGallery.length > 1;
    if (prevBtn) prevBtn.hidden = !multi;
    if (nextBtn) nextBtn.hidden = !multi;
    if (lightboxCounter) {
      lightboxCounter.textContent = multi ? `${currentIndex + 1} / ${currentGallery.length}` : "";
      lightboxCounter.hidden = !multi;
    }
  };

  const openLightbox = (img, trigger) => {
    if (dialog.open) return;
    pauseAllVideos();
    currentGallery = getGalleryGroup(img);
    const startIndex = Math.max(0, currentGallery.indexOf(img));
    lastTrigger = trigger || img;
    renderSlide(startIndex);
    dialog.showModal();
  };

  const step = (delta) => {
    if (!dialog.open || currentGallery.length <= 1) return;
    renderSlide(currentIndex + delta);
  };

  // Wrap gallery images in accessible native buttons so <img> keeps its semantics and keyboard focus ring
  document.querySelectorAll(".media-item > img").forEach((img) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "media-trigger";
    const figure = img.closest("figure");
    const figcaption = figure ? figure.querySelector("figcaption") : null;
    const labelText = figcaption ? figcaption.textContent.trim() : img.alt || "image";
    btn.setAttribute("aria-label", "View larger image: " + labelText);
    img.parentNode.insertBefore(btn, img);
    btn.appendChild(img);
    btn.addEventListener("click", () => openLightbox(img, btn));
  });

  lightboxImg.addEventListener("click", (event) => {
    toggleZoom(event);
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => dialog.close());
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => step(-1));
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => step(1));
  }

  document.addEventListener("keydown", (event) => {
    if (!dialog.open || currentGallery.length <= 1) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  });

  dialog.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) return;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    },
    { passive: true }
  );

  dialog.addEventListener(
    "touchend",
    (event) => {
      if (
        currentGallery.length <= 1 ||
        !event.changedTouches.length ||
        (zoomWrap && zoomWrap.classList.contains("is-zoomed"))
      ) {
        return;
      }
      const dx = event.changedTouches[0].clientX - touchStartX;
      const dy = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        step(dx < 0 ? 1 : -1);
      }
    },
    { passive: true }
  );

  dialog.addEventListener("pointerdown", (event) => {
    pointerDownOnBackdrop = event.target === dialog;
  });

  dialog.addEventListener("click", (event) => {
    if (pointerDownOnBackdrop && event.target === dialog) {
      dialog.close();
    }
    pointerDownOnBackdrop = false;
  });

  dialog.addEventListener("close", () => {
    resetZoom();
    lightboxImg.removeAttribute("src");
    lightboxImg.classList.remove("media-diagram");
    currentGallery = [];
    currentIndex = 0;
    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus();
    }
    lastTrigger = null;
  });
})();
