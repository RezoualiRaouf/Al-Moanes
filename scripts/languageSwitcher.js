const arBtn = document.getElementById("ar-btn");
const engBtn = document.getElementById("eng-btn");

// Get stored language preference or default to 'en'
let currentLang = localStorage.getItem("language") || "en";

// Initialize language on page load
const initializeLanguage = () => {
  setLanguage(currentLang);
};

// Remove hover effect on active button
const removeHover = (btn) => {
  if (btn) {
    btn.classList.add("no-hover");
  }
};

const addHover = (btn) => {
  if (btn) {
    btn.classList.remove("no-hover");
  }
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

    // Update SIDEBAR button state
    if (arBtn) {
      arBtn.classList.add("active");
      removeHover(arBtn);
    }
    if (engBtn) {
      engBtn.classList.remove("active");
      addHover(engBtn);
    }

    // Update MOBILE MENU button state
    const mobileArBtn = document.querySelector(
      '.mobile-menu-option[data-lang="ar"]',
    );
    const mobileEngBtn = document.querySelector(
      '.mobile-menu-option[data-lang="en"]',
    );

    if (mobileArBtn) {
      mobileArBtn.classList.add("active");
    }
    if (mobileEngBtn) {
      mobileEngBtn.classList.remove("active");
    }
  } else {
    // Set English
    html.setAttribute("lang", "en");
    html.setAttribute("dir", "ltr");
    html.classList.add("ltr");
    html.classList.remove("rtl");
    // Switch to English display font
    html.style.setProperty("--font-display", "var(--font-display-eng)");

    // Update sideBar button state
    if (engBtn) {
      engBtn.classList.add("active");
      removeHover(engBtn);
    }
    if (arBtn) {
      arBtn.classList.remove("active");
      addHover(arBtn);
    }

    // Update mobile menu button state
    const mobileArBtn = document.querySelector(
      '.mobile-menu-option[data-lang="ar"]',
    );
    const mobileEngBtn = document.querySelector(
      '.mobile-menu-option[data-lang="en"]',
    );

    if (mobileEngBtn) {
      mobileEngBtn.classList.add("active");
    }
    if (mobileArBtn) {
      mobileArBtn.classList.remove("active");
    }
  }

  // Save preference to localStorage
  localStorage.setItem("language", lang);
  currentLang = lang;

  // Trigger changing language event
  window.dispatchEvent(
    new CustomEvent("languageChanged", { detail: { lang } }),
  );
};

// Sidebar button listeners
if (arBtn) {
  arBtn.addEventListener("click", () => {
    setLanguage("ar");
  });
}

if (engBtn) {
  engBtn.addEventListener("click", () => {
    setLanguage("en");
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeLanguage();
});

const getCurrentLanguage = () => {
  return currentLang;
};

// Make setLanguage available globally for mobile nav
window.setLanguage = setLanguage;
