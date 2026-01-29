const arBtn = document.getElementById("ar-btn");
const engBtn = document.getElementById("eng-btn");

// Get stored language preference or default to 'en'
let currentLang = localStorage.getItem("language") || "en";

// Initialize language on page load
const initializeLanguage = () => {
  setLanguage(currentLang);
};

// remove hover efect on active var(--gradient-button)

const removeHover = (btn) => {
  btn.classList.toggle("no-hover");
};

// Set language function
const setLanguage = (lang) => {
  const html = document.documentElement;

  if (lang === "ar") {
    // Set Arabic
    html.setAttribute("lang", "ar");
    html.setAttribute("dir", "rtl");
    html.classList.add("rtl");
    html.classList.remove("ltr");

    // Switch to Arabic display font
    html.style.setProperty("--font-display", "var(--font-display-ar)");
    // Update active button state
    arBtn.classList.add("active");
    engBtn.classList.remove("active");
    removeHover(arBtn);
  } else {
    // Set English
    html.setAttribute("lang", "en");
    html.setAttribute("dir", "ltr");
    html.classList.add("ltr");
    html.classList.remove("rtl");

    // Switch to English display font
    html.style.setProperty("--font-display", "var(--font-display-eng)");
    // Update active button state
    engBtn.classList.add("active");
    arBtn.classList.remove("active");
    removeHover(engBtn);
  }

  // Save preference to localStorage
  localStorage.setItem("language", lang);
  currentLang = lang;

  // Optional: Trigger custom event for other scripts to listen to
  window.dispatchEvent(
    new CustomEvent("languageChanged", { detail: { lang } }),
  );
};

arBtn.addEventListener("click", () => {
  setLanguage("ar");
});

engBtn.addEventListener("click", () => {
  setLanguage("en");
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeLanguage();
});

const getCurrentLanguage = () => {
  return currentLang;
};
