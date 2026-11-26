(() => {
  const dialog = document.getElementById("image-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeBtn = dialog ? dialog.querySelector(".lightbox-close") : null;

  if (!dialog || !lightboxImg || !lightboxCaption || typeof dialog.showModal !== "function") {
    return;
  }

  let lastTrigger = null;

  const openLightbox = (img) => {
    lastTrigger = img;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || "";
    const figure = img.closest("figure");
    const figcaption = figure ? figure.querySelector("figcaption") : null;
    lightboxCaption.textContent = figcaption ? figcaption.textContent.trim() : img.alt || "";
    lightboxCaption.hidden = !lightboxCaption.textContent;
    dialog.showModal();
  };

  document.querySelectorAll(".media-item img").forEach((img) => {
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-haspopup", "dialog");
    img.addEventListener("click", () => openLightbox(img));
    img.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(img);
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => dialog.close());
  }

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    lightboxImg.removeAttribute("src");
    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus();
    }
  });
})();
