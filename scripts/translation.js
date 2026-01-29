const translations = {
  en: {
    // Navigation
    home: "Home",
    recitation: "Recitaion",
    quran: "Quarn",
    hadith: "Hadith",
    contact: "Contact Us",

    // Dropdowns
    theme: "Theme",
    language: "Language",

    // Theme options
    light: "Light",
    dark: "Dark",
    system: "System",

    // Language options
    arabic: "Arabic",
    english: "English",

    //  Hero
    heroSubTitle:
      "Listen to beautiful Quran recitations from your favorite readers with access to over 250 trusted reciters and multiple recitations from across the Islamic world.",
    ctaButton: "Install extation",

    // Recitaion
    selectReciter: "Select a reciter:",
    selectNarration: "Select a Narration/Rewaya:",
    selectSurah: "Select a Surah:",
  },

  ar: {
    // Navigation
    home: "الرئيسية",
    recitation: "التلاوة",
    quran: "القرآن",
    hadith: "حديث",
    contact: "تواصل معنا",

    // Dropdowns
    theme: "المظهر",
    language: "اللغة",

    // Theme options
    light: "فاتح",
    dark: "داكن",
    system: "النظام",

    // Language options
    arabic: "العربية",
    english: "الإنجليزية",

    //  Hero
    heroSubTitle:
      "استمع إلى تلاوات قرآنية جميلة من قرائك المفضلين مع إمكانية الوصول إلى أكثر من 250 قارئًا موثوقًا به وتلاوات متعددة من جميع أنحاء العالم الإسلامي.",
    ctaButton: "تحميل الإضافة",

    // Recitaion
    selectReciter: "إختر قارئ",
    selectNarration: "إختر المصحف",
    selectSurah: "إختر السورة",
  },
};

// Translate all elements with data-i18n attribute
function translatePage(lang) {
  // Validate language
  if (!translations[lang]) {
    return;
  }

  // Get all elements with data-i18n attribute
  const elements = document.querySelectorAll("[data-i18n]");

  elements.forEach((element) => {
    const key = element.getAttribute("data-i18n");

    if (translations[lang][key]) {
      // Check if element has data-i18n-attr for translating attributes
      const attr = element.getAttribute("data-i18n-attr");

      if (attr) {
        // Translate attribute (like placeholder, title, etc.)
        element.setAttribute(attr, translations[lang][key]);
      } else {
        // Translate text content
        element.textContent = translations[lang][key];
      }
    } else {
      console.warn(`Translation key '${key}' not found for language '${lang}'`);
    }
  });
}

// Translate input placeholders
function translatePlaceholders(lang) {
  const elements = document.querySelectorAll("[data-i18n-placeholder]");

  elements.forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    if (translations[lang][key]) {
      element.setAttribute("placeholder", translations[lang][key]);
    }
  });
}

// Get translation by key
function t(key, lang = null) {
  const currentLang = lang || localStorage.getItem("language") || "en";
  return translations[currentLang][key] || key;
}

// Initialize translations on page load
document.addEventListener("DOMContentLoaded", () => {
  const currentLang = localStorage.getItem("language") || "en";
  translatePage(currentLang);
  translatePlaceholders(currentLang);
});

// Listen for language changes
window.addEventListener("languageChanged", (event) => {
  translatePage(event.detail.lang);
  translatePlaceholders(event.detail.lang);
});

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = { translatePage, t };
}
