(() => {
  const dialog = document.getElementById("image-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeBtn = dialog ? dialog.querySelector(".lightbox-close") : null;

  if (!dialog || !lightboxImg || !lightboxCaption || typeof dialog.showModal !== "function") {
    return;
  }

  let lastTrigger = null;
  let pointerDownOnBackdrop = false;

  const openLightbox = (img, trigger) => {
    if (dialog.open) return;
    lastTrigger = trigger || img;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || "";
    lightboxImg.classList.toggle("media-diagram", img.classList.contains("media-diagram"));
    const figure = img.closest("figure");
    const figcaption = figure ? figure.querySelector("figcaption") : null;
    lightboxCaption.textContent = figcaption ? figcaption.textContent.trim() : img.alt || "";
    lightboxCaption.hidden = !lightboxCaption.textContent;
    dialog.showModal();
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

  if (closeBtn) {
    closeBtn.addEventListener("click", () => dialog.close());
  }

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
    lightboxImg.removeAttribute("src");
    lightboxImg.classList.remove("media-diagram");
    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus();
    }
    lastTrigger = null;
  });
})();
