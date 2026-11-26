(() => {
  document.querySelectorAll(".expand-trigger").forEach((button) => {
    const targetId = button.getAttribute("aria-controls");
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;

    const hint = button.querySelector(".expand-hint[data-open][data-closed]");

    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      const next = !isExpanded;
      button.setAttribute("aria-expanded", String(next));
      target.hidden = !next;
      if (hint) {
        hint.textContent = next ? hint.dataset.open : hint.dataset.closed;
      }
    });
  });
})();
