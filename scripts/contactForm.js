const CONFIG = {
  // Email credentials
  get EMAILJS_PUBLIC_KEY() {
    return window.EMAIL_CONFIG?.EMAILJS_PUBLIC_KEY || "";
  },
  get EMAILJS_SERVICE_ID() {
    return window.EMAIL_CONFIG?.EMAILJS_SERVICE_ID || "";
  },
  get EMAILJS_TEMPLATE_ID() {
    return window.EMAIL_CONFIG?.EMAILJS_TEMPLATE_ID || "";
  },

  // Submission limits
  MAX_SUBMISSIONS_PER_DAY: 2,
  LOCK_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours

  // Update intervals
  HOUR_UPDATE_INTERVAL: 60 * 60 * 1000, // 1 hour
  MINUTE_UPDATE_INTERVAL: 5 * 60 * 1000, // 5 minutes

  // LocalStorage keys
  STORAGE_KEYS: {
    LOCK_RESET_TIME: "contactForm_lockResetTime",
    DAILY_SUBMISSIONS: "contactForm_dailySubmissions",
  },
};

// Validate configuration
function validateConfig() {
  if (
    !CONFIG.EMAILJS_PUBLIC_KEY ||
    !CONFIG.EMAILJS_SERVICE_ID ||
    !CONFIG.EMAILJS_TEMPLATE_ID
  ) {
    console.error(
      "EmailJS configuration is missing. Please create config.js file.",
    );
    return false;
  }
  return true;
}

const Storage = {
  getLockResetTime() {
    const value = localStorage.getItem(CONFIG.STORAGE_KEYS.LOCK_RESET_TIME);
    if (!value) return null;

    const timestamp = parseInt(value, 10);
    return isNaN(timestamp) ? null : timestamp;
  },

  setLockResetTime(timestampMs) {
    localStorage.setItem(
      CONFIG.STORAGE_KEYS.LOCK_RESET_TIME,
      String(timestampMs),
    );
  },

  clearLock() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.LOCK_RESET_TIME);
  },

  getSubmissions() {
    const data = localStorage.getItem(CONFIG.STORAGE_KEYS.DAILY_SUBMISSIONS);
    return data ? JSON.parse(data) : {};
  },

  setSubmissions(submissions) {
    localStorage.setItem(
      CONFIG.STORAGE_KEYS.DAILY_SUBMISSIONS,
      JSON.stringify(submissions),
    );
  },

  cleanupOldSubmissions() {
    const today = new Date().toDateString();
    const submissions = this.getSubmissions();
    const cleaned = {};

    if (submissions[today]) {
      cleaned[today] = submissions[today];
    }

    this.setSubmissions(cleaned);
  },
};

const SubmissionManager = {
  canSubmit() {
    const now = Date.now();
    const lockResetTime = Storage.getLockResetTime();

    if (lockResetTime && now < lockResetTime) {
      return false;
    }

    if (lockResetTime && now >= lockResetTime) {
      Storage.clearLock();
    }

    Storage.cleanupOldSubmissions();

    const today = new Date().toDateString();
    const submissions = Storage.getSubmissions();
    const todayCount = submissions[today] || 0;

    return todayCount < CONFIG.MAX_SUBMISSIONS_PER_DAY;
  },

  recordSubmission() {
    const today = new Date().toDateString();
    const submissions = Storage.getSubmissions();

    submissions[today] = (submissions[today] || 0) + 1;
    Storage.setSubmissions(submissions);

    if (submissions[today] >= CONFIG.MAX_SUBMISSIONS_PER_DAY) {
      const lockResetTime = Date.now() + CONFIG.LOCK_DURATION_MS;
      Storage.setLockResetTime(lockResetTime);
    }
  },

  getRemainingSubmissions() {
    const today = new Date().toDateString();
    const submissions = Storage.getSubmissions();
    const used = submissions[today] || 0;
    return Math.max(0, CONFIG.MAX_SUBMISSIONS_PER_DAY - used);
  },

  isLocked() {
    const lockResetTime = Storage.getLockResetTime();
    return lockResetTime && Date.now() < lockResetTime;
  },

  getTimeUntilReset() {
    const lockResetTime = Storage.getLockResetTime();
    if (!lockResetTime) return 0;

    const remaining = lockResetTime - Date.now();
    return Math.max(0, remaining);
  },
};

