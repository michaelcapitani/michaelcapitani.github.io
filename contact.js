(() => {
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("contact-status");
  const submitBtn = document.getElementById("contact-submit");

  if (!form || !statusEl || !submitBtn) return;

  let isSubmitting = false;

  const setStatus = (message, state) => {
    statusEl.textContent = message;
    statusEl.className = "form-status" + (state ? " is-" + state : "");
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nameInput = form.elements.namedItem("name");
    const messageInput = form.elements.namedItem("message");
    if (nameInput && !nameInput.value.trim()) {
      setStatus("Please enter your name before sending.", "error");
      nameInput.focus();
      return;
    }
    if (messageInput && !messageInput.value.trim()) {
      setStatus("Please enter a message before sending.", "error");
      messageInput.focus();
      return;
    }

    const formData = new FormData(form);
    const originalLabel = submitBtn.textContent;
    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    form.setAttribute("aria-busy", "true");
    setStatus("Sending your message...", "pending");

    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 15000) : null;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
        signal: controller ? controller.signal : undefined,
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        form.reset();
        setStatus("Thanks! Your message has been sent.", "success");
      } else {
        setStatus(
          (data.message || "Something went wrong sending your message.") +
            " Please try again or reach out on LinkedIn.",
          "error"
        );
      }
    } catch (err) {
      const timedOut = err && err.name === "AbortError";
      setStatus(
        timedOut
          ? "Request timed out. Please try again or reach out on LinkedIn."
          : "Network error. Please check your connection and try again, or reach out on LinkedIn.",
        "error"
      );
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
      form.removeAttribute("aria-busy");
    }
  });
})();
