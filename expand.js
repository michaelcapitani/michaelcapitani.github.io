(() => {
  const main = document.getElementById("main-content");
  if (!main) return;

  main.addEventListener("click", (event) => {
    const button = event.target.closest(".expand-trigger");
    if (!button) return;

    const targetId = button.getAttribute("aria-controls");
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;

    const swapId = button.dataset.swapTarget;
    const swapTarget = swapId ? document.getElementById(swapId) : null;
    const hint = button.querySelector(".expand-hint[data-open][data-closed]");

    const isExpanded = button.getAttribute("aria-expanded") === "true";
    const next = !isExpanded;
    button.setAttribute("aria-expanded", String(next));
    target.hidden = !next;
    if (swapTarget) {
      swapTarget.hidden = next;
    }
    if (hint) {
      hint.textContent = next ? hint.dataset.open : hint.dataset.closed;
    }
  });
})();
