/**
 * New Letter
 */
const SCRIPT_URL = process.env.APP_SCRIPT_URL;

document.addEventListener("DOMContentLoaded", function () {
  const subscribeForm = document.getElementById("subscribeForm");
  if (subscribeForm) {
    subscribeForm.addEventListener("submit", handleSubscription);
  }
});

async function handleSubscription(e) {
  e.preventDefault();
  const emailInput = document.getElementById("emailInput");
  const submitButton = e.target.querySelector('button[type="submit"]');
  const email = emailInput.value.trim();
  if (!email || !isValidEmail(email)) {
    setButtonState(submitButton, "error", "Invalid email");
    return;
  }
  emailInput.disabled = true;
  setButtonState(submitButton, "loading", "Subscribing...");
  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ email: email }),
    });
    emailInput.value = "";
    setButtonState(submitButton, "success", " Subscribed!");
  } catch {
    setButtonState(submitButton, "error", "Try again");
  } finally {
    emailInput.disabled = false;
    setTimeout(() => {
      setButtonState(
        submitButton,
        "default",
        submitButton.dataset.originalText,
      );
    }, 3000);
  }
}

function setButtonState(button, state, text) {
  if (!button.dataset.originalText) {
    button.dataset.originalText = button.textContent;
  }
  button.classList.remove("btn--loading", "btn--success", "btn--error");
  button.textContent = text;
  button.disabled = state === "loading";
  if (state !== "default") {
    button.classList.add(`btn--${state}`);
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
