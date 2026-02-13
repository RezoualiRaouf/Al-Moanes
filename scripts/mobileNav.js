// Mobile Navigation Functionality

document.addEventListener("DOMContentLoaded", function () {
  // Mobile Menu Elements
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
  const mobileMenuPanel = document.getElementById("mobileMenuPanel");
  const mobileMenuClose = document.getElementById("mobileMenuClose");

  // Mobile Nav Items - Active State
  const mobileNavItems = document.querySelectorAll(".mobile-nav__item");
  const sections = document.querySelectorAll("section[id]");

  // Open Mobile Menu
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", function (e) {
      e.preventDefault();
      mobileMenuOverlay.classList.add("active");
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    });
  }

  // Close Mobile Menu
  function closeMobileMenu() {
    mobileMenuOverlay.classList.remove("active");
    document.body.style.overflow = ""; // Restore scrolling
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", closeMobileMenu);
  }

  // Close when clicking overlay background
  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener("click", function (e) {
      if (e.target === mobileMenuOverlay) {
        closeMobileMenu();
      }
    });
  }

  // Mobile Language Buttons
  const mobileLangButtons = document.querySelectorAll(
    ".mobile-menu-option[data-lang]",
  );

  mobileLangButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const lang = this.getAttribute("data-lang");

      // Call the setLanguage function from languageSwitcher.js
      if (typeof setLanguage === "function") {
        setLanguage(lang);
      }
    });
  });

  // Active Navigation State on Scroll
  function highlightNavOnScroll() {
    let current = "";
    const scrollPosition = window.scrollY + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        current = section.getAttribute("id");
      }
    });

    mobileNavItems.forEach((item) => {
      item.classList.remove("active");
      const navTarget = item.getAttribute("data-nav");
      if (navTarget === current) {
        item.classList.add("active");
      }
    });
  }

  // Smooth Scroll for Mobile Nav Links
  mobileNavItems.forEach((item) => {
    if (item.tagName === "A") {
      item.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetSection = document.getElementById(targetId);
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    }
  });

  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);

    // Wait 100ms after resize stops, then close menu
    resizeTimer = setTimeout(function () {
      if (mobileMenuOverlay.classList.contains("active")) {
        closeMobileMenu();
      }
    }, 100);
  });

  // Listen for scroll to update active state
  window.addEventListener("scroll", highlightNavOnScroll);

  // Initial highlight
  highlightNavOnScroll();

  // Horizontal Scroll Functionality for Mobile Nav
  const mobileNavList = document.querySelector(".mobile-nav__list");
  if (mobileNavList) {
    let isScrolling = false;
    let startX;
    let scrollLeft;

    // Touch events for mobile swipe
    mobileNavList.addEventListener("touchstart", (e) => {
      isScrolling = true;
      startX = e.touches[0].pageX - mobileNavList.offsetLeft;
      scrollLeft = mobileNavList.scrollLeft;
    });

    mobileNavList.addEventListener("touchmove", (e) => {
      if (!isScrolling) return;
      e.preventDefault();
      const x = e.touches[0].pageX - mobileNavList.offsetLeft;
      const walk = (x - startX) * 2;
      mobileNavList.scrollLeft = scrollLeft - walk;
    });

    mobileNavList.addEventListener("touchend", () => {
      isScrolling = false;
    });

    // Mouse events for desktop testing
    mobileNavList.addEventListener("mousedown", (e) => {
      isScrolling = true;
      startX = e.pageX - mobileNavList.offsetLeft;
      scrollLeft = mobileNavList.scrollLeft;
    });

    mobileNavList.addEventListener("mouseleave", () => {
      isScrolling = false;
    });

    mobileNavList.addEventListener("mouseup", () => {
      isScrolling = false;
    });

    mobileNavList.addEventListener("mousemove", (e) => {
      if (!isScrolling) return;
      e.preventDefault();
      const x = e.pageX - mobileNavList.offsetLeft;
      const walk = (x - startX) * 2;
      mobileNavList.scrollLeft = scrollLeft - walk;
    });
  }
});