const UI = {
  updateTimer: null,

  updateTooltip() {
    const tooltipText = document.querySelector(".tooltip-text");
    const tooltipFooter = document.querySelector(".tooltip-footer span");

    if (!tooltipText || !tooltipFooter) return;

    const remaining = SubmissionManager.getRemainingSubmissions();
    const isLocked = SubmissionManager.isLocked();
    const timeUntilReset = SubmissionManager.getTimeUntilReset();

    tooltipText.textContent = `You have ${remaining}/${CONFIG.MAX_SUBMISSIONS_PER_DAY} submissions left`;

    if (isLocked && timeUntilReset > 0) {
      const timeText = this.formatTimeRemaining(timeUntilReset);
      tooltipFooter.textContent = `Restarts in ${timeText}`;
    } else {
      tooltipFooter.textContent = "Restarts in 24h";
    }

    this.scheduleNextUpdate();
  },

  formatTimeRemaining(ms) {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.ceil((ms % (60 * 60 * 1000)) / 60000);

    if (hours >= 1) {
      return `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return "less than 1m";
    }
  },

  scheduleNextUpdate() {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }

    const timeUntilReset = SubmissionManager.getTimeUntilReset();

    if (timeUntilReset === 0) {
      this.updateTimer = setTimeout(
        () => this.updateTooltip(),
        CONFIG.HOUR_UPDATE_INTERVAL,
      );
      return;
    }

    if (timeUntilReset >= CONFIG.HOUR_UPDATE_INTERVAL) {
      const msToNextHour =
        timeUntilReset % CONFIG.HOUR_UPDATE_INTERVAL ||
        CONFIG.HOUR_UPDATE_INTERVAL;
      this.updateTimer = setTimeout(
        () => this.updateTooltip(),
        msToNextHour + 100,
      );
    } else {
      this.updateTimer = setTimeout(
        () => this.updateTooltip(),
        CONFIG.MINUTE_UPDATE_INTERVAL,
      );
    }
  },

  showPopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
      popup.classList.add("show");
    }
  },

  closePopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
      popup.classList.remove("show");
    }
  },

  closeAllPopups() {
    document.querySelectorAll(".popup-overlay").forEach((popup) => {
      popup.classList.remove("show");
    });
  },

  setSubmitButtonState(disabled, text) {
    const submitBtn = document.getElementById("form__submit_btn");
    const submitText = submitBtn?.querySelector("span");

    if (submitBtn) {
      submitBtn.disabled = disabled;
    }

    if (submitText) {
      submitText.textContent = text;
    }
  },
};

const FormHandler = {
  init() {
    // Validate configuration
    if (!validateConfig()) {
      console.error("Form initialization failed: Invalid configuration");
      return;
    }

    // Initialize EmailJS
    try {
      emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);
    } catch (error) {
      console.error("EmailJS initialization failed:", error);
      return;
    }

    const form = document.getElementById("contactForm");
    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    document.querySelectorAll(".popup-btn").forEach((btn) => {
      btn.addEventListener("click", () => UI.closeAllPopups());
    });

    document.querySelectorAll(".popup-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          UI.closeAllPopups();
        }
      });
    });

    document.querySelectorAll(".tooltip-trigger").forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const tooltip = trigger.nextElementSibling;
        if (tooltip && tooltip.classList.contains("tooltip-content")) {
          tooltip.style.pointerEvents =
            tooltip.style.pointerEvents === "auto" ? "none" : "auto";
        }
      });
    });

    document.addEventListener("click", () => {
      document.querySelectorAll(".tooltip-content").forEach((tooltip) => {
        tooltip.style.pointerEvents = "none";
      });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        UI.updateTooltip();
      }
    });

    UI.updateTooltip();
  },

  async handleSubmit(e) {
    e.preventDefault();

    if (!SubmissionManager.canSubmit()) {
      UI.showPopup("errorPopup");
      const errorMessage = document.querySelector("#errorPopup .popup-message");
      if (errorMessage) {
        errorMessage.textContent =
          "You have reached your daily submission limit. Please try again later.";
      }
      return;
    }

    UI.setSubmitButtonState(true, "Sending...");

    try {
      const response = await emailjs.sendForm(
        CONFIG.EMAILJS_SERVICE_ID,
        CONFIG.EMAILJS_TEMPLATE_ID,
        e.target,
      );

      if (response.status === 200) {
        SubmissionManager.recordSubmission();
        UI.updateTooltip();
        UI.showPopup("successPopup");
        e.target.reset();
      } else {
        throw new Error("EmailJS returned non-200 status");
      }
    } catch (error) {
      console.error("Form submission failed:", error);
      UI.showPopup("errorPopup");
      const errorMessage = document.querySelector("#errorPopup .popup-message");
      if (errorMessage) {
        errorMessage.textContent =
          "Something went wrong. Please try again later.";
      }
    } finally {
      UI.setSubmitButtonState(false, "Send Message");
    }
  },
};

window.closePopup = (popupId) => {
  if (popupId) {
    UI.closePopup(popupId);
  } else {
    UI.closeAllPopups();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => FormHandler.init());
} else {
  FormHandler.init();
}
