(() => {
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("contact-status");
  const submitBtn = document.getElementById("contact-submit");

  if (!form || !statusEl || !submitBtn) return;

  const setStatus = (message, state) => {
    statusEl.textContent = message;
    statusEl.className = "form-status" + (state ? " is-" + state : "");
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const accessKey = (formData.get("access_key") || "").toString().trim();

    if (!accessKey || accessKey === "YOUR_WEB3FORMS_ACCESS_KEY") {
      setStatus(
        "Contact form is not activated yet. Add your Web3Forms access key in index.html.",
        "error"
      );
      return;
    }

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    setStatus("Sending your message...", "pending");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        form.reset();
        setStatus("Thanks! Your message has been sent.", "success");
      } else {
        setStatus(
          data.message || "Something went wrong sending your message. Please try again.",
          "error"
        );
      }
    } catch {
      setStatus(
        "Network error. Please check your connection and try again, or reach out on LinkedIn.",
        "error"
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
})();
